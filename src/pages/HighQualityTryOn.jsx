import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaHistory, FaStar, FaArrowLeft } from 'react-icons/fa';
import PhotoTryOnUpload from '../components/PhotoTryOnUpload';
import TryOnResultsDisplay from '../components/TryOnResultsDisplay';
import { productService } from '../services/productService';
import axios from 'axios';

const HighQualityTryOn = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [previousResults, setPreviousResults] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    loadProducts();
    loadHistory();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await productService.getProducts('women');
      setProducts(productsData.slice(0, 12)); // Show 12 products
      if (productsData.length > 0) {
        setSelectedProduct(productsData[0]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get('/api/try-on/sessions', {
        params: { limit: 10 }
      });
      
      if (response.data.success) {
        const sessionsWithResults = await Promise.all(
          response.data.sessions
            .filter(s => s.status === 'completed')
            .map(async (session) => {
              try {
                const resultResponse = await axios.get(
                  `/api/try-on/session/${session.sessionId}/results`
                );
                return resultResponse.data.success ? {
                  ...session,
                  results: resultResponse.data.results
                } : null;
              } catch (err) {
                return null;
              }
            })
        );
        
        setPreviousResults(sessionsWithResults.filter(Boolean));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleResultReady = (resultData) => {
    setCurrentResult(resultData);
    loadHistory(); // Refresh history
  };

  const handleViewHistoryItem = (historyItem) => {
    setCurrentResult({
      sessionId: historyItem.sessionId,
      result: historyItem.results[0],
      product: historyItem.garmentId ? 
        products.find(p => p.id === historyItem.garmentId) : null
    });
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaCamera className="text-blue-400" />
                  High-Quality Try-On
                </h1>
                <p className="text-gray-400 text-sm">AI-powered professional virtual try-on</p>
              </div>
            </div>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <FaHistory />
              {showHistory ? 'Hide' : 'Show'} History
              {previousResults.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {previousResults.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Product Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                Select Product
              </h2>

              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedProduct(product)}
                    className={`cursor-pointer rounded-xl p-3 transition-all ${
                      selectedProduct?.id === product.id
                        ? 'bg-blue-500/30 border-2 border-blue-400'
                        : 'bg-black/30 border-2 border-transparent hover:border-white/20'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {product.name}
                        </h3>
                        <p className="text-gray-400 text-xs truncate">{product.brand}</p>
                        <p className="text-green-400 font-bold text-sm mt-1">
                          {product.price}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Selected Product Display */}
            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-400/30"
              >
                <h3 className="text-lg font-bold text-white mb-3">Selected</h3>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h4 className="text-white font-semibold">{selectedProduct.name}</h4>
                <p className="text-gray-400 text-sm">{selectedProduct.brand}</p>
                <p className="text-green-400 font-bold text-lg mt-2">
                  {selectedProduct.price}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right Column: Upload & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* History Sidebar */}
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h2 className="text-xl font-bold text-white mb-4">
                  Previous Try-Ons
                </h2>
                
                {isLoadingHistory ? (
                  <div className="text-gray-400 text-center py-8">
                    Loading history...
                  </div>
                ) : previousResults.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    No previous try-ons yet
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {previousResults.map((item, idx) => (
                      <motion.div
                        key={item.sessionId || idx}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleViewHistoryItem(item)}
                        className="cursor-pointer rounded-xl overflow-hidden bg-black/40 hover:bg-black/60 transition-colors border border-white/10"
                      >
                        {item.results?.[0]?.resultImage?.url ? (
                          <img
                            src={item.results[0].resultImage.url}
                            alt="Previous try-on"
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No image</span>
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-white text-xs font-semibold truncate">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Main Content Area */}
            {!currentResult ? (
              <PhotoTryOnUpload
                selectedProduct={selectedProduct}
                onResultReady={handleResultReady}
              />
            ) : (
              <div className="space-y-4">
                <TryOnResultsDisplay
                  sessionId={currentResult.sessionId}
                  result={currentResult.result}
                  product={currentResult.product || selectedProduct}
                  onClose={() => setCurrentResult(null)}
                />

                <button
                  onClick={() => setCurrentResult(null)}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Try Another Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default HighQualityTryOn;
