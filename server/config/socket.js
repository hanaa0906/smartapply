const { Server } = require('socket.io');
const { verifyToken } = require('./jwt');
const User = require('../models/User');
const Application = require('../models/Application');
const { initializeApplication } = require('./initialize');
const toOrigin = (value) => {
  if (!value) return '';
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).origin;
  } catch {
    return '';
  }
};
const allowedOrigins = [
  ...(process.env.CLIENT_URL || 'http://localhost:5173').split(','),
  process.env.RENDER_EXTERNAL_URL || '',
  toOrigin(process.env.VERCEL_URL),
  toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  'http://localhost:5001',
  'http://127.0.0.1:5001'
].map(value => value.trim()).filter(Boolean);

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
  });

  io.use(async (socket, next) => {
    try {
      if (process.env.VERCEL) await initializeApplication();
      const token = socket.handshake.auth?.token;
      const decoded = token && verifyToken(token);
      if (!decoded?.id) return next(new Error('Authentication required'));
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) return next(new Error('Authentication required'));
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication required'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    socket.join(`user_${user._id}`);
    if (user.role === 'admin') socket.join('admins');

    socket.on('join_application', async (applicationId) => {
      try {
        const query = { _id: applicationId };
        if (user.role !== 'admin') query.studentId = user._id;
        const application = await Application.findOne(query).select('_id');
        if (application) socket.join(`app_${application._id}`);
      } catch (error) {
        // Invalid IDs and database errors do not grant room access.
      }
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToApplication = (applicationId, event, data) => {
  if (io && applicationId) {
    io.to(`app_${applicationId}`).emit(event, data);
  }
};

const broadcastToAdmins = (event, data) => {
  if (io) {
    io.to('admins').emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToUser, emitToApplication, broadcastToAdmins };
