import bot from '../core/bot.js';
import * as botController from '../controllers/botController.js';
import { t } from '../utils/i18n.js';

/** Har ikki tildagi tugma matnini tanib olish uchun */
const matches = (text, key) => text === t('uz', key) || text === t('ru', key);

export function registerBotHandlers() {
  bot.onText(/^\/start/, (msg) => botController.handleStart(msg).catch(console.error));
  bot.onText(/^\/help/, (msg) => botController.handleHelp(msg).catch(console.error));
  bot.onText(/^\/lang/, (msg) => botController.handleLanguageMenu(msg).catch(console.error));
  bot.onText(/^\/admin/, (msg) => botController.handleAdmin(msg).catch(console.error));

  bot.on('contact', (msg) => botController.handleContact(msg).catch(console.error));
  bot.on('photo', (msg) => botController.handlePhoto(msg).catch(console.error));
  bot.on('callback_query', (q) => botController.handleCallback(q).catch(console.error));

  bot.on('message', (msg) => {
    const text = msg.text;
    if (!text || text.startsWith('/')) return;

    const run = (fn) => fn(msg).catch(console.error);

    if (matches(text, 'myOrders')) return run(botController.handleMyOrders);
    if (matches(text, 'contactUs')) return run(botController.handleContactInfo);
    if (matches(text, 'help')) return run(botController.handleHelp);
    if (text === '🌐 Til / Язык') return run(botController.handleLanguageMenu);
  });

  bot
    .setMyCommands([
      { command: 'start', description: "🛍 Do'konni ochish / Открыть магазин" },
      { command: 'help', description: 'ℹ️ Yordam / Помощь' },
      { command: 'lang', description: '🌐 Tilni o‘zgartirish / Сменить язык' },
    ])
    .catch(() => {});

  console.log('📋 Bot handlerlari ro‘yxatdan o‘tdi');
}

export default registerBotHandlers;
