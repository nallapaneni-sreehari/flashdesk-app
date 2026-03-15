const ticketService = require('../services/ticket.service');

class TicketController {
  async createTicket(req, res) {
    try {
      const { subject, description, customerId, type, priority, channel, assignedAgentId, followerIds, tags } = req.body;

      if (!subject?.trim() || !description?.trim() || !customerId) {
        return res.fail(400, { message: 'Subject, description, and customerId are required' });
      }

      const { workspaceId } = req.user;

      const ticket = await ticketService.createTicket(
        { subject, description, customerId, type, priority, channel, assignedAgentId: assignedAgentId || undefined, followerIds, tags, workspaceId }
      );

      res.ok(201, ticket, 'Ticket created successfully');
    } catch (error) {
      res.handleError(error, { body: req.body });
    }
  }

  async getTickets(req, res) {
    try {
      const { workspaceId } = req.user;
      const { search, status, priority, type, channel, assignedAgentId, customerId, page, pageSize, sortBy, sortOrder } = req.query;

      const result = await ticketService.getTickets({
        workspaceId,
        search,
        status,
        priority,
        type,
        channel,
        assignedAgentId,
        customerId,
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 20,
        sortBy,
        sortOrder,
      });

      res.ok(200, result.tickets, 'Tickets retrieved successfully', result.pagination);
    } catch (error) {
      res.handleError(error, { query: req.query });
    }
  }

  async getTicketByNumber(req, res) {
    try {
      const ticketNumber = parseInt(req.params.ticketNumber, 10);

      if (isNaN(ticketNumber)) {
        return res.fail(400, { message: 'Invalid ticket number' });
      }

      const ticket = await ticketService.getTicketByNumber(ticketNumber);

      if (!ticket) {
        return res.fail(404, { message: `Ticket #${ticketNumber} not found` });
      }

      res.ok(200, ticket);
    } catch (error) {
      res.handleError(error, { ticketNumber: req.params.ticketNumber });
    }
  }

  async updateTicket(req, res) {
    try {
      const ticketNumber = parseInt(req.params.ticketNumber, 10);
      if (isNaN(ticketNumber)) {
        return res.fail(400, { message: 'Invalid ticket number' });
      }

      const { workspaceId, userId } = req.user;

      // Look up the ticket by number to get its ID
      const existing = await require('../services/ticket.service').getTicketByNumber(ticketNumber);
      if (!existing || existing.workspaceId !== workspaceId) {
        return res.fail(404, { message: `Ticket #${ticketNumber} not found` });
      }

      const { status, priority, type, assignedAgentId, description, subject, eta, followerIds, tags } = req.body;

      const updates = {};
      if (status !== undefined) updates.status = status;
      if (priority !== undefined) updates.priority = priority;
      if (type !== undefined) updates.type = type;
      if (assignedAgentId !== undefined) updates.assignedAgentId = assignedAgentId;
      if (description !== undefined) updates.description = description;
      if (subject !== undefined) updates.subject = subject;
      if (eta !== undefined) updates.eta = eta;
      if (followerIds !== undefined) updates.followerIds = followerIds;
      if (tags !== undefined) updates.tags = tags;

      const ticket = await ticketService.updateTicket({
        ticketId: existing.id,
        workspaceId,
        userId,
        updates,
      });

      if (!ticket) {
        return res.fail(404, { message: `Ticket #${ticketNumber} not found` });
      }

      res.ok(200, ticket, 'Ticket updated successfully');
    } catch (error) {
      res.handleError(error, { ticketNumber: req.params.ticketNumber, body: req.body });
    }
  }
}

module.exports = new TicketController();
