import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import config from './config/default.js';
import { connectDatabase, disconnectDatabase } from './database/connection.js';
import { startBot, stopBot } from './core/bot.js';
import registerBotHandlers from './routes/bot.routes.js';
import clientRoutes from './routes/client.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middlewares/auth.middleware.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    name: `${config.shopName} API`,
    endpoints: ['/api/health', '/api/client/*', '/api/admin/*'],
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => res.status(404).json({ ok: false, error: 'Topilmadi' }));
app.use(errorHandler);

async function bootstrap() {
  await connectDatabase();

  // API darhol ishga tushadi — botning Telegram bilan ulanishini kutib turmaydi
  app.listen(config.port, () => {
    console.log('');
    console.log('══════════════════════════════════════════════');
    console.log(`🛍  ${config.shopName}`);
    console.log(`🚀 Server:      http://localhost:${config.port}`);
    console.log(`📱 Mini App:    ${config.miniAppUrl}`);
    console.log(`🔐 Admin Panel: ${config.adminPanelUrl}`);
    console.log(`👑 Admin login: ${config.admin.login}`);
    console.log('══════════════════════════════════════════════');
    console.log('');
  });

  registerBotHandlers();
  startBot().catch((err) => {
    console.error('⚠️  Bot ishga tushmadi (API baribir ishlayapti):', err?.message || err);
  });
}

async function shutdown(signal) {
  console.log(`\n${signal} — dastur to‘xtatilmoqda...`);
  await stopBot().catch(() => {});
  await disconnectDatabase().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

bootstrap().catch((err) => {
  console.error('❌ Dastur ishga tushmadi:', err);
  process.exit(1);
});
