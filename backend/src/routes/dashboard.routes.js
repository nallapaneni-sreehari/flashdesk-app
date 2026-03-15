const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const dashboardController = require('../controllers/dashboard.controller');

// GET /dashboard/summary
router.get('/summary', authenticate, dashboardController.getSummary);

// GET /dashboard/activity
router.get('/activity', authenticate, dashboardController.getRecentActivity);

// GET /dashboard/needs-attention
router.get('/needs-attention', authenticate, dashboardController.getNeedsAttention);

// GET /dashboard/top-performers
router.get('/top-performers', authenticate, dashboardController.getTopPerformers);

module.exports = router;
