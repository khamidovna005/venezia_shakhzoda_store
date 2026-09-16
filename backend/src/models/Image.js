import prisma from '../database/connection.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB — brauzer allaqachon kichraytirib yuboradi

/**
 * `data:image/jpeg;base64,...` ko'rinishidagi satrni bazaga yozadi.
 * Qaytadi: rasmga yo'l (`/api/images/<id>`).
 */
export async function saveDataUrl(dataUrl) {
  const match = /^data:([\w/+.-]+);base64,(.+)$/s.exec(String(dataUrl || ''));
  if (!match) throw new Error('Rasm formati tanilmadi');

  const [, mimeType, base64] = match;
  if (!ALLOWED.includes(mimeType)) {
    throw new Error('Faqat JPG, PNG yoki WEBP rasm yuklash mumkin');
  }

  const data = Buffer.from(base64, 'base64');
  if (!data.length) throw new Error('Rasm bo\'sh');
  if (data.length > MAX_BYTES) throw new Error('Rasm hajmi 3 MB dan oshmasligi kerak');

  const image = await prisma.image.create({
    data: { mimeType, data, size: data.length },
    select: { id: true, size: true },
  });

  return { url: `/api/images/${image.id}`, size: image.size };
}

export async function findById(id) {
  return prisma.image.findUnique({ where: { id } });
}

export default { saveDataUrl, findById };
