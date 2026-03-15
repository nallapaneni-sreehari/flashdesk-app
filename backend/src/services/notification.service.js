const { prisma } = require('../connections/prisma');
const { getIO } = require('../connections/socket');
const logger = require('../utils/logger');

class NotificationService {
  /**
   * Create a notification for a specific user.
   */
  async create({ userId, type, title, message, link }) {
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, link },
    });
    this._emitToUser(userId, notification);
    return notification;
  }

  /**
   * Create notifications for multiple users at once.
   */
  async createMany(notifications) {
    if (!notifications.length) return;
    await prisma.notification.createMany({ data: notifications });

    // Emit to each recipient in real time
    const io = getIO();
    if (io) {
      for (const n of notifications) {
        logger.info({ userId: n.userId, type: n.type, title: n.title }, 'Emitting notification:new (createMany) to user room');
        io.to(`user:${n.userId}`).emit('notification:new', n);
      }
    }
  }

  /**
   * Get paginated notifications for a user.
   */
  async getByUser(userId, { page = 1, pageSize = 20, unreadOnly = false }) {
    const where = { userId };
    if (unreadOnly) where.read = false;

    const [notifications, totalItems, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { time: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  /**
   * Get unread count for a user.
   */
  async getUnreadCount(userId) {
    return prisma.notification.count({ where: { userId, read: false } });
  }

  // ── Ticket-triggered notifications ────────────────────

  /**
   * Notify agent when a ticket is assigned to them.
   */
  async notifyTicketAssigned({ ticketNumber, ticketPrefix, subject, assignedAgentId, assignedBy }) {
    if (!assignedAgentId || assignedAgentId === assignedBy) return;

    await this.create({
      userId: assignedAgentId,
      type: 'assignment',
      title: 'Ticket assigned to you',
      message: `${ticketPrefix}-${ticketNumber}: ${subject}`,
      link: `/tickets/${ticketNumber}`,
    });
  }

  /**
   * Notify assigned agent & followers when a new reply is added.
   */
  async notifyTicketReply({ ticketNumber, ticketPrefix, subject, assignedAgentId, followerIds = [], authorId, authorName }) {
    const recipients = new Set([...(followerIds || [])]);
    if (assignedAgentId) recipients.add(assignedAgentId);
    recipients.delete(authorId); // don't notify the author

    if (!recipients.size) return;

    const notifications = [...recipients].map(userId => ({
      userId,
      type: 'ticket',
      title: `New reply on ${ticketPrefix}-${ticketNumber}`,
      message: `${authorName} replied on: ${subject}`,
      link: `/tickets/${ticketNumber}`,
    }));

    await this.createMany(notifications);
  }

  /**
   * Notify assigned agent & followers when ticket status changes.
   */
  async notifyTicketStatusChanged({ ticketNumber, ticketPrefix, subject, assignedAgentId, followerIds = [], changedBy, fromStatus, toStatus }) {
    const recipients = new Set([...(followerIds || [])]);
    if (assignedAgentId) recipients.add(assignedAgentId);
    recipients.delete(changedBy);

    if (!recipients.size) return;

    const notifications = [...recipients].map(userId => ({
      userId,
      type: 'ticket',
      title: `Ticket status updated`,
      message: `${ticketPrefix}-${ticketNumber}: ${fromStatus} → ${toStatus}`,
      link: `/tickets/${ticketNumber}`,
    }));

    await this.createMany(notifications);
  }

  /**
   * Notify assigned agent & followers when ticket priority changes.
   */
  async notifyTicketPriorityChanged({ ticketNumber, ticketPrefix, subject, assignedAgentId, followerIds = [], changedBy, fromPriority, toPriority }) {
    const recipients = new Set([...(followerIds || [])]);
    if (assignedAgentId) recipients.add(assignedAgentId);
    recipients.delete(changedBy);

    if (!recipients.size) return;

    const notifications = [...recipients].map(userId => ({
      userId,
      type: 'ticket',
      title: `Ticket priority changed to ${toPriority}`,
      message: `${ticketPrefix}-${ticketNumber}: ${subject}`,
      link: `/tickets/${ticketNumber}`,
    }));

    await this.createMany(notifications);
  }

  /**
   * Notify when a new ticket is created (to admins/managers or round-robin).
   * Notifies all agents in the workspace.
   */
  async notifyNewTicket({ ticketNumber, ticketPrefix, subject, workspaceId, createdById }) {
    const agents = await prisma.user.findMany({
      where: {
        workspaceId,
        status: 'active',
        role: { in: ['admin', 'agent'] },
        id: { not: createdById || undefined },
      },
      select: { id: true },
    });

    if (!agents.length) return;

    const notifications = agents.map(a => ({
      userId: a.id,
      type: 'ticket',
      title: 'New ticket created',
      message: `${ticketPrefix}-${ticketNumber}: ${subject}`,
      link: `/tickets/${ticketNumber}`,
    }));

    await this.createMany(notifications);
  }

  /**
   * Notify when user is mentioned (future use).
   */
  async notifyMention({ userId, mentionedBy, ticketNumber, ticketPrefix }) {
    if (userId === mentionedBy) return;

    await this.create({
      userId,
      type: 'mention',
      title: 'You were mentioned',
      message: `In ticket ${ticketPrefix}-${ticketNumber}`,
      link: `/tickets/${ticketNumber}`,
    });
  }

  /**
   * Emit a notification to a specific user via Socket.IO.
   */
  _emitToUser(userId, notification) {
    const io = getIO();
    if (io) {
      logger.info({ userId, type: notification.type, title: notification.title }, 'Emitting notification:new to user room');
      io.to(`user:${userId}`).emit('notification:new', notification);
    } else {
      logger.warn('Cannot emit notification — Socket.IO not initialized');
    }
  }
}

module.exports = new NotificationService();
