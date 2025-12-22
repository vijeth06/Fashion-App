

import React, { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';


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



export const VirtualTryOnComponent = lazy(() => 
  import('./components/VirtualTryOnComponent.v2').then(module => ({
    default: module.default
  }))
);

export const AdvancedARTryOn = lazy(() => 
  import('./components/AdvancedARTryOn')
);

export const ARTryOn = lazy(() => 
  import('./components/ARTryOn')
);

export const QuantumTryOn = lazy(() => 
  import('./components/QuantumTryOn')
);

export const Immersive3DShopping = lazy(() => 
  import('./components/Immersive3DShopping')
);

export const MetaverseIntegration = lazy(() => 
  import('./components/MetaverseIntegration')
);

export const PremiumFeatures = lazy(() => 
  import('./components/PremiumFeatures')
);

export const AdvancedAdminDashboard = lazy(() => 
  import('./components/AdvancedAdminDashboard')
);

export const BiometricSustainability = lazy(() => 
  import('./components/BiometricSustainability')
);

export const RealTimeFeatures = lazy(() => 
  import('./components/RealTimeFeatures')
);

export const AdvancedAnalytics = lazy(() => 
  import('./analytics/advancedAnalytics')
);


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


export const ImageOptimization = {
  
  lazyLoadImage: (src, options = {}) => {
    const {
      placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E',
      threshold = 0.1,
      rootMargin = '50px'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();

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

  
  progressiveLoad: async (lowResSrc, highResSrc) => {

    const lowRes = new Image();
    lowRes.src = lowResSrc;
    
    await new Promise((resolve, reject) => {
      lowRes.onload = resolve;
      lowRes.onerror = reject;
    });

    const highRes = new Image();
    highRes.src = highResSrc;
    
    return new Promise((resolve, reject) => {
      highRes.onload = () => resolve({ lowRes, highRes });
      highRes.onerror = reject;
    });
  }
};


export const BundleOptimization = {
  
  importModule: async (modulePath) => {
    try {
      const module = await import(modulePath);
      return module;
    } catch (error) {
      console.error(`Failed to load module: ${modulePath}`, error);
      throw error;
    }
  },

  
  loadChunk: async (chunkName, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const module = await import( chunkName);
        return module;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
};


export const PerformanceMonitor = {
  
  measureRender: (componentName, callback) => {
    const start = performance.now();
    const result = callback();
    const end = performance.now();
    
    console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
    
    return result;
  },

  
  trackLazyLoad: (componentName) => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`${componentName} load time: ${(end - start).toFixed(2)}ms`);
    };
  },

  
  getMetrics: () => {
    if (!window.performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {

      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,

      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,

      totalResources: performance.getEntriesByType('resource').length,

      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null
    };
  }
};


export const CacheManager = {
  
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

  
  cleanup: () => {
    const now = Date.now();
    
    for (const [key, item] of CacheManager.cache.entries()) {
      if (now > item.expiry) {
        CacheManager.cache.delete(key);
      }
    }
  }
};

setInterval(() => CacheManager.cleanup(), 5 * 60 * 1000);

export default {
  LazyComponent,
  LoadingFallback,
  ImageOptimization,
  BundleOptimization,
  PerformanceMonitor,
  CacheManager
};
