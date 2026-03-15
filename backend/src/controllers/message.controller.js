const messageService = require('../services/message.service');
const ticketService = require('../services/ticket.service');

class MessageController {
  async createMessage(req, res) {
    try {
      const ticketNumber = parseInt(req.params.ticketNumber, 10);
      if (isNaN(ticketNumber)) {
        return res.fail(400, { message: 'Invalid ticket number' });
      }

      const { content, contentHtml, isInternal } = req.body;
      if (!content?.trim()) {
        return res.fail(400, { message: 'Message content is required' });
      }

      const { workspaceId, userId } = req.user;

      // Look up ticket by number and verify workspace
      const ticket = await ticketService.getTicketByNumber(ticketNumber);
      if (!ticket || ticket.workspaceId !== workspaceId) {
        return res.fail(404, { message: `Ticket #${ticketNumber} not found` });
      }

      const message = await messageService.createMessage({
        ticketId: ticket.id,
        content: content.trim(),
        contentHtml,
        isInternal: isInternal || false,
        authorType: 'agent',
        userId,
      });

      // Broadcast via Socket.IO to all clients in the room
      const { getIO } = require('../connections/socket');
      const io = getIO();
      if (io) {
        io.to(`ticket:${ticketNumber}`).emit('message:new', message);
      }

      res.ok(201, message, isInternal ? 'Note added' : 'Reply sent');
    } catch (error) {
      res.handleError(error, { ticketNumber: req.params.ticketNumber, body: req.body });
    }
  }

  async getMessages(req, res) {
    try {
      const ticketNumber = parseInt(req.params.ticketNumber, 10);
      if (isNaN(ticketNumber)) {
        return res.fail(400, { message: 'Invalid ticket number' });
      }

      const { workspaceId } = req.user;

      const ticket = await ticketService.getTicketByNumber(ticketNumber);
      if (!ticket || ticket.workspaceId !== workspaceId) {
        return res.fail(404, { message: `Ticket #${ticketNumber} not found` });
      }

      const { page, pageSize } = req.query;

      const result = await messageService.getMessages(ticket.id, {
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 50,
        includeInternal: true,
      });

      res.ok(200, result.messages, 'Messages retrieved', result.pagination);
    } catch (error) {
      res.handleError(error, { ticketNumber: req.params.ticketNumber });
    }
  }
}

module.exports = new MessageController();
