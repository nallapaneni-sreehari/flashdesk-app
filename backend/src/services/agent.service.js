const { prisma } = require("../connections/prisma");
const bcrypt = require("bcrypt");
const { emailQueue } = require("../queues/email.queue");
const logger = require("../utils/logger");

const SALT_ROUNDS = 12;

const AGENT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
  phone: true,
  role: true,
  status: true,
  bio: true,
  jobTitle: true,
  department: true,
  timezone: true,
  lastActiveAt: true,
  createdAt: true,
  updatedAt: true,
};

class AgentService {
  async createAgent(data) {
    const plainPassword = data.password || "changeme123";
    const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    const agent = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        phone: data.phone || null,
        avatar: data.avatar || null,
        role: "agent",
        status: data.status || "active",
        department: data.department || null,
        jobTitle: data.jobTitle || null,
        bio: data.bio || null,
        timezone: data.timezone || "UTC",
        workspaceId: data.workspaceId,
      },
      select: AGENT_SELECT,
    });

    // Send welcome email if requested
    if (data.sendInvite) {
      try {
        const workspace = await prisma.workspace.findUnique({
          where: { id: data.workspaceId },
          select: { name: true, supportEmail: true },
        });

        await emailQueue.add('welcome-agent', {
          type: 'welcome-agent',
          data: {
            agentEmail: data.email,
            firstName: data.firstName,
            password: plainPassword,
            workspaceName: workspace?.name || 'Flashdesk',
            fromEmail: workspace?.supportEmail || process.env.SMTP_FROM,
          },
        });
      } catch (err) {
        logger.error({ err, agentEmail: data.email }, 'Failed to queue welcome email');
      }
    }

    return agent;
  }

  async getAgents({ workspaceId, search, status, role, page = 1, pageSize = 20 }) {
    const where = { workspaceId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (role) {
      where.role = role;
    }

    const [agents, totalItems] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          ...AGENT_SELECT,
          _count: {
            select: {
              assignedTickets: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    // Get resolved ticket counts for each agent
    const agentIds = agents.map((a) => a.id);
    const resolvedCounts = await prisma.ticket.groupBy({
      by: ["assignedAgentId"],
      where: {
        assignedAgentId: { in: agentIds },
        status: { in: ["resolved", "closed"] },
      },
      _count: true,
    });

    const resolvedMap = new Map(resolvedCounts.map((r) => [r.assignedAgentId, r._count]));

    const enriched = agents.map(({ _count, ...agent }) => ({
      ...agent,
      assignedTickets: _count.assignedTickets,
      resolvedTickets: resolvedMap.get(agent.id) || 0,
    }));

    return {
      agents: enriched,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  async getAgentById(id) {
    const agent = await prisma.user.findUnique({
      where: { id },
      select: {
        ...AGENT_SELECT,
        _count: {
          select: {
            assignedTickets: true,
          },
        },
      },
    });

    if (!agent) return null;

    const resolvedCount = await prisma.ticket.count({
      where: {
        assignedAgentId: id,
        status: { in: ["resolved", "closed"] },
      },
    });

    const { _count, ...rest } = agent;
    return {
      ...rest,
      assignedTickets: _count.assignedTickets,
      resolvedTickets: resolvedCount,
    };
  }

  async updateAgent(id, data) {
    const updateData = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: AGENT_SELECT,
    });
  }

  async deleteAgent(id) {
    const assignedCount = await prisma.ticket.count({
      where: {
        assignedAgentId: id,
        status: { in: ["open", "in_progress", "waiting"] },
      },
    });

    if (assignedCount > 0) {
      const error = new Error(
        `Cannot delete agent: ${assignedCount} active ticket(s) are still assigned. Please reassign them first.`
      );
      error.statusCode = 409;
      error.code = "AGENT_HAS_TICKETS";
      throw error;
    }
    return prisma.user.delete({
      where: { id },
    });
  }

  async bulkCreateAgents(agents, workspaceId) {
    const results = { created: [], errors: [] };

    for (const agent of agents) {
      try {
        const created = await this.createAgent({
          firstName: agent.firstName,
          lastName: agent.lastName,
          email: agent.email,
          phone: agent.phone || null,
          role: agent.role || "agent",
          department: agent.department || null,
          password: agent.password,
          workspaceId,
        });
        results.created.push(created);
      } catch (error) {
        results.errors.push({
          email: agent.email,
          message: error.code === "P2002" ? "Email already exists" : error.message,
        });
      }
    }

    return results;
  }

  async getAgentTickets(agentId, { page = 1, pageSize = 10 }) {
    const where = { assignedAgentId: agentId };

    const [tickets, totalItems] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.ticket.count({ where }),
    ]);

    return {
      tickets,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }
}

module.exports = new AgentService();
