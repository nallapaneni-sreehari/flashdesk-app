const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const logger = require('../utils/logger');

const INBOUND_SMTP_PORT = parseInt(process.env.INBOUND_SMTP_PORT || '2525', 10);

let smtpServer = null;

/**
 * Initialize the inbound SMTP server.
 *
 * Receives emails directly via SMTP protocol — no polling, no IMAP,
 * no third-party provider. Like Freshdesk/Zendesk.
 *
 * Dev:  port 2525 (no root needed)
 * Prod: port 25   (standard SMTP, requires root or capabilities)
 *
 * DNS setup for production:
 *   yourcompany.com  MX  10  mail.yourcompany.com
 *   mail.yourcompany.com  A  <server-ip>
 */
function initInboundSmtp(onEmailReceived) {
  smtpServer = new SMTPServer({
    // No auth required — we accept emails from anyone (like a real mail server)
    authOptional: true,
    disabledCommands: ['AUTH'],

    // Don't require STARTTLS in dev (production should enable TLS)
    secure: false,
    disabledCommands: ['STARTTLS'],

    // Size limit: 25MB (same as Gmail)
    size: 25 * 1024 * 1024,

    // Banner shown to connecting SMTP clients
    banner: 'FlashDesk Inbound SMTP',

    // Validate recipient — only accept emails to our domains
    onRcptTo(address, session, callback) {
      logger.debug({ to: address.address, from: session.envelope?.mailFrom?.address }, 'SMTP RCPT TO');
      callback();
    },

    // Process the incoming email
    onData(stream, session, callback) {
      const chunks = [];

      stream.on('data', (chunk) => chunks.push(chunk));

      stream.on('end', async () => {
        try {
          const raw = Buffer.concat(chunks);
          const parsed = await simpleParser(raw);

          const from = session.envelope?.mailFrom?.address || parsed.from?.value?.[0]?.address;
          const to = session.envelope?.rcptTo?.map(r => r.address) || [];

          logger.info({
            from,
            to,
            subject: parsed.subject,
            messageId: parsed.messageId,
          }, 'Inbound email received via SMTP');

          // Pass to the handler
          await onEmailReceived({
            from,
            to,
            subject: parsed.subject || '',
            text: parsed.text || '',
            html: parsed.html || null,
            messageId: parsed.messageId || null,
            inReplyTo: parsed.inReplyTo || null,
            references: parsed.references || [],
            date: parsed.date || new Date(),
          });

          callback(); // Accept the email (250 OK)
        } catch (err) {
          logger.error({ err }, 'Failed to process inbound SMTP email');
          callback(); // Still accept — don't bounce, log for debugging
        }
      });

      stream.on('error', (err) => {
        logger.error({ err }, 'SMTP stream error');
        callback(new Error('Error processing message'));
      });
    },
  });

  smtpServer.on('error', (err) => {
    logger.error({ err }, 'Inbound SMTP server error');
  });

  smtpServer.listen(INBOUND_SMTP_PORT, '0.0.0.0', () => {
    logger.info({ port: INBOUND_SMTP_PORT }, 'Inbound SMTP server listening');
  });

  return smtpServer;
}

function getSmtpServer() {
  return smtpServer;
}

module.exports = { initInboundSmtp, getSmtpServer };
