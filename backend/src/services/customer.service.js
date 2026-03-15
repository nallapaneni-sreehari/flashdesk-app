const { prisma } = require("../connections/prisma");

class CustomerService {
  async createCustomer(data) {
    return prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        avatar: data.avatar || null,
        tier: data.tier || null,
        workspaceId: data.workspaceId || null,
        companyId: data.companyId || null,
      },
    });
  }

  async getCustomers({ workspaceId, search, page = 1, pageSize = 20 }) {
    const where = {};

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customers, totalItems] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: {
              tickets: true,
              messages: true,
            },
          },
          tickets: {
            where: { status: { in: ["open", "in_progress", "waiting"] } },
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    // Flatten ticket counts
    const enriched = customers.map(({ tickets, ...c }) => ({
      ...c,
      totalTickets: c._count.tickets,
      openTickets: tickets.length,
    }));

    return {
      customers: enriched,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  async getCustomerById(id) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: { select: { tickets: true, messages: true } },
        workspace: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        tickets: {
          where: { status: { in: ["open", "in_progress", "waiting"] } },
          select: { id: true },
        },
      },
    });

    if (!customer) return null;

    const { tickets, ...rest } = customer;
    return {
      ...rest,
      totalTickets: rest._count.tickets,
      openTickets: tickets.length,
    };
  }

  async updateCustomer(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.tier !== undefined) updateData.tier = data.tier;
    if (data.lastContactAt !== undefined) updateData.lastContactAt = data.lastContactAt;

    return prisma.customer.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCustomer(id) {
    const ticketCount = await prisma.ticket.count({
      where: { customerId: id },
    });

    if (ticketCount > 0) {
      const error = new Error(
        `Cannot delete customer: ${ticketCount} ticket(s) are still associated. Please reassign or close them first.`
      );
      error.statusCode = 409;
      error.code = "CUSTOMER_HAS_TICKETS";
      throw error;
    }

    return prisma.customer.delete({
      where: { id },
    });
  }

  async bulkCreateCustomers(customers, workspaceId) {
    const results = { created: [], errors: [] };

    for (const customer of customers) {
      try {
        const created = await prisma.customer.create({
          data: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || null,
            tier: customer.tier || null,
            workspaceId: workspaceId || null,
            companyId: customer.companyId || null,
          },
        });
        results.created.push(created);
      } catch (error) {
        results.errors.push({
          email: customer.email,
          message: error.code === "P2002" ? "Email already exists" : error.message,
        });
      }
    }

    return results;
  }

  async getCustomerTickets(customerId, { page = 1, pageSize = 10 }) {
    const where = { customerId };

    const [tickets, totalItems] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          assignedAgent: { select: { id: true, firstName: true, lastName: true, avatar: true } },
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

module.exports = new CustomerService();
