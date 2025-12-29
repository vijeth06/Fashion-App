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
import enhancedPoseDetection from '../services/EnhancedPoseDetection';
import clothSegmentationService from '../services/ClothSegmentationService';

const ARTryOn = ({ 
  productId, 
  products = [],
  onClose, 
  isOpen = false 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafIdRef = useRef(null);
  const lastPoseTimeRef = useRef(0);
  const isMountedRef = useRef(false);
  const smoothingRef = useRef({ top: null, bottom: null, shoes: null });
  
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [status, setStatus] = useState('idle');
  const [liteMode, setLiteMode] = useState(false);
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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const initializeAR = async () => {
    try {
      if (isCameraActive) return;

      if ('xr' in navigator) {
        const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        if (isSupported) {
          console.log('WebXR AR is supported!');
        } else {
          console.log('WebXR AR not supported, falling back to camera');
        }
      }

      setStatus('initializing');

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

      await initializePoseDetection();

      setStatus('tracking');

    } catch (error) {
      console.error('Error initializing AR:', error);
      alert('Camera access is required for AR try-on. Please allow camera permissions.');
      setStatus('error');
    }
  };

  const initializePoseDetection = async () => {
    try {
      await enhancedPoseDetection.initialize();
      console.log('✅ Real pose detection initialized with TensorFlow.js');
      setStatus('pose-ready');

      startPoseDetectionLoop();
    } catch (error) {
      console.error('Failed to initialize pose detection:', error);
      setStatus('pose-error');
    }
  };

  const startPoseDetectionLoop = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const targetFrameMs = 1000 / 30;

    const detectPose = async (timestamp) => {
      if (!isMountedRef.current || !isCameraActive) return;
      if (liteMode) {
        rafIdRef.current = requestAnimationFrame(detectPose);
        return;
      }

      if (videoRef.current && videoRef.current.readyState >= 2) {
        if (timestamp - lastPoseTimeRef.current >= targetFrameMs) {
          lastPoseTimeRef.current = timestamp;

          try {
            const poseData = await enhancedPoseDetection.detectPose(videoRef.current);
            
            if (poseData.success && canvasRef.current) {
              if (poseData.confidence !== undefined && poseData.confidence < 0.2) {
                setStatus('pose-low');
              } else {
                setStatus('tracking');
              }
              drawPoseAndGarments(poseData);
            }
          } catch (error) {
            console.error('Pose detection error:', error);
            setStatus('pose-error');
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(detectPose);
    };
    
    rafIdRef.current = requestAnimationFrame(detectPose);
  };

  const drawPoseAndGarments = (poseData) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const normalizedKeypoints = normalizeKeypoints(poseData.keypoints || [], canvas.width, canvas.height);

    if (poseData.keypoints) {
      ctx.fillStyle = 'red';
      normalizedKeypoints.forEach(kp => {
        if (kp.visible && kp.score > 0.3) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }

    const transforms = computeGarmentTransforms(normalizedKeypoints, canvas.width, canvas.height, smoothingRef);

    drawGarmentsWithTransforms(ctx, transforms);
  };

  const normalizeKeypoints = (keypoints, width, height) => {
    if (!keypoints || !width || !height) return [];
    return keypoints.map(kp => ({
      ...kp,
      x: kp.x,
      y: kp.y,
      nx: kp.x / width,
      ny: kp.y / height
    }));
  };

  const smoothTransform = (category, nextTransform, alpha = 0.25) => {
    if (!nextTransform) return null;
    const previous = smoothingRef.current[category];
    if (!previous) {
      smoothingRef.current[category] = nextTransform;
      return nextTransform;
    }

    const smoothed = {
      x: previous.x + (nextTransform.x - previous.x) * alpha,
      y: previous.y + (nextTransform.y - previous.y) * alpha,
      width: previous.width + (nextTransform.width - previous.width) * alpha,
      height: previous.height + (nextTransform.height - previous.height) * alpha,
      rotation: previous.rotation + (nextTransform.rotation - previous.rotation) * alpha,
    };

    smoothingRef.current[category] = smoothed;
    return smoothed;
  };

  const computeGarmentTransforms = (keypoints, width, height, smoothingStore) => {
    const get = (name) => keypoints.find(kp => kp.name === name);

    const transforms = {};

    const leftShoulder = get('left_shoulder');
    const rightShoulder = get('right_shoulder');
    const leftHip = get('left_hip');
    const rightHip = get('right_hip');
    const leftKnee = get('left_knee');
    const rightKnee = get('right_knee');
    const leftAnkle = get('left_ankle');
    const rightAnkle = get('right_ankle');

    const shoulderMid = (leftShoulder && rightShoulder)
      ? { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 }
      : null;
    const hipMid = (leftHip && rightHip)
      ? { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 }
      : null;

    const shoulderWidth = (leftShoulder && rightShoulder)
      ? Math.hypot(rightShoulder.x - leftShoulder.x, rightShoulder.y - leftShoulder.y)
      : null;
    const hipWidth = (leftHip && rightHip)
      ? Math.hypot(rightHip.x - leftHip.x, rightHip.y - leftHip.y)
      : null;

    if (leftShoulder && rightShoulder && hipMid && shoulderWidth) {
      const heightTop = hipMid.y - Math.min(leftShoulder.y, rightShoulder.y);
      const widthTop = shoulderWidth * 1.1;
      const rotation = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);
      transforms.top = smoothTransform('top', {
        x: (shoulderMid.x - widthTop / 2),
        y: Math.min(leftShoulder.y, rightShoulder.y) - heightTop * 0.1,
        width: widthTop,
        height: heightTop * 1.2,
        rotation,
      });
    }

    if (leftHip && rightHip && (leftKnee || rightKnee)) {
      const kneeY = Math.max(leftKnee?.y || rightKnee?.y || hipMid?.y || 0, hipMid?.y || 0);
      const legHeight = kneeY - hipMid.y;
      const widthBottom = (hipWidth || shoulderWidth || width * 0.2) * 1.05;
      transforms.bottom = smoothTransform('bottom', {
        x: (hipMid.x - widthBottom / 2),
        y: hipMid.y,
        width: widthBottom,
        height: legHeight * 1.1,
        rotation: 0,
      });
    }

    if (leftAnkle || rightAnkle) {
      const ankleY = Math.max(leftAnkle?.y || 0, rightAnkle?.y || 0);
      const ankleX = ((leftAnkle?.x || 0) + (rightAnkle?.x || 0)) / 2 || hipMid?.x || shoulderMid?.x || 0;
      const widthShoes = hipWidth ? hipWidth * 0.6 : width * 0.15;
      transforms.shoes = smoothTransform('shoes', {
        x: ankleX - widthShoes / 2,
        y: ankleY - (height * 0.02),
        width: widthShoes,
        height: height * 0.04,
        rotation: 0,
      });
    }

    return transforms;
  };

  const drawGarmentsWithTransforms = (ctx, transforms) => {
    Object.entries(mixAndMatch).forEach(([category, product]) => {
      if (!product || category === 'accessories') return;
      const transform = transforms[category];
      if (!transform) return;

      ctx.save();
      ctx.translate(transform.x + transform.width / 2, transform.y + transform.height / 2);
      ctx.rotate(transform.rotation || 0);
      ctx.translate(-transform.width / 2, -transform.height / 2);
      ctx.globalAlpha = arSettings.opacity / 100;
      ctx.fillStyle = product.color || 'rgba(255, 107, 107, 0.6)';
      ctx.fillRect(0, 0, transform.width, transform.height);

      if (product.imageUrl || product.image) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = product.imageUrl || product.image;
        img.onload = () => {
          ctx.globalAlpha = 0.8;
          ctx.drawImage(img, 0, 0, transform.width, transform.height);
          ctx.globalAlpha = 1;
        };
      }

      ctx.restore();
    });
  };

  const startARSession = async () => {
    if ('xr' in navigator) {
      try {
        const session = await navigator.xr.requestSession('immersive-ar', {
          requiredFeatures: ['local', 'hit-test'],
          optionalFeatures: ['dom-overlay'],
          domOverlay: { root: document.body }
        });

        console.log('AR session started:', session);

        
      } catch (error) {
        console.log('WebXR not available, using camera fallback');
        await initializeAR();
      }
    } else {
      await initializeAR();
    }
  };

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

  const handleGestureStart = (e) => {
    e.preventDefault();

  };

  const handleGestureMove = (e) => {
    e.preventDefault();

  };

  const handleGestureEnd = (e) => {
    e.preventDefault();

  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      drawVirtualGarments(ctx);

      const link = document.createElement('a');
      link.download = `ar-tryon-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const shareARLook = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      drawVirtualGarments(ctx);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        capturePhoto(); // Fallback to download
        return;
      }
      
      const file = new File([blob], 'ar-tryon-look.png', { type: 'image/png' });

      const selectedItems = Object.values(mixAndMatch).filter(Boolean);
      const itemNames = selectedItems.map(item => item.name).join(', ');
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Check out my AR virtual try-on!',
          text: itemNames ? `I'm trying on ${itemNames} using AR technology!` : 'Check out my virtual try-on look!'
        });
      } else {

        const shareText = `Check out my AR virtual try-on! ${itemNames ? `Trying on: ${itemNames}` : ''} #VirtualFashion #ARTryOn`;
        
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareText);
          console.log('Share text copied to clipboard!');
        }

        capturePhoto();
      }
    } catch (error) {
      console.error('Share failed:', error);

      capturePhoto();
    }
  };

  const startRecording = () => {
    setIsRecording(true);

  };

  const stopRecording = () => {
    setIsRecording(false);

  };

  const drawVirtualGarmentsWithPose = (ctx, poseData) => {
    if (!poseData.keypoints || !poseData.measurements) return;

    Object.entries(mixAndMatch).forEach(([category, product]) => {
      if (product && category !== 'accessories') {

        const measurements = poseData.measurements;
        
        if (category === 'top' || category === 'shirt') {
          drawUpperBodyGarment(ctx, product, poseData.keypoints, measurements);
        } else if (category === 'bottom' || category === 'pants') {
          drawLowerBodyGarment(ctx, product, poseData.keypoints, measurements);
        }
      }
    });

    if (mixAndMatch.accessories) {
      mixAndMatch.accessories.forEach(accessory => {
        drawAccessory(ctx, accessory, poseData.keypoints);
      });
    }
  };

  const drawUpperBodyGarment = (ctx, product, keypoints, measurements) => {
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const rightHip = keypoints.find(kp => kp.name === 'right_hip');

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return;

    const shoulderWidth = measurements.shoulderWidth || Math.abs(rightShoulder.x - leftShoulder.x);
    const torsoLength = measurements.torsoLength || Math.abs(leftHip.y - leftShoulder.y);

    ctx.fillStyle = product.color || 'rgba(100, 100, 200, 0.5)';
    ctx.fillRect(
      leftShoulder.x,
      leftShoulder.y,
      shoulderWidth,
      torsoLength
    );

    if (product.imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = product.imageUrl;
      img.onload = () => {
        ctx.globalAlpha = 0.7;
        ctx.drawImage(
          img,
          leftShoulder.x,
          leftShoulder.y,
          shoulderWidth,
          torsoLength
        );
        ctx.globalAlpha = 1.0;
      };
    }
  };

  const drawLowerBodyGarment = (ctx, product, keypoints, measurements) => {
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const rightHip = keypoints.find(kp => kp.name === 'right_hip');
    const leftAnkle = keypoints.find(kp => kp.name === 'left_ankle');

    if (!leftHip || !rightHip || !leftAnkle) return;

    const hipWidth = measurements.hipWidth || Math.abs(rightHip.x - leftHip.x);
    const legLength = measurements.legLength || Math.abs(leftAnkle.y - leftHip.y);

    ctx.fillStyle = product.color || 'rgba(100, 150, 200, 0.5)';
    ctx.fillRect(
      leftHip.x,
      leftHip.y,
      hipWidth,
      legLength
    );

    if (product.imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = product.imageUrl;
      img.onload = () => {
        ctx.globalAlpha = 0.7;
        ctx.drawImage(
          img,
          leftHip.x,
          leftHip.y,
          hipWidth,
          legLength
        );
        ctx.globalAlpha = 1.0;
      };
    }
  };

  const drawAccessory = (ctx, accessory, keypoints) => {
    const nose = keypoints.find(kp => kp.name === 'nose');
    if (!nose) return;

    if (accessory.category === 'hat' || accessory.category === 'cap') {
      ctx.fillStyle = accessory.color || 'rgba(200, 100, 100, 0.6)';
      ctx.fillRect(nose.x - 50, nose.y - 100, 100, 50);
    }
  };

  const drawVirtualGarments = (ctx) => {
    Object.entries(mixAndMatch).forEach(([category, product]) => {
      if (product && category !== 'accessories') {
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

    mixAndMatch.accessories.forEach((accessory, index) => {
      ctx.fillStyle = accessory.color || '#333';
      ctx.globalAlpha = 0.8;

      ctx.fillRect(50 + index * 30, 100, 25, 25);
      ctx.globalAlpha = 1;
    });
  };

  const cleanup = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    enhancedPoseDetection.dispose?.();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setStatus('idle');
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
          {}
          <div className="flex-1 relative">
            {}
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

            {}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ mixBlendMode: 'multiply' }}
            />

            {}
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

            {}
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

                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-xs font-mono">
                  Status: {status}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLiteMode(!liteMode)}
                  className={`p-3 rounded-full transition-all ${liteMode ? 'bg-yellow-400 text-black' : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'}`}
                  title="Lite mode disables pose overlays if performance is poor"
                >
                  {liteMode ? 'Lite' : 'Live'}
                </button>

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

            {}
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

          {}
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

                  {}
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

                  {}
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

                  {}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Gesture Controls</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Pinch to scale garments</li>
                      <li>• Drag to reposition</li>
                      <li>• Rotate with two fingers</li>
                      <li>• Tap to select/deselect</li>
                    </ul>
                  </div>

                  {}
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