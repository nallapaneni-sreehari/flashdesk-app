const express = require('express');
const router = express.Router();
const InboundWebhookController = require('../controllers/inbound-webhook.controller');

// Postmark inbound email webhook (no auth — Postmark sends directly)
router.post('/inbound-email/postmark', InboundWebhookController.postmark);

module.exports = router;
