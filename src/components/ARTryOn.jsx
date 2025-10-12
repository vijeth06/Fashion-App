import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCamera, 
  FaVideo, 
  FaStop,
  FaMobile,
  FaExpand,
  FaCompress,
  FaCog,
  FaTimes,
  FaDownload,
  FaShare,
  FaArrowsAlt,
  FaRedo,
  FaUndo,
  FaPalette,
  FaLayerGroup
} from 'react-icons/fa';

const ARTryOn = ({ 
  productId, 
  products = [],
  onClose, 
  isOpen = false 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentGarment, setCurrentGarment] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [arSettings, setArSettings] = useState({
    brightness: 50,
    contrast: 50,
    saturation: 50,
    opacity: 80
  });
  const [gestures, setGestures] = useState({
    scale: 1,
    rotation: 0,
    position: { x: 0, y: 0 }
  });
  const [mixAndMatch, setMixAndMatch] = useState({
    top: null,
    bottom: null,
    shoes: null,
    accessories: []
  });

  // Initialize camera and AR session
  const initializeAR = async () => {
    try {
      // Check for WebXR support
      if ('xr' in navigator) {
        const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        if (isSupported) {
          console.log('WebXR AR is supported!');
        } else {
          console.log('WebXR AR not supported, falling back to camera');
        }
      }

      // Initialize camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }

      // Initialize pose detection (mock implementation)
      initializePoseDetection();

    } catch (error) {
      console.error('Error initializing AR:', error);
      alert('Camera access is required for AR try-on. Please allow camera permissions.');
    }
  };

  // Mock pose detection initialization
  const initializePoseDetection = () => {
    // In a real implementation, you would load ML models like MediaPipe or TensorFlow.js
    console.log('Pose detection initialized (mock)');
  };

  // Start AR session
  const startARSession = async () => {
    if ('xr' in navigator) {
      try {
        const session = await navigator.xr.requestSession('immersive-ar', {
          requiredFeatures: ['local', 'hit-test'],
          optionalFeatures: ['dom-overlay'],
          domOverlay: { root: document.body }
        });

        console.log('AR session started:', session);
        // Handle AR session setup
        
      } catch (error) {
        console.log('WebXR not available, using camera fallback');
        await initializeAR();
      }
    } else {
      await initializeAR();
    }
  };

  // Handle product selection for mix and match
  const selectProduct = (product, category) => {
    const newSelection = { ...mixAndMatch };
    
    if (category === 'accessories') {
      if (newSelection.accessories.some(acc => acc.id === product.id)) {
        newSelection.accessories = newSelection.accessories.filter(acc => acc.id !== product.id);
      } else {
        newSelection.accessories.push(product);
      }
    } else {
      newSelection[category] = newSelection[category]?.id === product.id ? null : product;
    }
    
    setMixAndMatch(newSelection);
    setSelectedProducts(Object.values(newSelection).flat().filter(Boolean));
  };

  // Handle gesture controls
  const handleGestureStart = (e) => {
    e.preventDefault();
    // Implement gesture handling for scaling, rotation, positioning
  };

  const handleGestureMove = (e) => {
    e.preventDefault();
    // Update garment position/scale based on touch/mouse movement
  };

  const handleGestureEnd = (e) => {
    e.preventDefault();
    // Finalize gesture transformation
  };

  // Capture photo/video
  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Overlay virtual garments (mock implementation)
      drawVirtualGarments(ctx);
      
      // Download image
      const link = document.createElement('a');
      link.download = `ar-tryon-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Share AR try-on look using Web Share API
  const shareARLook = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Overlay virtual garments
      drawVirtualGarments(ctx);
      
      // Convert to blob for sharing
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        capturePhoto(); // Fallback to download
        return;
      }
      
      const file = new File([blob], 'ar-tryon-look.png', { type: 'image/png' });
      
      // Get selected items for share text
      const selectedItems = Object.values(mixAndMatch).filter(Boolean);
      const itemNames = selectedItems.map(item => item.name).join(', ');
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Check out my AR virtual try-on!',
          text: itemNames ? `I'm trying on ${itemNames} using AR technology!` : 'Check out my virtual try-on look!'
        });
      } else {
        // Fallback: copy share text to clipboard and download image
        const shareText = `Check out my AR virtual try-on! ${itemNames ? `Trying on: ${itemNames}` : ''} #VirtualFashion #ARTryOn`;
        
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareText);
          console.log('Share text copied to clipboard!');
        }
        
        // Download the image as fallback
        capturePhoto();
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to download
      capturePhoto();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Implement video recording functionality
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Stop and save video recording
  };

  // Draw virtual garments on canvas (mock implementation)
  const drawVirtualGarments = (ctx) => {
    Object.entries(mixAndMatch).forEach(([category, product]) => {
      if (product && category !== 'accessories') {
        // Mock garment overlay
        ctx.fillStyle = product.color || '#ff6b6b';
        ctx.globalAlpha = arSettings.opacity / 100;
        
        switch (category) {
          case 'top':
            ctx.fillRect(100, 150, 200, 180);
            break;
          case 'bottom':
            ctx.fillRect(120, 330, 160, 200);
            break;
          case 'shoes':
            ctx.fillRect(110, 530, 80, 40);
            ctx.fillRect(210, 530, 80, 40);
            break;
        }
        
        ctx.globalAlpha = 1;
      }
    });

    // Draw accessories
    mixAndMatch.accessories.forEach((accessory, index) => {
      ctx.fillStyle = accessory.color || '#333';
      ctx.globalAlpha = 0.8;
      // Position accessories around the body
      ctx.fillRect(50 + index * 30, 100, 25, 25);
      ctx.globalAlpha = 1;
    });
  };

  // Cleanup camera stream
  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      startARSession();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-black ${isFullscreen ? '' : 'p-4'}`}
      >
        <div className="relative w-full h-full flex">
          {/* Main AR View */}
          <div className="flex-1 relative">
            {/* Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onTouchStart={handleGestureStart}
              onTouchMove={handleGestureMove}
              onTouchEnd={handleGestureEnd}
              onMouseDown={handleGestureStart}
              onMouseMove={handleGestureMove}
              onMouseUp={handleGestureEnd}
            />

            {/* AR Overlay Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ mixBlendMode: 'multiply' }}
            />

            {/* Virtual Garment Overlays */}
            <div className="absolute inset-0 pointer-events-none">
              {Object.entries(mixAndMatch).map(([category, product]) => {
                if (!product || category === 'accessories') return null;
                
                return (
                  <motion.div
                    key={`${category}-${product.id}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: arSettings.opacity / 100, scale: gestures.scale }}
                    className="absolute"
                    style={{
                      transform: `translate(${gestures.position.x}px, ${gestures.position.y}px) rotate(${gestures.rotation}deg)`,
                      filter: `brightness(${arSettings.brightness}%) contrast(${arSettings.contrast}%) saturate(${arSettings.saturation}%)`
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-auto h-auto max-w-sm opacity-80"
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* AR Controls Overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
                
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                  AR Try-On Active
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                >
                  {isFullscreen ? <FaCompress className="w-5 h-5" /> : <FaExpand className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={() => setShowControls(!showControls)}
                  className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                >
                  <FaCog className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center items-center gap-4">
              <button
                onClick={capturePhoto}
                className="p-4 bg-white text-gray-900 rounded-full shadow-lg hover:bg-gray-100 transition-all"
              >
                <FaCamera className="w-6 h-6" />
              </button>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-4 rounded-full shadow-lg transition-all ${
                  isRecording 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                {isRecording ? <FaStop className="w-6 h-6" /> : <FaVideo className="w-6 h-6" />}
              </button>
              
              <button
                onClick={shareARLook}
                className="p-4 bg-white text-gray-900 rounded-full shadow-lg hover:bg-gray-100 transition-all"
              >
                <FaShare className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Side Panel */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-80 bg-white shadow-2xl overflow-y-auto"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-6">Mix & Match</h3>

                  {/* Product Categories */}
                  {['top', 'bottom', 'shoes'].map(category => (
                    <div key={category} className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3 capitalize flex items-center gap-2">
                        <FaLayerGroup className="w-4 h-4" />
                        {category}
                      </h4>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {products
                          .filter(p => p.category === category)
                          .slice(0, 6)
                          .map(product => (
                            <button
                              key={product.id}
                              onClick={() => selectProduct(product, category)}
                              className={`aspect-square rounded-lg border-2 transition-all ${
                                mixAndMatch[category]?.id === product.id
                                  ? 'border-purple-500 ring-2 ring-purple-200'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  ))}

                  {/* AR Settings */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <FaPalette className="w-4 h-4" />
                      AR Settings
                    </h4>
                    
                    <div className="space-y-4">
                      {Object.entries(arSettings).map(([setting, value]) => (
                        <div key={setting}>
                          <label className="block text-sm text-gray-700 mb-1 capitalize">
                            {setting}: {value}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => setArSettings({
                              ...arSettings,
                              [setting]: parseInt(e.target.value)
                            })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gesture Controls Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Gesture Controls</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Pinch to scale garments</li>
                      <li>• Drag to reposition</li>
                      <li>• Rotate with two fingers</li>
                      <li>• Tap to select/deselect</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => setGestures({ scale: 1, rotation: 0, position: { x: 0, y: 0 } })}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FaUndo className="w-4 h-4" />
                      Reset Position
                    </button>
                    
                    <button
                      onClick={() => setMixAndMatch({ top: null, bottom: null, shoes: null, accessories: [] })}
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FaTimes className="w-4 h-4" />
                      Clear All
                    </button>
                    
                    <button
                      onClick={capturePhoto}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                    >
                      Save Look
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ARTryOn;