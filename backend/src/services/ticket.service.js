const { prisma } = require("../connections/prisma");
const notificationService = require('./notification.service');
const { emailQueue } = require('../queues/email.queue');
const logger = require('../utils/logger');

const USER_SUMMARY = { id: true, firstName: true, lastName: true, avatar: true };

class TicketService {
  async createTicket(data) {
    const ticketData = {
      subject: data.subject,
      description: data.description,
      type: data.type,
      priority: data.priority,
      channel: data.channel,
      customerId: data.customerId,
      workspaceId: data.workspaceId,
      assignedAgentId: data.assignedAgentId || undefined,
      history: { create: { type: "created", description: "Ticket created" } },
    };

    if (data.followerIds?.length) {
      ticketData.followers = {
        create: data.followerIds.map((userId) => ({ userId })),
      };
    }

    if (data.tags?.length) {
      const workspaceId = data.workspaceId;

      ticketData.tags = {
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { workspaceId_name: { workspaceId, name } },
              create: { name, workspaceId },
            },
          },
        })),
      };
    }

    return prisma.ticket.create({
      data: ticketData,
      include: {
        customer: { select: { id: true, name: true, email: true, avatar: true } },
        assignedAgent: { select: USER_SUMMARY },
        followers: { include: { user: { select: USER_SUMMARY } } },
        tags: { include: { tag: true } },
        workspace: { select: { ticketPrefix: true, name: true, slug: true, supportEmail: true } },
      },
    }).then(async ticket => {
      // Create initial system message in the conversation
      const customerName = ticket.customer?.name || 'a customer';
      await prisma.message.create({
        data: {
          ticketId: ticket.id,
          content: `Ticket created on behalf of ${customerName}.`,
          authorType: 'system',
          isInternal: false,
        },
      }).catch(err => logger.error({ err }, 'Failed to create initial system message'));
      // Fire notifications asynchronously
      const prefix = ticket.workspace?.ticketPrefix || 'TKT';
      notificationService.notifyNewTicket({
        ticketNumber: ticket.ticketNumber,
        ticketPrefix: prefix,
        subject: ticket.subject,
        workspaceId: data.workspaceId,
        createdById: data.assignedAgentId,
      }).catch(err => logger.error({ err }, 'Failed to send new ticket notifications'));

      if (ticket.assignedAgentId) {
        notificationService.notifyTicketAssigned({
          ticketNumber: ticket.ticketNumber,
          ticketPrefix: prefix,
          subject: ticket.subject,
          assignedAgentId: ticket.assignedAgentId,
        }).catch(err => logger.error({ err }, 'Failed to send assignment notification'));
      }

      // Send ticket-created confirmation email to customer
      if (ticket.customer?.email) {
        const fromEmail = ticket.workspace?.supportEmail || process.env.SMTP_FROM || 'support@flashdesk.app';
        emailQueue.add('ticket-created', {
          type: 'ticket-created',
          data: {
            customerEmail: ticket.customer.email,
            ticketPrefix: prefix,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            description: data.description,
            workspaceName: ticket.workspace?.name || 'Support',
            workspaceSlug: ticket.workspace?.slug,
            fromEmail,
          },
        }).catch(err => logger.error({ err }, 'Failed to enqueue ticket-created email'));
      }

      return ticket;
    });
  }

  async getTickets({ workspaceId, search, status, priority, type, channel, assignedAgentId, customerId, page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const where = { workspaceId };

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
      ];
      const searchNum = parseInt(search, 10);
      if (!isNaN(searchNum)) {
        where.OR.push({ ticketNumber: searchNum });
      }
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;
    if (channel) where.channel = channel;
    if (assignedAgentId) where.assignedAgentId = assignedAgentId;
    if (customerId) where.customerId = customerId;

    const orderBy = { [sortBy]: sortOrder };

    const [tickets, totalItems] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, avatar: true } },
          assignedAgent: { select: USER_SUMMARY },
          workspace: { select: { ticketPrefix: true } },
          tags: { include: { tag: { select: { id: true, name: true } } } },
          _count: { select: { messages: true } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.ticket.count({ where }),
    ]);

    const enriched = tickets.map(({ tags, workspace, _count, ...t }) => ({
      ...t,
      ticketPrefix: workspace?.ticketPrefix || null,
      tags: tags.map(tt => tt.tag.name),
      messageCount: _count.messages,
    }));

    return {
      tickets: enriched,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  async getTicketByNumber(ticketNumber) {
    return prisma.ticket.findUnique({
      where: { ticketNumber },
      include: {
        customer: { select: { id: true, name: true, email: true, avatar: true } },
        assignedAgent: { select: USER_SUMMARY },
        workspace: { select: { ticketPrefix: true } },
        followers: { include: { user: { select: USER_SUMMARY } } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: USER_SUMMARY },
            customer: { select: { id: true, name: true, avatar: true } },
          },
        },
        history: {
          orderBy: { timestamp: 'desc' },
          include: { user: { select: USER_SUMMARY } },
        },
      },
    });
  }

  async updateTicket({ ticketId, workspaceId, userId, updates }) {
    const existing = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        assignedAgent: { select: USER_SUMMARY },
        followers: { include: { user: { select: USER_SUMMARY } } },
        tags: { include: { tag: true } },
      },
    });

    if (!existing || existing.workspaceId !== workspaceId) {
      return null;
    }

    const data = {};
    const historyEntries = [];

    // Status change
    if (updates.status !== undefined && updates.status !== existing.status) {
      historyEntries.push({
        type: 'status_changed',
        description: `Status changed from ${existing.status} to ${updates.status}`,
        fromValue: existing.status,
        toValue: updates.status,
        userId,
      });
      data.status = updates.status;
      if (updates.status === 'resolved' && !existing.resolvedAt) {
        data.resolvedAt = new Date();
      }
      if (updates.status === 'closed' && !existing.closedAt) {
        data.closedAt = new Date();
      }
    }

    // Priority change
    if (updates.priority !== undefined && updates.priority !== existing.priority) {
      historyEntries.push({
        type: 'priority_changed',
        description: `Priority changed from ${existing.priority} to ${updates.priority}`,
        fromValue: existing.priority,
        toValue: updates.priority,
        userId,
      });
      data.priority = updates.priority;
    }

    // Type change
    if (updates.type !== undefined && updates.type !== existing.type) {
      historyEntries.push({
        type: 'updated',
        description: `Type changed from ${existing.type} to ${updates.type}`,
        fromValue: existing.type,
        toValue: updates.type,
        userId,
      });
      data.type = updates.type;
    }

    // Agent assignment
    if (updates.assignedAgentId !== undefined && updates.assignedAgentId !== existing.assignedAgentId) {
      const fromName = existing.assignedAgent
        ? `${existing.assignedAgent.firstName} ${existing.assignedAgent.lastName}`.trim()
        : 'Unassigned';
      let toName = 'Unassigned';
      if (updates.assignedAgentId) {
        const newAgent = await prisma.user.findUnique({
          where: { id: updates.assignedAgentId },
          select: USER_SUMMARY,
        });
        if (newAgent) toName = `${newAgent.firstName} ${newAgent.lastName}`.trim();
      }
      historyEntries.push({
        type: 'assigned',
        description: `Assigned to ${toName}`,
        fromValue: fromName,
        toValue: toName,
        userId,
      });
      data.assignedAgentId = updates.assignedAgentId || null;
    }

    // Description change
    if (updates.description !== undefined && updates.description !== existing.description) {
      historyEntries.push({
        type: 'updated',
        description: 'Description updated',
        userId,
      });
      data.description = updates.description;
    }

    // Subject change
    if (updates.subject !== undefined && updates.subject !== existing.subject) {
      historyEntries.push({
        type: 'updated',
        description: `Subject changed`,
        fromValue: existing.subject,
        toValue: updates.subject,
        userId,
      });
      data.subject = updates.subject;
    }

    // ETA change
    if (updates.eta !== undefined && updates.eta !== existing.eta) {
      data.eta = updates.eta;
    }

    // Build the update within a transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Handle followers sync if provided
      if (updates.followerIds !== undefined) {
        const currentIds = existing.followers.map(f => f.userId).sort();
        const newIds = [...updates.followerIds].sort();
        if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
          // Remove all existing followers
          await tx.ticketFollower.deleteMany({ where: { ticketId } });
          // Add new followers
          if (newIds.length > 0) {
            await tx.ticketFollower.createMany({
              data: newIds.map(userId => ({ ticketId, userId })),
            });
          }
          historyEntries.push({
            type: 'updated',
            description: `Followers updated`,
            userId,
          });
        }
      }

      // Handle tags sync if provided
      if (updates.tags !== undefined) {
        const currentTags = existing.tags.map(t => t.tag.name).sort();
        const newTags = [...updates.tags].sort();
        if (JSON.stringify(currentTags) !== JSON.stringify(newTags)) {
          await tx.ticketTag.deleteMany({ where: { ticketId } });
          if (newTags.length > 0) {
            for (const name of newTags) {
              const tag = await tx.tag.upsert({
                where: { workspaceId_name: { workspaceId, name } },
                update: {},
                create: { name, workspaceId },
              });
              await tx.ticketTag.create({ data: { ticketId, tagId: tag.id } });
            }
          }
        }
      }

      // Create history entries
      if (historyEntries.length > 0) {
        await tx.historyEntry.createMany({ data: historyEntries.map(h => ({ ...h, ticketId })) });
      }

      // Update the ticket
      return tx.ticket.update({
        where: { id: ticketId },
        data,
        include: {
          customer: { select: { id: true, name: true, email: true, avatar: true } },
          assignedAgent: { select: USER_SUMMARY },
          workspace: { select: { ticketPrefix: true } },
          followers: { include: { user: { select: USER_SUMMARY } } },
          tags: { include: { tag: { select: { id: true, name: true } } } },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: { select: USER_SUMMARY },
              customer: { select: { id: true, name: true, avatar: true } },
            },
          },
          history: {
            orderBy: { timestamp: 'desc' },
            include: { user: { select: USER_SUMMARY } },
          },
        },
      });
    });

    // Fire notifications asynchronously after transaction completes
    this._sendUpdateNotifications(existing, updates, result, userId);

    return result;
  }

  /**
   * Fire notifications based on what changed in the ticket update.
   * Called after updateTicket completes successfully.
   */
  _sendUpdateNotifications(existing, updates, result, userId) {
    const prefix = result.workspace?.ticketPrefix || 'TKT';
    const followerIds = result.followers?.map(f => f.userId) || [];

    // Assignment notification
    if (updates.assignedAgentId !== undefined && updates.assignedAgentId !== existing.assignedAgentId) {
      notificationService.notifyTicketAssigned({
        ticketNumber: result.ticketNumber,
        ticketPrefix: prefix,
        subject: result.subject,
        assignedAgentId: updates.assignedAgentId,
        assignedBy: userId,
      }).catch(err => logger.error({ err }, 'Failed to send assignment notification'));
    }

    // Status change notification
    if (updates.status !== undefined && updates.status !== existing.status) {
      notificationService.notifyTicketStatusChanged({
        ticketNumber: result.ticketNumber,
        ticketPrefix: prefix,
        subject: result.subject,
        assignedAgentId: result.assignedAgentId,
        followerIds,
        changedBy: userId,
        fromStatus: existing.status,
        toStatus: updates.status,
      }).catch(err => logger.error({ err }, 'Failed to send status change notification'));
    }

    // Priority change notification
    if (updates.priority !== undefined && updates.priority !== existing.priority) {
      notificationService.notifyTicketPriorityChanged({
        ticketNumber: result.ticketNumber,
        ticketPrefix: prefix,
        subject: result.subject,
        assignedAgentId: result.assignedAgentId,
        followerIds,
        changedBy: userId,
        fromPriority: existing.priority,
        toPriority: updates.priority,
      }).catch(err => logger.error({ err }, 'Failed to send priority change notification'));
    }
  }

  async createTicketFromEmail({ workspaceId, email, name, subject, description, tags }) {
    let customer;

    if (workspaceId) {
      customer = await prisma.customer.upsert({
        where: { workspaceId_email: { workspaceId, email } }, //workspaceId_email = unique constraint in the database
        update: {},
        create: { email, name: name || email, workspaceId },
      });
    } else {
      customer = await prisma.customer.findFirst({ where: { email } });
      if (!customer) {
        customer = await prisma.customer.create({
          data: { email, name: name || email },
        });
      }
    }

    return this.createTicket({
      subject,
      description,
      customerId: customer.id,
      channel: "email",
      tags,
    });
  }
}

module.exports = new TicketService();
