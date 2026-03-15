const { prisma } = require('../connections/prisma');
const { getIO } = require('../connections/socket');
const logger = require('../utils/logger');

/**
 * Inbound Email Service — processes emails received by the SMTP server.
 *
 * Called directly by the SMTP onData handler — no polling, instant.
 * Matches emails to tickets, creates messages, broadcasts via Socket.IO.
 */
class InboundEmailService {
  /**
   * Handle an incoming email from the SMTP server.
   *
   * @param {Object} email - Parsed email data
   * @param {string} email.from - Sender email address
   * @param {string[]} email.to - Recipient email addresses
   * @param {string} email.subject - Email subject
   * @param {string} email.text - Plain text body
   * @param {string|null} email.html - HTML body
   * @param {string|null} email.messageId - Email Message-ID header
   * @param {string|null} email.inReplyTo - In-Reply-To header
   * @param {string[]} email.references - References header
   */
  async handleInboundEmail(email) {
    const { from: senderEmail, subject, text, html, messageId, inReplyTo, references } = email;

    if (!senderEmail) {
      logger.warn({ subject }, 'No sender email — skipping');
      return null;
    }

    // Ignore emails from our own SMTP address (avoid loops)
    const smtpFrom = (process.env.SMTP_FROM || '').toLowerCase();
    if (senderEmail.toLowerCase() === smtpFrom) {
      logger.debug({ senderEmail }, 'Ignoring email from own SMTP address');
      return null;
    }

    // Extract ticket number from headers/subject
    const ticketNumber = this._extractTicketNumber({ subject, inReplyTo, references });
    if (!ticketNumber) {
      logger.info({ subject, from: senderEmail }, 'No ticket reference found — email ignored');
      return null;
    }

    // Check for duplicate by emailMessageId
    if (messageId) {
      const existing = await prisma.message.findFirst({
        where: { emailMessageId: messageId },
      });
      if (existing) {
        logger.debug({ messageId, ticketNumber }, 'Duplicate email — already processed');
        return null;
      }
    }

    // Find the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { ticketNumber },
      include: {
        workspace: { select: { id: true, ticketPrefix: true } },
      },
    });

    if (!ticket) {
      logger.warn({ ticketNumber, senderEmail }, 'Ticket not found for inbound email');
      return null;
    }

    // Find customer by email + workspace
    let customer = await prisma.customer.findFirst({
      where: { email: senderEmail, workspaceId: ticket.workspaceId },
    });
    if (!customer) {
      customer = await prisma.customer.findFirst({
        where: { email: senderEmail },
      });
    }

    // Extract reply body (strip quoted text)
    const replyText = this._extractReplyBody(text);
    if (!replyText?.trim() && !html) {
      logger.debug({ ticketNumber, senderEmail }, 'Empty email body — skipping');
      return null;
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        ticketId: ticket.id,
        content: replyText || this._stripHtml(html),
        contentHtml: html,
        isInternal: false,
        authorType: 'customer',
        customerId: customer?.id || null,
        emailMessageId: messageId,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        customer: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Create history entry
    await prisma.historyEntry.create({
      data: {
        type: 'reply',
        description: 'Customer replied via email',
        ticketId: ticket.id,
      },
    });

    // Update ticket updatedAt + reopen if resolved/closed
    const updateData = { updatedAt: new Date() };
    if (['resolved', 'closed'].includes(ticket.status)) {
      updateData.status = 'open';
      await prisma.historyEntry.create({
        data: {
          type: 'status_change',
          description: 'Ticket reopened by customer email reply',
          ticketId: ticket.id,
          fromValue: ticket.status,
          toValue: 'open',
        },
      });
    }
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: updateData,
    });

    // Broadcast via Socket.IO
    const io = getIO();
    if (io) {
      io.to(`ticket:${ticketNumber}`).emit('message:new', message);
    }

    // Send in-app notifications
    const notificationService = require('./notification.service');
    const prefix = ticket.workspace?.ticketPrefix || 'TKT';
    const customerName = customer?.name || senderEmail;

    const ticketWithFollowers = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      select: {
        assignedAgentId: true,
        followers: { select: { userId: true } },
      },
    });

    if (ticketWithFollowers) {
      notificationService.notifyTicketReply({
        ticketNumber,
        ticketPrefix: prefix,
        subject: ticket.subject,
        assignedAgentId: ticketWithFollowers.assignedAgentId,
        followerIds: ticketWithFollowers.followers.map(f => f.userId),
        authorId: null,
        authorName: customerName,
      }).catch(err => logger.error({ err }, 'Failed to notify on inbound email'));
    }

    logger.info({ ticketNumber, senderEmail, messageId: message.id }, 'Inbound email processed → message created');
    return message;
  }

  /**
   * Extract ticket number from email headers or subject line.
   */
  _extractTicketNumber({ subject, inReplyTo, references }) {
    // Check References header
    const refs = Array.isArray(references) ? references : references ? [references] : [];
    for (const ref of refs) {
      const match = ref.match(/ticket-(\d+)@flashdesk\.app/);
      if (match) return parseInt(match[1], 10);
    }

    // Check In-Reply-To
    if (inReplyTo) {
      const replyMatch = inReplyTo.match(/ticket-(\d+)@flashdesk\.app/);
      if (replyMatch) return parseInt(replyMatch[1], 10);
    }

    // Fallback: parse subject line for [PREFIX-NUMBER]
    if (subject) {
      const subjectMatch = subject.match(/\[[\w]+-(\d+)\]/);
      if (subjectMatch) return parseInt(subjectMatch[1], 10);
    }

    return null;
  }

  /**
   * Extract reply body, stripping quoted text.
   */
  _extractReplyBody(text) {
    if (!text) return '';

    const separators = [
      /^--+\s*$/m,
      /^On .+ wrote:$/m,
      /^>+ /m,
      /^-{3,}\s*Original Message\s*-{3,}/mi,
      /^From: /m,
    ];

    let reply = text;
    for (const sep of separators) {
      const match = reply.match(sep);
      if (match) {
        reply = reply.substring(0, match.index).trim();
        break;
      }
    }

    return reply.trim();
  }

  /**
   * Strip HTML tags for plain-text fallback.
   */
  _stripHtml(html) {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|div|li|tr|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}

module.exports = new InboundEmailService();
