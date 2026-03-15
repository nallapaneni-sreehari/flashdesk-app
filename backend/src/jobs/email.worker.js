const { Worker } = require('bullmq');
const { redis } = require('../connections/redis');
const emailService = require('../services/email.service');
const { ticketReplyTemplate } = require('../templates/ticket-reply');
const { ticketCreatedTemplate } = require('../templates/ticket-created');
const { welcomeAgentTemplate } = require('../templates/welcome-agent');
const logger = require('../utils/logger');

const PORTAL_BASE_URL = process.env.PORTAL_URL || 'http://localhost:4200';
const INBOUND_EMAIL_DOMAIN = process.env.INBOUND_EMAIL_DOMAIN || '';

/**
 * Process email jobs from the BullMQ 'email' queue.
 */
function startEmailWorker() {
  const worker = new Worker('email', async (job) => {
    const { type, data } = job.data;

    switch (type) {
      case 'ticket-reply':
        await handleTicketReply(data);
        break;
      case 'ticket-created':
        await handleTicketCreated(data);
        break;
      case 'welcome-agent':
        await handleWelcomeAgent(data);
        break;
      default:
        logger.warn({ type }, 'Unknown email job type');
    }
  }, {
    connection: redis,
    concurrency: 5,
    limiter: {
      max: 50,
      duration: 60_000, // max 50 emails per minute
    },
  });

  worker.on('completed', (job) => {
    logger.debug({ jobId: job.id, type: job.data.type }, 'Email job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, type: job?.data?.type, err }, 'Email job failed');
  });

  logger.info('Email worker started');
  return worker;
}

/**
 * Handle ticket-reply email job.
 */
async function handleTicketReply(data) {
  const {
    customerEmail,
    ticketPrefix,
    ticketNumber,
    subject,
    agentName,
    replyContent,
    replyHtml,
    workspaceName,
    workspaceSlug,
    fromEmail,
    messageId,
  } = data;

  if (!customerEmail) {
    logger.warn({ ticketNumber }, 'No customer email — skipping reply email');
    return;
  }

  const portalUrl = `${PORTAL_BASE_URL}/tickets/${ticketNumber}`;
  const ticketRef = `${ticketPrefix}-${ticketNumber}`;

  const { html, text } = ticketReplyTemplate({
    ticketPrefix,
    ticketNumber,
    subject,
    agentName,
    replyContent,
    replyHtml,
    portalUrl,
    workspaceName,
  });

  // Generate a deterministic Message-ID for email threading
  const emailMessageId = `<${messageId}@flashdesk.app>`;
  // Thread reference: use ticket-level ID so all replies chain together
  const threadId = `<ticket-${ticketNumber}@flashdesk.app>`;

  await emailService.send({
    to: customerEmail,
    subject: `Re: [${ticketRef}] ${subject}`,
    html,
    text,
    from: fromEmail,
    replyTo: INBOUND_EMAIL_DOMAIN && workspaceSlug ? `${workspaceSlug}@${INBOUND_EMAIL_DOMAIN}` : fromEmail,
    messageId: emailMessageId,
    inReplyTo: threadId,
    references: threadId,
  });
}

/**
 * Handle ticket-created email job.
 */
async function handleTicketCreated(data) {
  const {
    customerEmail,
    ticketPrefix,
    ticketNumber,
    subject,
    description,
    workspaceName,
    workspaceSlug,
    fromEmail,
  } = data;

  if (!customerEmail) {
    logger.warn({ ticketNumber }, 'No customer email — skipping created email');
    return;
  }

  const portalUrl = `${PORTAL_BASE_URL}/tickets/${ticketNumber}`;
  const ticketRef = `${ticketPrefix}-${ticketNumber}`;

  const { html, text } = ticketCreatedTemplate({
    ticketPrefix,
    ticketNumber,
    subject,
    description,
    portalUrl,
    workspaceName,
  });

  const threadId = `<ticket-${ticketNumber}@flashdesk.app>`;

  await emailService.send({
    to: customerEmail,
    subject: `[${ticketRef}] ${subject}`,
    html,
    text,
    from: fromEmail,
    replyTo: INBOUND_EMAIL_DOMAIN && workspaceSlug ? `${workspaceSlug}@${INBOUND_EMAIL_DOMAIN}` : fromEmail,
    messageId: threadId,
  });
}

/**
 * Handle welcome-agent email job.
 */
async function handleWelcomeAgent(data) {
  const {
    agentEmail,
    firstName,
    password,
    workspaceName,
    fromEmail,
  } = data;

  if (!agentEmail) {
    logger.warn('No agent email — skipping welcome email');
    return;
  }

  const loginUrl = `${PORTAL_BASE_URL}/login`;

  const { html, text } = welcomeAgentTemplate({
    firstName,
    email: agentEmail,
    password,
    workspaceName,
    loginUrl,
  });

  await emailService.send({
    to: agentEmail,
    subject: `Welcome to ${workspaceName} — Your login credentials`,
    html,
    text,
    from: fromEmail,
  });
}

module.exports = { startEmailWorker };
