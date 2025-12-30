// Backend Configuration for MongoDB Atlas
// This file contains the configuration for connecting to MongoDB Atlas

require('dotenv').config();

const config = {
  // MongoDB Atlas Configuration
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4,
      maxIdleTimeMS: 45000,
      waitQueueTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true
    }
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: '24h'
  },

  // File Upload Configuration
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    directory: process.env.UPLOAD_DIR || './uploads'
  },

  // API Configuration
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api'
  }
};

// Validate critical configuration
if (!config.mongodb.uri) {
  console.error('❌ MONGODB_URI is not set in environment variables!');
  console.error('💡 Please create a .env file in the backend folder with MONGODB_URI');
  process.exit(1);
}

module.exports = config;