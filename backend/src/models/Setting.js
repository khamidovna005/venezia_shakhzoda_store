import crypto from 'node:crypto';
import prisma from '../database/connection.js';
import config from '../config/default.js';

/**
 * Do'kon sozlamalari.
 *
 * Qiymat bazadan olinadi; bazada bo'lmasa `.env` dagi qiymat ishlatiladi.
 * Shu sabab eski o'rnatmalar hech narsa o'zgartirmasdan ishlayveradi,
 * do'kon egasi esa sozlamalarni admin paneldan boshqara oladi.
 *
 * Har so'rovda bazaga bormaslik uchun qiymatlar xotirada saqlanadi.
 */

const CACHE_MS = 30_000;
let cache = null;
let cachedAt = 0;

/** Admin paneldan boshqariladigan kalitlar va ularning `.env` zaxirasi */
export const DEFAULTS = {
  shopName: () => config.shopName,
  currency: () => config.currency,
  deliveryFee: () => String(config.delivery.fee),
  freeDeliveryFrom: () => String(config.delivery.freeFrom),
  cardNumber: () => config.payment.cardNumber,
  cardHolder: () => config.payment.cardHolder,
  contactPhone: () => '',
  contactAddress: () => '',

  // Payme va Click rekvizitlari. Bular maxfiy emas — to'lov havolasi
  // ichida ochiq ketadi. Maxfiy kalitlar (Payme key, Click secret) faqat
  // avtomatik tasdiqlash uchun kerak, u hali ulanmagan.
  paymeMerchantId: () => config.payment.payme.merchantId,
  clickServiceId: () => config.payment.click.serviceId,
  clickMerchantId: () => config.payment.click.merchantId,
};

/** Parol bazada ochiq saqlanmaydi — scrypt hash sifatida yoziladi */
const PRIVATE_KEYS = ['adminPasswordHash'];

async function load() {
  if (cache && Date.now() - cachedAt < CACHE_MS) return cache;
  const rows = await prisma.setting.findMany();
  cache = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  cachedAt = Date.now();
  return cache;
}

/** Keshni majburan bekor qiladi (yozgandan keyin chaqiriladi) */
export function invalidate() {
  cache = null;
}

/** Bitta qiymat — bazada bo'lmasa `.env` dan */
export async function get(key) {
  const db = await load();
  if (db[key] !== undefined && db[key] !== '') return db[key];
  return DEFAULTS[key] ? DEFAULTS[key]() : '';
}

/** Raqamli qiymat */
export async function getInt(key) {
  const n = Number.parseInt(await get(key), 10);
  return Number.isNaN(n) ? 0 : n;
}

/** Admin panel ko'rsatadigan barcha sozlamalar */
export async function getAll() {
  const out = {};
  for (const key of Object.keys(DEFAULTS)) out[key] = await get(key);
  return out;
}

/** Bot va savatcha uchun kerak bo'ladigan to'plam */
export async function getShopInfo() {
  return {
    shopName: await get('shopName'),
    currency: await get('currency'),
    deliveryFee: await getInt('deliveryFee'),
    freeDeliveryFrom: await getInt('freeDeliveryFrom'),
    cardNumber: await get('cardNumber'),
    cardHolder: await get('cardHolder'),
    contactPhone: await get('contactPhone'),
    contactAddress: await get('contactAddress'),
    paymeMerchantId: await get('paymeMerchantId'),
    clickServiceId: await get('clickServiceId'),
    clickMerchantId: await get('clickMerchantId'),
  };
}

/** Bir nechta sozlamani birdan yozadi. Faqat ruxsat etilgan kalitlar qabul qilinadi. */
export async function setMany(values) {
  const entries = Object.entries(values).filter(([key]) => key in DEFAULTS);

  for (const [key, value] of entries) {
    const str = String(value ?? '');
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: str },
      update: { value: str },
    });
  }

  invalidate();
  return entries.length;
}

/* ------------------------------------------------------------------ */
/*  Admin paroli                                                       */
/* ------------------------------------------------------------------ */

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

/** Yangi parol o'rnatadi (bazada faqat hash saqlanadi) */
export async function setAdminPassword(password) {
  const value = hashPassword(password);
  await prisma.setting.upsert({
    where: { key: 'adminPasswordHash' },
    create: { key: 'adminPasswordHash', value },
    update: { value },
  });
  invalidate();
}

/**
 * Parolni tekshiradi.
 * Bazada hash bo'lsa — o'sha bilan, bo'lmasa `.env` dagi parol bilan.
 */
export async function verifyAdminPassword(password) {
  const db = await load();
  const stored = db[PRIVATE_KEYS[0]];

  if (!stored) {
    // Hali parol o'zgartirilmagan — .env dagi qiymat amal qiladi
    return safeEqual(password, config.admin.password);
  }

  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;

  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return safeEqual(derived, expected);
}

/** Parol bazada o'zgartirilganmi (admin panelda ko'rsatish uchun) */
export async function hasCustomPassword() {
  const db = await load();
  return Boolean(db[PRIVATE_KEYS[0]]);
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export default { get, getInt, getAll, getShopInfo, setMany, setAdminPassword, verifyAdminPassword, hasCustomPassword, invalidate };
