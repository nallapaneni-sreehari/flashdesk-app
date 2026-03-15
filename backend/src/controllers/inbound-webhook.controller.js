const inboundEmailService = require('../services/inbound-email.service');
const logger = require('../utils/logger');

/**
 * Webhook controller for inbound email providers (Postmark, etc.).
 *
 * Postmark sends a POST with JSON containing the parsed email.
 * We map it to our internal format and delegate to inboundEmailService.
 */
class InboundWebhookController {
  /**
   * POST /api/webhooks/inbound-email/postmark
   *
   * Postmark inbound webhook payload:
   * https://postmarkapp.com/developer/webhooks/inbound-webhook
   */
  async postmark(req, res) {
    try {
      const payload = req.body;

      logger.info({ payload }, 'Received Postmark inbound webhook');

      if (!payload || !payload.From) {
        return res.status(400).json({ success: false, error: 'Invalid payload' });
      }

      // Extract headers from Postmark's Headers array
      const headers = {};
      if (Array.isArray(payload.Headers)) {
        for (const h of payload.Headers) {
          headers[h.Name.toLowerCase()] = h.Value;
        }
      }

      // Map Postmark payload → our internal email format
      const email = {
        from: payload.FromFull?.Email || payload.From,
        to: Array.isArray(payload.ToFull)
          ? payload.ToFull.map(t => t.Email)
          : [payload.To],
        subject: payload.Subject || '',
        text: payload.TextBody || '',
        html: payload.HtmlBody || null,
        messageId: headers['message-id'] || payload.MessageID || null,
        inReplyTo: headers['in-reply-to'] || null,
        references: headers['references']
          ? headers['references'].split(/\s+/)
          : [],
      };

      logger.info({
        from: email.from,
        to: email.to,
        subject: email.subject,
        messageId: email.messageId,
      }, 'Postmark inbound webhook received');

      const message = await inboundEmailService.handleInboundEmail(email);

      res.status(200).json({ success: true, processed: !!message });
    } catch (error) {
      logger.error({ err: error }, 'Postmark inbound webhook error');
      // Always return 200 to prevent Postmark from retrying
      res.status(200).json({ success: false, error: 'Processing failed' });
    }
  }
}

module.exports = new InboundWebhookController();
