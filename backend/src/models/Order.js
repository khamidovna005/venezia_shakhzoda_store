import prisma from '../database/connection.js';
import { generateOrderNo } from '../utils/helpers.js';

const OrderModel = {
  async create(data) {
    let orderNo = generateOrderNo();
    // Juda kam ehtimol, lekin raqam takrorlanmasligini kafolatlaymiz
    while (await prisma.order.findUnique({ where: { orderNo } })) {
      orderNo = generateOrderNo();
    }

    return prisma.order.create({
      data: { ...data, orderNo },
      include: { user: true },
    });
  },

  findById(id) {
    return prisma.order.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });
  },

  findByOrderNo(orderNo) {
    return prisma.order.findUnique({ where: { orderNo }, include: { user: true } });
  },

  /** Mijozning buyurtmalar tarixi */
  listByUser(userId) {
    return prisma.order.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
    });
  },

  /** Admin panel uchun: filtr + sahifalash */
  async listForAdmin({ status, search, skip = 0, take = 50 } = {}) {
    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { orderNo: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(take),
      }),
      prisma.order.count({ where }),
    ]);

    return { items, total };
  },

  updateStatus(id, status) {
    return prisma.order.update({
      where: { id: Number(id) },
      data: { status },
      include: { user: true },
    });
  },

  update(id, data) {
    return prisma.order.update({
      where: { id: Number(id) },
      data,
      include: { user: true },
    });
  },

  remove(id) {
    return prisma.order.delete({ where: { id: Number(id) } });
  },

  /** To'lov cheki kutilayotgan oxirgi buyurtma */
  findPendingReceipt(userId) {
    return prisma.order.findFirst({
      where: {
        userId: Number(userId),
        paymentMethod: 'CARD_TRANSFER',
        paymentStatus: 'PENDING',
        receiptFileId: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Lokatsiya kutayotgan oxirgi buyurtma.
   *
   * Faqat so'nggi sutkadagi va hali yetkazilmagan buyurtma olinadi —
   * mijoz eski buyurtmaga tasodifan lokatsiya biriktirib yubormasligi uchun.
   */
  findAwaitingLocation(userId) {
    const birKunOldin = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return prisma.order.findFirst({
      where: {
        userId: Number(userId),
        lat: null,
        createdAt: { gte: birKunOldin },
        status: { in: ['NEW', 'CONFIRMED'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /** Admin bosh sahifasi uchun statistika */
  async stats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalOrders, newOrders, todayOrders, delivered, revenueAgg, todayRevenueAgg] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'NEW' } }),
        prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.order.count({ where: { status: 'DELIVERED' } }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: 'CANCELLED' } },
        }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfToday } },
        }),
      ]);

    const topProducts = await prisma.product.findMany({
      where: { soldCount: { gt: 0 } },
      orderBy: { soldCount: 'desc' },
      take: 5,
      select: { id: true, nameUz: true, soldCount: true, price: true, images: true },
    });

    return {
      totalOrders,
      newOrders,
      todayOrders,
      delivered,
      revenue: revenueAgg._sum.total || 0,
      todayRevenue: todayRevenueAgg._sum.total || 0,
      topProducts,
    };
  },
};

export default OrderModel;
