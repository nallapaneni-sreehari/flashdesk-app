const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const KnowledgeBaseController = require('../controllers/knowledge-base.controller');

// Categories
router.get('/categories', authenticate, KnowledgeBaseController.getCategories);
router.post('/categories', authenticate, KnowledgeBaseController.createCategory);
router.patch('/categories/:id', authenticate, KnowledgeBaseController.updateCategory);
router.delete('/categories/:id', authenticate, KnowledgeBaseController.deleteCategory);

// Articles
router.get('/articles', authenticate, KnowledgeBaseController.getArticles);
router.get('/articles/search', authenticate, KnowledgeBaseController.searchArticles);
router.get('/articles/popular', authenticate, KnowledgeBaseController.getPopularArticles);
router.get('/articles/:slug', authenticate, KnowledgeBaseController.getArticleBySlug);
router.post('/articles', authenticate, KnowledgeBaseController.createArticle);
router.patch('/articles/:id', authenticate, KnowledgeBaseController.updateArticle);
router.delete('/articles/:id', authenticate, KnowledgeBaseController.deleteArticle);

// Article interactions
router.post('/articles/:id/view', authenticate, KnowledgeBaseController.recordView);
router.post('/articles/:id/feedback', authenticate, KnowledgeBaseController.recordFeedback);

module.exports = router;
