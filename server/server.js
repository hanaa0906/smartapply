const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { seedInitialDataIfEmpty } = require('./seeds/seedHelper');
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

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
}

module.exports = { app, server, startServer };
