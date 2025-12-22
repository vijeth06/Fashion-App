import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaHeart, 
  FaShoppingCart, 
  FaTrash, 
  FaEye, 
  FaShareAlt, 
  FaFilter,
  FaSortAmountDown,
  FaTh,
  FaList,
  FaSearch
} from 'react-icons/fa';
import wishlistService from '../services/wishlistService';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      if (currentUser && currentUser.uid) {

        const result = await wishlistService.getWishlist(currentUser.uid);
        if (result.success) {
          setWishlistItems(result.data.items || []);

          localStorage.setItem(`wishlist_${currentUser.uid}`, JSON.stringify(result.data.items));
        } else {
          throw new Error('Failed to load wishlist from server');
        }
      } else {

        const localItems = wishlistService.getLocalWishlist();
        setWishlistItems(localItems);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);

      if (currentUser && currentUser.uid) {
        const cachedItems = JSON.parse(localStorage.getItem(`wishlist_${currentUser.uid}`) || '[]');
        setWishlistItems(cachedItems);
      } else {
        const localItems = wishlistService.getLocalWishlist();
        setWishlistItems(localItems);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const result = await wishlistService.removeFromWishlist(currentUser.uid, productId);
      if (result.success) {
        setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = async (item) => {
    try {
      if (currentUser && currentUser.uid) {

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/v1/users/${currentUser.uid}/cart`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: item.productId,
              quantity: 1,
              size: item.selectedSize || 'M',
              color: item.selectedColor || 'Default'
            })
          }
        );

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to add to cart');
        }

        const cartItems = JSON.parse(localStorage.getItem(`cart_${currentUser.uid}`) || '[]');
        const existingItem = cartItems.find(
          ci => ci.productId === item.productId &&
                ci.size === (item.selectedSize || 'M') &&
                ci.color === (item.selectedColor || 'Default')
        );

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cartItems.push({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: 1,
            size: item.selectedSize || 'M',
            color: item.selectedColor || 'Default'
          });
        }

        localStorage.setItem(`cart_${currentUser.uid}`, JSON.stringify(cartItems));
        alert('Added to cart!');

      } else {

        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cartItems.find(
          ci => ci.id === item.productId &&
                ci.size === (item.selectedSize || 'M')
        );

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cartItems.push({
            id: item.productId,
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: 1,
            size: item.selectedSize || 'M',
            color: item.selectedColor || 'Default',
            image: item.image
          });
        }

        localStorage.setItem('cart', JSON.stringify(cartItems));
        alert('Added to cart!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(`Failed to add to cart: ${error.message}`);
    }
  };

  const toggleItemSelection = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const removeSelectedItems = async () => {
    try {
      for (const productId of selectedItems) {
        await wishlistService.removeFromWishlist(currentUser.uid, productId);
      }
      setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.productId)));
      setSelectedItems([]);
    } catch (error) {
      console.error('Error removing selected items:', error);
    }
  };

  const clearWishlist = async () => {
    try {
      const result = await wishlistService.clearWishlist(currentUser.uid);
      if (result.success) {
        setWishlistItems([]);
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  };

  const shareItem = async (item) => {
    try {
      const shareData = {
        title: `Check out this amazing ${item.name}!`,
        text: `I found this on Virtual Fashion: ${item.name} - â‚¹${item.price ? item.price.toLocaleString() : '0'}`,
        url: `${window.location.origin}/product/${item.productId}`
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {

        const shareText = `${shareData.title} ${shareData.text} ${shareData.url}`;
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareText);
          console.log('Share link copied to clipboard!');
        } else {

          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
            '_blank',
            'width=600,height=400'
          );
        }
      }
    } catch (error) {
      console.error('Share failed:', error);

      window.open(`/product/${item.productId}`, '_blank');
    }
  };

  const filteredAndSortedItems = wishlistItems
    .filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
                           item.category?.toLowerCase() === filterBy.toLowerCase();
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedAt) - new Date(a.addedAt);
        case 'oldest':
          return new Date(a.addedAt) - new Date(b.addedAt);
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const categories = [...new Set(wishlistItems.map(item => item.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-zinc-900 relative overflow-hidden">
      {}
      <div className="fixed inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 30% 20%, rgba(251, 191, 36, 0.2) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 60%),
            linear-gradient(135deg, rgba(251, 191, 36, 0.05) 25%, transparent 25%),
            linear-gradient(-135deg, rgba(245, 158, 11, 0.05) 25%, transparent 25%)
          `,
          backgroundSize: '400px 400px, 300px 300px, 50px 50px, 50px 50px'
        }}></div>
        
        {}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute ${
              i % 4 === 0 ? 'bg-gradient-to-br from-amber-400/15 to-yellow-300/15' :
              i % 4 === 1 ? 'bg-gradient-to-br from-yellow-500/15 to-amber-400/15' :
              i % 4 === 2 ? 'bg-gradient-to-br from-amber-500/15 to-orange-400/15' :
              'bg-gradient-to-br from-yellow-400/15 to-amber-500/15'
            } backdrop-blur-3xl shadow-2xl`}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.7, 0.2]
            }}
            transition={{
              duration: 18 + i * 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              width: `${90 + i * 25}px`,
              height: `${90 + i * 25}px`,
              left: `${5 + i * 9}%`,
              top: `${5 + i * 9}%`,
              clipPath: i % 3 === 0 
                ? 'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)'
                : i % 3 === 1
                ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                : 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
            }}
          />
        ))}
        
        {}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full"
            animate={{
              scale: [0, 2, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>
      
      {}
      <div className="relative z-10 bg-black/40 backdrop-blur-2xl border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6 mb-8 lg:mb-0">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-400 rounded-full flex items-center justify-center shadow-2xl">
                  <FaHeart className="w-10 h-10 text-black" />
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-6xl lg:text-7xl font-black text-white mb-2">
                  LUXURY
                  <span className="block bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    VAULT
                  </span>
                </h1>
                <p className="text-xl text-amber-200 font-light">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'precious item' : 'exclusive pieces'} in your collection
                </p>
              </div>
            </div>

            {}
            {wishlistItems.length > 0 && (
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <FaFilter className="w-5 h-5" />
                  <span className="font-medium tracking-wide">FILTERS</span>
                </button>
                
                {selectedItems.length > 0 && (
                  <button
                    onClick={removeSelectedItems}
                    className="flex items-center gap-3 px-6 py-4 bg-red-500/20 backdrop-blur-xl text-red-300 border border-red-400/30 rounded-2xl hover:bg-red-500/30 transition-all duration-300 hover:scale-105"
                  >
                    <FaTrash className="w-5 h-5" />
                    <span className="font-medium tracking-wide">REMOVE SELECTED ({selectedItems.length})</span>
                  </button>
                )}
                
                <button
                  onClick={clearWishlist}
                  className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <FaTrash className="w-5 h-5" />
                  <span className="font-medium tracking-wide">CLEAR ALL</span>
                </button>
              </div>
            )}
          </div>

          {}
          <AnimatePresence>
            {showFilters && wishlistItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-gray-50 rounded-lg border"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {}
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  {}
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  {}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>

                  {}
                  <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 transition-colors ${
                        viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <FaTh className="w-4 h-4" />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 transition-colors ${
                        viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <FaList className="w-4 h-4" />
                      List
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAndSortedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="mb-8">
              <FaHeart className="w-24 h-24 text-amber-300/50 mx-auto mb-4" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent mb-2">
                {wishlistItems.length === 0 ? 'Your Collection Awaits' : 'No Treasures Found'}
              </h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto text-lg">
                {wishlistItems.length === 0 
                  ? 'Curate your exclusive collection of luxury pieces in your personal vault.'
                  : 'Refine your search to discover the perfect luxury items for your collection.'
                }
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-10 py-4 rounded-full font-bold hover:from-amber-400 hover:to-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <FaSearch className="w-5 h-5" />
                EXPLORE LUXURY
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            <AnimatePresence>
              {filteredAndSortedItems.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.productId)}
                      onChange={() => toggleItemSelection(item.productId)}
                      className="w-5 h-5 text-purple-600 bg-white border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                  </div>

                  {}
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'
                  }`}>
                    <img
                      src={item.image || '/api/placeholder/300/300'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-3">
                        <Link
                          to={`/product/${item.productId}`}
                          className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors transform hover:scale-110"
                        >
                          <FaEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => addToCart(item)}
                          className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors transform hover:scale-110"
                        >
                          <FaShoppingCart className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => shareItem(item)}
                          className="p-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors transform hover:scale-110"
                        >
                          <FaShareAlt className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {}
                    <button
                      onClick={() => removeFromWishlist(item.productId)}
                      className="absolute top-4 right-4 p-2 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>

                  {}
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        {item.brand && (
                          <p className="text-sm text-gray-500 mb-2">{item.brand}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-purple-600">
                          â‚¹{item.price ? item.price.toLocaleString() : '0'}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-sm text-gray-500 line-through">
                            â‚¹{item.originalPrice ? item.originalPrice.toLocaleString() : '0'}
                          </span>
                        )}
                      </div>
                      {item.discount && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          {item.discount}% OFF
                        </span>
                      )}
                    </div>

                    {}
                    <div className="space-y-2 mb-4">
                      {item.selectedSize && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Size:</span>
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {item.selectedSize}
                          </span>
                        </div>
                      )}
                      {item.selectedColor && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Color:</span>
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.selectedColor }}
                            ></div>
                            <span className="text-xs text-gray-600">{item.selectedColor}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {}
                    <p className="text-xs text-gray-400 mb-4">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>

                    {}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(item)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <FaShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                      <Link
                        to={`/product/${item.productId}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FaEye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;