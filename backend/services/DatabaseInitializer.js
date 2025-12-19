// Database Initialization Service
const databaseService = require('./DatabaseService');

class DatabaseInitializer {
  constructor() {
    this.initialized = false;
  }

  // Initialize all collections with proper schema and indexes
  async initializeDatabase() {
    // Skip if already initialized to avoid redundant work
    if (this.initialized) {
      console.log('ℹ️ Database already initialized, skipping initialization');
      return;
    }

    try {
      console.log('🔧 Initializing VF-TryOn Database...');
      const db = databaseService.getDb();

      // Create collections with validation and indexes
      await this.createUsersCollection(db);
      await this.createProductsCollection(db);
      await this.createWishlistCollection(db);
      await this.createLooksCollection(db);
      await this.createTryOnSessionsCollection(db);
      await this.createCategoriesCollection(db);
      await this.createReviewsCollection(db);

      // Insert sample data (only on first initialization)
      await this.insertSampleData(db);

      this.initialized = true;
      console.log('✅ Database initialized successfully!');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // Users collection with Firebase integration
  async createUsersCollection(db) {
    try {
      const collection = db.collection('users');
      
      // Create indexes (will silently fail if they already exist)
      try {
        await collection.createIndex({ firebaseUid: 1 }, { unique: true, sparse: true });
      } catch (err) {
        // Index already exists, ignore error
      }
      
      try {
        await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
      } catch (err) {
        // Index already exists, ignore error
      }
      
      try {
        await collection.createIndex({ createdAt: -1 });
      } catch (err) {
        // Index already exists, ignore error
      }
      
      console.log('✅ Users collection created');
    } catch (error) {
      if (error.codeName === 'NamespaceExists' || error.message.includes('already exists')) {
        console.log('ℹ️ Users collection already exists');
      } else {
        throw error;
      }
    }
  }

  // Products collection for fashion items
  async createProductsCollection(db) {
    try {
      const collection = db.collection('products');
      
      // Create indexes (silently handle if they already exist)
      const indexCreationMethods = [
        () => collection.createIndex({ category: 1 }),
        () => collection.createIndex({ name: 'text', description: 'text' }),
        () => collection.createIndex({ price: 1 }),
        () => collection.createIndex({ featured: -1 }),
        () => collection.createIndex({ createdAt: -1 })
      ];
      
      for (const createIndexFn of indexCreationMethods) {
        try {
          await createIndexFn();
        } catch (err) {
          // Index already exists, continue to next
        }
      }
      
      console.log('✅ Products collection created');
    } catch (error) {
      if (error.codeName === 'NamespaceExists' || error.message.includes('already exists')) {
        console.log('ℹ️ Products collection already exists');
      } else {
        throw error;
      }
    }
  }

  // Wishlist collection
  async createWishlistCollection(db) {
    try {
      const collection = db.collection('wishlist');
      
      // Create indexes (silently handle if they already exist)
      try {
        await collection.createIndex({ userId: 1 });
      } catch (err) { }
      
      try {
        await collection.createIndex({ userId: 1, productId: 1 }, { unique: true, sparse: true });
      } catch (err) { }
      
      try {
        await collection.createIndex({ createdAt: -1 });
      } catch (err) { }
      
      console.log('✅ Wishlist collection created');
    } catch (error) {
      if (error.codeName === 'NamespaceExists' || error.message.includes('already exists')) {
        console.log('ℹ️ Wishlist collection already exists');
      } else {
        throw error;
      }
    }
  }

  // Looks collection for saved outfits
  async createLooksCollection(db) {
    try {
      const collection = db.collection('looks');
      
      // Create indexes (silently handle if they already exist)
      try {
        await collection.createIndex({ userId: 1 });
      } catch (err) { }
      
      try {
        await collection.createIndex({ createdAt: -1 });
      } catch (err) { }
      
      try {
        await collection.createIndex({ isPublic: 1 });
      } catch (err) { }
      
      console.log('✅ Looks collection created');
    } catch (error) {
      if (error.codeName === 'NamespaceExists' || error.message.includes('already exists')) {
        console.log('ℹ️ Looks collection already exists');
      } else {
        throw error;
      }
    }
  }

  // Try-on sessions collection
  async createTryOnSessionsCollection(db) {
    try {
      const collection = db.collection('tryOnSessions');
      
      // Create indexes (silently handle if they already exist)
      try {
        await collection.createIndex({ userId: 1 });
      } catch (err) { }
      
      try {
        await collection.createIndex({ createdAt: -1 });
      } catch (err) { }
      
      try {
        await collection.createIndex({ sessionId: 1 }, { unique: true, sparse: true });
      } catch (err) { }
      
      console.log('✅ TryOn Sessions collection created');
    } catch (error) {
      if (error.codeName === 'NamespaceExists' || error.message.includes('already exists')) {
        console.log('ℹ️ TryOn Sessions collection already exists');
      } else {
        throw error;
      }
    }
  }

  // Categories collection
  async createCategoriesCollection(db) {
    try {
      const collection = db.collection('categories');
      
      // Create indexes (silently handle if they already exist)
      try {
        await collection.createIndex({ name: 1 }, { unique: true, sparse: true });
      } catch (err) { }
      
      try {
        await collection.createIndex({ order: 1 });
      } catch (err) { }
      
      console.log('✅ Categories collection created');
    } catch (error) {
      if (error.codeName === 'NamespaceExists' || error.message.includes('already exists')) {
        console.log('ℹ️ Categories collection already exists');
      } else {
        throw error;
      }
    }
  }

  // Reviews collection
  async createReviewsCollection(db) {
    try {
      const collection = db.collection('reviews');
      
      // Create indexes (silently handle if they already exist)
      try {
        await collection.createIndex({ productId: 1 });
      } catch (err) { }
      
      try {
        await collection.createIndex({ userId: 1 });
      } catch (err) { }
      
      try {
        await collection.createIndex({ rating: -1 });
      } catch (err) { }
      
      try {
        await collection.createIndex({ createdAt: -1 });
      } catch (err) { }
      
      console.log('✅ Reviews collection created');
    } catch (error) {
      if (error.codeName === 'NamespaceExists' || error.message.includes('already exists')) {
        console.log('ℹ️ Reviews collection already exists');
      } else {
        throw error;
      }
    }
  }

  // Production: No sample data insertion
  // Data should be added through admin panel or migration scripts
  async insertSampleData(db) {
    // PRODUCTION MODE: Sample data insertion is disabled
    // Use admin dashboard or data migration tools to add products
    console.log('ℹ️ Sample data insertion is disabled in production mode');
    console.log('💡 Use admin dashboard to add products and categories');
    return;
  }

  // Sample categories
  async insertSampleCategories(db) {
    const categories = [
      { name: 'shirts', displayName: 'Shirts', description: 'Casual and formal shirts', order: 1, active: true },
      { name: 'pants', displayName: 'Pants', description: 'Jeans, trousers, and casual pants', order: 2, active: true },
      { name: 'dresses', displayName: 'Dresses', description: 'Casual and formal dresses', order: 3, active: true },
      { name: 'jackets', displayName: 'Jackets', description: 'Coats, blazers, and jackets', order: 4, active: true },
      { name: 'shoes', displayName: 'Shoes', description: 'Footwear for all occasions', order: 5, active: true },
      { name: 'accessories', displayName: 'Accessories', description: 'Bags, belts, and jewelry', order: 6, active: true }
    ];

    const collection = db.collection('categories');
    for (const category of categories) {
      try {
        await collection.insertOne({
          ...category,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (error) {
        // Category might already exist
      }
    }
  }

  // Sample products
  async insertSampleProducts(db) {
    const products = [
      {
        name: 'Classic White Shirt',
        description: 'A timeless white button-down shirt perfect for any occasion',
        category: 'shirts',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['white', 'blue', 'black'],
        featured: true,
        inStock: true,
        stock: 50
      },
      {
        name: 'Blue Denim Jeans',
        description: 'Classic blue jeans with a modern fit',
        category: 'pants',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['blue', 'black', 'gray'],
        featured: true,
        inStock: true,
        stock: 30
      },
      {
        name: 'Summer Floral Dress',
        description: 'Light and airy floral dress perfect for summer',
        category: 'dresses',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['floral', 'red', 'blue'],
        featured: true,
        inStock: true,
        stock: 25
      },
      {
        name: 'Leather Jacket',
        description: 'Premium leather jacket with modern styling',
        category: 'jackets',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['black', 'brown'],
        featured: true,
        inStock: true,
        stock: 15
      },
      {
        name: 'Running Sneakers',
        description: 'Comfortable running shoes for active lifestyle',
        category: 'shoes',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500',
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['white', 'black', 'gray'],
        featured: true,
        inStock: true,
        stock: 40
      },
      {
        name: 'Designer Handbag',
        description: 'Elegant handbag for everyday use',
        category: 'accessories',
        price: 159.99,
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
        sizes: ['One Size'],
        colors: ['black', 'brown', 'beige'],
        featured: true,
        inStock: true,
        stock: 20
      }
    ];

    const collection = db.collection('products');
    for (const product of products) {
      try {
        await collection.insertOne({
          ...product,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
          rating: Math.random() * 2 + 3, // Random rating between 3-5
          reviewCount: Math.floor(Math.random() * 100) + 10
        });
      } catch (error) {
        // Product might already exist
      }
    }
  }

  // Get database statistics
  async getInitializationStatus() {
    try {
      const db = databaseService.getDb();
      const collections = await db.listCollections().toArray();
      
      const stats = {};
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        stats[collection.name] = count;
      }

      return {
        initialized: this.initialized,
        collections: collections.map(c => c.name),
        documentCounts: stats,
        totalCollections: collections.length
      };
    } catch (error) {
      return {
        initialized: false,
        error: error.message
      };
    }
  }

  // Reset database (development only)
  async resetDatabase() {
    try {
      console.log('⚠️ Resetting database...');
      const db = databaseService.getDb();
      
      const collections = ['users', 'products', 'wishlist', 'looks', 'tryOnSessions', 'categories', 'reviews'];
      
      for (const collectionName of collections) {
        try {
          await db.collection(collectionName).drop();
          console.log(`🗑️ Dropped collection: ${collectionName}`);
        } catch (error) {
          // Collection might not exist
        }
      }
      
      // Reinitialize
      await this.initializeDatabase();
      
      console.log('✅ Database reset complete');
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const databaseInitializer = new DatabaseInitializer();

module.exports = databaseInitializer;