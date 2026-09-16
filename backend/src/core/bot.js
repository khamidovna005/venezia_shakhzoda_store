import TelegramBot from 'node-telegram-bot-api';
import config from '../config/default.js';

if (!config.botToken) {
  console.error('❌ BOT_TOKEN topilmadi. .env faylni tekshiring.');
  process.exit(1);
}

export const bot = new TelegramBot(config.botToken, {
  polling: {
    interval: 800,
    autoStart: false,
    params: { timeout: 30 },
  },
});

bot.on('polling_error', (err) => {
  console.error('⚠️  Polling xatosi:', err?.message || err);
});

export async function startBot() {
  await bot.startPolling();
  const me = await bot.getMe();
  console.log(`🤖 Bot ishga tushdi: @${me.username}`);
  return me;
}

export async function stopBot() {
  await bot.stopPolling();
}

/** Mijozga xabar yuborish (xato bo'lsa dastur to'xtamaydi) */
export async function safeSend(chatId, text, options = {}) {
  try {
    return await bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...options });
  } catch (err) {
    console.error(`⚠️  Xabar yuborilmadi (${chatId}):`, err?.message || err);
    return null;
  }
}

export default bot;
