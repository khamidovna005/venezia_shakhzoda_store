import config from '../config/default.js';
import { checkAdminCredentials, issueAdminToken } from '../middlewares/auth.middleware.js';
import OrderModel from '../models/Order.js';
import ProductModel from '../models/Product.js';
import CategoryModel from '../models/Category.js';
import PromoModel from '../models/Promo.js';
import StoryModel from '../models/Story.js';
import UserModel from '../models/User.js';
import SettingModel from '../models/Setting.js';
import ImageModel from '../models/Image.js';
import { safeSend } from '../core/bot.js';
import { t, ORDER_STATUS_LABELS } from '../utils/i18n.js';
import { toPlain, toInt } from '../utils/helpers.js';

/* ------------------------------------------------------------------ */
/*  KIRISH (login + parol)                                             */
/* ------------------------------------------------------------------ */

// Bir xil IP dan ketma-ket noto'g'ri urinishlarni cheklaymiz
const attempts = new Map();
const MAX_ATTEMPTS = 8;
const BLOCK_MS = 5 * 60 * 1000;

export async function login(req, res) {
  const ip = req.ip || 'unknown';
  const record = attempts.get(ip);

  if (record && record.count >= MAX_ATTEMPTS && Date.now() - record.at < BLOCK_MS) {
    return res.status(429).json({
      ok: false,
      error: 'Juda ko‘p urinish. 5 daqiqadan keyin qayta urinib ko‘ring.',
    });
  }

  const { login: userLogin, password } = req.body;

  if (!(await checkAdminCredentials(userLogin, password))) {
    // Parol tanlashni sekinlashtiramiz
    await new Promise((resolve) => setTimeout(resolve, 400));
    const count = record && Date.now() - record.at < BLOCK_MS ? record.count + 1 : 1;
    attempts.set(ip, { count, at: Date.now() });
    return res.status(401).json({ ok: false, error: 'Login yoki parol noto‘g‘ri' });
  }

  attempts.delete(ip);

  res.json({
    ok: true,
    token: issueAdminToken(userLogin),
    shopName: await SettingModel.get('shopName'),
    currency: await SettingModel.get('currency'),
  });
}

/* ------------------------------------------------------------------ */
/*  SESSIYA                                                            */
/* ------------------------------------------------------------------ */

export async function me(req, res) {
  res.json({
    ok: true,
    admin: req.admin,
    shopName: await SettingModel.get('shopName'),
    currency: await SettingModel.get('currency'),
  });
}

/* ------------------------------------------------------------------ */
/*  SOZLAMALAR                                                         */
/* ------------------------------------------------------------------ */

export async function getSettings(_req, res) {
  res.json({
    ok: true,
    settings: await SettingModel.getAll(),
    passwordChanged: await SettingModel.hasCustomPassword(),
  });
}

export async function updateSettings(req, res) {
  const saved = await SettingModel.setMany(req.body || {});
  res.json({ ok: true, saved, settings: await SettingModel.getAll() });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};

  if (!(await SettingModel.verifyAdminPassword(currentPassword ?? ''))) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return res.status(401).json({ ok: false, error: 'Joriy parol noto‘g‘ri' });
  }

  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({ ok: false, error: 'Yangi parol kamida 8 ta belgi bo‘lsin' });
  }

  await SettingModel.setAdminPassword(String(newPassword));
  res.json({ ok: true });
}

/* ------------------------------------------------------------------ */
/*  RASM YUKLASH                                                       */
/* ------------------------------------------------------------------ */

export async function uploadImage(req, res) {
  try {
    const result = await ImageModel.saveDataUrl(req.body?.dataUrl);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

/* ------------------------------------------------------------------ */
/*  STATISTIKA                                                         */
/* ------------------------------------------------------------------ */

export async function stats(_req, res, next) {
  try {
    const [orderStats, productCount, userCount] = await Promise.all([
      OrderModel.stats(),
      ProductModel.count(),
      UserModel.count(),
    ]);
    res.json({ ok: true, stats: { ...orderStats, productCount, userCount } });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  BUYURTMALAR                                                        */
/* ------------------------------------------------------------------ */

export async function listOrders(req, res, next) {
  try {
    const { items, total } = await OrderModel.listForAdmin({
      status: req.query.status,
      search: req.query.search,
      skip: toInt(req.query.skip, 0),
      take: toInt(req.query.take, 50),
    });
    res.json({ ok: true, orders: toPlain(items), total });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ ok: false, error: 'Buyurtma topilmadi' });
    res.json({ ok: true, order: toPlain(order) });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['NEW', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ ok: false, error: 'Noto‘g‘ri holat' });
    }

    const order = await OrderModel.updateStatus(req.params.id, status);

    // Mijozga botda xabar beramiz
    const lang = order.user?.language || 'uz';
    const label = ORDER_STATUS_LABELS[lang][status];
    if (order.user?.telegramId) {
      await safeSend(order.user.telegramId, t(lang, 'statusChanged', order.orderNo, label));
    }

    res.json({ ok: true, order: toPlain(order) });
  } catch (err) {
    next(err);
  }
}

export async function updatePaymentStatus(req, res, next) {
  try {
    const { paymentStatus } = req.body;
    if (!['PENDING', 'PAID', 'FAILED'].includes(paymentStatus)) {
      return res.status(400).json({ ok: false, error: 'Noto‘g‘ri to‘lov holati' });
    }
    const order = await OrderModel.update(req.params.id, { paymentStatus });
    res.json({ ok: true, order: toPlain(order) });
  } catch (err) {
    next(err);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    await OrderModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  MAHSULOTLAR (CRUD)                                                 */
/* ------------------------------------------------------------------ */

function normalizeProductPayload(body) {
  const toArray = (value) =>
    Array.isArray(value)
      ? value.map((v) => String(v).trim()).filter(Boolean)
      : String(value || '')
          .split('\n')
          .map((v) => v.trim())
          .filter(Boolean);

  return {
    nameUz: String(body.nameUz || '').trim(),
    nameRu: String(body.nameRu || body.nameUz || '').trim(),
    descUz: String(body.descUz || '').trim(),
    descRu: String(body.descRu || body.descUz || '').trim(),
    featuresUz: toArray(body.featuresUz),
    featuresRu: toArray(body.featuresRu ?? body.featuresUz),
    images: toArray(body.images),
    price: toInt(body.price, 0),
    oldPrice: body.oldPrice ? toInt(body.oldPrice, 0) : null,
    brand: body.brand ? String(body.brand).trim() : null,
    materialUz: body.materialUz ? String(body.materialUz).trim() : null,
    materialRu: body.materialRu ? String(body.materialRu).trim() : null,
    categoryId: toInt(body.categoryId, 0),
    isActive: body.isActive !== false,
    isNew: Boolean(body.isNew),
    isHit: Boolean(body.isHit),
    variants: Array.isArray(body.variants)
      ? body.variants
          .filter((v) => v && v.size)
          .map((v) => ({
            size: String(v.size).trim().toUpperCase(),
            colorUz: String(v.colorUz || 'Aralash').trim(),
            colorRu: String(v.colorRu || v.colorUz || 'Микс').trim(),
            colorHex: String(v.colorHex || '#000000').trim(),
            stock: toInt(v.stock, 0),
          }))
      : undefined,
  };
}

export async function listProducts(_req, res, next) {
  try {
    const products = await ProductModel.listForAdmin();
    res.json({ ok: true, products });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const data = normalizeProductPayload(req.body);
    if (!data.nameUz) return res.status(400).json({ ok: false, error: 'Mahsulot nomini kiriting' });
    if (!data.categoryId) return res.status(400).json({ ok: false, error: 'Kategoriyani tanlang' });
    if (data.price <= 0) return res.status(400).json({ ok: false, error: 'Narxni kiriting' });

    const product = await ProductModel.create({ ...data, variants: data.variants || [] });
    res.status(201).json({ ok: true, product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const data = normalizeProductPayload(req.body);
    const product = await ProductModel.update(req.params.id, data);
    res.json({ ok: true, product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await ProductModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  KATEGORIYALAR                                                      */
/* ------------------------------------------------------------------ */

export async function listCategories(_req, res, next) {
  try {
    res.json({ ok: true, categories: await CategoryModel.listAll() });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await CategoryModel.create({
      slug: String(req.body.slug || req.body.nameUz).toLowerCase().replace(/\s+/g, '-'),
      nameUz: String(req.body.nameUz || '').trim(),
      nameRu: String(req.body.nameRu || req.body.nameUz || '').trim(),
      emoji: req.body.emoji || '👕',
      sortOrder: toInt(req.body.sortOrder, 0),
    });
    res.status(201).json({ ok: true, category });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await CategoryModel.update(req.params.id, {
      nameUz: req.body.nameUz,
      nameRu: req.body.nameRu,
      emoji: req.body.emoji,
      sortOrder: toInt(req.body.sortOrder, 0),
      isActive: req.body.isActive !== false,
    });
    res.json({ ok: true, category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    await CategoryModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  PROMOKODLAR                                                        */
/* ------------------------------------------------------------------ */

export async function listPromos(_req, res, next) {
  try {
    res.json({ ok: true, promos: await PromoModel.listAll() });
  } catch (err) {
    next(err);
  }
}

export async function createPromo(req, res, next) {
  try {
    const promo = await PromoModel.create({
      code: String(req.body.code || '').trim(),
      type: req.body.type === 'FIXED' ? 'FIXED' : 'PERCENT',
      value: toInt(req.body.value, 0),
      minTotal: toInt(req.body.minTotal, 0),
      usageLimit: toInt(req.body.usageLimit, 0),
      isActive: req.body.isActive !== false,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
    });
    res.status(201).json({ ok: true, promo });
  } catch (err) {
    next(err);
  }
}

export async function updatePromo(req, res, next) {
  try {
    const promo = await PromoModel.update(req.params.id, {
      code: req.body.code,
      type: req.body.type === 'FIXED' ? 'FIXED' : 'PERCENT',
      value: toInt(req.body.value, 0),
      minTotal: toInt(req.body.minTotal, 0),
      usageLimit: toInt(req.body.usageLimit, 0),
      isActive: req.body.isActive !== false,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
    });
    res.json({ ok: true, promo });
  } catch (err) {
    next(err);
  }
}

export async function deletePromo(req, res, next) {
  try {
    await PromoModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  STORIES                                                            */
/* ------------------------------------------------------------------ */

export async function listStories(_req, res, next) {
  try {
    res.json({ ok: true, stories: await StoryModel.listAll() });
  } catch (err) {
    next(err);
  }
}

export async function createStory(req, res, next) {
  try {
    const story = await StoryModel.create({
      titleUz: String(req.body.titleUz || '').trim(),
      titleRu: String(req.body.titleRu || req.body.titleUz || '').trim(),
      coverUrl: String(req.body.coverUrl || '').trim(),
      imageUrl: String(req.body.imageUrl || req.body.coverUrl || '').trim(),
      productId: req.body.productId ? toInt(req.body.productId, 0) : null,
      sortOrder: toInt(req.body.sortOrder, 0),
      isActive: req.body.isActive !== false,
    });
    res.status(201).json({ ok: true, story });
  } catch (err) {
    next(err);
  }
}

export async function deleteStory(req, res, next) {
  try {
    await StoryModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/* ------------------------------------------------------------------ */
/*  MIJOZLAR                                                           */
/* ------------------------------------------------------------------ */

export async function listUsers(req, res, next) {
  try {
    const users = await UserModel.list({
      skip: toInt(req.query.skip, 0),
      take: toInt(req.query.take, 100),
    });
    res.json({ ok: true, users: toPlain(users) });
  } catch (err) {
    next(err);
  }
}

/** Mijozga bot orqali qo'lda xabar yuborish */
export async function messageUser(req, res, next) {
  try {
    const { telegramId, text } = req.body;
    if (!telegramId || !text) {
      return res.status(400).json({ ok: false, error: 'telegramId va text majburiy' });
    }
    const sent = await safeSend(telegramId, String(text));
    res.json({ ok: Boolean(sent) });
  } catch (err) {
    next(err);
  }
}
