/**
 * Mobile Utilities and Hooks
 * 
 * Utilities for mobile device detection, touch handling, and responsive behavior
 * 
 * @version 2.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Device detection utilities
export const DeviceUtils = {
  // Check if device is mobile
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // Check if device is tablet
  isTablet: () => {
    if (typeof window === 'undefined') return false;
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  },
  
  // Check if device is iOS
  isIOS: () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },
  
  // Check if device is Android
  isAndroid: () => {
    if (typeof window === 'undefined') return false;
    return /Android/i.test(navigator.userAgent);
  },
  
  // Check if device supports touch
  isTouch: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // Get device pixel ratio
  getPixelRatio: () => {
    if (typeof window === 'undefined') return 1;
    return window.devicePixelRatio || 1;
  },
  
  // Get viewport dimensions
  getViewport: () => {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    return {
      width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    };
  },
  
  // Check if device is in landscape mode
  isLandscape: () => {
    const { width, height } = DeviceUtils.getViewport();
    return width > height;
  },
  
  // Check if PWA is installed
  isPWA: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }
};

// Hook for responsive breakpoints
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('desktop');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < 640) {
        setBreakpoint('mobile');
      } else if (width < 768) {
        setBreakpoint('tablet-sm');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else if (width < 1280) {
        setBreakpoint('desktop');
      } else {
        setBreakpoint('desktop-lg');
      }
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet-sm' || breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'desktop-lg'
  };
};

// Hook for touch gestures
export const useTouch = (elementRef, options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500
  } = options;
  
  const touchState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    startDistance: 0,
    isLongPress: false,
    longPressTimer: null
  });
  
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const state = touchState.current;
    
    state.startX = touch.clientX;
    state.startY = touch.clientY;
    state.startTime = Date.now();
    state.isLongPress = false;
    
    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch) {
      const touch2 = e.touches[1];
      state.startDistance = Math.hypot(
        touch.clientX - touch2.clientX,
        touch.clientY - touch2.clientY
      );
    }
    
    // Long press detection
    if (onLongPress) {
      state.longPressTimer = setTimeout(() => {
        state.isLongPress = true;
        onLongPress(e);
      }, longPressDelay);
    }
  }, [onPinch, onLongPress, longPressDelay]);
  
  const handleTouchMove = useCallback((e) => {
    const state = touchState.current;
    
    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      
      const scale = distance / state.startDistance;
      onPinch({ scale, distance });
    }
    
    // Cancel long press if finger moves
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
  }, [onPinch]);
  
  const handleTouchEnd = useCallback((e) => {
    const touch = e.changedTouches[0];
    const state = touchState.current;
    
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;
    const deltaTime = Date.now() - state.startTime;
    
    // Clear long press timer
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
    
    // Don't trigger other gestures after long press
    if (state.isLongPress) {
      return;
    }
    
    // Handle tap
    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold && deltaTime < 300) {
      if (onTap) {
        onTap(e);
      }
      return;
    }
    
    // Handle swipe gestures
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > threshold && onSwipeRight) {
          onSwipeRight(e);
        } else if (deltaX < -threshold && onSwipeLeft) {
          onSwipeLeft(e);
        }
      } else {
        // Vertical swipe
        if (deltaY > threshold && onSwipeDown) {
          onSwipeDown(e);
        } else if (deltaY < -threshold && onSwipeUp) {
          onSwipeUp(e);
        }
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, threshold]);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
};

// Hook for orientation changes
export const useOrientation = () => {
  const [orientation, setOrientation] = useState('portrait');
  
  useEffect(() => {
    const updateOrientation = () => {
      if (window.innerWidth > window.innerHeight) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };
    
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);
  
  return orientation;
};

// Hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');
  
  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
      
      // Get connection type if available
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
      }
    };
    
    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);
  
  return { isOnline, connectionType };
};

// Hook for viewport visibility
export const useVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return isVisible;
};

// Hook for haptic feedback (iOS)
export const useHaptic = () => {
  const vibrate = useCallback((pattern = 200) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);
  
  const impact = useCallback((intensity = 'medium') => {
    if (window.DeviceMotionEvent && DeviceUtils.isIOS()) {
      try {
        const feedback = new window.UIImpactFeedbackGenerator?.({ style: intensity });
        feedback?.impactOccurred();
      } catch (error) {
        // Fallback to vibration
        const patterns = {
          light: 10,
          medium: 50,
          heavy: 100
        };
        vibrate(patterns[intensity] || 50);
      }
    } else {
      vibrate();
    }
  }, [vibrate]);
  
  return { vibrate, impact };
};

// Hook for PWA installation
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      }
    } catch (error) {
      console.error('PWA install error:', error);
    }
    
    return false;
  }, [deferredPrompt]);
  
  return {
    isInstallable,
    install,
    isPWA: DeviceUtils.isPWA()
  };
};

// Utility functions for mobile optimization
export const MobileOptimizations = {
  // Optimize image loading for mobile
  optimizeImage: (src, { width, quality = 75, format = 'webp' } = {}) => {
    if (!src || typeof window === 'undefined') return src;
    
    const pixelRatio = DeviceUtils.getPixelRatio();
    const optimizedWidth = width ? Math.round(width * pixelRatio) : undefined;
    
    // If using a CDN that supports query parameters for optimization
    const url = new URL(src);
    if (optimizedWidth) url.searchParams.set('w', optimizedWidth);
    url.searchParams.set('q', quality);
    url.searchParams.set('f', format);
    
    return url.toString();
  },
  
  // Preload critical images
  preloadImages: (urls) => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  },
  
  // Optimize touch targets
  optimizeTouchTarget: (element) => {
    if (!element) return;
    
    const styles = {
      minHeight: '44px',
      minWidth: '44px',
      touchAction: 'manipulation',
      userSelect: 'none'
    };
    
    Object.assign(element.style, styles);
  },
  
  // Prevent zoom on input focus (iOS)
  preventInputZoom: () => {
    if (!DeviceUtils.isIOS()) return;
    
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.style.fontSize = '16px';
    });
  }
};

export default {
  DeviceUtils,
  MobileOptimizations,
  useBreakpoint,
  useTouch,
  useOrientation,
  useNetworkStatus,
  useVisibility,
  useHaptic,
  usePWAInstall
};