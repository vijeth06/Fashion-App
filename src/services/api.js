


const databaseService = require('./database.js');

class ApiService {
  constructor() {
    this.db = databaseService;
    this.isInitialized = false;
  }

  async initialize() {
    if (!this.isInitialized) {
      await this.db.connect();
      this.isInitialized = true;
      console.log('ðŸš€ API Service initialized successfully');
    }
  }

  async createUser(userData) {
    try {
      await this.initialize();
      const user = new this.db.User(userData);
      return await user.save();
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  }

  async getUserById(uid) {
    try {
      await this.initialize();
      return await this.db.User.findOne({ uid });
    } catch (error) {
      console.error('❌ Failed to get user:', error);
      throw error;
    }
  }

  async updateUser(uid, updateData) {
    try {
      await this.initialize();
      return await this.db.User.findOneAndUpdate(
        { uid },
        { ...updateData, updatedAt: new Date() },
        { new: true, upsert: true }
      );
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  }

  async updateUserBiometrics(uid, biometrics) {
    try {
      await this.initialize();
      return await this.db.User.findOneAndUpdate(
        { uid },
        { biometrics, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('❌ Failed to update user biometrics:', error);
      throw error;
    }
  }

  async updateUserStyleDNA(uid, styleDNA) {
    try {
      await this.initialize();
      return await this.db.User.findOneAndUpdate(
        { uid },
        { styleDNA, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('❌ Failed to update style DNA:', error);
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      await this.initialize();
      const product = new this.db.Product(productData);
      return await product.save();
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      throw error;
    }
  }

  async getProducts(filters = {}, page = 1, limit = 20) {
    try {
      await this.initialize();
      const skip = (page - 1) * limit;
      
      const query = { isActive: true, ...filters };
      
      const [products, total] = await Promise.all([
        this.db.Product.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        this.db.Product.countDocuments(query)
      ]);

      return {
        products,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: skip + products.length < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('❌ Failed to get products:', error);
      throw error;
    }
  }

  async getProductById(productId) {
    try {
      await this.initialize();
      const product = await this.db.Product.findById(productId);
      
      if (product) {

        product.views += 1;
        await product.save();
      }
      
      return product;
    } catch (error) {
      console.error('❌ Failed to get product:', error);
      throw error;
    }
  }

  async searchProducts(searchTerm, filters = {}) {
    try {
      await this.initialize();
      
      const searchQuery = {
        isActive: true,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { brand: { $regex: searchTerm, $options: 'i' } },
          { 'aiMetadata.occasionTags': { $in: [searchTerm] } },
          { tags: { $in: [searchTerm] } }
        ],
        ...filters
      };

      return await this.db.Product.find(searchQuery).limit(50);
    } catch (error) {
      console.error('❌ Failed to search products:', error);
      throw error;
    }
  }

  async createOutfit(outfitData) {
    try {
      await this.initialize();
      const outfit = new this.db.Outfit(outfitData);
      return await outfit.save();
    } catch (error) {
      console.error('❌ Failed to create outfit:', error);
      throw error;
    }
  }

  async getUserOutfits(userId, page = 1, limit = 12) {
    try {
      await this.initialize();
      const skip = (page - 1) * limit;
      
      const [outfits, total] = await Promise.all([
        this.db.Outfit.find({ userId })
          .populate('items.productId')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        this.db.Outfit.countDocuments({ userId })
      ]);

      return {
        outfits,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasNext: skip + outfits.length < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('❌ Failed to get user outfits:', error);
      throw error;
    }
  }

  async getPublicOutfits(page = 1, limit = 20) {
    try {
      await this.initialize();
      const skip = (page - 1) * limit;
      
      return await this.db.Outfit.find({ isPublic: true })
        .populate('items.productId')
        .skip(skip)
        .limit(limit)
        .sort({ likes: -1, createdAt: -1 });
    } catch (error) {
      console.error('❌ Failed to get public outfits:', error);
      throw error;
    }
  }

  async createTryOnSession(sessionData) {
    try {
      await this.initialize();
      const session = new this.db.TryOnSession(sessionData);
      return await session.save();
    } catch (error) {
      console.error('❌ Failed to create try-on session:', error);
      throw error;
    }
  }

  async getTryOnSession(sessionId) {
    try {
      await this.initialize();
      return await this.db.TryOnSession.findOne({ sessionId })
        .populate('itemsTried.productId');
    } catch (error) {
      console.error('❌ Failed to get try-on session:', error);
      throw error;
    }
  }

  async updateTryOnSession(sessionId, updateData) {
    try {
      await this.initialize();
      return await this.db.TryOnSession.findOneAndUpdate(
        { sessionId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error('❌ Failed to update try-on session:', error);
      throw error;
    }
  }

  async createAIRecommendation(recommendationData) {
    try {
      await this.initialize();
      const recommendation = new this.db.AIRecommendation(recommendationData);
      return await recommendation.save();
    } catch (error) {
      console.error('❌ Failed to create AI recommendation:', error);
      throw error;
    }
  }

  async getAIRecommendations(userId, type = null) {
    try {
      await this.initialize();
      const query = { 
        userId, 
        isActive: true,
        expiresAt: { $gt: new Date() }
      };
      
      if (type) {
        query.type = type;
      }
      
      return await this.db.AIRecommendation.find(query)
        .populate('recommendations.productId')
        .sort({ generatedAt: -1 })
        .limit(5);
    } catch (error) {
      console.error('❌ Failed to get AI recommendations:', error);
      throw error;
    }
  }

  async createSocialPost(postData) {
    try {
      await this.initialize();
      const post = new this.db.SocialFeed(postData);
      return await post.save();
    } catch (error) {
      console.error('❌ Failed to create social post:', error);
      throw error;
    }
  }

  async getSocialFeed(page = 1, limit = 20) {
    try {
      await this.initialize();
      const skip = (page - 1) * limit;
      
      return await this.db.SocialFeed.find({ isPublic: true })
        .populate('content.outfitId')
        .populate('content.productIds')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('❌ Failed to get social feed:', error);
      throw error;
    }
  }

  async likeSocialPost(postId, userId) {
    try {
      await this.initialize();
      const post = await this.db.SocialFeed.findById(postId);
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      const existingLike = post.likes.find(like => like.userId === userId);
      
      if (existingLike) {

        post.likes = post.likes.filter(like => like.userId !== userId);
      } else {

        post.likes.push({ userId, timestamp: new Date() });
      }
      
      return await post.save();
    } catch (error) {
      console.error('❌ Failed to like/unlike post:', error);
      throw error;
    }
  }

  async createNFT(nftData) {
    try {
      await this.initialize();
      const nft = new this.db.NFTItem(nftData);
      return await nft.save();
    } catch (error) {
      console.error('❌ Failed to create NFT:', error);
      throw error;
    }
  }

  async getUserNFTs(ownerId) {
    try {
      await this.initialize();
      return await this.db.NFTItem.find({ ownerId })
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('❌ Failed to get user NFTs:', error);
      throw error;
    }
  }

  async getNFTMarketplace(page = 1, limit = 20) {
    try {
      await this.initialize();
      const skip = (page - 1) * limit;
      
      return await this.db.NFTItem.find({ isListed: true })
        .skip(skip)
        .limit(limit)
        .sort({ listingPrice: 1 });
    } catch (error) {
      console.error('❌ Failed to get NFT marketplace:', error);
      throw error;
    }
  }

  async getUserAnalytics(userId) {
    try {
      await this.initialize();
      
      const [user, outfits, sessions, recommendations] = await Promise.all([
        this.db.User.findOne({ uid: userId }),
        this.db.Outfit.countDocuments({ userId }),
        this.db.TryOnSession.countDocuments({ userId }),
        this.db.AIRecommendation.countDocuments({ userId })
      ]);

      return {
        user: {
          totalSessions: user?.totalSessions || 0,
          adaptationLevel: user?.learningData?.adaptationLevel || 0,
          premiumTier: user?.premiumTier || 'Standard',
          sustainabilityScore: user?.sustainability?.score || 0
        },
        activity: {
          totalOutfits: outfits,
          totalTryOnSessions: sessions,
          totalRecommendations: recommendations
        }
      };
    } catch (error) {
      console.error('❌ Failed to get user analytics:', error);
      throw error;
    }
  }

  async trackUserInteraction(userId, interactionData) {
    try {
      await this.initialize();
      
      const user = await this.db.User.findOne({ uid: userId });
      if (!user) {
        throw new Error('User not found');
      }

      user.learningData.interactionHistory.push(interactionData);

      if (user.learningData.interactionHistory.length > 1000) {
        user.learningData.interactionHistory = user.learningData.interactionHistory.slice(-1000);
      }

      user.learningData.adaptationLevel = Math.min(1.0, user.learningData.adaptationLevel + 0.001);
      user.lastActive = new Date();
      user.totalSessions += 1;
      
      return await user.save();
    } catch (error) {
      console.error('❌ Failed to track user interaction:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.initialize();
      const isConnected = this.db.isConnectedToDatabase();
      
      if (isConnected) {
        console.log('✅ Database connection test passed');

        const userCount = await this.db.User.countDocuments();
        const productCount = await this.db.Product.countDocuments();
        
        return {
          connected: true,
          collections: {
            users: userCount,
            products: productCount
          }
        };
      } else {
        throw new Error('Database not connected');
      }
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return { connected: false, error: error.message };
    }
  }
}

const apiService = new ApiService();
module.exports = apiService;