const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const MessageController = require('../controllers/message.controller');

// Create a message (reply or internal note) on a ticket
router.post('/:ticketNumber/messages', authenticate, MessageController.createMessage);

// Get messages for a ticket
router.get('/:ticketNumber/messages', authenticate, MessageController.getMessages);

module.exports = router;
