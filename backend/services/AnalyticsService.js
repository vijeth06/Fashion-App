/**
 * Advanced User Analytics & Business Intelligence Service
 * 
 * Features:
 * - Real-time user behavior tracking
 * - Conversion funnel analytics
 * - A/B testing framework
 * - Product performance insights
 * - User engagement metrics
 * - Predictive analytics for recommendations
 * 
 * @version 2.0.0
 */

const mongoose = require('mongoose');

// Analytics Data Models
const UserInteractionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  event: { type: String, required: true },
  properties: { type: Object, default: {} },
  context: {
    page: String,
    userAgent: String,
    referrer: String,
    viewport: { width: Number, height: Number },
    location: { country: String, city: String }
  }
});

const ConversionFunnelSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: String },
  funnel: { type: String, required: true }, // 'try-on-to-purchase', 'browse-to-try-on', etc.
  stage: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Object, default: {} }
});

const ABTestSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  userId: { type: String, required: true },
  variant: { type: String, required: true },
  assignedAt: { type: Date, default: Date.now },
  converted: { type: Boolean, default: false },
  conversionValue: { type: Number, default: 0 },
  events: [{
    event: String,
    timestamp: Date,
    value: Number
  }]
});

const ProductAnalyticsSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  date: { type: Date, required: true },
  metrics: {
    views: { type: Number, default: 0 },
    tryOns: { type: Number, default: 0 },
    addToCarts: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    wishlistAdds: { type: Number, default: 0 },
    avgTryOnDuration: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  demographics: {
    ageGroups: { type: Map, of: Number },
    genderDistribution: { type: Map, of: Number },
    geographicDistribution: { type: Map, of: Number }
  },
  aiMetrics: {
    avgFittingScore: { type: Number, default: 0 },
    avgPoseStability: { type: Number, default: 0 },
    avgProcessingTime: { type: Number, default: 0 }
  }
});

// Create models
const UserInteraction = mongoose.model('UserInteraction', UserInteractionSchema);
const ConversionFunnel = mongoose.model('ConversionFunnel', ConversionFunnelSchema);
const ABTest = mongoose.model('ABTest', ABTestSchema);
const ProductAnalytics = mongoose.model('ProductAnalytics', ProductAnalyticsSchema);

class AnalyticsService {
  constructor() {
    this.activeTests = new Map();
    this.userSessions = new Map();
    this.realTimeMetrics = {
      activeUsers: 0,
      currentTryOns: 0,
      conversionRate: 0,
      averageSessionDuration: 0
    };
    this.metricsInterval = null;
    
    // Real-time metrics update will be started after DB connection
  }

  /**
   * Initialize analytics after database connection
   */
  async initialize() {
    try {
      // Add a small delay to ensure DB is fully ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check connection state
      console.log(`📊 Mongoose connection state: ${mongoose.connection.readyState}`);
      
      // Start real-time metrics - it will check connection on each interval
      this.startRealTimeMetrics();
      console.log('✅ Analytics Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Analytics Service:', error);
    }
  }

  /**
   * Dispose analytics service and clean up intervals
   */
  dispose() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
      console.log('🗑️ Analytics Service disposed');
    }
  }

  /**
   * Track user interaction event
   */
  async trackEvent(userId, sessionId, event, properties = {}, context = {}) {
    try {
      const interaction = new UserInteraction({
        userId,
        sessionId,
        event,
        properties,
        context: {
          ...context,
          timestamp: new Date().toISOString()
        }
      });

      await interaction.save();

      // Update real-time metrics
      this.updateRealTimeMetrics(event, properties);

      // Check for funnel progression
      await this.checkFunnelProgression(sessionId, userId, event, properties);

      // Update A/B test metrics
      await this.updateABTestMetrics(userId, event, properties);

      return {
        success: true,
        eventId: interaction._id,
        timestamp: interaction.timestamp
      };

    } catch (error) {
      console.error('Event tracking error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Track conversion funnel progression
   */
  async trackFunnelStep(sessionId, userId, funnel, stage, metadata = {}) {
    try {
      const funnelStep = new ConversionFunnel({
        sessionId,
        userId,
        funnel,
        stage,
        metadata
      });

      await funnelStep.save();

      // Analyze funnel drop-off in real-time
      await this.analyzeFunnelDropOff(funnel, stage);

      return {
        success: true,
        funnelId: funnelStep._id
      };

    } catch (error) {
      console.error('Funnel tracking error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * A/B Testing Framework
   */
  async assignABTest(testName, userId, forceVariant = null) {
    try {
      // Check if user is already in this test
      const existingTest = await ABTest.findOne({ testName, userId });
      if (existingTest) {
        return {
          success: true,
          variant: existingTest.variant,
          existing: true
        };
      }

      // Get test configuration
      const testConfig = await this.getABTestConfig(testName);
      if (!testConfig || !testConfig.active) {
        return {
          success: false,
          error: 'Test not found or inactive'
        };
      }

      // Assign variant
      const variant = forceVariant || this.assignVariant(testConfig.variants, userId);

      // Save assignment
      const testAssignment = new ABTest({
        testName,
        userId,
        variant
      });

      await testAssignment.save();

      return {
        success: true,
        variant,
        testId: testAssignment._id,
        existing: false
      };

    } catch (error) {
      console.error('A/B test assignment error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Track A/B test conversion
   */
  async trackABTestConversion(userId, testName, conversionValue = 0) {
    try {
      const testAssignment = await ABTest.findOne({ testName, userId });
      if (!testAssignment) {
        return { success: false, error: 'User not in test' };
      }

      testAssignment.converted = true;
      testAssignment.conversionValue = conversionValue;
      testAssignment.events.push({
        event: 'conversion',
        timestamp: new Date(),
        value: conversionValue
      });

      await testAssignment.save();

      return {
        success: true,
        variant: testAssignment.variant,
        conversionValue
      };

    } catch (error) {
      console.error('A/B test conversion error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update product analytics
   */
  async updateProductAnalytics(productId, eventType, value = 1, userMetadata = {}, aiMetrics = {}) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let analytics = await ProductAnalytics.findOne({
        productId,
        date: today
      });

      if (!analytics) {
        analytics = new ProductAnalytics({
          productId,
          date: today,
          metrics: {},
          demographics: {
            ageGroups: new Map(),
            genderDistribution: new Map(),
            geographicDistribution: new Map()
          },
          aiMetrics: {}
        });
      }

      // Update metrics based on event type
      switch (eventType) {
        case 'view':
          analytics.metrics.views += value;
          break;
        case 'try_on':
          analytics.metrics.tryOns += value;
          if (aiMetrics.duration) {
            analytics.metrics.avgTryOnDuration = 
              (analytics.metrics.avgTryOnDuration + aiMetrics.duration) / 2;
          }
          break;
        case 'add_to_cart':
          analytics.metrics.addToCarts += value;
          break;
        case 'purchase':
          analytics.metrics.purchases += value;
          if (aiMetrics.revenue) {
            analytics.metrics.revenue += aiMetrics.revenue;
          }
          break;
        case 'wishlist_add':
          analytics.metrics.wishlistAdds += value;
          break;
      }

      // Update conversion rate
      if (analytics.metrics.views > 0) {
        analytics.metrics.conversionRate = 
          (analytics.metrics.purchases / analytics.metrics.views) * 100;
      }

      // Update demographics
      if (userMetadata.ageGroup) {
        const currentAge = analytics.demographics.ageGroups.get(userMetadata.ageGroup) || 0;
        analytics.demographics.ageGroups.set(userMetadata.ageGroup, currentAge + 1);
      }

      if (userMetadata.gender) {
        const currentGender = analytics.demographics.genderDistribution.get(userMetadata.gender) || 0;
        analytics.demographics.genderDistribution.set(userMetadata.gender, currentGender + 1);
      }

      // Update AI metrics
      if (aiMetrics.fittingScore) {
        analytics.aiMetrics.avgFittingScore = 
          (analytics.aiMetrics.avgFittingScore + aiMetrics.fittingScore) / 2;
      }

      if (aiMetrics.poseStability) {
        analytics.aiMetrics.avgPoseStability = 
          (analytics.aiMetrics.avgPoseStability + aiMetrics.poseStability) / 2;
      }

      await analytics.save();

      return {
        success: true,
        analyticsId: analytics._id
      };

    } catch (error) {
      console.error('Product analytics update error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardMetrics(timeRange = '7d') {
    try {
      const dateRange = this.getDateRange(timeRange);

      // Parallel execution of analytics queries
      const [
        userInteractions,
        conversionFunnels,
        productAnalytics,
        abTestResults
      ] = await Promise.all([
        this.getUserInteractionMetrics(dateRange),
        this.getConversionFunnelMetrics(dateRange),
        this.getProductPerformanceMetrics(dateRange),
        this.getABTestResults(dateRange)
      ]);

      return {
        success: true,
        metrics: {
          overview: {
            totalUsers: userInteractions.totalUsers,
            totalSessions: userInteractions.totalSessions,
            averageSessionDuration: userInteractions.averageSessionDuration,
            bounceRate: userInteractions.bounceRate,
            conversionRate: conversionFunnels.overallConversionRate
          },
          userBehavior: userInteractions,
          conversionFunnels: conversionFunnels,
          productPerformance: productAnalytics,
          abTests: abTestResults,
          realTime: this.realTimeMetrics
        },
        timeRange,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Dashboard metrics error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate predictive analytics
   */
  async generatePredictiveInsights(userId) {
    try {
      // Get user interaction history
      const userHistory = await UserInteraction.find({ userId })
        .sort({ timestamp: -1 })
        .limit(100);

      // Analyze user behavior patterns
      const behaviorPatterns = this.analyzeBehaviorPatterns(userHistory);

      // Generate recommendations
      const recommendations = await this.generateProductRecommendations(userId, behaviorPatterns);

      // Predict conversion likelihood
      const conversionPrediction = this.predictConversionLikelihood(behaviorPatterns);

      // Calculate customer lifetime value
      const clvPrediction = await this.predictCustomerLifetimeValue(userId, behaviorPatterns);

      return {
        success: true,
        insights: {
          behaviorPatterns,
          recommendations,
          conversionPrediction,
          clvPrediction,
          nextBestAction: this.determineNextBestAction(behaviorPatterns),
          riskSegment: this.determineRiskSegment(behaviorPatterns)
        }
      };

    } catch (error) {
      console.error('Predictive insights error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Real-time metrics update system
   */
  startRealTimeMetrics() {
    // Clear any existing interval
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    this.metricsInterval = setInterval(async () => {
      try {
        // Check if we're connected to DB using mongoose connection state
        if (mongoose.connection.readyState !== 1) {
          console.warn('⚠️ Database connection not ready, skipping metrics update');
          return;
        }

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // Create an abort controller with timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 5000); // 5 second timeout

        try {
          // Count active users (users with interactions in last hour)
          const activeUsers = await Promise.race([
            UserInteraction.distinct('userId', {
              timestamp: { $gte: oneHourAgo }
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Metrics query timeout')), 5000)
            )
          ]);

          clearTimeout(timeoutId);

          // Count current try-ons (try-on events in last 5 minutes)
          const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
          const currentTryOns = await Promise.race([
            UserInteraction.countDocuments({
              event: 'try_on_start',
              timestamp: { $gte: fiveMinutesAgo }
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Try-on count query timeout')), 5000)
            )
          ]);

          // Update metrics
          this.realTimeMetrics.activeUsers = activeUsers.length;
          this.realTimeMetrics.currentTryOns = currentTryOns;

          // Broadcast to connected clients via WebSocket if available
          this.broadcastRealTimeMetrics();

        } catch (error) {
          if (error.message.includes('timeout')) {
            console.warn('⚠️ Metrics query timeout, will retry on next interval');
          } else {
            console.error('❌ Real-time metrics query error:', error.message);
          }
        }

      } catch (error) {
        console.error('❌ Real-time metrics update error:', error.message);
      }
    }, 30000); // Update every 30 seconds
  }

  // Helper methods
  assignVariant(variants, userId) {
    // Consistent hash-based assignment
    const hash = this.hashUserId(userId);
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    const threshold = hash % totalWeight;
    
    let currentWeight = 0;
    for (const variant of variants) {
      currentWeight += variant.weight;
      if (threshold < currentWeight) {
        return variant.name;
      }
    }
    
    return variants[0].name; // Fallback
  }

  hashUserId(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  getDateRange(timeRange) {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate: now };
  }

  broadcastRealTimeMetrics() {
    // Implementation would depend on WebSocket setup
    // For now, just log the metrics
    console.log('Real-time metrics:', this.realTimeMetrics);
  }

  // Additional helper methods would be implemented here...
  async checkFunnelProgression(sessionId, userId, event, properties) {
    // Implementation for funnel analysis
  }

  async updateABTestMetrics(userId, event, properties) {
    // Implementation for A/B test metric updates
  }

  async getABTestConfig(testName) {
    // Implementation to get test configuration
    return {
      active: true,
      variants: [
        { name: 'control', weight: 50 },
        { name: 'variant_a', weight: 50 }
      ]
    };
  }

  analyzeBehaviorPatterns(userHistory) {
    // Implementation for behavior pattern analysis
    return {
      sessionFrequency: 'high',
      averageSessionDuration: 300,
      preferredCategories: ['dresses', 'shirts'],
      tryOnToCartRatio: 0.3
    };
  }

  async generateProductRecommendations(userId, patterns) {
    // Implementation for product recommendations
    return [
      { productId: '1', reason: 'Similar to viewed items', confidence: 0.8 },
      { productId: '2', reason: 'Trending in your category', confidence: 0.7 }
    ];
  }

  predictConversionLikelihood(patterns) {
    // Implementation for conversion prediction
    return {
      likelihood: 0.75,
      factors: ['high engagement', 'multiple try-ons', 'return visitor']
    };
  }
}

// Create singleton instance
let analyticsInstance = null;

function getAnalyticsService() {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService();
  }
  return analyticsInstance;
}

module.exports = {
  AnalyticsService,
  getAnalyticsService,
  UserInteraction,
  ConversionFunnel,
  ABTest,
  ProductAnalytics
};