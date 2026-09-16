import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
});

export async function connectDatabase() {
  await prisma.$connect();
  console.log('✅ PostgreSQL (Neon) ga ulanildi');
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('🔌 Baza ulanishi yopildi');
}

export default prisma;
