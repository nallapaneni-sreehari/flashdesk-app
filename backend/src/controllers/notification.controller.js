const notificationService = require('../services/notification.service');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const { userId } = req.user;
      const { page, pageSize, unreadOnly } = req.query;

      const result = await notificationService.getByUser(userId, {
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 20,
        unreadOnly: unreadOnly === 'true',
      });

      res.ok(200, result, 'Notifications retrieved successfully');
    } catch (error) {
      res.handleError(error);
    }
  }

  async getUnreadCount(req, res) {
    try {
      const { userId } = req.user;
      const count = await notificationService.getUnreadCount(userId);
      res.ok(200, { unreadCount: count });
    } catch (error) {
      res.handleError(error);
    }
  }

  async markAsRead(req, res) {
    try {
      const { userId } = req.user;
      const { id } = req.params;

      await notificationService.markAsRead(id, userId);
      res.ok(200, null, 'Notification marked as read');
    } catch (error) {
      res.handleError(error, { notificationId: req.params.id });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const { userId } = req.user;
      await notificationService.markAllAsRead(userId);
      res.ok(200, null, 'All notifications marked as read');
    } catch (error) {
      res.handleError(error);
    }
  }
}

module.exports = new NotificationController();
