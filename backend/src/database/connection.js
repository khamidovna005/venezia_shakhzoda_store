import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
});

/** Baza ulanishi holati — /api/health shuni ko'rsatadi */
export const dbState = { connected: false, lastError: null };

/**
 * Bazaga ulanadi, muvaffaqiyatsiz bo'lsa qayta urinadi.
 *
 * Neon bepul tarifda 5 daqiqa ishlatilmasa uxlaydi va uyg'onishi bir necha
 * soniya oladi. Birinchi urinish muvaffaqiyatsiz bo'lishi normal — dastur
 * shu sababli yiqilmasligi kerak.
 */
export async function connectDatabase({ retries = 5, delayMs = 3000 } = {}) {
  for (let urinish = 1; urinish <= retries; urinish += 1) {
    try {
      await prisma.$connect();
      dbState.connected = true;
      dbState.lastError = null;
      console.log('✅ PostgreSQL (Neon) ga ulanildi');
      return true;
    } catch (err) {
      dbState.connected = false;
      dbState.lastError = err?.message || String(err);
      console.error(`⚠️  Bazaga ulanib bo'lmadi (${urinish}/${retries}): ${dbState.lastError}`);
      if (urinish < retries) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('🔌 Baza ulanishi yopildi');
}

export default prisma;
