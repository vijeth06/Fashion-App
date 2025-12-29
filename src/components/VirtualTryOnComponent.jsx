import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCamera, 
  FaUpload, 
  FaPlay, 
  FaStop, 
  FaDownload, 
  FaShare,
  FaCog,
  FaMagic,
  FaEye,
  FaTshirt,
  FaRedo
} from 'react-icons/fa';

import WebcamComponent from './WebcamComponent';
import PhotoUploadComponent from './PhotoUploadComponent';
import PoseDetectionService from '../services/PoseDetectionService';
import ClothingOverlaySystem from '../services/ClothingOverlaySystem';


const VirtualTryOnComponent = ({
  clothingItems = [],
  onCapture,
  onShare,
  className = ''
}) => {

  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const poseServiceRef = useRef(null);
  const overlaySystemRef = useRef(null);
  const startPendingRef = useRef(false);

  const [mode, setMode] = useState('webcam'); // 'webcam' or 'upload'
  const [isActive, setIsActive] = useState(false);
  const [selectedClothing, setSelectedClothing] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [performanceStats, setPerformanceStats] = useState({
    fps: 0,
    poseConfidence: 0,
    isRealTime: false
  });
  const [settings, setSettings] = useState({
    poseDetection: true,
    showKeypoints: false,
    clothingOpacity: 0.8,
    realTimeTracking: true,
    showPerformanceStats: true
  });

  const clothingCategories = {
    tops: ['shirt', 'jacket', 'hoodie', 'blazer'],
    bottoms: ['pants', 'jeans', 'skirt', 'shorts'],
    dresses: ['dress', 'gown'],
    accessories: ['hat', 'necklace', 'glasses']
  };

  const initializeServices = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {

      if (!poseServiceRef.current) {
        poseServiceRef.current = new PoseDetectionService();

        poseServiceRef.current.onPoseDetected((pose) => {
          setPoseData(pose);
          setPerformanceStats(prev => ({
            ...prev,
            poseConfidence: pose.confidence || 0,
            isRealTime: true
          }));
          
          if (overlaySystemRef.current) {
            overlaySystemRef.current.updatePose(pose);
          }
        });

        poseServiceRef.current.onFPSUpdate((fps) => {
          setPerformanceStats(prev => ({
            ...prev,
            fps
          }));
        });

        poseServiceRef.current.onError((err) => {
          console.error('Pose detection error:', err);
          setError('Pose detection failed. Some features may not work properly.');
          setPerformanceStats(prev => ({
            ...prev,
            isRealTime: false
          }));
        });
      }

      const initialized = await poseServiceRef.current.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize pose detection');
      }

      if (canvasRef.current && !overlaySystemRef.current) {
        overlaySystemRef.current = new ClothingOverlaySystem(canvasRef.current);

        overlaySystemRef.current.startRealTimeRendering();
      }

      setIsInitializing(false);
      console.log('Virtual try-on services initialized successfully');

    } catch (err) {
      console.error('Service initialization error:', err);
      setError(err.message);
      setIsInitializing(false);
    }
  }, []);

  const startTryOn = useCallback(async () => {
    console.log('Starting virtual try-on...');
    setError(null);
    
    try {
      if (!poseServiceRef.current) {
        console.log('Initializing services...');
        await initializeServices();
      }

      if (mode === 'webcam') {
        console.log('Starting webcam mode...');
        setIsActive(true);
        startPendingRef.current = true;

        if (videoRef.current && videoRef.current.readyState === 4) {
          console.log('Video is ready, starting pose detection...');
          poseServiceRef.current.startDetection(videoRef.current);
          startPendingRef.current = false;
        } else {
          console.log('Waiting for video to be ready...');

          setIsActive(true);
        }
      } else if (mode === 'upload' && uploadedImage) {
        console.log('Starting upload mode...');
        setIsActive(true);

        const img = new Image();
        img.onload = async () => {
          try {
            await poseServiceRef.current.detectOnImage(img);
          } catch (e) {
            console.error('Static image pose detection failed on start:', e);
            setError('Could not detect pose in the uploaded image. Try a clearer, full-body image.');
          }
        };
        img.src = uploadedImage.data;
      } else {
        setError('Please ensure camera is accessible or upload an image first');
      }
    } catch (err) {
      console.error('Failed to start try-on:', err);
      setError('Failed to start virtual try-on: ' + err.message);
    }
  }, [mode, uploadedImage, initializeServices]);

  const stopTryOn = useCallback(() => {
    console.log('Stopping virtual try-on...');
    setIsActive(false);
    
    if (poseServiceRef.current) {
      poseServiceRef.current.stopDetection();
    }

    setPoseData(null);
  }, []);

  const handleVideoReady = useCallback((video) => {
    console.log('Video ready callback triggered');
    videoRef.current = video;
    
    if (canvasRef.current) {

      canvasRef.current.width = video.videoWidth || 640;
      canvasRef.current.height = video.videoHeight || 480;
      
      if (overlaySystemRef.current) {
        overlaySystemRef.current.setCanvasSize(
          video.videoWidth || 640, 
          video.videoHeight || 480
        );
      }
    }

    if (mode === 'webcam' && poseServiceRef.current && (isActive || startPendingRef.current)) {
      console.log('Starting pose detection on video ready...');
      try {
        poseServiceRef.current.startDetection(video);
        startPendingRef.current = false;

        setIsActive(true);
      } catch (err) {
        console.error('Failed to start pose detection:', err);
        setError('Failed to start pose detection: ' + err.message);
      }
    }
  }, [mode, isActive]);

  const handleImageUpload = useCallback((imageData, imageInfo) => {
    setUploadedImage({ data: imageData, info: imageInfo });
    
    if (canvasRef.current) {

      canvasRef.current.width = imageInfo.width;
      canvasRef.current.height = imageInfo.height;
      
      if (overlaySystemRef.current) {
        overlaySystemRef.current.setCanvasSize(imageInfo.width, imageInfo.height);
      }
    }

    if (poseServiceRef.current) {
      const img = new Image();
      img.onload = async () => {
        try {
          await poseServiceRef.current.detectOnImage(img);
        } catch (e) {
          console.error('Static image pose detection failed:', e);
          setError('Could not detect pose in the uploaded image. Try a clearer, full-body image.');
        }
      };
      img.src = imageData;
    }
  }, []);

  const addClothingItem = useCallback((item) => {
    if (overlaySystemRef.current) {
      const itemId = overlaySystemRef.current.addClothingItem(item);
      setSelectedClothing(prev => [...prev, { ...item, id: itemId }]);
    }
  }, []);

  const removeClothingItem = useCallback((itemId) => {
    if (overlaySystemRef.current) {
      overlaySystemRef.current.removeClothingItem(itemId);
      setSelectedClothing(prev => prev.filter(item => item.id !== itemId));
    }
  }, []);

  const clearAllClothing = useCallback(() => {
    if (overlaySystemRef.current) {
      overlaySystemRef.current.clearAllItems();
      setSelectedClothing([]);
    }
  }, []);

  const captureFrame = useCallback(async () => {
    if (!canvasRef.current) return;

    const { default: ExportService } = await import('../services/ExportService');
    const exporter = new ExportService();

    let baseCanvas = undefined;
    let baseVideo = null;

    if (mode === 'webcam') {
      baseVideo = videoRef.current;
    } else if (mode === 'upload' && uploadedImage?.data) {

      const imgEl = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = uploadedImage.data;
      });

      const offscreen = document.createElement('canvas');
      offscreen.width = imgEl.width;
      offscreen.height = imgEl.height;
      const offCtx = offscreen.getContext('2d');
      offCtx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height);
      baseCanvas = offscreen;
    }

    const compositeUrl = await exporter.exportTryOnImage({
      canvas: baseCanvas,
      videoElement: baseVideo,
      overlayCanvas: canvasRef.current,
      format: 'png',
      quality: 'high',
      watermark: false,
      metadata: {
        showOverlay: false,
        clothing: selectedClothing,
        timestamp: Date.now()
      }
    });

    if (onCapture) onCapture(compositeUrl);
    return compositeUrl;
  }, [mode, uploadedImage, onCapture, selectedClothing]);

  const downloadCapture = useCallback(async () => {
    const dataUrl = await captureFrame();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `virtual-tryon-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  }, [captureFrame]);

  useEffect(() => {
    initializeServices();

    return () => {
      if (poseServiceRef.current) {
        poseServiceRef.current.dispose();
      }
      if (overlaySystemRef.current) {
        overlaySystemRef.current.dispose();
      }
    };
  }, [initializeServices]);

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Virtual Fashion Try-On
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Experience realistic virtual fitting with AI-powered pose detection and clothing overlay
        </p>
      </div>

      {}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-2 flex">
          <button
            onClick={() => setMode('webcam')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              mode === 'webcam'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FaCamera />
            Live Try-On
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              mode === 'upload'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FaUpload />
            Upload Photo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {mode === 'webcam' ? (
                    <button
                      onClick={isActive ? stopTryOn : startTryOn}
                      disabled={isInitializing}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isActive ? <FaStop /> : <FaPlay />}
                      {isActive ? 'Stop' : 'Start'} Try-On
                    </button>
                  ) : null}

                  {}
                  {!isInitializing && poseServiceRef.current?.isInitialized && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      AI Ready
                    </div>
                  )}

                  {poseData && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Pose Detected (Confidence: {Math.round(poseData.confidence * 100)}%)
                    </div>
                  )}
                  
                  {isActive && !poseData && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      Searching for pose...
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadCapture}
                    disabled={!isActive && !uploadedImage}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                    title="Download image"
                  >
                    <FaDownload />
                  </button>
                  <button
                    onClick={clearAllClothing}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Clear all clothing"
                  >
                    <FaRedo />
                  </button>
                </div>
              </div>
            </div>

            {}
            <div className="relative bg-gray-900 min-h-[600px]">
              {mode === 'webcam' ? (
                <WebcamComponent
                  onVideoReady={handleVideoReady}
                  onError={(err) => setError(err.message)}
                  className="w-full h-full"
                />
              ) : (
                <div className="p-8">
                  {!uploadedImage ? (
                    <PhotoUploadComponent
                      onImageSelect={handleImageUpload}
                      onError={(err) => setError(err.message)}
                    />
                  ) : (
                    <div className="relative">
                      <img
                        src={uploadedImage.data}
                        alt="Uploaded for try-on"
                        className="w-full max-h-96 object-contain mx-auto"
                      />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}

              {}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none w-full h-full object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />

              {}
              {settings.showKeypoints && poseData && (
                <div className="absolute inset-0 pointer-events-none">
                  {Object.entries(poseData.keypoints).map(([joint, position]) => (
                    <div
                      key={joint}
                      className="absolute w-2 h-2 bg-green-400 rounded-full"
                      style={{
                        left: position.x - 4,
                        top: position.y - 4,
                        opacity: 0.7
                      }}
                    />
                  ))}
                </div>
              )}

              {}
              {settings.showPerformanceStats && isActive && (
                <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm font-mono">
                  <div className={`flex items-center gap-2 mb-1 ${performanceStats.isRealTime ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${performanceStats.isRealTime ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    {performanceStats.isRealTime ? 'LIVE' : 'OFFLINE'}
                  </div>
                  <div className="space-y-1">
                    <div className={`${performanceStats.fps >= 20 ? 'text-green-400' : performanceStats.fps >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                      FPS: {performanceStats.fps}
                    </div>
                    <div className={`${performanceStats.poseConfidence >= 0.7 ? 'text-green-400' : performanceStats.poseConfidence >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      Pose: {(performanceStats.poseConfidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {}
              <AnimatePresence>
                {isInitializing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 flex items-center justify-center"
                  >
                    <div className="text-center text-white">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"
                      />
                      <p className="text-lg font-medium">Initializing AI systems...</p>
                      <p className="text-sm text-gray-300 mt-2">Loading pose detection models</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-4 right-4 bg-red-600 text-white p-4 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{error}</p>
                      <button
                        onClick={() => setError(null)}
                        className="text-white hover:text-gray-200"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {}
        <div className="space-y-6">
          {}
          {selectedClothing.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Currently Wearing
              </h3>
              <div className="space-y-3">
                {selectedClothing.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeClothingItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Choose Clothing
            </h3>
            
            {Object.entries(clothingCategories).map(([category, types]) => (
              <div key={category} className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  {category}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {clothingItems
                    .filter(item => types.includes(item.type))
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => addClothingItem(item)}
                        className="group relative bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-16 object-cover rounded mb-2"
                        />
                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 rounded-lg transition-all" />
                      </button>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Settings
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Keypoints</span>
                <input
                  type="checkbox"
                  checked={settings.showKeypoints}
                  onChange={(e) => setSettings(prev => ({ ...prev, showKeypoints: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Clothing Opacity: {Math.round(settings.clothingOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.clothingOpacity}
                  onChange={(e) => {
                    const opacity = parseFloat(e.target.value);
                    setSettings(prev => ({ ...prev, clothingOpacity: opacity }));
                    if (overlaySystemRef.current) {

                      selectedClothing.forEach(item => {
                        overlaySystemRef.current.updateItemProperties(item.id, { opacity });
                      });
                    }
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOnComponent;