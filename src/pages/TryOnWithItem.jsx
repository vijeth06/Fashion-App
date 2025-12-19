import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOutfit } from '../context/OutfitContext';
import productService from '../services/productService';
import VirtualTryOnComponent from '../components/VirtualTryOnComponent';
import ARTryOn from '../components/ARTryOn';
import { 
  FaTshirt, 
  FaCamera, 
  FaMagic, 
  FaSave, 
  FaShare, 
  FaHeart,
  FaExpand,
  FaCompress,
  FaAdjust,
  FaPalette,
  FaRuler,
  FaShoppingBag,
  FaCog,
  FaRocket,
  FaEye,
  FaLayerGroup,
  FaExchangeAlt,
  FaArrowLeft,
  FaSpinner
} from 'react-icons/fa';

/**
 * TryOnWithItem Page
 * Integrates with existing project architecture and services
 * Supports item-specific virtual try-on with proper routing
 */
const TryOnWithItem = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToOutfit, currentOutfit, saveOutfit } = useOutfit();
  
  // State management
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showARTryOn, setShowARTryOn] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [tryOnMode, setTryOnMode] = useState('virtual'); // 'virtual' or 'ar'

  // Try-on specific state
  const [clothingItems, setClothingItems] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);

  // Get item ID from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const itemId = parseInt(urlParams.get('item'));
    
    if (!itemId) {
      setError('No item specified. Please select an item to try on.');
      setLoading(false);
      return;
    }

    loadProductData(itemId);
  }, [location]);

  // Load product data from the service
  const loadProductData = async (itemId) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all products first
      const productsResponse = await productService.getAllProducts({ limit: 100 });
      const allProductsList = productsResponse.products || [];
      setAllProducts(allProductsList);

      // Find the specific product
      let targetProduct = allProductsList.find(p => p.id === itemId || p._id === itemId);

      if (!targetProduct) {
        setError(`Product with ID ${itemId} not found. Please select a valid product from the catalog.`);
        setLoading(false);
        return;
      }

      setProduct(targetProduct);
      setSelectedColor(targetProduct.colors?.[0] || '');
      setSelectedSize(targetProduct.sizes?.[Math.floor(targetProduct.sizes.length / 2)] || '');

      // Format products for virtual try-on component
      const formattedProducts = allProductsList.map(product => ({
        id: product.id || product._id,
        name: product.name?.en || product.name,
        type: product.type || product.category,
        imageUrl: product.images?.main || product.image || product.imageUrl || '/assets/tee_white.svg',
        category: product.category || 'tops'
      }));
      
      setClothingItems(formattedProducts);
      setLoading(false);

    } catch (err) {
      console.error('Error loading product data:', err);
      setError('Failed to load product data. Please try again.');
      setLoading(false);
    }
  };

  // Handle virtual try-on capture
  const handleCapture = (imageData) => {
    setIsCapturing(true);
    setCapturedImages(prev => [...prev, {
      id: Date.now(),
      image: imageData,
      product: product,
      timestamp: new Date().toISOString(),
      settings: { color: selectedColor, size: selectedSize }
    }]);
    
    setTimeout(() => setIsCapturing(false), 1000);
  };

  // Handle sharing
  const handleShare = async (imageData) => {
    try {
      if (navigator.share && navigator.canShare) {
        const response = await fetch(imageData);
        const blob = await response.blob();
        const file = new File([blob], 'virtual-tryon.png', { type: 'image/png' });
        
        await navigator.share({
          title: `Virtual Try-On: ${product?.name}`,
          text: `Check out how I look in ${product?.name}!`,
          files: [file]
        });
      } else {
        // Fallback to download
        const link = document.createElement('a');
        link.download = `tryon-${product?.name || 'item'}-${Date.now()}.png`;
        link.href = imageData;
        link.click();
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to download
      const link = document.createElement('a');
      link.download = `tryon-${product?.name || 'item'}-${Date.now()}.png`;
      link.href = imageData;
      link.click();
    }
  };

  // Add to outfit
  const handleAddToOutfit = () => {
    if (product) {
      addToOutfit({
        ...product,
        selectedColor,
        selectedSize,
        addedAt: Date.now()
      });
    }
  };

  // Save look
  const handleSaveLook = async () => {
    if (capturedImages.length > 0) {
      try {
        await saveOutfit({
          name: `${product?.name} Try-On`,
          items: [{ ...product, selectedColor, selectedSize }],
          images: capturedImages,
          createdAt: Date.now()
        });
        console.log('Look saved successfully');
      } catch (error) {
        console.error('Failed to save look:', error);
      }
    }
  };

  // Navigate to different products
  const navigateToProduct = (productId) => {
    navigate(`/try?item=${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-xl">Loading virtual try-on...</p>
          <p className="text-gray-300 text-sm mt-2">Initializing AI systems</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-4">Try-On Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/catalog')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Browse Catalog
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950">
      {/* Header */}
      <div className="relative overflow-hidden py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="bg-black/30 backdrop-blur-xl rounded-xl p-3 text-white hover:bg-black/50 transition-colors"
              >
                <FaArrowLeft />
              </motion.button>
              
              <div>
                <h1 className="text-3xl font-black text-white">
                  Virtual Try-On
                </h1>
                <p className="text-gray-300">{product?.name} - {product?.brand}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-black/30 backdrop-blur-xl rounded-xl px-4 py-2">
                <select 
                  className="bg-transparent text-white focus:outline-none"
                  onChange={(e) => navigateToProduct(e.target.value)}
                  value={product?.id}
                >
                  {allProducts.map(p => (
                    <option key={p.id || p._id} value={p.id || p._id} className="bg-gray-800">
                      {p.name?.en || p.name}
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="bg-black/30 backdrop-blur-xl rounded-xl p-3 text-white hover:bg-black/50 transition-colors"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-12">
        {/* Mode Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-2 border border-gray-700">
            <div className="flex space-x-2">
              <button
                onClick={() => setTryOnMode('virtual')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  tryOnMode === 'virtual'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FaCamera />
                <span>Virtual Try-On</span>
              </button>
              <button
                onClick={() => setTryOnMode('ar')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  tryOnMode === 'ar'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FaRocket />
                <span>AR Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Try-On Interface */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tryOnMode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {tryOnMode === 'virtual' ? (
              <VirtualTryOnComponent
                clothingItems={clothingItems}
                onCapture={handleCapture}
                onShare={handleShare}
                className={isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}
              />
            ) : (
              <ARTryOn
                productId={product?.id}
                products={allProducts}
                onClose={() => setTryOnMode('virtual')}
                isOpen={true}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Product Actions */}
        {!isFullscreen && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700"
            >
              <h3 className="text-2xl font-bold text-white mb-4">{product?.name}</h3>
              <p className="text-gray-300 mb-4">{product?.description}</p>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold text-blue-400">
                  ${product?.price || '29.99'}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white">{product?.rating || '4.8'}</span>
                </div>
              </div>
              
              {/* Color and Size Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Color</label>
                  <div className="flex space-x-2">
                    {(product?.colors || ['white', 'black']).map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor === color ? 'border-blue-400' : 'border-gray-600'
                        }`}
                        style={{
                          backgroundColor: color === 'white' ? '#ffffff' : 
                                         color === 'black' ? '#000000' : color
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Size</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(product?.sizes || ['S', 'M', 'L']).map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 px-3 rounded-lg font-medium transition-all ${
                          selectedSize === size 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToOutfit}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 rounded-xl mt-6 flex items-center justify-center space-x-2 shadow-lg"
              >
                <FaShoppingBag />
                <span>Add to Outfit</span>
              </motion.button>
            </motion.div>

            {/* Captured Images */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <FaLayerGroup className="mr-2" />
                Captured Looks
              </h3>
              
              {capturedImages.length === 0 ? (
                <div className="text-center py-8">
                  <FaCamera className="text-gray-500 text-4xl mx-auto mb-4" />
                  <p className="text-gray-400">No captures yet</p>
                  <p className="text-gray-500 text-sm">Use the try-on interface to capture looks</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {capturedImages.map((capture) => (
                    <motion.div
                      key={capture.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <img
                        src={capture.image}
                        alt="Captured look"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleShare(capture.image)}
                          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                        >
                          <FaShare />
                        </button>
                        <button
                          onClick={handleSaveLook}
                          className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                        >
                          <FaSave />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {capturedImages.length > 0 && (
                <div className="flex space-x-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveLook}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Save All Looks
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCapturedImages([])}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Clear All
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Capture Success Animation */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
              ✨ Look Captured!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TryOnWithItem;