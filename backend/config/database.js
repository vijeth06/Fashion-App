// Backend Configuration for MongoDB Atlas
// This file contains the configuration for connecting to MongoDB Atlas

require('dotenv').config();

const config = {
  // MongoDB Atlas Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://vijeth:2006@wtlab.9b3zqxr.mongodb.net/vf_tryon_db?retryWrites=true&w=majority',
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
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },

  // API Configuration
  api: {
    version: 'v1',
    prefix: '/api'
  }
};

module.exports = config;