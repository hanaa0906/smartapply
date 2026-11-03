const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const morgan = require('morgan');
// Load .env from the project root or the server folder, whichever exists
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDB, closeDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { seedInitialDataIfEmpty } = require('./seeds/seedHelper');
const { ensureAdminFromEnv } = require('./services/adminAccounts');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const courseRoutes = require('./routes/courseRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const documentRoutes = require('./routes/documentRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const simulatorRoutes = require('./routes/simulatorRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const universityRoutes = require('./routes/universityRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { startAutoRefresh: startUniversitySync } = require('./services/universityDirectory');
const { protect } = require('./middleware/auth');
const { downloadLegacyDocument } = require('./controllers/documentController');

const app = express();
const server = http.createServer(app);
const configuredOrigins = new Set([
  ...(process.env.CLIENT_URL || 'http://localhost:5173').split(','),
  process.env.RENDER_EXTERNAL_URL || '',
  'http://localhost:5001',
  'http://127.0.0.1:5001'
].map(value => value.trim()).filter(Boolean));

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || configuredOrigins.has(origin));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'SmartApply API & Real-time Engine',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/chat', chatRoutes);
app.get('/uploads/:filename', protect, downloadLegacyDocument);

// Static frontend serving if built
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Central error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  await seedInitialDataIfEmpty();
  await ensureAdminFromEnv();
  startUniversitySync();
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SmartApply Full-Stack Application is live!`);
    console.log(`🌐 Web App URL: http://localhost:${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`⚡ Real-time Socket.IO Engine: Active`);
    console.log(`====================================================`);
  });
};

if (require.main === module) {
  startServer();

  // Shut the database down cleanly so saved data is never corrupted
  const shutdown = async (signal) => {
    console.log(`\n${signal} received: closing SmartApply...`);
    server.close();
    try { await closeDB(); } catch (e) { /* already closed */ }
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = { app, server, startServer };
