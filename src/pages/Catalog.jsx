import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clothingItems } from '../data/clothingItems';
import { useOutfit } from '../context/OutfitContext';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaSearch, 
  FaHeart, 
  FaEye, 
  FaShoppingCart, 
  FaFilter,
  FaThLarge,
  FaList,
  FaStar,
  FaRocket,
  FaGem,
  FaLightbulb,
  FaTimes,
  FaChevronDown
} from 'react-icons/fa';
import wishlistService from '../services/wishlistService';

export default function Catalog() {
  const { addFavorite } = useOutfit();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // State for filters and sorting
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterOpen, setFilterOpen] = useState({ category: false, price: false, sort: false });

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(clothingItems.map(item => item.category))];
    return cats;
  }, []);

  // Price range options
  const priceRanges = [
    { value: 'all', label: 'ALL PRICES' },
    { value: '0-25', label: 'UNDER $25' },
    { value: '25-50', label: '$25 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100+', label: '$100+' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'featured', label: 'FEATURED' },
    { value: 'price-low', label: 'PRICE: LOW TO HIGH' },
    { value: 'price-high', label: 'PRICE: HIGH TO LOW' },
    { value: 'name-az', label: 'NAME: A-Z' },
    { value: 'name-za', label: 'NAME: Z-A' }
  ];

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = clothingItems.filter(item => {
      // Search query filter
      const matchesQuery = !query.trim() || 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase());
      
      // Category filter
      const matchesCategory = category === 'all' || item.category === category;
      
      // Price range filter
      let matchesPrice = true;
      if (priceRange !== 'all') {
        if (priceRange === '0-25') matchesPrice = item.price <= 25;
        else if (priceRange === '25-50') matchesPrice = item.price > 25 && item.price <= 50;
        else if (priceRange === '50-100') matchesPrice = item.price > 50 && item.price <= 100;
        else if (priceRange === '100+') matchesPrice = item.price > 100;
      }
      
      return matchesQuery && matchesCategory && matchesPrice;
    });

    // Sort items
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-za':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default: // featured
        break;
    }

    return filtered;
  }, [query, category, priceRange, sortBy]);

  const toggleFavorite = async (item) => {
    const newFavorites = new Set(favorites);
    if (favorites.has(item.id)) {
      newFavorites.delete(item.id);
      if (user) {
        await wishlistService.removeFromWishlist(user.uid, item.id);
      }
    } else {
      newFavorites.add(item.id);
      if (user) {
        await wishlistService.addToWishlist(user.uid, {
          productId: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category
        });
        addFavorite(item);
      }
    }
    setFavorites(newFavorites);
  };

  const toggleFilter = (filterType) => {
    setFilterOpen(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-600/10 via-amber-500/10 to-sky-500/10 relative overflow-hidden">
      {/* Industrial Background Pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(244, 114, 182, .2), transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(250, 204, 21, .2), transparent 40%),
            radial-gradient(circle at 30% 80%, rgba(56, 189, 248, .2), transparent 40%)
          `,
          backgroundSize: 'auto'
        }}></div>
        
        {/* Industrial pipes/beams */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute ${
              i % 2 === 0 ? 'bg-gradient-to-r from-orange-600/20 to-amber-600/20' : 
              'bg-gradient-to-r from-zinc-700/30 to-gray-600/30'
            } shadow-2xl`}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              width: i % 3 === 0 ? '200px' : '150px',
              height: i % 3 === 0 ? '8px' : '6px',
              left: `${5 + i * 12}%`,
              top: `${10 + i * 10}%`,
              transform: `rotate(${i % 2 === 0 ? 30 : -30}deg)`,
              borderRadius: '4px'
            }}
          />
        ))}
        
        {/* Sparks/welding effects */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-400 rounded-full"
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>
      {/* Header Section */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-3 bg-white/15 backdrop-blur-xl border border-white/30 rounded-full px-8 py-4 mb-8 shadow-lg">
            <FaRocket className="w-5 h-5 text-white" />
            <span className="text-white font-bold tracking-widest text-sm">DISCOVER COLLECTIONS</span>
          </div>
          
          <h1 className="text-6xl lg:text-7xl font-black text-white mb-6">
            SHOP THE
            <br />
            <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-sky-400 bg-clip-text text-transparent">
              COLORFUL DROP
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Heavy-duty fashion built for the streets. Industrial strength, urban style.
          </p>
        </motion.div>

        {/* Advanced Search & Filter System */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-12 border border-white/20"
        >
          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-purple-500/90 rounded-lg p-2">
              <FaSearch className="text-white w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search industrial wear, workgear, urban styles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-20 pr-6 py-5 bg-white/95 border-2 border-purple-300/50 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:bg-white transition-all duration-300 text-slate-900 text-lg placeholder-slate-500 backdrop-blur-sm shadow-xl font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleFilter('category')}
                className="w-full flex items-center justify-between p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 hover:border-purple-500/30 transition-all duration-300 text-white group"
              >
                <div className="flex items-center space-x-3">
                  <FaGem className="w-5 h-5 text-purple-300 group-hover:text-purple-200" />
                  <span className="font-medium">
                    {category === 'all' ? 'ALL CATEGORIES' : category.toUpperCase()}
                  </span>
                </div>
                <FaChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                  filterOpen.category ? 'rotate-180' : ''
                }`} />
              </button>
              
              <AnimatePresence>
                {filterOpen.category && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl z-20 overflow-hidden"
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          setFilterOpen(prev => ({ ...prev, category: false }));
                        }}
                        className="w-full px-4 py-3 text-left text-white hover:bg-emerald-500/20 transition-colors duration-200 border-b border-white/10 last:border-b-0"
                      >
                        {cat === 'all' ? 'ALL CATEGORIES' : cat.toUpperCase()}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price Range Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleFilter('price')}
                className="w-full flex items-center justify-between p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 text-white group"
              >
                <div className="flex items-center space-x-3">
                  <FaLightbulb className="w-5 h-5 text-cyan-300 group-hover:text-cyan-200" />
                  <span className="font-medium">
                    {priceRanges.find(range => range.value === priceRange)?.label || 'ALL PRICES'}
                  </span>
                </div>
                <FaChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                  filterOpen.price ? 'rotate-180' : ''
                }`} />
              </button>
              
              <AnimatePresence>
                {filterOpen.price && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl z-20 overflow-hidden"
                  >
                    {priceRanges.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => {
                          setPriceRange(range.value);
                          setFilterOpen(prev => ({ ...prev, price: false }));
                        }}
                        className="w-full px-4 py-3 text-left text-white hover:bg-teal-500/20 transition-colors duration-200 border-b border-white/10 last:border-b-0"
                      >
                        {range.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleFilter('sort')}
                className="w-full flex items-center justify-between p-4 bg-slate-800/50 border border-slate-600/50 rounded-xl hover:bg-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 text-white group"
              >
                <div className="flex items-center space-x-3">
                  <FaFilter className="w-5 h-5 text-emerald-300 group-hover:text-emerald-200" />
                  <span className="font-medium">
                    {sortOptions.find(option => option.value === sortBy)?.label || 'FEATURED'}
                  </span>
                </div>
                <FaChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                  filterOpen.sort ? 'rotate-180' : ''
                }`} />
              </button>
              
              <AnimatePresence>
                {filterOpen.sort && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl z-20 overflow-hidden"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setFilterOpen(prev => ({ ...prev, sort: false }));
                        }}
                        className="w-full px-4 py-3 text-left text-white hover:bg-emerald-500/20 transition-colors duration-200 border-b border-white/10 last:border-b-0"
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Results Info & View Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-6 border-t border-white/20">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-300">
                Showing <span className="font-bold text-emerald-400">{filteredAndSortedItems.length}</span> of <span className="font-bold text-white">{clothingItems.length}</span> products
              </p>
            </div>
            
            <div className="flex bg-slate-800/30 backdrop-blur-sm rounded-xl p-1 border border-slate-700/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <FaThLarge className="w-4 h-4" />
                <span>GRID</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-sky-400 to-indigo-400 text-black font-medium' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <FaList className="w-4 h-4" />
                <span>LIST</span>
              </button>
            </div>
          </div>
        </motion.div>
        {/* Product Showcase */}
        {filteredAndSortedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <FaSearch className="w-16 h-16 text-emerald-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">NO PRODUCTS FOUND</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Try adjusting your filters or search terms to discover amazing fashion items.
            </p>
            <button 
              onClick={() => {
                setQuery('');
                setCategory('all');
                setPriceRange('all');
                setSortBy('featured');
              }}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-2xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300"
            >
              CLEAR ALL FILTERS
            </button>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
            : 'space-y-6'
          }>
            <AnimatePresence>
              {filteredAndSortedItems.map((item, index) => {
                if (viewMode === 'grid') {
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group relative bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-500"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Hover Actions */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="flex space-x-3">
                            <Link
                              to={`/catalog/${item.id}`}
                              className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-emerald-500 hover:text-black transition-all duration-300 transform hover:scale-110"
                            >
                              <FaEye className="w-5 h-5" />
                            </Link>
                            <Link
                              to="/try-on"
                              className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-cyan-500 hover:text-black transition-all duration-300 transform hover:scale-110"
                            >
                              <FaShoppingCart className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                        
                        {/* Favorite Button */}
                        <button
                          onClick={() => toggleFavorite(item)}
                          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            favorites.has(item.id) 
                              ? 'bg-red-500 text-white scale-110' 
                              : 'bg-white/20 backdrop-blur-xl text-white hover:bg-red-500 hover:text-white hover:scale-110'
                          }`}
                        >
                          <FaHeart className={`w-4 h-4 ${favorites.has(item.id) ? 'fill-current' : ''}`} />
                        </button>
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-gradient-to-r from-rose-400 to-amber-400 backdrop-blur-xl text-black text-xs font-bold rounded-full uppercase tracking-wide">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-6">
                        <div className="space-y-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-rose-300 transition-colors duration-300 line-clamp-2">
                            {item.name}
                          </h3>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold bg-gradient-to-r from-rose-400 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                                ${item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${item.originalPrice}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className="w-3 h-3 text-yellow-400" />
                              ))}
                              <span className="text-xs text-gray-400 ml-1">(4.8)</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 pt-3">
                            <Link
                              to={`/catalog/${item.id}`}
                              className="flex-1 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300 text-center"
                            >
                              DETAILS
                            </Link>
                            <Link
                              to="/try-on"
                              className="flex-1 py-3 bg-gradient-to-r from-rose-400 via-amber-400 to-sky-400 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-rose-400/30 transition-all duration-300 text-center"
                            >
                              TRY ON
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                } else {
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-500 group"
                    >
                      {/* Image */}
                      <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-gradient-to-r from-rose-400 to-amber-400 backdrop-blur-xl text-black text-xs font-bold rounded-full uppercase">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-6 flex justify-between">
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-2xl font-bold text-white group-hover:text-rose-300 transition-colors duration-300 mb-2">
                              {item.name}
                            </h3>
                            <div className="flex items-center space-x-4">
                              <span className="text-3xl font-bold bg-gradient-to-r from-rose-400 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                                ${item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="text-lg text-gray-500 line-through">
                                  ${item.originalPrice}
                                </span>
                              )}
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar key={i} className="w-4 h-4 text-yellow-400" />
                                ))}
                                <span className="text-sm text-gray-400 ml-2">(4.8)</span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-400 leading-relaxed">
                            Premium quality {item.category} perfect for any occasion. 
                            Experience luxury fashion with our virtual try-on technology.
                          </p>
                        </div>
                        
                        <div className="flex flex-col justify-between ml-6">
                          <button
                            onClick={() => toggleFavorite(item)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-4 ${
                              favorites.has(item.id) 
                                ? 'bg-red-500 text-white scale-110' 
                                : 'bg-white/20 backdrop-blur-xl text-white hover:bg-red-500 hover:text-white hover:scale-110'
                            }`}
                          >
                            <FaHeart className={`w-5 h-5 ${favorites.has(item.id) ? 'fill-current' : ''}`} />
                          </button>
                          
                          <div className="space-y-3">
                            <Link
                              to={`/catalog/${item.id}`}
                              className="block px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300 text-center"
                            >
                              VIEW DETAILS
                            </Link>
                            <Link
                              to="/try-on"
                              className="block px-6 py-3 bg-gradient-to-r from-rose-400 via-amber-400 to-sky-400 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-rose-400/30 transition-all duration-300 text-center"
                            >
                              TRY ON NOW
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}