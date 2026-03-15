const { Queue } = require('bullmq');
const { redis } = require('../connections/redis');
const logger = require('../utils/logger');

/**
 * Email queue — async email delivery via BullMQ.
 *
 * Job types:
 *   - ticket-reply   : agent replied → email customer
 *   - ticket-created  : new ticket   → confirmation to customer
 */
const emailQueue = new Queue('email', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 1000 },
  },
});

emailQueue.on('error', (err) => {
  logger.error({ err }, 'Email queue error');
});

logger.info('Email queue initialized');

module.exports = { emailQueue };
