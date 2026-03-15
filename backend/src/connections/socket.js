const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'flashdesk-dev-secret';

let io = null;

/**
 * Initialize Socket.IO on the HTTP server.
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Authentication middleware — verify JWT from handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        workspaceId: decoded.workspaceId,
      };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info({ userId: socket.user.userId }, 'Socket connected');

    // Auto-join personal room for targeted notifications
    socket.join(`user:${socket.user.userId}`);

    // Join a ticket room to receive real-time messages
    socket.on('ticket:join', (ticketNumber) => {
      const room = `ticket:${ticketNumber}`;
      socket.join(room);
      logger.debug({ userId: socket.user.userId, room }, 'Joined ticket room');
    });

    // Leave a ticket room
    socket.on('ticket:leave', (ticketNumber) => {
      const room = `ticket:${ticketNumber}`;
      socket.leave(room);
      logger.debug({ userId: socket.user.userId, room }, 'Left ticket room');
    });

    // Typing indicator
    socket.on('ticket:typing', ({ ticketNumber, isTyping }) => {
      const room = `ticket:${ticketNumber}`;
      socket.to(room).emit('ticket:typing', {
        userId: socket.user.userId,
        isTyping,
      });
    });

    socket.on('disconnect', (reason) => {
      logger.debug({ userId: socket.user.userId, reason }, 'Socket disconnected');
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

/**
 * Get the Socket.IO server instance.
 */
function getIO() {
  return io;
}

/**
 * Find a connected socket by userId.
 */
function getSocketByUserId(userId) {
  if (!io) return null;
  for (const [, socket] of io.sockets.sockets) {
    if (socket.user?.userId === userId) return socket;
  }
  return null;
}

module.exports = { initSocket, getIO, getSocketByUserId };
