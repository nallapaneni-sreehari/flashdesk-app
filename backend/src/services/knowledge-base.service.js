const { prisma } = require('../connections/prisma');

class KnowledgeBaseService {
  _mapAuthor(article) {
    if (!article?.author) return article;
    const { firstName, lastName, ...rest } = article.author;
    return { ...article, author: { ...rest, name: `${firstName} ${lastName}`.trim() } };
  }

  // ─── CATEGORIES ──────────────────────────────────────

  async getCategories(workspaceId) {
    const categories = await prisma.kBCategory.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { articles: true } },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map(({ _count, ...cat }) => ({
      ...cat,
      articleCount: _count.articles,
    }));
  }

  async getCategoryById(id) {
    return prisma.kBCategory.findUnique({ where: { id } });
  }

  async createCategory(data) {
    return prisma.kBCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon || 'pi pi-folder',
        color: data.color || '#6366f1',
        workspaceId: data.workspaceId,
      },
    });
  }

  async updateCategory(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;

    return prisma.kBCategory.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCategory(id) {
    return prisma.kBCategory.delete({ where: { id } });
  }

  // ─── ARTICLES ────────────────────────────────────────

  async getArticles({ workspaceId, status, categoryId, search, page = 1, pageSize = 50 }) {
    const where = { workspaceId };

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    const [articles, totalItems] = await Promise.all([
      prisma.kBArticle.findMany({
        where,
        include: {
          category: true,
          author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.kBArticle.count({ where }),
    ]);

    return {
      articles: articles.map(a => this._mapAuthor(a)),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  async getArticleBySlug(workspaceId, slug) {
    const article = await prisma.kBArticle.findUnique({
      where: { workspaceId_slug: { workspaceId, slug } },
      include: {
        category: true,
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
    return this._mapAuthor(article);
  }

  async getArticleById(id) {
    const article = await prisma.kBArticle.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
    return this._mapAuthor(article);
  }

  async getPopularArticles(workspaceId, limit = 5) {
    const articles = await prisma.kBArticle.findMany({
      where: { workspaceId, status: 'published' },
      include: {
        category: true,
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { views: 'desc' },
      take: limit,
    });
    return articles.map(a => this._mapAuthor(a));
  }

  async createArticle(data) {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const article = await prisma.kBArticle.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        status: data.status || 'draft',
        tags: data.tags || [],
        categoryId: data.categoryId,
        authorId: data.authorId,
        workspaceId: data.workspaceId,
      },
      include: {
        category: true,
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
    return this._mapAuthor(article);
  }

  async updateArticle(id, data) {
    const updateData = {};
    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    const article = await prisma.kBArticle.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
    return this._mapAuthor(article);
  }

  async deleteArticle(id) {
    return prisma.kBArticle.delete({ where: { id } });
  }

  async recordView(id) {
    return prisma.kBArticle.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async recordFeedback(id, helpful) {
    const data = helpful
      ? { helpful: { increment: 1 } }
      : { notHelpful: { increment: 1 } };

    return prisma.kBArticle.update({
      where: { id },
      data,
    });
  }

  async searchArticles(workspaceId, query, limit = 20) {
    const lowerQuery = query.toLowerCase();

    const articles = await prisma.kBArticle.findMany({
      where: {
        workspaceId,
        status: 'published',
        OR: [
          { title: { contains: lowerQuery, mode: 'insensitive' } },
          { excerpt: { contains: lowerQuery, mode: 'insensitive' } },
          { tags: { hasSome: [lowerQuery] } },
        ],
      },
      include: {
        category: true,
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { views: 'desc' },
      take: limit,
    });
    return articles.map(a => this._mapAuthor(a));
  }
}

module.exports = new KnowledgeBaseService();
