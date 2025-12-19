import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCamera, 
  FaVideo, 
  FaVideoSlash, 
  FaSync, 
  FaExpand, 
  FaCompress,
  FaExclamationTriangle,
  FaCog,
  FaDownload
} from 'react-icons/fa';

/**
 * Advanced Webcam Component
 * Provides webcam access with error handling, controls, and capture functionality
 */
const WebcamComponent = ({
  onVideoReady,
  onCapture,
  onError,
  width = 640,
  height = 480,
  facingMode = 'user',
  className = '',
  showControls = true
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [settings, setSettings] = useState({
    facingMode,
    width,
    height,
    frameRate: 30
  });

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Get user media
      const constraints = {
        video: {
          facingMode: settings.facingMode,
          width: { ideal: settings.width },
          height: { ideal: settings.height },
          frameRate: { ideal: settings.frameRate },
          ...(selectedDeviceId && { deviceId: { exact: selectedDeviceId } })
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, calling onVideoReady');
          setIsActive(true);
          setIsLoading(false);
          if (onVideoReady) {
            onVideoReady(videoRef.current);
          }
        };

        // Also call onVideoReady when video starts playing
        videoRef.current.onplaying = () => {
          console.log('Video started playing');
          if (onVideoReady && videoRef.current.readyState >= 2) {
            onVideoReady(videoRef.current);
          }
        };
      }

    } catch (err) {
      console.error('Camera initialization error:', err);
      let errorMessage = 'Failed to access camera';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera permissions.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera settings are not supported.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      
      if (onError) {
        onError(err);
      }
    }
  }, [settings, selectedDeviceId, onVideoReady, onError]);

  // Get available devices
  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error getting devices:', err);
    }
  }, [selectedDeviceId]);

  // Start camera
  const startCamera = useCallback(() => {
    initializeCamera();
  }, [initializeCamera]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
  }, []);

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user'
    }));
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    if (onCapture) {
      onCapture(imageDataUrl);
    }

    return imageDataUrl;
  }, [onCapture]);

  // Download captured image
  const downloadCapture = useCallback(() => {
    const imageData = capturePhoto();
    if (imageData) {
      const link = document.createElement('a');
      link.download = `webcam-capture-${Date.now()}.jpg`;
      link.href = imageData;
      link.click();
    }
  }, [capturePhoto]);

  // Handle device change
  const handleDeviceChange = useCallback((deviceId) => {
    setSelectedDeviceId(deviceId);
  }, []);

  // Initialize on mount
  useEffect(() => {
    getDevices();
    // Auto-start camera on mount
    startCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Re-initialize when settings change
  useEffect(() => {
    if (isActive) {
      initializeCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.facingMode, selectedDeviceId, isActive]);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      {/* Video Element */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${
            settings.facingMode === 'user' ? 'scale-x-[-1]' : ''
          }`}
          style={{
            minHeight: isFullscreen ? '100vh' : '300px',
            maxHeight: isFullscreen ? '100vh' : '600px'
          }}
        />

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
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
                <p className="text-lg font-medium">Initializing camera...</p>
                <p className="text-sm text-gray-300 mt-2">Please allow camera access</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Overlay */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-900/70 flex items-center justify-center"
            >
              <div className="text-center text-white max-w-md mx-auto p-6">
                <FaExclamationTriangle className="text-4xl text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Camera Error</h3>
                <p className="text-sm mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    startCamera();
                  }}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Video Placeholder */}
        {!isActive && !isLoading && !error && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <FaVideoSlash className="text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Camera Inactive</h3>
              <p className="text-sm mb-4">Click start to begin</p>
              <button
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <FaVideo />
                Start Camera
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
              {/* Start/Stop Camera */}
              <button
                onClick={isActive ? stopCamera : startCamera}
                className={`p-3 rounded-full transition-all ${
                  isActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                disabled={isLoading}
              >
                {isActive ? <FaVideoSlash /> : <FaVideo />}
              </button>

              {/* Capture Photo */}
              {isActive && (
                <button
                  onClick={capturePhoto}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                >
                  <FaCamera />
                </button>
              )}

              {/* Switch Camera */}
              {isActive && devices.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
                >
                  <FaSync />
                </button>
              )}

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>

              {/* Download Capture */}
              {isActive && (
                <button
                  onClick={downloadCapture}
                  className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
                >
                  <FaDownload />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Device Selector */}
        {devices.length > 1 && showControls && (
          <div className="absolute top-4 right-4">
            <select
              value={selectedDeviceId}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="bg-black/70 text-white rounded-lg px-3 py-2 text-sm backdrop-blur-sm"
            >
              {devices.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Settings Indicator */}
        {isActive && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Live</span>
              <span>•</span>
              <span>{settings.width}x{settings.height}</span>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Close Button */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-60 p-2 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
        >
          <FaCompress />
        </button>
      )}
    </div>
  );
};

export default WebcamComponent;