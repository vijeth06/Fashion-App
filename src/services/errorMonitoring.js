// Comprehensive Error Monitoring and Analytics System
class ErrorMonitoringService {
  constructor() {
    this.errorQueue = [];
    this.analytics = {
      errors: {},
      performance: {},
      userActions: {}
    };
    this.config = {
      maxQueueSize: 100,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      retryAttempts: 3
    };
    
    this.initializeMonitoring();
  }

  initializeMonitoring() {
    // Global error handler
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    
    // Performance monitoring
    this.setupPerformanceMonitoring();
    
    // Start periodic flush
    setInterval(() => this.flushErrors(), this.config.flushInterval);
  }

  handleGlobalError(event) {
    const error = {
      type: 'javascript_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    this.logError(error);
  }

  handleUnhandledRejection(event) {
    const error = {
      type: 'unhandled_promise_rejection',
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    this.logError(error);
  }

  logError(errorData) {
    // Enhance error with additional context
    const enhancedError = {
      ...errorData,
      sessionId: this.getSessionId(),
      userId: this.getCurrentUserId(),
      buildVersion: process.env.REACT_APP_VERSION || 'unknown',
      environment: process.env.NODE_ENV,
      features: this.getActiveFeatures(),
      browserInfo: this.getBrowserInfo(),
      deviceInfo: this.getDeviceInfo()
    };

    // Add to queue
    this.errorQueue.push(enhancedError);
    
    // Update analytics
    this.updateErrorAnalytics(enhancedError);
    
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Logged:', enhancedError);
    }
    
    // Immediate flush for critical errors
    if (this.isCriticalError(enhancedError)) {
      this.flushErrors();
    }
    
    // Maintain queue size
    if (this.errorQueue.length > this.config.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  async flushErrors() {
    if (this.errorQueue.length === 0) return;
    
    const batch = this.errorQueue.splice(0, this.config.batchSize);
    
    try {
      await this.sendErrorBatch(batch);
    } catch (error) {
      // Put failed batch back in queue
      this.errorQueue.unshift(...batch);
      console.error('Failed to send error batch:', error);
    }
  }

  async sendErrorBatch(errors, attempt = 1) {
    const endpoint = process.env.REACT_APP_ERROR_ENDPOINT || '/api/v1/errors/batch';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.REACT_APP_API_KEY || ''
        },
        body: JSON.stringify({
          errors,
          metadata: {
            batchId: this.generateBatchId(),
            timestamp: new Date().toISOString(),
            analytics: this.getAnalyticsSummary()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => {
          this.sendErrorBatch(errors, attempt + 1);
        }, delay);
      } else {
        throw error;
      }
    }
  }

  setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        this.logPerformance('page_load', {
          loadTime: perfData.loadEventEnd - perfData.fetchStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint()
        });
      }, 0);
    });

    // Monitor resource loading
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 2000) { // Log slow resources
          this.logPerformance('slow_resource', {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize
          });
        }
      });
    }).observe({ entryTypes: ['resource'] });
  }

  logPerformance(type, data) {
    const perfEntry = {
      type: 'performance',
      subtype: type,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    this.analytics.performance[type] = this.analytics.performance[type] || [];
    this.analytics.performance[type].push(perfEntry);
  }

  logUserAction(action, data = {}) {
    const actionEntry = {
      action,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userId: this.getCurrentUserId()
    };
    
    this.analytics.userActions[action] = this.analytics.userActions[action] || [];
    this.analytics.userActions[action].push(actionEntry);
  }

  updateErrorAnalytics(error) {
    const errorType = `${error.type}_${error.message?.split(' ')[0] || 'unknown'}`;
    
    if (!this.analytics.errors[errorType]) {
      this.analytics.errors[errorType] = {
        count: 0,
        firstSeen: error.timestamp,
        lastSeen: error.timestamp,
        samples: []
      };
    }
    
    this.analytics.errors[errorType].count++;
    this.analytics.errors[errorType].lastSeen = error.timestamp;
    
    // Keep sample errors
    if (this.analytics.errors[errorType].samples.length < 5) {
      this.analytics.errors[errorType].samples.push(error);
    }
  }

  isCriticalError(error) {
    const criticalPatterns = [
      /payment/i,
      /security/i,
      /auth/i,
      /database/i,
      /critical/i
    ];
    
    return criticalPatterns.some(pattern => 
      pattern.test(error.message) || 
      pattern.test(error.type)
    );
  }

  getSessionId() {
    if (!sessionStorage.getItem('errorMonitoringSessionId')) {
      sessionStorage.setItem('errorMonitoringSessionId', 
        Date.now().toString(36) + Math.random().toString(36).substr(2)
      );
    }
    return sessionStorage.getItem('errorMonitoringSessionId');
  }

  getCurrentUserId() {
    // Get from your auth context or localStorage
    return localStorage.getItem('userId') || 'anonymous';
  }

  getActiveFeatures() {
    return [
      'ar-tryon',
      'ai-recommendations',
      'payment',
      'social-features'
    ]; // Return currently active features
  }

  getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  }

  getDeviceInfo() {
    return {
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window
    };
  }

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  generateBatchId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  getAnalyticsSummary() {
    return {
      errorTypes: Object.keys(this.analytics.errors).length,
      totalErrors: Object.values(this.analytics.errors).reduce((sum, error) => sum + error.count, 0),
      performanceMetrics: Object.keys(this.analytics.performance).length,
      userActions: Object.keys(this.analytics.userActions).length
    };
  }

  // Public methods for manual error reporting
  reportError(error, context = {}) {
    this.logError({
      type: 'manual_report',
      message: error.message || error,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  reportPerformanceIssue(type, data) {
    this.logPerformance(`manual_${type}`, data);
  }

  reportUserFeedback(feedback, category = 'general') {
    this.logUserAction('feedback', {
      category,
      feedback,
      rating: feedback.rating,
      comment: feedback.comment
    });
  }

  // Get analytics data for dashboard
  getAnalytics() {
    return {
      ...this.analytics,
      summary: this.getAnalyticsSummary(),
      queueSize: this.errorQueue.length
    };
  }
}

// React Hook for error monitoring
export const useErrorMonitoring = () => {
  const reportError = (error, context) => {
    errorMonitoringService.reportError(error, context);
  };

  const reportPerformance = (type, data) => {
    errorMonitoringService.reportPerformanceIssue(type, data);
  };

  const reportUserAction = (action, data) => {
    errorMonitoringService.logUserAction(action, data);
  };

  return {
    reportError,
    reportPerformance,
    reportUserAction
  };
};

// Initialize global instance
const errorMonitoringService = new ErrorMonitoringService();

export default errorMonitoringService;