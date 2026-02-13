import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaDownload, 
  FaShare, 
  FaStar, 
  FaHeart, 
  FaShoppingCart,
  FaExpand,
  FaChartLine,
  FaClock,
  FaCheck
} from 'react-icons/fa';
import axios from 'axios';

const TryOnResultsDisplay = ({ sessionId, result, product, onClose }) => {
  const [resultDetails, setResultDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    if (result) {
      setResultDetails(result);
      setIsLoading(false);
    } else if (sessionId) {
      fetchResultDetails();
    }
  }, [sessionId, result]);

  const fetchResultDetails = async () => {
    try {
      const response = await axios.get(`/api/try-on/session/${sessionId}/results`);
      if (response.data.success && response.data.results.length > 0) {
        setResultDetails(response.data.results[0]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching result details:', error);
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const imageUrl = resultDetails?.resultImage?.url || resultDetails?.result_url;
      if (!imageUrl) return;

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tryon-result-${sessionId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleShare = async (platform) => {
    const imageUrl = resultDetails?.resultImage?.url || resultDetails?.result_url;
    const text = `Check out how I look in ${product?.name || 'this outfit'}!`;
    
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: 'My Virtual Try-On',
          text,
          url: imageUrl
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    }
    
    setShowShareMenu(false);
  };

  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    // In production: Call API to save favorite status
    try {
      await axios.post(`/api/try-on/results/${resultDetails._id}/favorite`, {
        isFavorite: !isFavorite
      });
    } catch (error) {
      console.error('Favorite toggle error:', error);
    }
  };

  const handleAddToCart = () => {
    // In production: Add product to cart
    console.log('Adding to cart:', product);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    );
  }

  if (!resultDetails) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400 text-xl">No results available</div>
      </div>
    );
  }

  const imageUrl = resultDetails?.resultImage?.url || resultDetails?.result_url || resultDetails?.image;
  const qualityScore = resultDetails?.score?.overall || resultDetails?.quality_score || 0.9;
  const processingTime = resultDetails?.aiMetrics?.processingTime || resultDetails?.processing_time || 2.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-black/30 p-6 border-b border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FaCheck className="text-green-400" />
              Try-On Complete
            </h2>
            <p className="text-gray-400 mt-1">
              High-quality AI-generated result ready
            </p>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Result Image */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black/20 group">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Try-on result"
                className="w-full h-auto object-contain"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <p className="text-gray-400">Result image loading...</p>
              </div>
            )}

            {/* Fullscreen button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaExpand />
            </button>

            {/* Quality badge */}
            <div className="absolute top-4 left-4 px-4 py-2 bg-green-500/80 backdrop-blur-sm rounded-full text-white font-semibold text-sm flex items-center gap-2">
              <FaStar className="text-yellow-300" />
              {Math.round(qualityScore * 100)}% Quality
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FaDownload /> Download
            </button>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <FaShare /> Share
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 right-0 bg-black/90 backdrop-blur-xl rounded-xl p-3 border border-white/20 z-10 min-w-[200px]"
                  >
                    <button
                      onClick={() => handleShare('native')}
                      className="w-full px-4 py-2 hover:bg-white/10 rounded-lg text-left text-white"
                    >
                      Share via...
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full px-4 py-2 hover:bg-white/10 rounded-lg text-left text-white"
                    >
                      Copy Link
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleFavorite}
              className={`px-4 py-3 ${
                isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
              } text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2`}
            >
              <FaHeart /> {isFavorite ? 'Favorited' : 'Favorite'}
            </button>

            <button
              onClick={handleAddToCart}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        </div>

        {/* Details Panel */}
        <div className="space-y-4">
          {/* Product Info */}
          {product && (
            <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Product Details</h3>
              <div className="flex gap-4">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{product.name}</h4>
                  <p className="text-gray-400 text-sm">{product.brand}</p>
                  <p className="text-green-400 font-bold mt-2">{product.price}</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Metrics */}
          <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaChartLine className="text-blue-400" />
              AI Quality Metrics
            </h3>

            <div className="space-y-4">
              {/* Overall Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Overall Quality</span>
                  <span className="text-white font-bold">{Math.round(qualityScore * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${qualityScore * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                  />
                </div>
              </div>

              {/* Fit Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Garment Fit</span>
                  <span className="text-white font-bold">
                    {Math.round((resultDetails?.score?.fit || 0.88) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(resultDetails?.score?.fit || 0.88) * 100}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  />
                </div>
              </div>

              {/* Processing Time */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-gray-400 text-sm flex items-center gap-2">
                  <FaClock className="text-blue-400" />
                  Processing Time
                </span>
                <span className="text-white font-semibold">{processingTime.toFixed(1)}s</span>
              </div>

              {/* Model Version */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">AI Model</span>
                <span className="text-white font-semibold">
                  {resultDetails?.aiMetrics?.modelVersion || 'VITON-HD v2'}
                </span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-400/30">
            <h3 className="text-lg font-bold text-white mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Download the image for future reference</li>
              <li>• Share with friends to get their opinion</li>
              <li>• Add to cart before the item sells out</li>
              <li>• Try different products for comparison</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white text-2xl z-10"
              onClick={() => setIsFullscreen(false)}
            >
              ✕
            </button>
            <img
              src={imageUrl}
              alt="Try-on result fullscreen"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TryOnResultsDisplay;
