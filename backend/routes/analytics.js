/**
 * Enhanced Analytics API Routes
 * 
 * Features:
 * - Real-time user behavior tracking
 * - Conversion funnel analytics
 * - A/B testing framework
 * - Product performance insights
 * - Predictive analytics
 * 
 * @version 2.0.0
 */

const express = require('express');
const router = express.Router();
const { getAnalyticsService } = require('../services/AnalyticsService');
const { verifyFirebaseToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Get singleton analytics service instance
const analyticsService = getAnalyticsService();

// Rate limiting for analytics endpoints
const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Allow more requests for analytics
  message: 'Too many analytics requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const dashboardLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Fewer requests for dashboard data
  message: 'Too many dashboard requests, please try again later',
});

// All analytics data is now stored in MongoDB collections:
// - userinteractions: User behavior tracking
// - orders: Purchase and transaction data
// - users: User information
// - products: Product inventory and sales

/**
 * @route   POST /api/analytics/track
 * @desc    Track user interaction event (Enhanced)
 * @access  Public
 */
router.post('/track',
  analyticsLimiter,
  async (req, res) => {
    try {
      const {
        userId,
        sessionId,
        event,
        properties = {},
        context = {}
      } = req.body;

      // Basic validation
      if (!userId || !sessionId || !event) {
        return res.status(400).json({
          success: false,
          message: 'userId, sessionId, and event are required'
        });
      }

      // Enhanced context with request data
      const enhancedContext = {
        ...context,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer'),
        timestamp: new Date().toISOString()
      };

      const result = await analyticsService.trackEvent(
        userId,
        sessionId,
        event,
        properties,
        enhancedContext
      );

      res.status(200).json({
        success: true,
        message: 'Event tracked successfully',
        eventId: result.eventId,
        timestamp: result.timestamp
      });

    } catch (error) {
      console.error('Analytics tracking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track event',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   POST /api/analytics/ab-test/assign
 * @desc    Assign user to A/B test variant
 * @access  Public
 */
router.post('/ab-test/assign',
  analyticsLimiter,
  async (req, res) => {
    try {
      const { testName, userId, forceVariant } = req.body;

      if (!testName || !userId) {
        return res.status(400).json({
          success: false,
          message: 'testName and userId are required'
        });
      }

      const result = await analyticsService.assignABTest(testName, userId, forceVariant);

      res.status(200).json({
        success: true,
        variant: result.variant,
        existing: result.existing || false
      });

    } catch (error) {
      console.error('A/B test assignment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign A/B test'
      });
    }
  }
);

/**
 * @route   POST /api/analytics/product
 * @desc    Update product analytics metrics
 * @access  Public
 */
router.post('/product',
  analyticsLimiter,
  async (req, res) => {
    try {
      const { productId, eventType, value = 1, userMetadata = {}, aiMetrics = {} } = req.body;

      if (!productId || !eventType) {
        return res.status(400).json({
          success: false,
          message: 'productId and eventType are required'
        });
      }

      const result = await analyticsService.updateProductAnalytics(
        productId,
        eventType,
        value,
        userMetadata,
        aiMetrics
      );

      res.status(200).json({
        success: true,
        analyticsId: result.analyticsId
      });
    } catch (error) {
      console.error('Product analytics update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product analytics'
      });
    }
  }
);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get analytics dashboard data with real MongoDB queries
 * @access  Private (Admin only)
 */
router.get('/dashboard',
  dashboardLimiter,
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { range = '7d' } = req.query;
      const db = req.app.locals.db;

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      switch (range) {
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

      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Execute all queries in parallel for better performance
      const [
        totalUsers,
        totalOrders,
        revenueData,
        newUsersToday,
        activeUserIds,
        pendingOrders,
        lowStockProducts,
        popularCategories,
        topProducts,
        sessionMetrics
      ] = await Promise.all([
        // Total users
        db.collection('users').countDocuments(),
        
        // Total orders in date range
        db.collection('orders').countDocuments({
          createdAt: { $gte: startDate }
        }),
        
        // Revenue aggregation
        db.collection('orders').aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
              'payment.status': 'completed'
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$payment.amount' }
            }
          }
        ]).toArray(),
        
        // New users today
        db.collection('users').countDocuments({
          createdAt: { $gte: todayStart }
        }),
        
        // Active users (last hour)
        db.collection('userinteractions').distinct('userId', {
          timestamp: { $gte: oneHourAgo }
        }),
        
        // Pending orders
        db.collection('orders').countDocuments({
          status: { $in: ['pending', 'processing'] }
        }),
        
        // Low stock items
        db.collection('products').countDocuments({
          'inventory.totalStock': { $lt: 10 }
        }),
        
        // Popular categories
        db.collection('products').aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalSales: { $sum: '$sales' }
            }
          },
          { $sort: { totalSales: -1 } },
          { $limit: 5 }
        ]).toArray(),
        
        // Top products by sales
        db.collection('products').aggregate([
          { $match: { sales: { $gt: 0 } } },
          { $sort: { sales: -1 } },
          { $limit: 5 },
          {
            $project: {
              name: '$name.en',
              sales: 1,
              revenue: { $multiply: ['$sales', '$pricing.selling'] }
            }
          }
        ]).toArray(),
        
        // Session duration and bounce rate calculations
        calculateSessionMetrics(db, startDate)
      ]);

      const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
      const activeUsers = activeUserIds.length;

      // Format response to match AdminDashboard expectations
      res.status(200).json({
        success: true,
        analytics: {
          totalUsers,
          totalOrders,
          totalRevenue,
          conversionRate: sessionMetrics.conversionRate,
          bounceRate: sessionMetrics.bounceRate,
          avgSessionDuration: sessionMetrics.avgSessionDuration,
          newUsersToday,
          activeUsers,
          pendingOrders,
          lowStockItems,
          popularCategories: popularCategories.map(cat => ({
            category: cat._id,
            count: cat.count,
            sales: cat.totalSales
          })),
          topProducts: topProducts.map(prod => ({
            id: prod._id,
            name: prod.name,
            sales: prod.sales,
            revenue: prod.revenue
          }))
        },
        timeRange: range,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Dashboard metrics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard metrics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * Helper function to calculate session metrics
 */
async function calculateSessionMetrics(db, startDate) {
  try {
    // Get all sessions in date range
    const sessions = await db.collection('userinteractions').aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$sessionId',
          events: { $push: { event: '$event', timestamp: '$timestamp' } },
          firstEvent: { $min: '$timestamp' },
          lastEvent: { $max: '$timestamp' },
          eventCount: { $sum: 1 }
        }
      }
    ]).toArray();

    if (sessions.length === 0) {
      return {
        avgSessionDuration: '0m 0s',
        bounceRate: 0,
        conversionRate: 0
      };
    }

    // Calculate average session duration
    let totalDuration = 0;
    let bounces = 0;
    let conversions = 0;

    sessions.forEach(session => {
      const duration = (new Date(session.lastEvent) - new Date(session.firstEvent)) / 1000;
      totalDuration += duration;
      
      // Count bounces (single page visit < 10 seconds)
      if (session.eventCount === 1 || duration < 10) {
        bounces++;
      }
      
      // Check for conversion events
      const hasConversion = session.events.some(e => 
        ['purchase', 'add_to_cart', 'checkout'].includes(e.event)
      );
      if (hasConversion) {
        conversions++;
      }
    });

    const avgDurationSeconds = Math.floor(totalDuration / sessions.length);
    const minutes = Math.floor(avgDurationSeconds / 60);
    const seconds = avgDurationSeconds % 60;
    const avgSessionDuration = `${minutes}m ${seconds}s`;
    
    const bounceRate = ((bounces / sessions.length) * 100).toFixed(2);
    const conversionRate = ((conversions / sessions.length) * 100).toFixed(2);

    return {
      avgSessionDuration,
      bounceRate: parseFloat(bounceRate),
      conversionRate: parseFloat(conversionRate)
    };
  } catch (error) {
    console.error('Session metrics calculation error:', error);
    return {
      avgSessionDuration: '0m 0s',
      bounceRate: 0,
      conversionRate: 0
    };
  }
}

/**
 * GET /api/analytics/summary
 * Get analytics summary from MongoDB
 */
router.get('/summary', async (req, res) => {
  try {
    const { timeRange = '24h', userId } = req.query;
    const db = req.app.locals.db;

    // Calculate time threshold
    const now = new Date();
    let threshold;
    switch (timeRange) {
      case '1h':
        threshold = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Build query filter
    const matchFilter = {
      timestamp: { $gte: threshold }
    };
    if (userId) {
      matchFilter.userId = userId;
    }

    // Execute aggregation queries in parallel
    const [
      eventStats,
      pageViewStats,
      tryOnStats,
      errorStats
    ] = await Promise.all([
      // Overall event statistics
      db.collection('userinteractions').aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            uniqueSessions: { $addToSet: '$sessionId' },
            uniqueUsers: { $addToSet: '$userId' },
            eventsByType: { $push: '$event' }
          }
        }
      ]).toArray(),
      
      // Page view statistics
      db.collection('userinteractions').aggregate([
        {
          $match: {
            ...matchFilter,
            event: 'page_view'
          }
        },
        {
          $group: {
            _id: '$properties.page',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray(),
      
      // Try-on session statistics
      db.collection('userinteractions').aggregate([
        {
          $match: {
            ...matchFilter,
            event: { $in: ['try_on_start', 'try_on_complete', 'try_on_end'] }
          }
        },
        {
          $group: {
            _id: '$sessionId',
            events: { $push: '$event' },
            duration: {
              $max: {
                $subtract: ['$timestamp', { $min: '$timestamp' }]
              }
            },
            success: {
              $max: {
                $cond: [{ $eq: ['$event', 'try_on_complete'] }, 1, 0]
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            successful: { $sum: '$success' },
            avgDuration: { $avg: { $divide: ['$duration', 1000] } }
          }
        }
      ]).toArray(),
      
      // Error statistics
      db.collection('userinteractions').aggregate([
        {
          $match: {
            ...matchFilter,
            event: 'error'
          }
        },
        {
          $group: {
            _id: '$properties.errorType',
            count: { $sum: 1 }
          }
        }
      ]).toArray()
    ]);

    // Process event counts
    const eventCounts = {};
    if (eventStats.length > 0 && eventStats[0].eventsByType) {
      eventStats[0].eventsByType.forEach(event => {
        eventCounts[event] = (eventCounts[event] || 0) + 1;
      });
    }

    // Format error statistics
    const errorsByType = {};
    errorStats.forEach(err => {
      errorsByType[err._id || 'unknown'] = err.count;
    });

    res.json({
      success: true,
      summary: {
        timeRange,
        totalEvents: eventStats.length > 0 ? eventStats[0].totalEvents : 0,
        uniqueSessions: eventStats.length > 0 ? eventStats[0].uniqueSessions.length : 0,
        uniqueUsers: eventStats.length > 0 ? eventStats[0].uniqueUsers.filter(u => u).length : 0,
        eventCounts,
        topPages: pageViewStats.map(p => ({ name: p._id, count: p.count })),
        tryOnStats: {
          total: tryOnStats.length > 0 ? tryOnStats[0].total : 0,
          successful: tryOnStats.length > 0 ? tryOnStats[0].successful : 0,
          avgDuration: tryOnStats.length > 0 ? Math.round(tryOnStats[0].avgDuration) : 0
        },
        errors: {
          total: errorStats.reduce((sum, err) => sum + err.count, 0),
          byType: errorsByType
        }
      }
    });

  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics summary',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/analytics/realtime
 * Get real-time analytics from MongoDB
 */
router.get('/realtime', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Execute queries in parallel
    const [
      recentEvents,
      activeUserIds,
      activeTryOns,
      recentOrders
    ] = await Promise.all([
      // Recent events in last 5 minutes
      db.collection('userinteractions').find({
        timestamp: { $gte: fiveMinutesAgo }
      }).sort({ timestamp: -1 }).limit(20).toArray(),
      
      // Active users in last hour
      db.collection('userinteractions').distinct('userId', {
        timestamp: { $gte: oneHourAgo }
      }),
      
      // Current try-on sessions
      db.collection('userinteractions').countDocuments({
        event: 'try_on_start',
        timestamp: { $gte: fiveMinutesAgo }
      }),
      
      // Recent orders
      db.collection('orders').countDocuments({
        createdAt: { $gte: fiveMinutesAgo }
      })
    ]);

    res.json({
      success: true,
      realtime: {
        activeUsers: activeUserIds.length,
        currentTryOns: activeTryOns,
        recentEvents: recentEvents.length,
        recentOrders,
        currentActivities: recentEvents.map(e => ({
          userId: e.userId,
          eventName: e.event,
          timestamp: e.timestamp,
          sessionId: e.sessionId,
          properties: e.properties
        })),
        timestamp: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get real-time analytics',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/analytics/user/:userId
 * Get analytics for specific user from MongoDB
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = req.app.locals.db;
    
    // Check if user exists
    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { password: 0, verificationToken: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user interaction statistics
    const [
      recentEvents,
      eventStats,
      sessionStats,
      purchaseHistory
    ] = await Promise.all([
      // Recent events for this user
      db.collection('userinteractions').find({ userId })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray(),
      
      // Event type breakdown
      db.collection('userinteractions').aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$event',
            count: { $sum: 1 }
          }
        }
      ]).toArray(),
      
      // Session statistics
      db.collection('userinteractions').aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$sessionId',
            startTime: { $min: '$timestamp' },
            endTime: { $max: '$timestamp' },
            eventCount: { $sum: 1 }
          }
        },
        {
          $project: {
            duration: {
              $divide: [
                { $subtract: ['$endTime', '$startTime'] },
                1000
              ]
            },
            eventCount: 1
          }
        },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            avgDuration: { $avg: '$duration' },
            avgEventsPerSession: { $avg: '$eventCount' }
          }
        }
      ]).toArray(),
      
      // Purchase history
      db.collection('orders').find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()
    ]);

    // Format event type counts
    const eventTypeCounts = {};
    eventStats.forEach(stat => {
      eventTypeCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        lastActive: recentEvents.length > 0 ? recentEvents[0].timestamp : null,
        analytics: {
          totalEvents: recentEvents.length,
          eventTypeCounts,
          sessions: sessionStats.length > 0 ? {
            total: sessionStats[0].totalSessions,
            avgDuration: Math.round(sessionStats[0].avgDuration),
            avgEventsPerSession: Math.round(sessionStats[0].avgEventsPerSession)
          } : { total: 0, avgDuration: 0, avgEventsPerSession: 0 },
          purchases: {
            total: purchaseHistory.length,
            totalSpent: purchaseHistory.reduce((sum, order) => 
              sum + (order.payment?.amount || 0), 0
            )
          }
        },
        recentEvents: recentEvents.map(e => ({
          event: e.event,
          timestamp: e.timestamp,
          sessionId: e.sessionId,
          properties: e.properties
        })),
        recentOrders: purchaseHistory.map(o => ({
          orderId: o._id,
          amount: o.payment?.amount || 0,
          status: o.status,
          createdAt: o.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user analytics',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
