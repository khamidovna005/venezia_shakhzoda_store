import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import config from '../config/default.js';
import UserModel from '../models/User.js';
import SettingModel from '../models/Setting.js';

/**
 * Telegram WebApp initData imzosini tekshiradi.
 * Hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyInitData(initData, botToken) {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;

    params.delete('hash');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    const buildCheckString = (entries) =>
      entries
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    // Telegram hujjatida faqat `hash` chiqariladi deyilgan, lekin ba'zi
    // mijoz versiyalari `signature` ni ham hisobga olmaydi. Ikkalasini
    // ham sinaymiz — qaysi biri mos kelsa, imzo haqiqiy.
    const all = [...params.entries()];
    const candidates = [all];
    if (params.has('signature')) {
      candidates.push(all.filter(([key]) => key !== 'signature'));
    }

    const matched = candidates.some((entries) => {
      const computed = crypto
        .createHmac('sha256', secretKey)
        .update(buildCheckString([...entries]))
        .digest('hex');
      // timingSafeEqual uzunliklar farq qilsa xato tashlaydi
      return computed.length === hash.length
        && crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
    });

    if (!matched) {
      console.warn('[auth] initData imzosi mos kelmadi. Kelgan maydonlar:', all.map(([k]) => k).join(','));
      return null;
    }

    // 24 soatdan eski initData qabul qilinmaydi
    const authDate = Number(params.get('auth_date') || 0);
    if (authDate && Date.now() / 1000 - authDate > 86400) return null;

    const rawUser = params.get('user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

/**
 * Mini App so'rovlari uchun.
 * Header: `X-Telegram-Init-Data: <initData>`
 * Dev rejimida (ALLOW_INSECURE_AUTH=true) `X-Debug-User-Id` bilan test qilsa bo'ladi.
 */
export async function telegramAuth(req, res, next) {
  try {
    const initData = req.header('X-Telegram-Init-Data');
    let tgUser = initData ? verifyInitData(initData, config.botToken) : null;

    if (!tgUser && config.allowInsecureAuth) {
      const debugId = req.header('X-Debug-User-Id') || '999000999';
      tgUser = {
        id: Number(debugId),
        first_name: req.header('X-Debug-User-Name') || 'Test Mijoz',
        username: 'test_user',
        language_code: 'uz',
      };
    }

    if (!tgUser) {
      // Ikki xil sabab bor — ularni ajratib ko'rsatamiz, aks holda nimani
      // tuzatish kerakligi noma'lum bo'lib qoladi.
      const error = initData
        ? 'Telegram imzosi mos kelmadi — BOT_TOKEN boshqa botniki bo\'lishi mumkin'
        : "Mini App Telegram orqali ochilmagan — bot menyusidagi tugma bilan oching";
      return res.status(401).json({ ok: false, error, reason: initData ? 'bad_signature' : 'no_init_data' });
    }

    req.user = await UserModel.upsertFromTelegram(tgUser);
    req.telegramUser = tgUser;
    next();
  } catch (err) {
    next(err);
  }
}

/** Login/parolni vaqt bo'yicha xavfsiz solishtirish */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** `.env` dagi ADMIN_LOGIN / ADMIN_PASSWORD bilan tekshiradi */
export async function checkAdminCredentials(login, password) {
  if (!safeEqual(login ?? '', config.admin.login)) return false;
  // Parol admin paneldan o'zgartirilgan bo'lsa bazadagi hash bilan,
  // aks holda `.env` dagi qiymat bilan solishtiriladi.
  return SettingModel.verifyAdminPassword(password ?? '');
}

/** Muvaffaqiyatli kirishdan keyin 7 kunlik token beriladi */
export function issueAdminToken(login) {
  return jwt.sign({ login: String(login), role: 'admin' }, config.jwtSecret, {
    expiresIn: '7d',
  });
}

/**
 * Admin Panel so'rovlari uchun.
 * Header: `Authorization: Bearer <token>`
 */
export function adminAuth(req, res, next) {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, error: 'Avval tizimga kiring' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Admin huquqi yo‘q' });
    }
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Sessiya muddati tugagan — qaytadan kiring' });
  }
}

/** Barcha xatolarni bitta joyda ushlash */
export function errorHandler(err, _req, res, _next) {
  console.error('❌ Xato:', err);
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: err.message || 'Serverda kutilmagan xato yuz berdi',
  });
}
