
import React, { 
  memo, 
  useMemo, 
  useCallback, 
  useState, 
  useEffect, 
  useRef,
  lazy,
  Suspense 
} from 'react';

export const ProductCard = memo(({ product, onAddToCart, onAddToWishlist, onTryOn }) => {
  const handleAddToCart = useCallback(() => {
    onAddToCart(product);
  }, [product, onAddToCart]);

  const handleAddToWishlist = useCallback(() => {
    onAddToWishlist(product);
  }, [product, onAddToWishlist]);

  const handleTryOn = useCallback(() => {
    onTryOn(product);
  }, [product, onTryOn]);

  const discountPercentage = useMemo(() => {
    if (product.originalPrice && product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  }, [product.originalPrice, product.price]);

  return (
    <div className="product-card bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xl font-bold">${product.price}</span>
          {product.originalPrice && (
            <>
              <span className="text-gray-500 line-through">${product.originalPrice}</span>
              <span className="text-green-600 text-sm">{discountPercentage}% off</span>
            </>
          )}
        </div>
        <div className="flex space-x-2 mt-4">
          <button 
            onClick={handleAddToCart}
            className="btn btn-primary flex-1"
          >
            Add to Cart
          </button>
          <button 
            onClick={handleTryOn}
            className="btn btn-secondary flex-1"
          >
            Try On
          </button>
          <button 
            onClick={handleAddToWishlist}
            className="btn btn-outline"
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  );
});

export const useVirtualizedList = (items, containerHeight = 400, itemHeight = 100) => {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    setEndIndex(Math.min(startIndex + visibleCount + 2, items.length));
  }, [startIndex, containerHeight, itemHeight, items.length]);

  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    setStartIndex(newStartIndex);
  }, [itemHeight]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  return {
    visibleItems,
    containerRef,
    handleScroll,
    startIndex,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight
  };
};

export const useDebouncedSearch = (searchTerm, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return debouncedValue;
};

export const SearchResults = memo(({ 
  searchTerm, 
  items, 
  renderItem, 
  noResultsMessage = 'No results found' 
}) => {
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {noResultsMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredItems.map(item => renderItem(item))}
    </div>
  );
});

export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/images/placeholder.jpg',
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    setImgSrc(fallbackSrc);
  }, [fallbackSrc]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        {...props}
      />
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500">
          Image not available
        </div>
      )}
    </div>
  );
});

export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isIntersecting];
};

export const LazyContainer = memo(({ children, height = '200px', className = '' }) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  return (
    <div ref={ref} className={className} style={{ minHeight: height }}>
      {isIntersecting ? children : (
        <div 
          className="bg-gray-100 animate-pulse rounded"
          style={{ height }}
        />
      )}
    </div>
  );
});

export const usePerformanceMonitor = (componentName) => {
  const renderStart = useRef(Date.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - renderStart.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current} took ${renderTime}ms`);
    }
    
    renderStart.current = Date.now();
  });

  return renderCount.current;
};

export const LazyARTryOn = lazy(() => import('./AdvancedARTryOn.jsx'));
export const LazyQuantumTryOn = lazy(() => import('./QuantumTryOn.jsx'));
export const LazyCatalog = lazy(() => import('../pages/Catalog.jsx'));

export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return memo((props) => {
    usePerformanceMonitor(componentName);
    return <WrappedComponent {...props} />;
  });
};

export const useCache = (key, computeFn, dependencies = []) => {
  const cache = useRef(new Map());
  
  return useMemo(() => {
    if (cache.current.has(key)) {
      return cache.current.get(key);
    }
    
    const result = computeFn();
    cache.current.set(key, result);
    return result;
  }, [key, ...dependencies]);
};

export default {
  ProductCard,
  SearchResults,
  OptimizedImage,
  LazyContainer,
  useVirtualizedList,
  useDebouncedSearch,
  useIntersectionObserver,
  usePerformanceMonitor,
  useCache,
  withPerformanceMonitoring,
  LazyARTryOn,
  LazyQuantumTryOn,
  LazyCatalog
};