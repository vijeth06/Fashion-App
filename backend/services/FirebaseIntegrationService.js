// Firebase Integration Service
const databaseService = require('./DatabaseService');

class FirebaseIntegrationService {
  constructor() {
    this.initialized = false;
  }

  // Sync Firebase user to MongoDB
  async syncFirebaseUser(firebaseUser) {
    try {
      const collection = databaseService.getCollection('users');
      
      const userData = {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        lastLoginAt: new Date(),
        updatedAt: new Date()
      };

      // Use upsert to create or update user
      const result = await collection.updateOne(
        { firebaseUid: firebaseUser.uid },
        { 
          $set: userData,
          $setOnInsert: {
            createdAt: new Date(),
            preferences: {
              measurements: {
                chest: null,
                waist: null,
                hips: null,
                height: null,
                weight: null
              },
              style: {
                casual: 0.5,
                formal: 0.5,
                sporty: 0.5,
                trendy: 0.5
              },
              sizes: {
                shirt: null,
                pants: null,
                shoes: null
              }
            },
            stats: {
              totalTryOns: 0,
              totalLooks: 0,
              totalWishlistItems: 0
            }
          }
        },
        { upsert: true }
      );

      // Get the updated user
      const user = await collection.findOne({ firebaseUid: firebaseUser.uid });
      
      console.log(`✅ User synced: ${firebaseUser.email}`);
      return user;
    } catch (error) {
      console.error('❌ Error syncing Firebase user:', error);
      throw error;
    }
  }

  // Get user by Firebase UID
  async getUserByFirebaseUid(firebaseUid) {
    try {
      const collection = databaseService.getCollection('users');
      const user = await collection.findOne({ firebaseUid });
      return user;
    } catch (error) {
      console.error('Error getting user by Firebase UID:', error);
      throw error;
    }
  }

  // Update user preferences
  async updateUserPreferences(firebaseUid, preferences) {
    try {
      const collection = databaseService.getCollection('users');
      
      const result = await collection.updateOne(
        { firebaseUid },
        {
          $set: {
            preferences: {
              ...preferences
            },
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        throw new Error('User not found');
      }

      return await collection.findOne({ firebaseUid });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Update user stats
  async updateUserStats(firebaseUid, statsUpdate) {
    try {
      const collection = databaseService.getCollection('users');
      
      const result = await collection.updateOne(
        { firebaseUid },
        {
          $inc: statsUpdate,
          $set: { updatedAt: new Date() }
        }
      );

      if (result.matchedCount === 0) {
        throw new Error('User not found');
      }

      return await collection.findOne({ firebaseUid });
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  // Get user's wishlist
  async getUserWishlist(firebaseUid) {
    try {
      const usersCollection = databaseService.getCollection('users');
      const user = await usersCollection.findOne({ firebaseUid });
      
      if (!user) {
        throw new Error('User not found');
      }

      const wishlistCollection = databaseService.getCollection('wishlist');
      const productsCollection = databaseService.getCollection('products');

      // Get wishlist items with product details
      const wishlistItems = await wishlistCollection.aggregate([
        { $match: { userId: user._id.toString() } },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        { $sort: { createdAt: -1 } }
      ]).toArray();

      return wishlistItems;
    } catch (error) {
      console.error('Error getting user wishlist:', error);
      throw error;
    }
  }

  // Get user's looks
  async getUserLooks(firebaseUid) {
    try {
      const usersCollection = databaseService.getCollection('users');
      const user = await usersCollection.findOne({ firebaseUid });
      
      if (!user) {
        throw new Error('User not found');
      }

      const looksCollection = databaseService.getCollection('looks');
      const looks = await looksCollection
        .find({ userId: user._id.toString() })
        .sort({ createdAt: -1 })
        .toArray();

      return looks;
    } catch (error) {
      console.error('Error getting user looks:', error);
      throw error;
    }
  }

  // Save user try-on session
  async saveTryOnSession(firebaseUid, sessionData) {
    try {
      const usersCollection = databaseService.getCollection('users');
      const user = await usersCollection.findOne({ firebaseUid });
      
      if (!user) {
        throw new Error('User not found');
      }

      const sessionsCollection = databaseService.getCollection('tryOnSessions');
      
      const session = {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user._id.toString(),
        ...sessionData,
        createdAt: new Date()
      };

      const result = await sessionsCollection.insertOne(session);
      
      // Update user stats
      await this.updateUserStats(firebaseUid, { 'stats.totalTryOns': 1 });
      
      return await sessionsCollection.findOne({ _id: result.insertedId });
    } catch (error) {
      console.error('Error saving try-on session:', error);
      throw error;
    }
  }

  // Delete user account and all associated data
  async deleteUserAccount(firebaseUid) {
    try {
      const usersCollection = databaseService.getCollection('users');
      const user = await usersCollection.findOne({ firebaseUid });
      
      if (!user) {
        throw new Error('User not found');
      }

      const userId = user._id.toString();

      // Delete user data from all collections
      const collections = [
        { name: 'wishlist', field: 'userId' },
        { name: 'looks', field: 'userId' },
        { name: 'tryOnSessions', field: 'userId' },
        { name: 'reviews', field: 'userId' }
      ];

      for (const { name, field } of collections) {
        const collection = databaseService.getCollection(name);
        await collection.deleteMany({ [field]: userId });
      }

      // Delete user account
      await usersCollection.deleteOne({ firebaseUid });
      
      console.log(`✅ User account deleted: ${firebaseUid}`);
      return { success: true, message: 'User account deleted successfully' };
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  }
}

// Create singleton instance
const firebaseIntegrationService = new FirebaseIntegrationService();

module.exports = firebaseIntegrationService;