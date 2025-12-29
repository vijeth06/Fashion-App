import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FaCamera, FaImage, FaCheckCircle, FaShoppingBag, FaHeart, FaExpand } from 'react-icons/fa';

const QuantumTryOnPage = () => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [tryOnMode, setTryOnMode] = useState('browse'); // browse, camera, result
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { default: indianProductService } = await import('../services/indianProductService');
      const result = await indianProductService.getAllProducts();

      if (result.success) {
        setProducts(result.products.map(p => ({ ...p, id: p.productId })));
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setTryOnMode('camera');
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access is required for virtual try-on');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      setTryOnMode('result');
      stopCamera();
    }
  };

  const getItemIcon = (type) => {
    const icons = {
      kurta: '👕', saree: '🥻', jacket: '🧥', jeans: '👖',
      shirt: '👔', kurti: '👗', salwar: '👘', top: '👚',
      dress: '👗', hoodie: '🧥'
    };
    return icons[type] || '👕';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-pink-600 shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
              Indian Fashion Try-On
            </h1>
            <p className="text-xl text-orange-100">
              See yourself in traditional and modern Indian wear instantly
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Product Selection Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 sticky top-4"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <FaShoppingBag className="mr-3 text-orange-400" />
                Choose Your Style
              </h2>

              {loading ? (
                <div className="text-center py-8 text-gray-300">Loading...</div>
              ) : (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                  {products.slice(0, 15).map((item) => (
                    <motion.div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedItem?.id === item.id
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">{getItemIcon(item.type)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">{item.name}</h3>
                          <p className="text-gray-300 text-sm truncate">{item.brand}</p>
                          <p className="text-orange-300 font-bold">₹{item.price.selling.toLocaleString()}</p>
                        </div>
                        {selectedItem?.id === item.id && (
                          <FaCheckCircle className="text-white text-xl" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Main Try-On Area */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
            >
              
              {/* Mode Selector */}
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Virtual Try-On Studio</h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => { setTryOnMode('browse'); stopCamera(); }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        tryOnMode === 'browse' 
                          ? 'bg-white text-purple-900' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      Browse
                    </button>
                    <button
                      onClick={startCamera}
                      disabled={!selectedItem}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                        tryOnMode === 'camera' 
                          ? 'bg-white text-purple-900' 
                          : 'bg-white/20 text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <FaCamera />
                      <span>Try On</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  
                  {/* Browse Mode */}
                  {tryOnMode === 'browse' && (
                    <motion.div
                      key="browse"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-12 text-center"
                    >
                      {selectedItem ? (
                        <div className="max-w-xl mx-auto">
                          <div className="text-9xl mb-6">{getItemIcon(selectedItem.type)}</div>
                          <h3 className="text-3xl font-bold text-white mb-2">{selectedItem.name}</h3>
                          <p className="text-xl text-gray-300 mb-4">{selectedItem.brand}</p>
                          <p className="text-4xl font-bold text-orange-400 mb-6">
                            ₹{selectedItem.price.selling.toLocaleString()}
                          </p>
                          <div className="bg-white/5 rounded-xl p-6 mb-6">
                            <p className="text-gray-300 leading-relaxed">
                              {selectedItem.description || 'Premium quality Indian fashion wear with authentic design and superior craftsmanship.'}
                            </p>
                          </div>
                          <button
                            onClick={startCamera}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
                          >
                            <FaCamera className="inline mr-2" />
                            Start Virtual Try-On
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-400 py-20">
                          <FaShoppingBag className="text-6xl mx-auto mb-4 opacity-50" />
                          <p className="text-xl">Select an item from the left to get started</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Camera Mode */}
                  {tryOnMode === 'camera' && (
                    <motion.div
                      key="camera"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative aspect-video bg-black"
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {/* Overlay UI */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                          <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 text-white pointer-events-auto">
                            <p className="font-bold text-lg">{selectedItem?.name}</p>
                            <p className="text-sm text-gray-300">{selectedItem?.brand}</p>
                          </div>
                        </div>
                        
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                          <button
                            onClick={capturePhoto}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition-transform"
                          >
                            Capture Photo
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Result Mode */}
                  {tryOnMode === 'result' && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative aspect-video bg-black"
                    >
                      <canvas ref={canvasRef} className="w-full h-full object-contain" />
                      
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
                        <button
                          onClick={startCamera}
                          className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => setTryOnMode('browse')}
                          className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
                        >
                          Choose Another
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuantumTryOnPage;
