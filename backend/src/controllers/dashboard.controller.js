const dashboardService = require('../services/dashboard.service');

class DashboardController {
  async getSummary(req, res) {
    try {
      const { workspaceId } = req.user;

      const summary = await dashboardService.getSummary(workspaceId);
      res.ok(200, summary);
    } catch (error) {
      res.handleError(error, { workspaceId: req.user?.workspaceId });
    }
  }

  async getRecentActivity(req, res) {
    try {
      const { workspaceId } = req.user;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 15;

      const activity = await dashboardService.getRecentActivity(workspaceId, { limit });
      res.ok(200, activity, 'Recent activity retrieved successfully');
    } catch (error) {
      res.handleError(error, { workspaceId: req.user?.workspaceId });
    }
  }

  async getNeedsAttention(req, res) {
    try {
      const { workspaceId, userId, role } = req.user;

      const data = await dashboardService.getNeedsAttention(workspaceId, { userId, role });
      res.ok(200, data);
    } catch (error) {
      res.handleError(error, { workspaceId: req.user?.workspaceId });
    }
  }

  async getTopPerformers(req, res) {
    try {
      const { workspaceId } = req.user;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
      const days = req.query.days ? parseInt(req.query.days, 10) : 30;

      const data = await dashboardService.getTopPerformers(workspaceId, { limit, days });
      res.ok(200, data);
    } catch (error) {
      res.handleError(error, { workspaceId: req.user?.workspaceId });
    }
  }
}

module.exports = new DashboardController();
