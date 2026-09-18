import prisma from '../database/connection.js';

const PromoModel = {
  listAll() {
    return prisma.promo.findMany({ orderBy: { createdAt: 'desc' } });
  },

  /**
   * Mijozga ko'rsatiladigan promokodlar.
   * Ishlatib bo'lingan yoki muddati o'tganlari ro'yxatga tushmaydi —
   * mijoz kiritib, keyin "ishlamadi" degan javob olmasligi uchun.
   */
  async listPublic() {
    const now = new Date();
    const rows = await prisma.promo.findMany({
      where: {
        isActive: true,
        isPublic: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows
      .filter((p) => p.usageLimit === 0 || p.usedCount < p.usageLimit)
      .map((p) => ({
        code: p.code,
        type: p.type,
        value: p.value,
        minTotal: p.minTotal,
        expiresAt: p.expiresAt,
        // Nechta qolganini faqat cheklangan kodlarda ko'rsatamiz
        left: p.usageLimit > 0 ? p.usageLimit - p.usedCount : null,
      }));
  },

  create(data) {
    return prisma.promo.create({ data: { ...data, code: data.code.trim().toUpperCase() } });
  },

  update(id, data) {
    const payload = { ...data };
    if (payload.code) payload.code = payload.code.trim().toUpperCase();
    return prisma.promo.update({ where: { id: Number(id) }, data: payload });
  },

  remove(id) {
    return prisma.promo.delete({ where: { id: Number(id) } });
  },

  /**
   * Promokodni tekshiradi.
   * @returns {{ ok: boolean, reason?: string, promo?: object, discount?: number }}
   */
  async validate(code, subtotal) {
    if (!code) return { ok: false, reason: 'EMPTY' };

    const promo = await prisma.promo.findUnique({
      where: { code: String(code).trim().toUpperCase() },
    });

    if (!promo || !promo.isActive) return { ok: false, reason: 'NOT_FOUND' };
    if (promo.expiresAt && promo.expiresAt < new Date()) return { ok: false, reason: 'EXPIRED' };
    if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
      return { ok: false, reason: 'LIMIT' };
    }
    if (subtotal < promo.minTotal) {
      return { ok: false, reason: 'MIN_TOTAL', minTotal: promo.minTotal };
    }

    const discount =
      promo.type === 'PERCENT'
        ? Math.floor((subtotal * promo.value) / 100)
        : Math.min(promo.value, subtotal);

    return { ok: true, promo, discount };
  },

  markUsed(code) {
    return prisma.promo.update({
      where: { code: String(code).trim().toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  },
};

export default PromoModel;
