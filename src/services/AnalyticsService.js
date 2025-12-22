

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

    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000);
  }

  
  async initialize(userId = null) {
    try {
      this.userId = userId;
      this.isInitialized = true;

      await this.trackPageView();

      this.setupAutomaticTracking();

      await this.flushEventQueue();

      console.log('Enhanced Analytics tracker initialized successfully');

    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  
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

    if (action === 'start') {
      await this.updateProductAnalytics(productId, 'try_on', 1, {}, aiMetrics);
    }
  }

  
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

  
  async trackPageView() {
    const properties = {
      page: window.location.pathname,
      title: document.title,
      url: window.location.href,
      referrer: document.referrer
    };

    await this.trackEvent('page_view', properties);
  }

  
  setupAutomaticTracking() {

    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - this.pageStartTime;
      this.trackEvent('page_unload', { timeOnPage }, { sync: true });
    });

    document.addEventListener('click', (event) => {
      const element = event.target;
      if (element.dataset.track) {
        this.trackEvent('user_engagement', { 
          action: 'click', 
          element: element.dataset.track 
        });
      }
    });

    window.addEventListener('error', (event) => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        stack: event.error?.stack
      });
    });
  }

  
  async flushEventQueue() {
    for (const event of this.eventQueue) {
      await this.trackEvent(event.eventName, event.properties, event.context);
    }
    this.eventQueue = [];
  }

  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  
  startSession() {
    this.trackEvent('session_start', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language
    });
  }

  
  trackBodyAnalysis(data) {
    this.trackEvent('body_analysis', {
      success: data.success,
      bodyType: data.bodyType,
      confidence: data.confidence,
      processingTime: data.processingTime
    });
  }

  
  trackOutfitRecommendation(data) {
    this.trackEvent('outfit_recommendation', {
      itemsCount: data.itemsCount,
      score: data.score,
      style: data.style
    });
  }

  
  trackProductInteraction(action, productId, productData = {}) {
    this.trackEvent('product_interaction', {
      action, // view, wishlist_add, wishlist_remove, cart_add
      productId,
      ...productData
    });
  }

  
  trackButtonClick(buttonName, context = {}) {
    this.trackEvent('button_click', {
      buttonName,
      ...context
    });
  }

  
  trackError(errorType, errorMessage, context = {}) {
    this.trackEvent('error', {
      errorType,
      errorMessage,
      ...context
    });
  }

  
  trackPerformance(metricName, value, unit = 'ms') {
    this.trackEvent('performance', {
      metricName,
      value,
      unit
    });
  }

  
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

        const blob = new Blob([options.body], { type: 'application/json' });
        navigator.sendBeacon(`${this.baseUrl}/api/analytics/events`, blob);
      } else {

        const response = await fetch(`${this.baseUrl}/api/analytics/events`, options);
        
        if (!response.ok) {
          console.error('Failed to send analytics:', response.statusText);

          this.events.unshift(...eventsToSend);
        } else {
          console.log(`Flushed ${eventsToSend.length} analytics events`);
        }
      }
    } catch (error) {
      console.error('Analytics flush error:', error);

      this.events.unshift(...eventsToSend);
    }
  }

  
  setUserId(userId) {
    this.userId = userId;
    this.trackEvent('user_identified', { userId });
  }

  
  clearUserId() {
    this.userId = null;
  }

  
  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      eventsCount: this.events.length,
      startTime: this.events[0]?.timestamp
    };
  }

  
  dispose() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents(true);
  }
}

let analyticsInstance = null;

export const getAnalytics = () => {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService();
  }
  return analyticsInstance;
};

export default AnalyticsService;
