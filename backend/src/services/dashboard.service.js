const { prisma } = require('../connections/prisma');

class DashboardService {
  async getSummary(workspaceId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOpen,
      unassigned,
      resolvedToday,
      overdueTickets,
      totalTickets,
      avgResponseResult,
      slaTickets,
    ] = await Promise.all([
      // Open tickets (open + in_progress + waiting)
      prisma.ticket.count({
        where: {
          workspaceId,
          status: { in: ['open', 'in_progress', 'waiting'] },
        },
      }),

      // Unassigned tickets (not closed/resolved, no agent)
      prisma.ticket.count({
        where: {
          workspaceId,
          assignedAgentId: null,
          status: { in: ['open', 'in_progress', 'waiting'] },
        },
      }),

      // Resolved today
      prisma.ticket.count({
        where: {
          workspaceId,
          status: { in: ['resolved', 'closed'] },
          resolvedAt: { gte: today },
        },
      }),

      // Overdue tickets (past resolutionDue, not resolved/closed)
      prisma.ticket.count({
        where: {
          workspaceId,
          status: { in: ['open', 'in_progress', 'waiting'] },
          resolutionDue: { lt: new Date() },
        },
      }),

      // Total tickets
      prisma.ticket.count({
        where: { workspaceId },
      }),

      // Avg first response time (in hours)
      prisma.ticket.aggregate({
        where: {
          workspaceId,
          firstResponseAt: { not: null },
        },
        _avg: { eta: true }, // placeholder — we compute manually below
        _count: true,
      }),

      // SLA compliance — tickets with SLA dates
      prisma.ticket.findMany({
        where: {
          workspaceId,
          OR: [
            { firstResponseDue: { not: null } },
            { resolutionDue: { not: null } },
          ],
        },
        select: {
          firstResponseDue: true,
          firstResponseAt: true,
          resolutionDue: true,
          resolvedAt: true,
          status: true,
        },
      }),
    ]);

    // Calculate avg response time in hours
    const respondedTickets = await prisma.ticket.findMany({
      where: {
        workspaceId,
        firstResponseAt: { not: null },
      },
      select: {
        createdAt: true,
        firstResponseAt: true,
      },
    });

    let avgResponseHours = 0;
    if (respondedTickets.length > 0) {
      const totalMs = respondedTickets.reduce((sum, t) => {
        return sum + (t.firstResponseAt.getTime() - t.createdAt.getTime());
      }, 0);
      avgResponseHours = Math.round((totalMs / respondedTickets.length / (1000 * 60 * 60)) * 10) / 10;
    }

    // Calculate SLA compliance
    const now = new Date();
    let firstResponseMet = 0;
    let firstResponseTotal = 0;
    let resolutionMet = 0;
    let resolutionTotal = 0;

    for (const t of slaTickets) {
      if (t.firstResponseDue) {
        firstResponseTotal++;
        if (t.firstResponseAt && t.firstResponseAt <= t.firstResponseDue) {
          firstResponseMet++;
        } else if (!t.firstResponseAt && now <= t.firstResponseDue) {
          firstResponseMet++; // still within window
        }
      }
      if (t.resolutionDue) {
        resolutionTotal++;
        if (t.resolvedAt && t.resolvedAt <= t.resolutionDue) {
          resolutionMet++;
        } else if (!t.resolvedAt && t.status !== 'resolved' && t.status !== 'closed' && now <= t.resolutionDue) {
          resolutionMet++; // still within window
        }
      }
    }

    const firstResponse = firstResponseTotal > 0 ? Math.round((firstResponseMet / firstResponseTotal) * 100) : 100;
    const resolution = resolutionTotal > 0 ? Math.round((resolutionMet / resolutionTotal) * 100) : 100;
    const overall = Math.round((firstResponse + resolution) / 2);

    return {
      totalOpen,
      resolvedToday,
      unassigned,
      overdueTickets,
      avgResponseHours,
      totalTickets,
      sla: {
        firstResponse,
        resolution,
        overall,
      },
    };
  }

  async getRecentActivity(workspaceId, { limit = 15 } = {}) {
    const entries = await prisma.historyEntry.findMany({
      where: {
        ticket: { workspaceId },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        description: true,
        fromValue: true,
        toValue: true,
        timestamp: true,
        ticketId: true,
        ticket: {
          select: {
            ticketNumber: true,
            subject: true,
            workspace: {
              select: { ticketPrefix: true },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return entries.map(e => ({
      id: e.id,
      type: e.type,
      description: e.description,
      fromValue: e.fromValue,
      toValue: e.toValue,
      timestamp: e.timestamp,
      ticketId: e.ticketId,
      ticketNumber: e.ticket.ticketNumber,
      ticketPrefix: e.ticket.workspace?.ticketPrefix ?? null,
      subject: e.ticket.subject,
      user: e.user
        ? { id: e.user.id, name: `${e.user.firstName} ${e.user.lastName}`.trim(), avatar: e.user.avatar }
        : null,
    }));
  }

  async getNeedsAttention(workspaceId, { userId, role }) {
    const ticketSelect = {
      id: true,
      ticketNumber: true,
      subject: true,
      status: true,
      priority: true,
      createdAt: true,
      customer: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      assignedAgent: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
    };

    if (role === 'admin') {
      const [unassigned, escalated] = await Promise.all([
        prisma.ticket.findMany({
          where: {
            workspaceId,
            assignedAgentId: null,
            status: { in: ['open', 'in_progress', 'waiting'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: ticketSelect,
        }),
        prisma.ticket.findMany({
          where: {
            workspaceId,
            priority: { in: ['urgent', 'high'] },
            status: { in: ['open', 'in_progress', 'waiting'] },
          },
          orderBy: [
            { priority: 'asc' },
            { createdAt: 'desc' },
          ],
          take: 5,
          select: ticketSelect,
        }),
      ]);

      const mapTicket = (t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        customer: t.customer ? { id: t.customer.id, name: t.customer.name } : null,
        assignedAgent: t.assignedAgent
          ? { id: t.assignedAgent.id, name: `${t.assignedAgent.firstName} ${t.assignedAgent.lastName}`.trim(), avatar: t.assignedAgent.avatar }
          : null,
      });

      return {
        unassigned: unassigned.map(mapTicket),
        escalated: escalated.map(mapTicket),
        myTickets: [],
      };
    }

    // Agent: their assigned active tickets
    const myTickets = await prisma.ticket.findMany({
      where: {
        workspaceId,
        assignedAgentId: userId,
        status: { in: ['open', 'in_progress', 'waiting'] },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 5,
      select: ticketSelect,
    });

    const mapTicket = (t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
      customer: t.customer ? { id: t.customer.id, name: t.customer.name } : null,
      assignedAgent: t.assignedAgent
        ? { id: t.assignedAgent.id, name: `${t.assignedAgent.firstName} ${t.assignedAgent.lastName}`.trim(), avatar: t.assignedAgent.avatar }
        : null,
    });

    return {
      unassigned: [],
      escalated: [],
      myTickets: myTickets.map(mapTicket),
    };
  }

  async getTopPerformers(workspaceId, { limit = 5, days = 30 } = {}) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await prisma.ticket.groupBy({
      by: ['assignedAgentId'],
      where: {
        workspaceId,
        assignedAgentId: { not: null },
        status: { in: ['resolved', 'closed'] },
        resolvedAt: { gte: since },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    if (results.length === 0) return [];

    const agentIds = results.map(r => r.assignedAgentId);
    const agents = await prisma.user.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, firstName: true, lastName: true, avatar: true },
    });

    const agentMap = new Map(agents.map(a => [a.id, a]));

    return results
      .map(r => {
        const agent = agentMap.get(r.assignedAgentId);
        if (!agent) return null;
        return {
          agent: {
            id: agent.id,
            name: `${agent.firstName} ${agent.lastName}`.trim(),
            avatar: agent.avatar,
          },
          resolvedCount: r._count.id,
        };
      })
      .filter(Boolean);
  }
}

module.exports = new DashboardService();
