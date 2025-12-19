/**
 * Performance Optimization Configuration
 * 
 * Implements:
 * - Lazy loading for heavy components
 * - Code splitting
 * - Image optimization
 * - Bundle size optimization
 * 
 * @version 1.0.0
 */

import React, { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

/**
 * Loading fallback component
 */
const LoadingFallback = ({ message = 'Loading...' }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="400px"
    gap={2}
  >
    <CircularProgress size={50} />
    <p style={{ color: '#666', fontSize: '14px' }}>{message}</p>
  </Box>
);

/**
 * Lazy-loaded components
 * 
 * Heavy components are loaded only when needed to reduce initial bundle size
 */

// Main try-on component (v2)
export const VirtualTryOnComponent = lazy(() => 
  import('./components/VirtualTryOnComponent.v2').then(module => ({
    default: module.default
  }))
);

// AR Features
export const AdvancedARTryOn = lazy(() => 
  import('./components/AdvancedARTryOn')
);

export const ARTryOn = lazy(() => 
  import('./components/ARTryOn')
);

// Quantum/Advanced Features (likely fake - lazy load to defer bundle impact)
export const QuantumTryOn = lazy(() => 
  import('./components/QuantumTryOn')
);

// 3D/Immersive Features
export const Immersive3DShopping = lazy(() => 
  import('./components/Immersive3DShopping')
);

// Metaverse Integration
export const MetaverseIntegration = lazy(() => 
  import('./components/MetaverseIntegration')
);

// Premium Features
export const PremiumFeatures = lazy(() => 
  import('./components/PremiumFeatures')
);

// Admin Dashboard
export const AdvancedAdminDashboard = lazy(() => 
  import('./components/AdvancedAdminDashboard')
);

// Sustainability Features
export const BiometricSustainability = lazy(() => 
  import('./components/BiometricSustainability')
);

// Real-time Features
export const RealTimeFeatures = lazy(() => 
  import('./components/RealTimeFeatures')
);

// Analytics
export const AdvancedAnalytics = lazy(() => 
  import('./analytics/advancedAnalytics')
);

/**
 * Wrapper component for lazy-loaded components
 */
export const LazyComponent = ({ 
  component: Component, 
  fallback = null,
  errorFallback = null,
  ...props 
}) => {
  const [hasError, setHasError] = React.useState(false);

  if (hasError && errorFallback) {
    return errorFallback;
  }

  return (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <ErrorBoundary onError={() => setHasError(true)}>
        <Component {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

/**
 * Simple error boundary
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3} textAlign="center">
          <p style={{ color: '#d32f2f' }}>Failed to load component</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * Image optimization helpers
 */
export const ImageOptimization = {
  /**
   * Lazy load images when they enter viewport
   */
  lazyLoadImage: (src, options = {}) => {
    const {
      placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E',
      threshold = 0.1,
      rootMargin = '50px'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Use Intersection Observer for lazy loading
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              img.src = src;
              img.onload = () => resolve(img);
              img.onerror = reject;
              observer.disconnect();
            }
          });
        },
        { threshold, rootMargin }
      );

      observer.observe(img);
    });
  },

  /**
   * Preload critical images
   */
  preloadImages: (srcs) => {
    return Promise.all(
      srcs.map(src => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
      })
    );
  },

  /**
   * Progressive image loading
   */
  progressiveLoad: async (lowResSrc, highResSrc) => {
    // Load low-res first
    const lowRes = new Image();
    lowRes.src = lowResSrc;
    
    await new Promise((resolve, reject) => {
      lowRes.onload = resolve;
      lowRes.onerror = reject;
    });

    // Then load high-res
    const highRes = new Image();
    highRes.src = highResSrc;
    
    return new Promise((resolve, reject) => {
      highRes.onload = () => resolve({ lowRes, highRes });
      highRes.onerror = reject;
    });
  }
};

/**
 * Bundle optimization helpers
 */
export const BundleOptimization = {
  /**
   * Dynamically import modules only when needed
   */
  importModule: async (modulePath) => {
    try {
      const module = await import(modulePath);
      return module;
    } catch (error) {
      console.error(`Failed to load module: ${modulePath}`, error);
      throw error;
    }
  },

  /**
   * Chunk loading with retry
   */
  loadChunk: async (chunkName, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const module = await import(/* webpackChunkName: "[request]" */ chunkName);
        return module;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
};

/**
 * Performance monitoring
 */
export const PerformanceMonitor = {
  /**
   * Measure component render time
   */
  measureRender: (componentName, callback) => {
    const start = performance.now();
    const result = callback();
    const end = performance.now();
    
    console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
    
    return result;
  },

  /**
   * Track lazy component load time
   */
  trackLazyLoad: (componentName) => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`${componentName} load time: ${(end - start).toFixed(2)}ms`);
    };
  },

  /**
   * Get performance metrics
   */
  getMetrics: () => {
    if (!window.performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
      // Page load metrics
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
      
      // Paint metrics
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
      
      // Resource timing
      totalResources: performance.getEntriesByType('resource').length,
      
      // Memory (if available)
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null
    };
  }
};

/**
 * Cache management
 */
export const CacheManager = {
  /**
   * Cache with expiration
   */
  cache: new Map(),

  set: (key, value, ttl = 5 * 60 * 1000) => {
    CacheManager.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  },

  get: (key) => {
    const item = CacheManager.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      CacheManager.cache.delete(key);
      return null;
    }
    
    return item.value;
  },

  clear: () => {
    CacheManager.cache.clear();
  },

  /**
   * Clean expired entries
   */
  cleanup: () => {
    const now = Date.now();
    
    for (const [key, item] of CacheManager.cache.entries()) {
      if (now > item.expiry) {
        CacheManager.cache.delete(key);
      }
    }
  }
};

// Auto cleanup every 5 minutes
setInterval(() => CacheManager.cleanup(), 5 * 60 * 1000);

export default {
  LazyComponent,
  LoadingFallback,
  ImageOptimization,
  BundleOptimization,
  PerformanceMonitor,
  CacheManager
};
