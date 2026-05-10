const { prisma } = require('../connections/prisma');

class TagService {
  async getTags(workspaceId) {
    const tags = await prisma.tag.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { tickets: true } },
      },
    });

    return tags.map(({ _count, ...tag }) => ({
      ...tag,
      ticketCount: _count.tickets,
    }));
  }
}

module.exports = new TagService();
