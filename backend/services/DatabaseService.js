// MongoDB Connection Service
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
const config = require('../config/database');

class DatabaseService {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.mongooseConnected = false;
  }

  // Connect to MongoDB Atlas
  async connect() {
    try {
      console.log('🔗 Connecting to MongoDB Atlas...');
      
      // Connect native MongoDB driver
      this.client = new MongoClient(config.mongodb.uri, {
        ...config.mongodb.options,
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });

      await this.client.connect();
      
      // Use configured database name
      const dbName = process.env.DATABASE_NAME || 'vf_tryon_db';
      this.db = this.client.db(dbName);
      
      // Test the connection
      await this.db.admin().ping();
      
      this.isConnected = true;
      console.log('✅ Native MongoDB driver connected!');
      
      // Also connect Mongoose for models (used by AnalyticsService)
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(config.mongodb.uri, {
          ...config.mongodb.options,
          dbName: dbName
        });
        this.mongooseConnected = true;
        console.log('✅ Mongoose connected!');
      }
      
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      this.isConnected = false;
      this.mongooseConnected = false;
      throw error;
    }
  }

  // Extract database name from MongoDB URI
  extractDatabaseName(uri) {
    try {
      const match = uri.match(/\/([^?]+)\?/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  // Get database instance
  getDb() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  // Get collection
  getCollection(collectionName) {
    return this.getDb().collection(collectionName);
  }

  // Close connection
  async disconnect() {
    try {
      // Close Mongoose connection
      if (this.mongooseConnected && mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        this.mongooseConnected = false;
        console.log('📴 Mongoose disconnected');
      }
      
      // Close native MongoDB driver connection
      if (this.client) {
        await this.client.close();
        console.log('📴 MongoDB native driver disconnected');
      }
      
      this.isConnected = false;
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }

  // Check connection status
  isConnectedToDb() {
    return this.isConnected;
  }

  // Initialize collections with indexes
  async initializeCollections() {
    try {
      const db = this.getDb();
      
      // Users collection
      const usersCollection = db.collection('users');
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      await usersCollection.createIndex({ firebaseUid: 1 }, { unique: true });
      
      // Products collection
      const productsCollection = db.collection('products');
      await productsCollection.createIndex({ category: 1 });
      await productsCollection.createIndex({ name: 'text', description: 'text' });
      
      // Wishlist collection
      const wishlistCollection = db.collection('wishlist');
      await wishlistCollection.createIndex({ userId: 1 });
      await wishlistCollection.createIndex({ userId: 1, productId: 1 }, { unique: true });
      
      // Looks collection
      const looksCollection = db.collection('looks');
      await looksCollection.createIndex({ userId: 1 });
      await looksCollection.createIndex({ createdAt: -1 });
      
      // Try-on sessions collection
      const sessionsCollection = db.collection('tryOnSessions');
      await sessionsCollection.createIndex({ userId: 1 });
      await sessionsCollection.createIndex({ createdAt: -1 });
      
      console.log('✅ Collections and indexes initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing collections:', error);
    }
  }

  // Get connection statistics
  async getStats() {
    try {
      const db = this.getDb();
      const stats = await db.stats();
      return {
        connected: this.isConnected,
        collections: stats.collections,
        objects: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return { connected: false, error: error.message };
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;