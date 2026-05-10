const knowledgeBaseService = require('../services/knowledge-base.service');

class KnowledgeBaseController {
  // ─── CATEGORIES ──────────────────────────────────────

  async getCategories(req, res) {
    try {
      const { workspaceId } = req.user;
      const categories = await knowledgeBaseService.getCategories(workspaceId);
      res.ok(200, categories);
    } catch (error) {
      res.handleError(error);
    }
  }

  async createCategory(req, res) {
    try {
      const { workspaceId } = req.user;
      const { name, slug, description, icon, color } = req.body;

      if (!name?.trim() || !slug?.trim() || !description?.trim()) {
        return res.fail(400, { message: 'Name, slug, and description are required' });
      }

      const category = await knowledgeBaseService.createCategory({
        name, slug, description, icon, color, workspaceId,
      });

      res.ok(201, category, 'Category created successfully');
    } catch (error) {
      res.handleError(error, { body: req.body });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const existing = await knowledgeBaseService.getCategoryById(id);
      if (!existing) {
        return res.fail(404, { message: 'Category not found' });
      }

      const category = await knowledgeBaseService.updateCategory(id, req.body);
      res.ok(200, category, 'Category updated successfully');
    } catch (error) {
      res.handleError(error, { categoryId: req.params.id, body: req.body });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const existing = await knowledgeBaseService.getCategoryById(id);
      if (!existing) {
        return res.fail(404, { message: 'Category not found' });
      }

      await knowledgeBaseService.deleteCategory(id);
      res.ok(200, null, 'Category deleted successfully');
    } catch (error) {
      res.handleError(error, { categoryId: req.params.id });
    }
  }

  // ─── ARTICLES ────────────────────────────────────────

  async getArticles(req, res) {
    try {
      const { workspaceId } = req.user;
      const { status, categoryId, search, page, pageSize } = req.query;

      const result = await knowledgeBaseService.getArticles({
        workspaceId,
        status,
        categoryId,
        search,
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 50,
      });

      res.ok(200, result.articles, 'Articles retrieved successfully', result.pagination);
    } catch (error) {
      res.handleError(error, { query: req.query });
    }
  }

  async getArticleBySlug(req, res) {
    try {
      const { workspaceId } = req.user;
      const { slug } = req.params;

      const article = await knowledgeBaseService.getArticleBySlug(workspaceId, slug);
      if (!article) {
        return res.fail(404, { message: 'Article not found' });
      }

      res.ok(200, article);
    } catch (error) {
      res.handleError(error, { slug: req.params.slug });
    }
  }

  async getPopularArticles(req, res) {
    try {
      const { workspaceId } = req.user;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;

      const articles = await knowledgeBaseService.getPopularArticles(workspaceId, limit);
      res.ok(200, articles);
    } catch (error) {
      res.handleError(error);
    }
  }

  async searchArticles(req, res) {
    try {
      const { workspaceId } = req.user;
      const { q } = req.query;

      if (!q?.trim()) {
        return res.ok(200, []);
      }

      const articles = await knowledgeBaseService.searchArticles(workspaceId, q.trim());
      res.ok(200, articles);
    } catch (error) {
      res.handleError(error, { query: req.query });
    }
  }

  async createArticle(req, res) {
    try {
      const { workspaceId, userId } = req.user;
      const { title, excerpt, content, categoryId, tags, status } = req.body;

      if (!title?.trim() || !excerpt?.trim() || !content?.trim() || !categoryId) {
        return res.fail(400, { message: 'Title, excerpt, content, and categoryId are required' });
      }

      const article = await knowledgeBaseService.createArticle({
        title, excerpt, content, categoryId, tags, status,
        authorId: userId,
        workspaceId,
      });

      res.ok(201, article, 'Article created successfully');
    } catch (error) {
      res.handleError(error, { body: req.body });
    }
  }

  async updateArticle(req, res) {
    try {
      const { id } = req.params;
      const existing = await knowledgeBaseService.getArticleById(id);
      if (!existing) {
        return res.fail(404, { message: 'Article not found' });
      }

      const article = await knowledgeBaseService.updateArticle(id, req.body);
      res.ok(200, article, 'Article updated successfully');
    } catch (error) {
      res.handleError(error, { articleId: req.params.id, body: req.body });
    }
  }

  async deleteArticle(req, res) {
    try {
      const { id } = req.params;
      const existing = await knowledgeBaseService.getArticleById(id);
      if (!existing) {
        return res.fail(404, { message: 'Article not found' });
      }

      await knowledgeBaseService.deleteArticle(id);
      res.ok(200, null, 'Article deleted successfully');
    } catch (error) {
      res.handleError(error, { articleId: req.params.id });
    }
  }

  async recordView(req, res) {
    try {
      const { id } = req.params;
      await knowledgeBaseService.recordView(id);
      res.ok(200, null, 'View recorded');
    } catch (error) {
      res.handleError(error, { articleId: req.params.id });
    }
  }

  async recordFeedback(req, res) {
    try {
      const { id } = req.params;
      const { helpful } = req.body;

      if (typeof helpful !== 'boolean') {
        return res.fail(400, { message: 'helpful (boolean) is required' });
      }

      await knowledgeBaseService.recordFeedback(id, helpful);
      res.ok(200, null, 'Feedback recorded');
    } catch (error) {
      res.handleError(error, { articleId: req.params.id });
    }
  }
}

module.exports = new KnowledgeBaseController();
