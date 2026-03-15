const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Service — sends transactional emails via SMTP (Nodemailer).
 *
 * Supports any SMTP provider: Gmail, Mailgun, SES, SendGrid, etc.
 * Configure via environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.defaultFrom = process.env.SMTP_FROM || 'support@flashdesk.app';
    this._init();
  }

  _init() {
    const host = process.env.SMTP_HOST;
    if (!host) {
      logger.warn('SMTP_HOST not configured — outbound email is disabled');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection on startup (fire-and-forget)
    this.transporter.verify()
      .then(() => logger.info({ host }, 'SMTP transport verified'))
      .catch(err => logger.error({ err, host }, 'SMTP transport verification failed'));
  }

  /**
   * Check if email sending is enabled.
   */
  isEnabled() {
    return this.transporter !== null;
  }

  /**
   * Send a ticket reply email to the customer.
   *
   * @param {Object} opts
   * @param {string} opts.to          - customer email
   * @param {string} opts.subject     - email subject (e.g. "Re: [TKT-42] Issue with...")
   * @param {string} opts.html        - HTML body
   * @param {string} opts.text        - plain-text body
   * @param {string} [opts.from]      - from address (defaults to workspace support email or SMTP_FROM)
   * @param {string} [opts.replyTo]   - reply-to address
   * @param {string} [opts.messageId] - unique Message-ID for email threading
   * @param {string} [opts.inReplyTo] - In-Reply-To header for threading
   * @param {string} [opts.references]- References header for threading
   */
  async send(opts) {
    if (!this.transporter) {
      logger.debug({ to: opts.to }, 'Email skipped — SMTP not configured');
      return null;
    }

    const mailOptions = {
      from: opts.from || this.defaultFrom,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    };

    // Email threading headers
    if (opts.replyTo) mailOptions.replyTo = opts.replyTo;
    if (opts.messageId) mailOptions.messageId = opts.messageId;
    if (opts.inReplyTo) mailOptions.headers = { ...mailOptions.headers, 'In-Reply-To': opts.inReplyTo };
    if (opts.references) mailOptions.headers = { ...mailOptions.headers, 'References': opts.references };

    const info = await this.transporter.sendMail(mailOptions);
    logger.info({ to: opts.to, messageId: info.messageId, subject: opts.subject }, 'Email sent');
    return info;
  }
}

module.exports = new EmailService();
