// 🗄️ MONGODB DATABASE SERVICE
// Complete database integration with collections for all app features

const mongoose = require('mongoose');

// MongoDB Connection String
const MONGODB_URI = 'mongodb+srv://vijeth:2006@wtlab.9b3zqxr.mongodb.net/virtual-fashion?retryWrites=true&w=majority';

class DatabaseService {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  // 🔌 Connect to MongoDB
  async connect() {
    try {
      if (this.isConnected) {
        console.log('✅ Database already connected');
        return this.connection;
      }

      console.log('🔌 Connecting to MongoDB...');
      
      this.connection = await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        heartbeatFrequencyMS: 2000,
      });

      this.isConnected = true;
      console.log('✅ Successfully connected to MongoDB');
      
      // Initialize collections
      await this.initializeCollections();
      
      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  // 📋 Initialize all required collections
  async initializeCollections() {
    try {
      // Create all schemas and models
      await this.createUserSchema();
      await this.createProductSchema();
      await this.createOutfitSchema();
      await this.createTryOnSessionSchema();
      await this.createAIRecommendationSchema();
      await this.createSocialFeedSchema();
      await this.createNFTCollectionSchema();
      
      console.log('✅ All collections initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize collections:', error);
    }
  }

  // 👤 User Schema
  async createUserSchema() {
    const userSchema = new mongoose.Schema({
      uid: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      displayName: { type: String, required: true },
      photoURL: { type: String },
      
      // Biometric Profile
      biometrics: {
        height: { type: Number },
        weight: { type: Number },
        measurements: {
          chest: Number,
          waist: Number,
          hips: Number,
          shoulders: Number,
          inseam: Number
        },
        bodyType: { type: String, enum: ['pear', 'apple', 'hourglass', 'rectangle', 'inverted-triangle'] },
        skinTone: { type: String },
        preferredSizes: {
          top: String,
          bottom: String,
          shoes: String
        }
      },
      
      // Style DNA
      styleDNA: {
        minimalist: { type: Number, default: 0.5 },
        edgy: { type: Number, default: 0.5 },
        classic: { type: Number, default: 0.5 },
        bohemian: { type: Number, default: 0.5 },
        sporty: { type: Number, default: 0.5 },
        romantic: { type: Number, default: 0.5 }
      },
      
      // Preferences
      preferences: {
        favoriteColors: [String],
        dislikedColors: [String],
        preferredBrands: [String],
        budgetRange: {
          min: { type: Number, default: 0 },
          max: { type: Number, default: 1000 }
        },
        sustainabilityImportant: { type: Boolean, default: false }
      },
      
      // AI Learning Data
      learningData: {
        interactionHistory: [{
          action: String,
          target: String,
          timestamp: { type: Date, default: Date.now },
          context: mongoose.Schema.Types.Mixed
        }],
        behaviorPatterns: mongoose.Schema.Types.Mixed,
        adaptationLevel: { type: Number, default: 0 }
      },
      
      // Sustainability Profile
      sustainability: {
        score: { type: Number, default: 0 },
        carbonFootprint: { type: Number, default: 0 },
        waterUsage: { type: Number, default: 0 },
        wasteGenerated: { type: Number, default: 0 },
        circularActions: [{
          type: { type: String, enum: ['repair', 'resale', 'upcycle', 'recycle'] },
          item: String,
          date: { type: Date, default: Date.now },
          impact: Number
        }]
      },
      
      // Premium Features
      premiumTier: { 
        type: String, 
        enum: ['Standard', 'Premium Member', 'Digital Royalty', 'Quantum Elite'],
        default: 'Standard'
      },
      nftCollection: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NFTItem' }],
      
      // Activity
      lastActive: { type: Date, default: Date.now },
      totalSessions: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    this.User = mongoose.model('User', userSchema);
    return this.User;
  }

  // 👔 Product Schema
  async createProductSchema() {
    const productSchema = new mongoose.Schema({
      name: { type: String, required: true },
      description: { type: String, required: true },
      category: { 
        type: String, 
        enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'quantum-wear'],
        required: true 
      },
      subcategory: String,
      
      // Basic Info
      brand: { type: String, required: true },
      price: { type: Number, required: true },
      originalPrice: Number,
      currency: { type: String, default: 'USD' },
      sizes: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] }],
      colors: [String],
      
      // Media
      images: [{
        url: { type: String, required: true },
        alt: String,
        type: { type: String, enum: ['main', 'detail', '3d', 'ar'], default: 'main' }
      }],
      model3D: {
        url: String,
        format: { type: String, enum: ['gltf', 'fbx', 'obj'], default: 'gltf' },
        textures: [String]
      },
      
      // AI Metadata
      aiMetadata: {
        styleVector: [Number], // AI-generated style embedding
        colorPalette: [String],
        occasionTags: [{ type: String, enum: ['casual', 'formal', 'party', 'work', 'sport', 'wedding'] }],
        seasonality: [{ type: String, enum: ['spring', 'summer', 'fall', 'winter'] }],
        trendScore: { type: Number, default: 0.5 },
        compatibilityMatrix: mongoose.Schema.Types.Mixed
      },
      
      // Fabric Physics (for Quantum Try-On)
      fabricPhysics: {
        material: { type: String, enum: ['cotton', 'silk', 'denim', 'leather', 'synthetic', 'quantum-fiber'] },
        weight: Number, // grams per square meter
        stretch: { type: Number, min: 0, max: 1 },
        drape: { type: Number, min: 0, max: 1 },
        breathability: { type: Number, min: 0, max: 1 },
        quantumProperties: {
          colorShifting: { type: Boolean, default: false },
          temperatureAdaptive: { type: Boolean, default: false },
          selfCleaning: { type: Boolean, default: false }
        }
      },
      
      // Sustainability
      sustainability: {
        ecoRating: { type: Number, min: 0, max: 100 },
        carbonFootprint: Number, // kg CO2
        waterUsage: Number, // liters
        materials: [{
          type: String,
          percentage: Number,
          sustainable: Boolean,
          recycled: Boolean
        }],
        certifications: [String]
      },
      
      // Availability
      inventory: {
        totalStock: { type: Number, default: 0 },
        sizeStock: [{
          size: String,
          quantity: { type: Number, default: 0 }
        }]
      },
      
      // Performance
      rating: { type: Number, min: 0, max: 5, default: 0 },
      reviewCount: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      
      // Status
      isActive: { type: Boolean, default: true },
      isFeatured: { type: Boolean, default: false },
      isQuantumWear: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    this.Product = mongoose.model('Product', productSchema);
    return this.Product;
  }

  // 👗 Outfit Schema
  async createOutfitSchema() {
    const outfitSchema = new mongoose.Schema({
      userId: { type: String, required: true },
      name: { type: String, required: true },
      description: String,
      
      // Outfit Composition
      items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        category: String,
        size: String,
        color: String,
        position: {
          x: { type: Number, default: 0 },
          y: { type: Number, default: 0 },
          z: { type: Number, default: 0 }
        },
        scale: { type: Number, default: 1 },
        rotation: { type: Number, default: 0 }
      }],
      
      // AI Analysis
      aiAnalysis: {
        styleScore: { type: Number, min: 0, max: 1 },
        colorHarmony: { type: Number, min: 0, max: 1 },
        occasionMatch: [String],
        seasonSuitability: [String],
        compatibilityScore: { type: Number, min: 0, max: 1 },
        improvements: [String]
      },
      
      // Social Features
      isPublic: { type: Boolean, default: false },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      comments: [{
        userId: String,
        displayName: String,
        comment: String,
        timestamp: { type: Date, default: Date.now }
      }],
      tags: [String],
      
      // Try-On Data
      tryOnSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TryOnSession' }],
      
      // Metadata
      totalPrice: Number,
      occasion: [String],
      season: [String],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    this.Outfit = mongoose.model('Outfit', outfitSchema);
    return this.Outfit;
  }

  // 📸 Try-On Session Schema
  async createTryOnSessionSchema() {
    const tryOnSessionSchema = new mongoose.Schema({
      userId: { type: String, required: true },
      sessionId: { type: String, required: true, unique: true },
      
      // Session Details
      mode: { 
        type: String, 
        enum: ['quantum', 'ar', 'classic', 'metaverse'],
        default: 'quantum'
      },
      
      // User Input
      userPhoto: {
        url: String,
        bodyMeasurements: mongoose.Schema.Types.Mixed,
        pose: String,
        lighting: String
      },
      
      // Items Tried
      itemsTried: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        timestamp: { type: Date, default: Date.now },
        duration: Number, // seconds spent trying this item
        rating: { type: Number, min: 1, max: 5 },
        saved: { type: Boolean, default: false }
      }],
      
      // Generated Content
      generatedImages: [{
        url: String,
        type: { type: String, enum: ['tryon', 'outfit', '3d', 'ar'] },
        timestamp: { type: Date, default: Date.now }
      }],
      
      // AI Insights
      aiInsights: {
        fitAnalysis: mongoose.Schema.Types.Mixed,
        styleRecommendations: [String],
        colorAnalysis: mongoose.Schema.Types.Mixed,
        sizeRecommendations: mongoose.Schema.Types.Mixed
      },
      
      // Performance Metrics
      sessionDuration: Number, // total session time in seconds
      itemsViewed: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }, // items added to cart/wishlist
      
      // Status
      isCompleted: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    this.TryOnSession = mongoose.model('TryOnSession', tryOnSessionSchema);
    return this.TryOnSession;
  }

  // 🤖 AI Recommendation Schema
  async createAIRecommendationSchema() {
    const aiRecommendationSchema = new mongoose.Schema({
      userId: { type: String, required: true },
      
      // Recommendation Type
      type: { 
        type: String, 
        enum: ['style', 'color', 'size', 'occasion', 'trend', 'sustainability', 'dna-based'],
        required: true 
      },
      
      // Recommendations
      recommendations: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        score: { type: Number, min: 0, max: 1 },
        reason: String,
        aiModel: String,
        confidence: { type: Number, min: 0, max: 1 }
      }],
      
      // Context
      context: {
        occasion: String,
        season: String,
        budget: Number,
        userMood: String,
        weatherConditions: mongoose.Schema.Types.Mixed
      },
      
      // Performance Tracking
      interactions: [{
        action: { type: String, enum: ['view', 'like', 'dislike', 'purchase', 'ignore'] },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        timestamp: { type: Date, default: Date.now }
      }],
      
      // Metadata
      aiModelVersion: String,
      generatedAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, default: () => new Date(+new Date() + 24*60*60*1000) }, // 24 hours
      isActive: { type: Boolean, default: true }
    });

    this.AIRecommendation = mongoose.model('AIRecommendation', aiRecommendationSchema);
    return this.AIRecommendation;
  }

  // 📱 Social Feed Schema
  async createSocialFeedSchema() {
    const socialFeedSchema = new mongoose.Schema({
      userId: { type: String, required: true },
      userDisplayName: { type: String, required: true },
      userPhoto: String,
      
      // Post Content
      type: { 
        type: String, 
        enum: ['outfit', 'tryon', 'review', 'style-tip', 'nft-showcase'],
        required: true 
      },
      content: {
        text: String,
        images: [String],
        outfitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Outfit' },
        productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        nftId: { type: mongoose.Schema.Types.ObjectId, ref: 'NFTItem' }
      },
      
      // Engagement
      likes: [{
        userId: String,
        timestamp: { type: Date, default: Date.now }
      }],
      comments: [{
        userId: String,
        displayName: String,
        userPhoto: String,
        text: String,
        timestamp: { type: Date, default: Date.now }
      }],
      shares: { type: Number, default: 0 },
      
      // Metadata
      hashtags: [String],
      location: String,
      isPublic: { type: Boolean, default: true },
      isFeatured: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    this.SocialFeed = mongoose.model('SocialFeed', socialFeedSchema);
    return this.SocialFeed;
  }

  // 💎 NFT Collection Schema
  async createNFTCollectionSchema() {
    const nftSchema = new mongoose.Schema({
      tokenId: { type: String, required: true, unique: true },
      ownerId: { type: String, required: true },
      
      // NFT Details
      name: { type: String, required: true },
      description: String,
      image: { type: String, required: true },
      
      // Fashion Metadata
      designer: String,
      collection: String,
      rarity: { 
        type: String, 
        enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Quantum'],
        default: 'Common'
      },
      
      // Traits/Attributes
      traits: [{
        trait_type: String,
        value: String,
        rarity_percentage: Number
      }],
      
      // Virtual Wearability
      virtualWearable: { type: Boolean, default: true },
      metaverseCompatible: [String], // supported platforms
      threeDModel: {
        url: String,
        format: String,
        animations: [String]
      },
      
      // Blockchain Data
      blockchain: {
        network: { type: String, default: 'Ethereum' },
        contractAddress: String,
        transactionHash: String,
        blockNumber: Number
      },
      
      // Market Data
      mintPrice: Number,
      currentValue: Number,
      lastSalePrice: Number,
      royalties: { type: Number, default: 10 }, // percentage
      
      // Usage Rights
      physicalRedeemable: { type: Boolean, default: false },
      commercialRights: { type: Boolean, default: false },
      resaleRights: { type: Boolean, default: true },
      
      // Status
      isListed: { type: Boolean, default: false },
      listingPrice: Number,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    this.NFTItem = mongoose.model('NFTItem', nftSchema);
    return this.NFTItem;
  }

  // 🔍 Get connection status
  isConnectedToDatabase() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  // 🚪 Close connection
  async disconnect() {
    if (this.isConnected) {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Export singleton instance
const databaseService = new DatabaseService();
module.exports = databaseService;

// Export models for direct use
module.exports.models = {
  User: null,
  Product: null,
  Outfit: null,
  TryOnSession: null,
  AIRecommendation: null,
  SocialFeed: null,
  NFTItem: null
};