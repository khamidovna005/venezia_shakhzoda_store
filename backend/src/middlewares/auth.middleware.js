import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import config from '../config/default.js';
import UserModel from '../models/User.js';

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
    params.delete('signature');

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (computed !== hash) return null;

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
      return res.status(401).json({ ok: false, error: 'Telegram autentifikatsiyasi muvaffaqiyatsiz' });
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
export function checkAdminCredentials(login, password) {
  return safeEqual(login ?? '', config.admin.login) && safeEqual(password ?? '', config.admin.password);
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
