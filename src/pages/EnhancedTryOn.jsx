import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaRocket, 
  FaMagic, 
  FaEye, 
  FaDownload, 
  FaShare, 
  FaCog,
  FaInfoCircle 
} from 'react-icons/fa';

import VirtualTryOnComponent from '../components/VirtualTryOnComponent';
import { sampleClothingItems } from '../data/clothingData';

/**
 * Enhanced Virtual Try-On Page
 * Features realistic AR-like virtual fitting with pose detection
 */
const EnhancedTryOnPage = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [showInfo, setShowInfo] = useState(true);

  const handleCapture = (imageData) => {
    setCapturedImage(imageData);
    console.log('Image captured:', imageData);
  };

  const handleShare = async (imageData) => {
    if (navigator.share) {
      try {
        // Convert data URL to blob for sharing
        const response = await fetch(imageData);
        const blob = await response.blob();
        const file = new File([blob], 'virtual-tryon.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My Virtual Try-On Look',
          text: 'Check out my virtual fashion try-on!',
          files: [file]
        });
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback to download
        const link = document.createElement('a');
        link.download = 'virtual-tryon-shared.png';
        link.href = imageData;
        link.click();
      }
    } else {
      // Fallback for browsers without Web Share API
      const link = document.createElement('a');
      link.download = 'virtual-tryon-shared.png';
      link.href = imageData;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Info Banner */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 text-white p-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaInfoCircle className="text-xl" />
              <div>
                <p className="font-medium">🚀 Enhanced Virtual Try-On Experience</p>
                <p className="text-sm opacity-90">
                  Real-time AI pose detection • Realistic clothing overlay • Live camera or photo upload
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 pt-12 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center gap-8 mb-8"
              >
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <FaEye className="text-xl" />
                  <span className="font-medium">Real-time Pose Detection</span>
                </div>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <FaMagic className="text-xl" />
                  <span className="font-medium">AI-Powered Fitting</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <FaRocket className="text-xl" />
                  <span className="font-medium">Realistic Overlay</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Virtual Try-On Component */}
        <VirtualTryOnComponent
          clothingItems={sampleClothingItems}
          onCapture={handleCapture}
          onShare={handleShare}
        />

        {/* Captured Image Display */}
        {capturedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 max-w-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Captured Look</h3>
                <button
                  onClick={() => setCapturedImage(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <img
                src={capturedImage}
                alt="Captured try-on"
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `virtual-tryon-${Date.now()}.png`;
                    link.href = capturedImage;
                    link.click();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FaDownload />
                  Download
                </button>
                <button
                  onClick={() => handleShare(capturedImage)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FaShare />
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Info */}
        <div className="relative z-10 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center p-6 bg-white/70 dark:bg-gray-800/70 rounded-xl backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEye className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Real-time Pose Detection
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Advanced AI analyzes your body pose in real-time for accurate clothing placement and scaling.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center p-6 bg-white/70 dark:bg-gray-800/70 rounded-xl backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaMagic className="text-2xl text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Smart Clothing Fitting
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Clothing automatically adjusts to your body shape and moves naturally as you move.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center p-6 bg-white/70 dark:bg-gray-800/70 rounded-xl backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaRocket className="text-2xl text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Instant Results
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  See how clothes look on you instantly with high-quality rendering and realistic lighting.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Tech Stack Info */}
        <div className="relative z-10 py-12 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Powered by Advanced AI Technology
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">MediaPipe</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real-time pose detection</p>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">TensorFlow.js</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Machine learning in browser</p>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Canvas API</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">High-performance rendering</p>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">WebRTC</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Live camera access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTryOnPage;