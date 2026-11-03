// Vercel's Express adapter expects a function export. Delegate requests to the
// same HTTP server that owns Express and Socket.IO.
const serverModule = require('./server.js');
const app = serverModule.app || serverModule.default || serverModule;
const server = serverModule.server || app.server;

const handler = (req, res) => {
  if (server && typeof server.emit === 'function') {
    server.emit('request', req, res);
    return;
  }
  app(req, res);
};
handler.server = server;

module.exports = handler;
