import prisma from '../database/connection.js';

const CategoryModel = {
  listActive() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  },

  listAll() {
    return prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  },

  create(data) {
    return prisma.category.create({ data });
  },

  update(id, data) {
    return prisma.category.update({ where: { id: Number(id) }, data });
  },

  remove(id) {
    return prisma.category.delete({ where: { id: Number(id) } });
  },
};

export default CategoryModel;
