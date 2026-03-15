const pino = require('pino');

const targets = [
  // Pretty console output for development
  { target: 'pino-pretty', options: { colorize: true }, level: process.env.LOG_LEVEL || 'info' },
];

// Push logs to Grafana Cloud Loki when credentials are configured
if (process.env.LOKI_HOST) {
  targets.push({
    target: 'pino-loki',
    options: {
      batching: true,
      interval: 5,
      host: process.env.LOKI_HOST,
      basicAuth: {
        username: process.env.LOKI_USERNAME,
        password: process.env.LOKI_PASSWORD,
      },
      labels: { app: 'flashdesk-api', environment: process.env.NODE_ENV || 'development' },
    },
    level: process.env.LOG_LEVEL || 'info',
  });
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: { targets },
});

module.exports = logger;
