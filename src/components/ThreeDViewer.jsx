import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaExpand, 
  FaCompress, 
  FaPlay,
  FaPause,
  FaTimes,
  FaDownload,
  FaPalette
} from 'react-icons/fa';

const ThreeDViewer = ({ 
  productId, 
  modelUrl, 
  onClose, 
  isOpen = false,
  productName = 'Product',
  productPrice = 0
}) => {
  const mountRef = useRef(null);
  const animationRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [selectedTexture, setSelectedTexture] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Initialize 3D scene (mock implementation)
  const initThreeJS = useCallback(() => {
    if (!mountRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const size = isFullscreen ? { width: window.innerWidth, height: window.innerHeight - 80 } : { width: 800, height: 600 };
      canvas.width = size.width;
      canvas.height = size.height;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      
      const ctx = canvas.getContext('2d');
      
      const drawMockModel = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 3D Model simulation
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        if (isAutoRotating) {
          const time = Date.now() * 0.001;
          ctx.rotate(time * 0.5);
        }
        
        // Draw garment shape
        const colors = ['#ff6b6b', '#4a90e2', '#2ecc71', '#2c3e50', '#e74c3c'];
        ctx.fillStyle = colors[selectedTexture] || colors[0];
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
        
        // Main body
        ctx.fillRect(-60, -100, 120, 150);
        // Arms
        ctx.fillRect(-90, -80, 25, 100);
        ctx.fillRect(65, -80, 25, 100);
        // Bottom
        ctx.beginPath();
        ctx.moveTo(-60, 50);
        ctx.lineTo(-80, 120);
        ctx.lineTo(80, 120);
        ctx.lineTo(60, 50);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      };
      
      const animate = () => {
        drawMockModel();
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(canvas);
      
      // Simulate loading
      let progress = 0;
      const loadingInterval = setInterval(() => {
        progress += 20;
        setLoadingProgress(progress);
        if (progress >= 100) {
          clearInterval(loadingInterval);
          setIsLoading(false);
        }
      }, 200);
      
    } catch (err) {
      setIsLoading(false);
    }
  }, [isFullscreen, isAutoRotating, selectedTexture]);

  useEffect(() => {
    if (isOpen) {
      initThreeJS();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, initThreeJS]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadModel = () => {
    const canvas = mountRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${productName}-3d-view.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const textures = [
    { name: 'Original', color: '#ff6b6b' },
    { name: 'Blue', color: '#4a90e2' },
    { name: 'Green', color: '#2ecc71' },
    { name: 'Black', color: '#2c3e50' },
    { name: 'Red', color: '#e74c3c' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-black bg-opacity-90 ${
          isFullscreen ? 'p-0' : 'p-4 flex items-center justify-center'
        }`}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden ${
            isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[80vh]'
          }`}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm border-b">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold">{productName}</h3>
                <span className="text-lg font-semibold text-purple-600">${productPrice}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`p-2 rounded-lg ${
                    isAutoRotating ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isAutoRotating ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={downloadModel}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  <FaDownload className="w-4 h-4" />
                </button>
                
                <button
                  onClick={onClose}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h4 className="text-lg font-semibold mb-2">Loading 3D Model</h4>
                <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{loadingProgress}%</p>
              </div>
            </div>
          )}

          {/* 3D Viewer */}
          <div className="relative w-full h-full pt-20">
            <div 
              ref={mountRef} 
              className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"
            />
          </div>

          {/* Controls */}
          {!isLoading && (
            <div className="absolute top-20 right-4 w-64 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <FaPalette className="w-4 h-4" />
                Colors
              </h4>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {textures.map((texture, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTexture(index)}
                    className={`w-10 h-10 rounded-lg border-2 ${
                      selectedTexture === index ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: texture.color }}
                    title={texture.name}
                  />
                ))}
              </div>
              
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                Add to Cart
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ThreeDViewer;