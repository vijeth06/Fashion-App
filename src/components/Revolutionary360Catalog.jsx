


import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import {
  FaSearch, FaFilter, FaHeart, FaEye, FaShoppingCart, FaShare,
  FaExpand, FaRotate, FaMagic, FaRobot, FaTags, FaStar, FaFire,
  FaChevronDown, FaChevronUp, FaGrid3x3, FaListUl, FaSlidersH, FaCamera
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import { advancedFashionItems } from '../data/advancedProducts';

function Product3DViewer({ product, autoRotate = true }) {
  const meshRef = useRef();
  const { scene } = useGLTF(product.model3D || '/models/default-garment.glb');

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={scene} scale={[1, 1, 1]} />
    </group>
  );
}

function AISearchBar({ onSearch, onFilterChange, searchQuery, setSearchQuery }) {
  const [isAIMode, setIsAIMode] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    const aiSuggestions = [
      `${query} - trending styles`,
      `${query} - similar to your favorites`,
      `${query} - perfect for your body type`,
      `${query} - sustainable options`,
      `${query} - limited edition`
    ];

    setTimeout(() => {
      setSuggestions(aiSuggestions);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (isAIMode) {
      generateSuggestions(searchQuery);
    }
  }, [searchQuery, isAIMode]);

  return (
    <div className="relative">
      <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch(searchQuery)}
            placeholder={isAIMode ? "Ask AI: 'Show me summer dresses for beach vacation'" : "Search products..."}
            className="w-full px-6 py-4 text-lg outline-none"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setIsAIMode(!isAIMode)}
          className={`px-6 py-4 transition-colors ${
            isAIMode ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FaRobot className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => onSearch(searchQuery)}
          className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <FaSearch className="w-5 h-5" />
        </button>
      </div>

      {}
      {isAIMode && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-xl border border-gray-200 mt-2 z-50"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchQuery(suggestion);
                onSearch(suggestion);
                setSuggestions([]);
              }}
              className="w-full text-left px-4 py-3 hover:bg-purple-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
            >
              <FaMagic className="w-4 h-4 text-purple-600" />
              <span>{suggestion}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function AdvancedFilterPanel({ filters, onFilterChange, isOpen, onToggle }) {
  const filterCategories = {
    category: {
      name: 'Category',
      options: ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories']
    },
    price: {
      name: 'Price Range',
      type: 'range',
      min: 0,
      max: 500,
      step: 10
    },
    brand: {
      name: 'Brand',
      options: ['All', 'NeuralThreads', 'QuantumCouture', 'BioFashion', 'EcoLux']
    },
    color: {
      name: 'Color',
      type: 'color',
      options: [
        { name: 'Black', hex: '#000000' },
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Red', hex: '#EF4444' },
        { name: 'Blue', hex: '#3B82F6' },
        { name: 'Green', hex: '#10B981' },
        { name: 'Purple', hex: '#8B5CF6' }
      ]
    },
    size: {
      name: 'Size',
      options: ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    style: {
      name: 'Style',
      options: ['All', 'Casual', 'Formal', 'Sporty', 'Vintage', 'Trendy']
    },
    sustainability: {
      name: 'Sustainability',
      options: ['All', 'Eco-Friendly', 'Recycled', 'Organic', 'Fair Trade']
    },
    features: {
      name: 'Smart Features',
      type: 'checkbox',
      options: ['Bio-responsive', 'Temperature-adaptive', 'Self-cleaning', 'Memory-fabric']
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaSlidersH className="w-5 h-5" />
              Advanced Filters
            </h3>
            <button
              onClick={() => onFilterChange({})}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(filterCategories).map(([key, config]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {config.name}
                </label>
                
                {config.type === 'range' ? (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      value={filters[key] || config.max}
                      onChange={(e) => onFilterChange({ [key]: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>${config.min}</span>
                      <span>${filters[key] || config.max}</span>
                    </div>
                  </div>
                ) : config.type === 'color' ? (
                  <div className="grid grid-cols-6 gap-2">
                    {config.options.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => onFilterChange({ [key]: color.name })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          filters[key] === color.name ? 'border-purple-600' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                ) : config.type === 'checkbox' ? (
                  <div className="space-y-2">
                    {config.options.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters[key]?.includes(option) || false}
                          onChange={(e) => {
                            const current = filters[key] || [];
                            const updated = e.target.checked
                              ? [...current, option]
                              : current.filter(item => item !== option);
                            onFilterChange({ [key]: updated });
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <select
                    value={filters[key] || 'All'}
                    onChange={(e) => onFilterChange({ [key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {config.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProductCard({ product, viewMode, onProductClick, onTryOn, onWishlist }) {
  const [is360View, setIs360View] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-48 h-48 flex-shrink-0">
          {is360View ? (
            <div className="w-full h-full bg-gray-100">
              <Canvas camera={{ position: [0, 0, 5] }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <Product3DViewer product={product} />
                  <OrbitControls enableZoom={false} autoRotate />
              </Canvas>
            </div>
          ) : (
            <img 
              src={product.imageUrl || product.visualData?.primaryImage} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}
          
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={() => setIs360View(!is360View)}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <FaRotate className="w-4 h-4" />
            </button>
            <button
              onClick={() => onWishlist(product)}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
            >
              <FaHeart className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-gray-600 capitalize">{product.category}</p>
              <p className="text-sm text-gray-500">{product.brand || 'NeuralThreads'}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                ${product.price || product.basePrice}
              </div>
              {product.originalPrice && (
                <div className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="w-4 h-4" />
              ))}
            </div>
            <span className="text-sm text-gray-600">(4.8) â€¢ 234 reviews</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onProductClick(product)}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Details
            </button>
            <button
              onClick={() => onTryOn(product)}
              className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Try On
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square">
        {is360View ? (
          <div className="w-full h-full bg-gray-100">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Product3DViewer product={product} />
                <OrbitControls enableZoom={false} autoRotate />
            </Canvas>
          </div>
        ) : (
          <img 
            src={product.imageUrl || product.visualData?.primaryImage} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        )}

        {}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 flex items-center justify-center gap-3"
            >
              <button
                onClick={() => onProductClick(product)}
                className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaEye className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIs360View(!is360View)}
                className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaRotate className="w-5 h-5" />
              </button>
              <button
                onClick={() => onTryOn(product)}
                className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
              >
                <FaCamera className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
              NEW
            </span>
          )}
          {product.isTrending && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded flex items-center gap-1">
              <FaFire className="w-3 h-3" />
              HOT
            </span>
          )}
        </div>

        {}
        <button
          onClick={() => onWishlist(product)}
          className="absolute top-3 right-3 p-2 bg-white/80 text-gray-700 rounded-full hover:bg-white hover:text-red-500 transition-all"
        >
          <FaHeart className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 capitalize mb-2">{product.category}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-purple-600">
            ${product.price || product.basePrice}
          </div>
          <div className="flex items-center gap-1">
            <FaStar className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-600">4.8</span>
          </div>
        </div>

        <button
          onClick={() => onTryOn(product)}
          className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
        >
          Try On Now
        </button>
      </div>
    </motion.div>
  );
}

export default function Revolutionary360Catalog() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await productService.getAllProducts({ limit: 100 });
        const apiProducts = (data.products || []).map(product => ({
          id: product.productId || product._id,
          name: product.name?.en || product.name,
          price: product.pricing?.selling || product.price,
          category: product.category,
          brand: product.brand,
          imageUrl: product.images?.main || product.imageUrl,
          rating: product.reviews?.averageRating || 4.5,
          description: product.description?.en || product.description,
          colors: product.inventory?.colors?.map(c => c.name) || [],
          sizes: product.inventory?.sizes?.map(s => s.size) || [],
          model3D: product.model3D || '/models/default-garment.glb'
        }));
        const allProducts = [...apiProducts, ...advancedFashionItems];
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts(advancedFashionItems);
        setFilteredProducts(advancedFashionItems);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product => {
        const productName = typeof product.name === 'string' ? product.name : (product.name?.en || '');
        return productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      });
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All') {
        filtered = filtered.filter(product => {
          switch (key) {
            case 'category':
              return product.category.toLowerCase() === value.toLowerCase();
            case 'price':
              return (product.price || product.basePrice) <= value;
            case 'brand':
              return product.brand === value;
            case 'size':
              return product.sizes?.includes(value);
            default:
              return true;
          }
        });
      }
    });

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || a.basePrice) - (b.price || b.basePrice));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || b.basePrice) - (a.price || a.basePrice));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
        break;
      default:

        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, filters, sortBy]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);

  };

  const handleTryOn = (product) => {

    console.log('Try on:', product.name);
  };

  const handleWishlist = (product) => {

    console.log('Add to wishlist:', product.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading revolutionary catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Revolutionary 360Â° Fashion Catalog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of fashion shopping with AI-powered search, 
            360Â° product views, and intelligent recommendations
          </p>
        </div>

        {}
        <div className="mb-6">
          <AISearchBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showFilters ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              <FaFilter className="w-4 h-4" />
              Filters
              {showFilters ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {filteredProducts.length} products found
            </span>
            
            <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <FaGrid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <FaListUl className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {}
        <AdvancedFilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          isOpen={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
        />

        {}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-6'
        }>
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onProductClick={handleProductClick}
                onTryOn={handleTryOn}
                onWishlist={handleWishlist}
              />
            ))}
          </AnimatePresence>
        </div>

        {}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <FaSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters to find what you're looking for
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({});
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}