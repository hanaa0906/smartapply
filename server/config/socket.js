const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
  });

  io.on('connection', (socket) => {
    // console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Join personal user room for private notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        // console.log(`[Socket.IO] Socket ${socket.id} joined user_${userId}`);
      }
    });

    // Join specific application room for real-time tracking
    socket.on('join_application', (applicationId) => {
      if (applicationId) {
        socket.join(`app_${applicationId}`);
        // console.log(`[Socket.IO] Socket ${socket.id} joined app_${applicationId}`);
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

const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToUser, emitToApplication, broadcast };
