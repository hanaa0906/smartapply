// Vercel's Express adapter expects a function export. Delegate requests to the
// same HTTP server that owns Express and Socket.IO.
const { server } = require('./server');

const handler = (req, res) => {
  server.emit('request', req, res);
};
handler.server = server;

module.exports = handler;
