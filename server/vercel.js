// Vercel's Express service entrypoint exports the HTTP server so Socket.IO can
// attach to the same server for WebSocket requests.
const { server } = require('./server');

module.exports = server;
