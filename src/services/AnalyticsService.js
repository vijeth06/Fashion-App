/**
 * Enhanced Frontend Analytics Service
 * 
 * Provides client-side analytics tracking, A/B testing, and user behavior insights
 * 
 * @version 2.0.0
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.isInitialized = false;
    this.eventQueue = [];
    this.events = []; // Initialize events array
    this.abTestVariants = new Map();
    this.pageStartTime = Date.now();
    this.baseUrl = API_URL;
    this.flushInterval = null;
    
    // Set up automatic flushing every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000);
  }

  /**
   * Initialize analytics tracker
   */
  async initialize(userId = null) {
    try {
      this.userId = userId;
      this.isInitialized = true;

      // Track page view
      await this.trackPageView();

      // Set up automatic tracking
      this.setupAutomaticTracking();

      // Process queued events
      await this.flushEventQueue();

      console.log('Enhanced Analytics tracker initialized successfully');

    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  /**
   * Track custom event
   */
  async trackEvent(eventName, properties = {}, context = {}) {
    if (!this.isInitialized) {
      this.eventQueue.push({ eventName, properties, context });
      return;
    }

    try {
      const eventData = {
        userId: this.userId,
        sessionId: this.sessionId,
        event: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          referrer: document.referrer
        },
        context: {
          ...context,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          url: window.location.href
        }
      };

      const response = await fetch(`${this.baseUrl}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        console.error('Analytics tracking failed:', response.statusText);
      }

    } catch (error) {
      console.error('Analytics event tracking error:', error);
    }
  }

  /**
   * Track virtual try-on events
   */
  async trackTryOn(action, productId, aiMetrics = {}) {
    const properties = {
      productId,
      action, // 'start', 'success', 'error', 'complete'
      aiMetrics: {
        fittingScore: aiMetrics.fittingScore,
        poseStability: aiMetrics.poseStability,
        processingTime: aiMetrics.processingTime,
        confidence: aiMetrics.confidence
      }
    };

    await this.trackEvent('virtual_try_on', properties);

    // Update product analytics
    if (action === 'start') {
      await this.updateProductAnalytics(productId, 'try_on', 1, {}, aiMetrics);
    }
  }

  /**
   * A/B Testing
   */
  async assignToTest(testName, forceVariant = null) {
    try {
      if (this.abTestVariants.has(testName)) {
        return this.abTestVariants.get(testName);
      }

      const response = await fetch(`${this.baseUrl}/api/analytics/ab-test/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testName,
          userId: this.userId || this.sessionId,
          forceVariant
        })
      });

      if (!response.ok) {
        console.error('A/B test assignment failed:', response.statusText);
        return 'control'; // Default fallback
      }

      const result = await response.json();
      if (result.success) {
        this.abTestVariants.set(testName, result.variant);
        return result.variant;
      }

      return 'control';

    } catch (error) {
      console.error('A/B test assignment error:', error);
      return 'control';
    }
  }

  /**
   * Update product analytics
   */
  async updateProductAnalytics(productId, eventType, value = 1, userMetadata = {}, aiMetrics = {}) {
    try {
      await fetch(`${this.baseUrl}/api/analytics/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          eventType,
          value,
          userMetadata,
          aiMetrics
        })
      });

    } catch (error) {
      console.error('Product analytics update error:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView() {
    const properties = {
      page: window.location.pathname,
      title: document.title,
      url: window.location.href,
      referrer: document.referrer
    };

    await this.trackEvent('page_view', properties);
  }

  /**
   * Set up automatic tracking
   */
  setupAutomaticTracking() {
    // Track page unload
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - this.pageStartTime;
      this.trackEvent('page_unload', { timeOnPage }, { sync: true });
    });

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const element = event.target;
      if (element.dataset.track) {
        this.trackEvent('user_engagement', { 
          action: 'click', 
          element: element.dataset.track 
        });
      }
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        stack: event.error?.stack
      });
    });
  }

  /**
   * Flush event queue
   */
  async flushEventQueue() {
    for (const event of this.eventQueue) {
      await this.trackEvent(event.eventName, event.properties, event.context);
    }
    this.eventQueue = [];
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start session
   */
  startSession() {
    this.trackEvent('session_start', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language
    });
  }

  /**
   * Track body analysis
   */
  trackBodyAnalysis(data) {
    this.trackEvent('body_analysis', {
      success: data.success,
      bodyType: data.bodyType,
      confidence: data.confidence,
      processingTime: data.processingTime
    });
  }

  /**
   * Track outfit recommendation
   */
  trackOutfitRecommendation(data) {
    this.trackEvent('outfit_recommendation', {
      itemsCount: data.itemsCount,
      score: data.score,
      style: data.style
    });
  }

  /**
   * Track product interaction
   */
  trackProductInteraction(action, productId, productData = {}) {
    this.trackEvent('product_interaction', {
      action, // view, wishlist_add, wishlist_remove, cart_add
      productId,
      ...productData
    });
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName, context = {}) {
    this.trackEvent('button_click', {
      buttonName,
      ...context
    });
  }

  /**
   * Track error
   */
  trackError(errorType, errorMessage, context = {}) {
    this.trackEvent('error', {
      errorType,
      errorMessage,
      ...context
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(metricName, value, unit = 'ms') {
    this.trackEvent('performance', {
      metricName,
      value,
      unit
    });
  }

  /**
   * Flush events to backend
   */
  async flushEvents(synchronous = false) {
    if (this.events.length === 0) {
      return;
    }

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: eventsToSend
        })
      };

      if (synchronous && navigator.sendBeacon) {
        // Use sendBeacon for synchronous sending on page unload
        const blob = new Blob([options.body], { type: 'application/json' });
        navigator.sendBeacon(`${this.baseUrl}/api/analytics/events`, blob);
      } else {
        // Regular fetch for async sending
        const response = await fetch(`${this.baseUrl}/api/analytics/events`, options);
        
        if (!response.ok) {
          console.error('Failed to send analytics:', response.statusText);
          // Put events back in queue
          this.events.unshift(...eventsToSend);
        } else {
          console.log(`Flushed ${eventsToSend.length} analytics events`);
        }
      }
    } catch (error) {
      console.error('Analytics flush error:', error);
      // Put events back in queue
      this.events.unshift(...eventsToSend);
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId) {
    this.userId = userId;
    this.trackEvent('user_identified', { userId });
  }

  /**
   * Clear user ID
   */
  clearUserId() {
    this.userId = null;
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      eventsCount: this.events.length,
      startTime: this.events[0]?.timestamp
    };
  }

  /**
   * Cleanup
   */
  dispose() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents(true);
  }
}

// Singleton instance
let analyticsInstance = null;

export const getAnalytics = () => {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService();
  }
  return analyticsInstance;
};

export default AnalyticsService;
