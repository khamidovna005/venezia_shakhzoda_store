import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import config from './config/default.js';
import { connectDatabase, disconnectDatabase, dbState } from './database/connection.js';
import { startBot, stopBot } from './core/bot.js';
import registerBotHandlers from './routes/bot.routes.js';
import clientRoutes from './routes/client.routes.js';
import adminRoutes from './routes/admin.routes.js';
import ImageModel from './models/Image.js';
import { errorHandler } from './middlewares/auth.middleware.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
// Rasm base64 ko'rinishida keladi — brauzer kichraytirgandan keyin ham joy kerak
app.use(express.json({ limit: '8mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    name: `${config.shopName} API`,
    endpoints: ['/api/health', '/api/client/*', '/api/admin/*'],
  });
});

// Baza uzilgan bo'lsa ham javob beradi — nosozlikni shu yerdan ko'rasiz
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    db: dbState.connected ? 'ulangan' : 'ulanmagan',
    dbError: dbState.lastError,
  });
});

// Yuklangan rasmlar — ochiq, chunki ularni mijozlar ham ko'radi
app.get('/api/images/:id', async (req, res, next) => {
  try {
    const image = await ImageModel.findById(req.params.id);
    if (!image) return res.status(404).json({ ok: false, error: 'Rasm topilmadi' });

    // Rasm hech qachon o'zgarmaydi (yangisi yangi id oladi) — uzoq keshlash mumkin
    res.set('Content-Type', image.mimeType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(image.data);
  } catch (err) {
    next(err);
  }
});

app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => res.status(404).json({ ok: false, error: 'Topilmadi' }));
app.use(errorHandler);

function bootstrap() {
  // 1) Portni BIRINCHI ochamiz.
  //
  // Avval bazaga ulanib, keyin listen qilinardi — baza sekin bo'lsa port
  // umuman ochilmasdi va Render "javob bermayapti" deb kutib qolardi.
  // Endi server bazadan mustaqil ko'tariladi: /api/health ishlaydi,
  // sababini ko'rsatadi.
  app.listen(config.port, () => {
    console.log('');
    console.log('══════════════════════════════════════════════');
    console.log(`🛍  ${config.shopName}`);
    console.log(`🚀 Server:      http://localhost:${config.port}`);
    console.log(`📱 Mini App:    ${config.miniAppUrl}`);
    console.log(`🔐 Admin Panel: ${config.adminPanelUrl}`);
    console.log('══════════════════════════════════════════════');
    console.log('');
  });

  // 2) Baza fonda ulanadi. Ulanmasa ham dastur yiqilmaydi —
  //    Render cheksiz qayta ishga tushirmasligi uchun.
  connectDatabase().then((ok) => {
    if (!ok) console.error('❌ Baza ulanmadi. /api/health sababini ko\'rsatadi.');
  });

  // 3) Bot ham fonda
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

try {
  bootstrap();
} catch (err) {
  console.error('❌ Dastur ishga tushmadi:', err);
  process.exit(1);
}
