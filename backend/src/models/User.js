import prisma from '../database/connection.js';

const UserModel = {
  /** Telegram foydalanuvchisini topadi yoki yangisini yaratadi */
  async upsertFromTelegram(tgUser) {
    const telegramId = String(tgUser.id);
    return prisma.user.upsert({
      where: { telegramId },
      update: {
        firstName: tgUser.first_name || 'Mijoz',
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
      },
      create: {
        telegramId,
        firstName: tgUser.first_name || 'Mijoz',
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
        language: tgUser.language_code === 'ru' ? 'ru' : 'uz',
      },
    });
  },

  findByTelegramId(telegramId) {
    return prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  setPhone(telegramId, phone) {
    return prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { phone },
    });
  },

  setLanguage(telegramId, language) {
    return prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { language: language === 'ru' ? 'ru' : 'uz' },
    });
  },

  markIntroSeen(telegramId) {
    return prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { seenIntro: true },
    });
  },

  update(id, data) {
    return prisma.user.update({ where: { id }, data });
  },

  count() {
    return prisma.user.count();
  },

  list({ skip = 0, take = 50 } = {}) {
    return prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    });
  },
};

export default UserModel;
