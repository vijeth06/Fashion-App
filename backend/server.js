// VF-TryOn Backend Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

// Import configuration and services
const config = require('./config/database');
const databaseService = require('./services/DatabaseService');
const databaseInitializer = require('./services/DatabaseInitializer');
const { getAnalyticsService } = require('./services/AnalyticsService');

// Import routes - New Indian Products System
const authRoutes = require('./routes/auth');
const productsEnhancedRoutes = require('./routes/productsEnhanced');
const usersEnhancedRoutes = require('./routes/usersEnhanced');
const uploadRoutes = require('./routes/upload');
const tryOnRoutes = require('./routes/tryOn');
const errorRoutes = require('./routes/errors');
const paymentsRoutes = require('./routes/payments');
const ordersRoutes = require('./routes/orders');
const gdprRoutes = require('./routes/gdpr');

// Import new commerce logic routes
const couponRoutes = require('./routes/coupons');
const taxRoutes = require('./routes/tax');
const reservationRoutes = require('./routes/reservations');

// Import security middleware
const {
  EncryptionService,
  gdprCompliance,
  auditLogger,
  securityHeaders,
  createAdvancedRateLimit,
  validateAndSanitize
} = require('./middleware/security');

// Create Express app
const app = express();
const PORT = config.server.port;

// Security middleware - Enhanced GDPR compliant setup
app.use(securityHeaders);

// Advanced rate limiting with violation tracking
const advancedRateLimit = createAdvancedRateLimit();
app.use('/api', advancedRateLimit);

// Global input validation and sanitization
app.use(validateAndSanitize);

// Audit logging for all API requests
app.use('/api', auditLogger({ logRequestBody: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors(config.server.cors));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbStats = await databaseService.getStats();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: dbStats,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Database connection test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    if (!databaseService.isConnectedToDb()) {
      return res.status(503).json({
        connected: false,
        message: 'Database not connected'
      });
    }

    const stats = await databaseService.getStats();
    res.json({
      connected: true,
      message: 'Database connection successful',
      stats
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

// Error logging routes
app.use('/api/v1/errors', errorRoutes);

// Enhanced analytics routes
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

// Database initialization endpoint
app.post('/api/init-db', async (req, res) => {
  try {
    await databaseInitializer.initializeDatabase();
    const status = await databaseInitializer.getInitializationStatus();
    
    res.json({
      success: true,
      message: 'Database initialized successfully',
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    const status = await databaseInitializer.getInitializationStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Database reset endpoint (development only)
app.post('/api/reset-db', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Database reset not allowed in production'
    });
  }
  
  try {
    await databaseInitializer.resetDatabase();
    const status = await databaseInitializer.getInitializationStatus();
    
    res.json({
      success: true,
      message: 'Database reset successfully',
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API Routes - New Indian Products System
app.use(`${config.api.prefix}/${config.api.version}/auth`, authRoutes);
app.use(`${config.api.prefix}/${config.api.version}/products`, productsEnhancedRoutes); // Main products endpoint
app.use(`${config.api.prefix}/${config.api.version}/users`, usersEnhancedRoutes); // Users with cart/wishlist
app.use(`${config.api.prefix}/${config.api.version}/upload`, uploadRoutes);
app.use(`${config.api.prefix}/${config.api.version}/try-on`, tryOnRoutes);
app.use(`${config.api.prefix}/${config.api.version}/payments`, paymentsRoutes);
app.use(`${config.api.prefix}/${config.api.version}/orders`, ordersRoutes);

// Commerce Logic Routes - New
app.use(`${config.api.prefix}/${config.api.version}/coupons`, couponRoutes);
app.use(`${config.api.prefix}/${config.api.version}/tax`, taxRoutes);
app.use(`${config.api.prefix}/${config.api.version}/reservations`, reservationRoutes);

// GDPR and Privacy Routes
app.use(`${config.api.prefix}/gdpr`, gdprRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    error: {
      message: error.message || 'Internal server error',
      status: error.status || 500,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await databaseService.connect();
    
    // Initialize database collections and sample data
    await databaseInitializer.initializeDatabase();
    
    // Initialize Analytics Service after DB is ready
    const analyticsService = getAnalyticsService();
    await analyticsService.initialize();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 VF-TryOn Backend Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 Database test: http://localhost:${PORT}/api/test-db`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;