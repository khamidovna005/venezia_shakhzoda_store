import prisma from '../database/connection.js';

const withRelations = {
  category: true,
  variants: { orderBy: { id: 'asc' } },
};

const ProductModel = {
  /** Mijoz uchun katalog: filtr + qidiruv */
  async listForClient({ categoryId, search, minPrice, maxPrice, sort = 'new' } = {}) {
    const where = { isActive: true };

    if (categoryId) where.categoryId = Number(categoryId);

    if (search) {
      where.OR = [
        { nameUz: { contains: search, mode: 'insensitive' } },
        { nameRu: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const orderBy =
      sort === 'cheap'
        ? { price: 'asc' }
        : sort === 'expensive'
          ? { price: 'desc' }
          : sort === 'popular'
            ? { soldCount: 'desc' }
            : { createdAt: 'desc' };

    return prisma.product.findMany({ where, include: withRelations, orderBy });
  },

  /** Admin uchun: nofaol mahsulotlar ham ko'rinadi */
  listForAdmin() {
    return prisma.product.findMany({
      include: withRelations,
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id) {
    return prisma.product.findUnique({
      where: { id: Number(id) },
      include: withRelations,
    });
  },

  findManyByIds(ids) {
    return prisma.product.findMany({
      where: { id: { in: ids.map(Number) } },
      include: withRelations,
    });
  },

  /** Yangi mahsulot + variantlari bilan birga */
  create(data) {
    const { variants = [], ...rest } = data;
    return prisma.product.create({
      data: {
        ...rest,
        variants: { create: variants },
      },
      include: withRelations,
    });
  },

  /** Tahrirlash: variantlar to'liq almashtiriladi */
  async update(id, data) {
    const { variants, ...rest } = data;
    const productId = Number(id);

    if (Array.isArray(variants)) {
      await prisma.$transaction([
        prisma.productVariant.deleteMany({ where: { productId } }),
        prisma.product.update({
          where: { id: productId },
          data: { ...rest, variants: { create: variants } },
        }),
      ]);
      return ProductModel.findById(productId);
    }

    return prisma.product.update({
      where: { id: productId },
      data: rest,
      include: withRelations,
    });
  },

  remove(id) {
    return prisma.product.delete({ where: { id: Number(id) } });
  },

  /** Buyurtma tasdiqlanganda ombordan ayirish */
  async decreaseStock(items) {
    const ops = [];
    for (const item of items) {
      if (!item.variantId) continue;
      ops.push(
        prisma.productVariant.update({
          where: { id: Number(item.variantId) },
          data: { stock: { decrement: Number(item.qty) || 1 } },
        }),
      );
      ops.push(
        prisma.product.update({
          where: { id: Number(item.productId) },
          data: { soldCount: { increment: Number(item.qty) || 1 } },
        }),
      );
    }
    if (ops.length) await prisma.$transaction(ops);
  },

  count() {
    return prisma.product.count();
  },
};

export default ProductModel;
