const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth');
const AgentController = require('../controllers/agent.controller');

// CRUD
router.post('/', authenticate, AgentController.createAgent);
router.get('/', authenticate, AgentController.getAgents);
router.get('/:id', authenticate, AgentController.getAgentById);
router.patch('/:id', authenticate, AgentController.updateAgent);
router.delete('/:id', authenticate, AgentController.deleteAgent);

// Bulk import
router.post('/bulk', authenticate, AgentController.bulkCreateAgents);

// Agent's tickets
router.get('/:id/tickets', authenticate, AgentController.getAgentTickets);

module.exports = router;
