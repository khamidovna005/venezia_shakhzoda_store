import config from '../config/default.js';
import bot, { safeSend } from '../core/bot.js';
import UserModel from '../models/User.js';
import OrderModel from '../models/Order.js';
import SettingModel from '../models/Setting.js';
import { t, ORDER_STATUS_LABELS } from '../utils/i18n.js';
import { formatMoney, formatDate } from '../utils/helpers.js';

/**
 * Telegram "Do'konni ochish" tugmasiga FAQAT https manzilni qabul qiladi.
 * ngrok hali ishga tushmagan bo'lsa tugmani qo'shmaymiz — aks holda /start umuman ishlamaydi.
 */
export const isMiniAppReady = config.miniAppUrl.startsWith('https://');

/** Admin panel ham web_app tugmasi orqali ochiladi — u ham https bo'lishi shart. */
export const isAdminPanelReady = config.adminPanelUrl.startsWith('https://');

/** Asosiy klaviatura (WebApp tugmasi bilan) */
export function mainKeyboard(lang, hasPhone) {
  const rows = [];

  if (isMiniAppReady) {
    rows.push([{ text: t(lang, 'openShop'), web_app: { url: config.miniAppUrl } }]);
  }

  rows.push([{ text: t(lang, 'myOrders') }, { text: t(lang, 'contactUs') }]);

  if (!hasPhone) {
    rows.push([{ text: t(lang, 'sharePhone'), request_contact: true }]);
  } else {
    rows.push([{ text: t(lang, 'help') }, { text: '🌐 Til / Язык' }]);
  }

  return { keyboard: rows, resize_keyboard: true };
}

/* ------------------------------------------------------------------ */
/*  /start                                                             */
/* ------------------------------------------------------------------ */

export async function handleStart(msg) {
  const user = await UserModel.upsertFromTelegram(msg.from);
  const lang = user.language || 'uz';

  let text = t(lang, 'welcome', user.firstName, await SettingModel.get('shopName'));

  if (!isMiniAppReady) {
    text +=
      '\n\n⚠️ <b>Do‘kon hali ulanmagan.</b>\nTerminalda <code>ngrok http 5173</code> ni ishga tushiring, ' +
      'https manzilni <code>backend/.env</code> dagi <code>MINIAPP_URL</code> ga yozing va serverni qayta yurgizing.';
  }

  await safeSend(msg.chat.id, text, {
    reply_markup: mainKeyboard(lang, Boolean(user.phone)),
  });
}

/* ------------------------------------------------------------------ */
/*  Kontakt (telefon raqam)                                            */
/* ------------------------------------------------------------------ */

export async function handleContact(msg) {
  if (!msg.contact) return;
  // Faqat o'z raqamini yuborishga ruxsat
  if (String(msg.contact.user_id) !== String(msg.from.id)) return;

  const user = await UserModel.upsertFromTelegram(msg.from);
  const phone = msg.contact.phone_number.startsWith('+')
    ? msg.contact.phone_number
    : `+${msg.contact.phone_number}`;

  await UserModel.setPhone(user.telegramId, phone);
  const lang = user.language || 'uz';

  await safeSend(msg.chat.id, t(lang, 'phoneSaved', phone), {
    reply_markup: mainKeyboard(lang, true),
  });
}

/* ------------------------------------------------------------------ */
/*  Buyurtmalarim                                                      */
/* ------------------------------------------------------------------ */

export async function handleMyOrders(msg) {
  const user = await UserModel.upsertFromTelegram(msg.from);
  const lang = user.language || 'uz';
  const orders = await OrderModel.listByUser(user.id);

  if (orders.length === 0) {
    return safeSend(msg.chat.id, t(lang, 'noOrders'));
  }

  const lines = orders.slice(0, 10).map((order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const products = items
      .map((i) => `   • ${lang === 'ru' ? i.nameRu : i.nameUz}${i.size ? ` (${i.size})` : ''} × ${i.qty}`)
      .join('\n');

    return [
      `<b>${order.orderNo}</b> — ${ORDER_STATUS_LABELS[lang][order.status]}`,
      products,
      `   💰 ${formatMoney(order.total, config.currency)}`,
      `   🕒 ${formatDate(order.createdAt, lang)}`,
    ].join('\n');
  });

  await safeSend(msg.chat.id, `${t(lang, 'ordersTitle')}\n\n${lines.join('\n\n')}`);
}

/* ------------------------------------------------------------------ */
/*  Aloqa / Yordam / Til                                               */
/* ------------------------------------------------------------------ */

export async function handleContactInfo(msg) {
  const user = await UserModel.upsertFromTelegram(msg.from);
  const lang = user.language || 'uz';
  await safeSend(msg.chat.id, t(lang, 'contactInfo', await SettingModel.get('shopName')));
}

export async function handleHelp(msg) {
  const user = await UserModel.upsertFromTelegram(msg.from);
  const lang = user.language || 'uz';
  await safeSend(msg.chat.id, t(lang, 'helpText'));
}

/**
 * /admin — Admin panelni Telegram ichida ochadi.
 *
 * Buyruq ataylab `setMyCommands` ro'yxatiga qo'shilmagan: mijozlar uni
 * menyuda ko'rmaydi. Himoyani parol ta'minlaydi — panel login/parol so'raydi.
 */
export async function handleAdmin(msg) {
  const user = await UserModel.upsertFromTelegram(msg.from);
  const lang = user.language || 'uz';

  if (!isAdminPanelReady) {
    return safeSend(
      msg.chat.id,
      lang === 'ru'
        ? '⚠️ Админ-панель ещё не подключена.\nУкажите её https-адрес в переменной ADMIN_PANEL_URL.'
        : "⚠️ Admin panel hali ulanmagan.\nUning https manzilini ADMIN_PANEL_URL o'zgaruvchisiga yozing.",
    );
  }

  return safeSend(
    msg.chat.id,
    lang === 'ru'
      ? '🔐 Панель управления\n\nНажмите кнопку и войдите с логином и паролем.'
      : "🔐 Boshqaruv paneli\n\nTugmani bosing va login/parol bilan kiring.",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: lang === 'ru' ? '🔐 Открыть панель' : '🔐 Panelni ochish',
              web_app: { url: config.adminPanelUrl },
            },
          ],
        ],
      },
    },
  );
}

export async function handleLanguageMenu(msg) {
  await safeSend(msg.chat.id, '🌐 Tilni tanlang / Выберите язык:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🇺🇿 O'zbekcha", callback_data: 'lang:uz' },
          { text: '🇷🇺 Русский', callback_data: 'lang:ru' },
        ],
      ],
    },
  });
}

export async function handleCallback(query) {
  const data = query.data || '';

  if (data.startsWith('lang:')) {
    const lang = data.split(':')[1] === 'ru' ? 'ru' : 'uz';
    const user = await UserModel.upsertFromTelegram(query.from);
    await UserModel.setLanguage(user.telegramId, lang);

    await bot.answerCallbackQuery(query.id).catch(() => {});
    await safeSend(query.message.chat.id, t(lang, 'langChanged'), {
      reply_markup: mainKeyboard(lang, Boolean(user.phone)),
    });
    return;
  }

  await bot.answerCallbackQuery(query.id).catch(() => {});
}

/* ------------------------------------------------------------------ */
/*  To'lov cheki (rasm)                                                */
/* ------------------------------------------------------------------ */

export async function handlePhoto(msg) {
  const user = await UserModel.upsertFromTelegram(msg.from);
  const lang = user.language || 'uz';

  const order = await OrderModel.findPendingReceipt(user.id);
  if (!order) {
    return safeSend(msg.chat.id, t(lang, 'receiptNoOrder'));
  }

  const largest = msg.photo[msg.photo.length - 1];
  await OrderModel.update(order.id, { receiptFileId: largest.file_id });
  await safeSend(msg.chat.id, t(lang, 'receiptSaved'));
}

