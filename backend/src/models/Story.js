import prisma from '../database/connection.js';

const StoryModel = {
  listActive() {
    return prisma.story.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  },

  listAll() {
    return prisma.story.findMany({ orderBy: { sortOrder: 'asc' } });
  },

  create(data) {
    return prisma.story.create({ data });
  },

  update(id, data) {
    return prisma.story.update({ where: { id: Number(id) }, data });
  },

  remove(id) {
    return prisma.story.delete({ where: { id: Number(id) } });
  },
};

export default StoryModel;
