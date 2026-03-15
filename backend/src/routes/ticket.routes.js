const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const TicketController = require('../controllers/ticket.controller');

// Create a new ticket
router.post('/', authenticate, TicketController.createTicket);

// List tickets with filters & pagination
router.get('/', authenticate, TicketController.getTickets);

// Get ticket by ticket number
router.get('/:ticketNumber', authenticate, TicketController.getTicketByNumber);

// Update ticket
router.patch('/:ticketNumber', authenticate, TicketController.updateTicket);

module.exports = router;