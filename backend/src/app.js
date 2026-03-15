require('dotenv').config();
const http = require('http');
const express = require('express');
const app = express();
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const { initSocket } = require('./connections/socket');
const { startEmailWorker } = require('./jobs/email.worker');
const ticketRoutes = require('./routes/ticket.routes');
const messageRoutes = require('./routes/message.routes');
const customerRoutes = require('./routes/customer.routes');
const agentRoutes = require('./routes/agent.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const setupRoutes = require('./routes/setup.routes');
const authRoutes = require('./routes/auth.routes');
const notificationRoutes = require('./routes/notification.routes');
const webhookRoutes = require('./routes/webhook.routes');
const apiResponse = require('./middlewares/api-response');
const PORT = process.env.PORT || 3000;

const IS_DEV = (process.env.NODE_ENV || 'development') !== 'production';

app.use(cors());
app.use(express.json());
app.use(pinoHttp({
  logger,
  serializers: {
    req(req) {
      const base = { method: req.method, url: req.url };
      if (IS_DEV) {
        const r = req.raw;
        if (r?.user) base.user = { id: r.user.userId, email: r.user.email, workspaceId: r.user.workspaceId };
        if (r?.params && Object.keys(r.params).length) base.params = r.params;
        if (r?.body && Object.keys(r.body).length) base.body = r.body;
        return base;
      }
      // Production: include everything + IP
      return {
        ...base,
        params: req.raw?.params,
        query: req.raw?.query,
        body: req.raw?.body,
        userId: req.raw?.user?.userId,
        email: req.raw?.user?.email,
        workspaceId: req.raw?.user?.workspaceId,
        remoteAddress: req.remoteAddress,
      };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
  // Don't log polling/health noise
  autoLogging: {
    ignore(req) {
      return req.url === '/health' || req.url === '/api/notifications/unread-count';
    },
  },
}));
app.use(apiResponse);

// Import and use routes
app.get('/health', async (req, res) => {
  res.ok(200, null, 'API is healthy');
});

app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets', messageRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/webhooks', webhookRoutes);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
initSocket(server);

// Start background workers
startEmailWorker();

server.listen(PORT, async () => {
  logger.info({ port: PORT }, 'Server is running');
  const { isDbReady } = require('./connections/prisma');
  await isDbReady();
});