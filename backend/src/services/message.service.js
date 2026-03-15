const { prisma } = require('../connections/prisma');
const notificationService = require('./notification.service');
const { emailQueue } = require('../queues/email.queue');
const logger = require('../utils/logger');

const USER_SUMMARY = { id: true, firstName: true, lastName: true, avatar: true };

class MessageService {
  /**
   * Create a new message on a ticket.
   */
  async createMessage({ ticketId, content, contentHtml, isInternal, authorType, userId, customerId }) {
    const message = await prisma.message.create({
      data: {
        ticketId,
        content,
        contentHtml: contentHtml || null,
        isInternal: isInternal || false,
        authorType,
        userId: authorType === 'agent' ? userId : null,
        customerId: authorType === 'customer' ? customerId : null,
      },
      include: {
        user: { select: USER_SUMMARY },
        customer: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Create history entry
    const historyType = isInternal ? 'note' : 'reply';
    const historyDesc = isInternal ? 'Internal note added' : 'Reply sent';
    await prisma.historyEntry.create({
      data: {
        type: historyType,
        description: historyDesc,
        ticketId,
        userId: userId || null,
      },
    });

    // Update ticket's updatedAt
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    // Fire notifications and email (async, fire-and-forget)
    if (!isInternal) {
      this._sendReplyNotifications(ticketId, message, userId).catch(err =>
        logger.error({ err }, 'Failed to send reply notifications')
      );

      // Queue outbound email to customer
      if (authorType === 'agent') {
        this._enqueueReplyEmail(ticketId, message).catch(err =>
          logger.error({ err }, 'Failed to enqueue reply email')
        );
      }
    }

    return message;
  }

  /**
   * Get paginated messages for a ticket.
   */
  async getMessages(ticketId, { page = 1, pageSize = 50, includeInternal = true }) {
    const where = { ticketId };
    if (!includeInternal) {
      where.isInternal = false;
    }

    const [messages, totalItems] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          user: { select: USER_SUMMARY },
          customer: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.message.count({ where }),
    ]);

    return {
      messages,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  /**
   * Send notifications to assigned agent and followers when a reply is added.
   */
  async _sendReplyNotifications(ticketId, message, authorId) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        workspace: { select: { ticketPrefix: true } },
        followers: { select: { userId: true } },
      },
    });

    if (!ticket) return;

    const authorUser = authorId
      ? await prisma.user.findUnique({ where: { id: authorId }, select: USER_SUMMARY })
      : null;

    const authorName = authorUser
      ? `${authorUser.firstName} ${authorUser.lastName}`.trim()
      : message.customer?.name || 'Customer';

    const prefix = ticket.workspace?.ticketPrefix || 'TKT';
    const followerIds = ticket.followers.map(f => f.userId);

    await notificationService.notifyTicketReply({
      ticketNumber: ticket.ticketNumber,
      ticketPrefix: prefix,
      subject: ticket.subject,
      assignedAgentId: ticket.assignedAgentId,
      followerIds,
      authorId,
      authorName,
    });
  }

  /**
   * Enqueue an outbound email to the customer when an agent replies.
   */
  async _enqueueReplyEmail(ticketId, message) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        customer: { select: { email: true } },
        workspace: { select: { name: true, slug: true, ticketPrefix: true, supportEmail: true } },
      },
    });

    if (!ticket?.customer?.email) return;

    const agentUser = message.userId
      ? await prisma.user.findUnique({ where: { id: message.userId }, select: USER_SUMMARY })
      : null;

    const agentName = agentUser
      ? `${agentUser.firstName} ${agentUser.lastName}`.trim()
      : 'Support Agent';

    const prefix = ticket.workspace?.ticketPrefix || 'TKT';
    const fromEmail = ticket.workspace?.supportEmail || process.env.SMTP_FROM || 'support@flashdesk.app';

    await emailQueue.add('send-reply', {
      type: 'ticket-reply',
      data: {
        customerEmail: ticket.customer.email,
        ticketPrefix: prefix,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        agentName,
        replyContent: message.content,
        replyHtml: message.contentHtml,
        workspaceName: ticket.workspace?.name || 'Support',
        workspaceSlug: ticket.workspace?.slug,
        fromEmail,
        messageId: message.id,
      },
    });

    logger.debug({ ticketNumber: ticket.ticketNumber, to: ticket.customer.email }, 'Reply email enqueued');
  }
}

module.exports = new MessageService();
