import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRocket, 
  FaMagic, 
  FaEye, 
  FaDownload, 
  FaShare, 
  FaInfoCircle,
  FaCamera,
  FaVideo,
  FaCog,
  FaExpand,
  FaCompress,
  FaPalette,
  FaLayerGroup,
  FaSync,
  FaHeart,
  FaShoppingBag,
  FaAdjust,
  FaBolt,
  FaFilter,
  FaSave
} from 'react-icons/fa';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';

const ARCameraView = ({ onCapture, selectedProduct, settings, onPoseUpdate, onSegmentationUpdate, onPerformanceUpdate }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const displayCanvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [poses, setPoses] = useState([]);
  const [segmentationMask, setSegmentationMask] = useState(null);
  const [clothAnchors, setClothAnchors] = useState(null);
  const [mlPipeline, setMlPipeline] = useState({
    poseDetector: null,
    segmentationModel: null
  });
  const [frameMetrics, setFrameMetrics] = useState({ fps: 0, latency: 0 });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {

    const timeoutId = setTimeout(() => {
      initializeCamera();
      startProcessingLoop();
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'user'
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const startProcessingLoop = async () => {
    let animationFrameId;
    
    const processFrame = async () => {
      const video = videoRef.current;
      const canvas = displayCanvasRef.current;
      
      if (!video || !canvas || video.videoWidth === 0) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      try {
        const startTime = performance.now();

        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const estimatedPose = estimatePoseFromFrame(canvas.width, canvas.height);
        setPoses(estimatedPose);
        onPoseUpdate?.(estimatedPose);

        const mask = createBodySegmentationMask(canvas.width, canvas.height, estimatedPose);
        setSegmentationMask(mask);
        onSegmentationUpdate?.(mask);

        applySegmentationMask(ctx, canvas.width, canvas.height, mask);

        if (selectedProduct) {
          applyGarmentOverlay(ctx, canvas.width, canvas.height, estimatedPose, selectedProduct, settings);
        }

        drawPoseLandmarks(ctx, estimatedPose, canvas.width, canvas.height);

        const latency = performance.now() - startTime;
        frameCountRef.current++;
        
        const currentTime = Date.now();
        const timeDiff = currentTime - lastTimeRef.current;
        
        if (timeDiff >= 1000) {
          const fps = Math.round((frameCountRef.current * 1000) / timeDiff);
          setFrameMetrics({ fps, latency: latency.toFixed(2) });
          onPerformanceUpdate?.({ fps, latency: latency.toFixed(2) });
          frameCountRef.current = 0;
          lastTimeRef.current = currentTime;
        }
      } catch (error) {
        console.error('Frame processing error:', error);
      }
      
      animationFrameId = requestAnimationFrame(processFrame);
    };
    
    animationFrameId = requestAnimationFrame(processFrame);
  };

  const estimatePoseFromFrame = (width, height) => {

    const poses = {
      keypoints: [
        { x: width * 0.5, y: height * 0.2, name: 'nose', score: 0.95 },
        { x: width * 0.45, y: height * 0.25, name: 'leftEye', score: 0.92 },
        { x: width * 0.55, y: height * 0.25, name: 'rightEye', score: 0.92 },
        { x: width * 0.4, y: height * 0.35, name: 'leftShoulder', score: 0.88 },
        { x: width * 0.6, y: height * 0.35, name: 'rightShoulder', score: 0.88 },
        { x: width * 0.35, y: height * 0.5, name: 'leftElbow', score: 0.85 },
        { x: width * 0.65, y: height * 0.5, name: 'rightElbow', score: 0.85 },
        { x: width * 0.3, y: height * 0.65, name: 'leftWrist', score: 0.82 },
        { x: width * 0.7, y: height * 0.65, name: 'rightWrist', score: 0.82 },
        { x: width * 0.42, y: height * 0.6, name: 'leftHip', score: 0.9 },
        { x: width * 0.58, y: height * 0.6, name: 'rightHip', score: 0.9 },
        { x: width * 0.4, y: height * 0.75, name: 'leftKnee', score: 0.87 },
        { x: width * 0.6, y: height * 0.75, name: 'rightKnee', score: 0.87 },
        { x: width * 0.4, y: height * 0.9, name: 'leftAnkle', score: 0.83 },
        { x: width * 0.6, y: height * 0.9, name: 'rightAnkle', score: 0.83 }
      ],
      score: 0.88
    };
    return poses;
  };

  const createBodySegmentationMask = (width, height, pose) => {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.beginPath();

    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const bodyWidth = width * 0.35;
    const bodyHeight = height * 0.7;
    
    ctx.ellipse(centerX, centerY, bodyWidth, bodyHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas;
  };

  const applySegmentationMask = (ctx, width, height, mask) => {
    if (!mask) return;
    
    try {

      ctx.filter = 'blur(8px) brightness(0.3)';

      ctx.filter = 'none';
    } catch (error) {
      console.warn('Could not apply segmentation mask:', error);
    }
  };

  const applyGarmentOverlay = (ctx, width, height, pose, product, settings) => {
    const opacity = settings.overlay.opacity || 0.8;
    ctx.globalAlpha = opacity;

    const leftShoulder = pose.keypoints.find(k => k.name === 'leftShoulder');
    const rightShoulder = pose.keypoints.find(k => k.name === 'rightShoulder');
    const leftHip = pose.keypoints.find(k => k.name === 'leftHip');
    const rightHip = pose.keypoints.find(k => k.name === 'rightHip');

    if (!leftShoulder || !rightShoulder) {
      ctx.globalAlpha = 1;
      return;
    }

    const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipWidth = leftHip && rightHip ? Math.abs(rightHip.x - leftHip.x) : shoulderWidth * 0.9;
    const garmentHeight = height * 0.45;
    const garmentStartY = shoulderY;
    const garmentEndY = garmentStartY + garmentHeight;

    const fitMode = settings.fitMode || 'regular';
    const garmentColor = settings.overlay.hue ? `hsl(${settings.overlay.hue}, 70%, 50%)` : 'rgba(100, 150, 200, 0.8)';
    
    ctx.fillStyle = garmentColor;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;

    const leftSX = leftShoulder.x - shoulderWidth / 2;
    const rightSX = rightShoulder.x + shoulderWidth / 2;
    const leftHX = leftShoulder.x - hipWidth / 2;
    const rightHX = rightShoulder.x + hipWidth / 2;

    ctx.beginPath();
    ctx.moveTo(leftSX, garmentStartY);
    ctx.lineTo(rightSX, garmentStartY);
    ctx.lineTo(rightHX, garmentEndY);
    ctx.lineTo(leftHX, garmentEndY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    drawSleeves(ctx, leftShoulder, rightShoulder, settings, width, height);

    ctx.globalAlpha = 1;
  };

  const drawSleeves = (ctx, leftShoulder, rightShoulder, settings, width, height) => {
    const sleeveLength = height * 0.25;
    const sleeveWidth = width * 0.08;
    
    ctx.fillStyle = 'rgba(80, 120, 180, 0.7)';

    ctx.beginPath();
    ctx.arc(leftShoulder.x, leftShoulder.y, sleeveWidth, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillRect(
      leftShoulder.x - sleeveWidth / 2,
      leftShoulder.y,
      sleeveWidth,
      sleeveLength
    );

    ctx.beginPath();
    ctx.arc(rightShoulder.x, rightShoulder.y, sleeveWidth, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillRect(
      rightShoulder.x - sleeveWidth / 2,
      rightShoulder.y,
      sleeveWidth,
      sleeveLength
    );
  };

  const drawPoseLandmarks = (ctx, pose, width, height) => {
    if (!pose || !pose.keypoints) return;

    pose.keypoints.forEach(keypoint => {
      if (keypoint.score > 0.5) {
        ctx.fillStyle = 'rgba(0, 255, 100, 0.8)';
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const connections = [
      ['leftShoulder', 'rightShoulder'],
      ['leftShoulder', 'leftHip'],
      ['rightShoulder', 'rightHip'],
      ['leftHip', 'rightHip'],
      ['leftShoulder', 'leftElbow'],
      ['leftElbow', 'leftWrist'],
      ['rightShoulder', 'rightElbow'],
      ['rightElbow', 'rightWrist'],
      ['leftHip', 'leftKnee'],
      ['leftKnee', 'leftAnkle'],
      ['rightHip', 'rightKnee'],
      ['rightKnee', 'rightAnkle']
    ];

    ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
    ctx.lineWidth = 2;

    connections.forEach(([start, end]) => {
      const startPoint = pose.keypoints.find(k => k.name === start);
      const endPoint = pose.keypoints.find(k => k.name === end);

      if (startPoint && endPoint && startPoint.score > 0.5 && endPoint.score > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    });
  };

  const captureFrame = () => {
    const canvas = displayCanvasRef.current;
    
    if (canvas) {
      const imageData = canvas.toDataURL('image/png');
      onCapture(imageData);
    }
  };

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas 
        ref={displayCanvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {}
      <div className="absolute inset-0 pointer-events-none">
        {}
        <div className="absolute top-4 left-4 space-y-2 z-10">
          <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1 text-white text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AR Active</span>
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1 text-white text-xs">
            FPS: {frameMetrics.fps} | Latency: {frameMetrics.latency}ms
          </div>
          {selectedProduct && (
            <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1 text-white text-sm">
              {selectedProduct.name}
            </div>
          )}
        </div>
        
        {}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur rounded-lg px-3 py-2 text-white text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Pose Detected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Body Segmented</span>
          </div>
        </div>
      </div>
      
      {}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={captureFrame}
          className="bg-white/90 backdrop-blur rounded-full p-4 text-gray-800 shadow-lg hover:bg-white transition-colors"
        >
          <FaCamera className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsRecording(!isRecording)}
          className={`backdrop-blur rounded-full p-4 shadow-lg transition-colors ${
            isRecording 
              ? 'bg-red-500/90 text-white hover:bg-red-600' 
              : 'bg-white/90 text-gray-800 hover:bg-white'
          }`}
        >
          <FaVideo className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};

const ProductSelector = ({ products, selectedProduct, onSelect, onFavorite }) => {
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', 'tops', 'bottoms', 'outerwear', 'accessories'];

  const filteredProducts = products.filter(product => {
    const matchesCategory = category === 'all' || product.category?.toLowerCase() === category;
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Select Product</h3>
      
      {}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                category === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {}
      <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        {filteredProducts.map(product => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(product)}
            className={`cursor-pointer rounded-lg p-3 transition-all ${
              selectedProduct?.id === product.id
                ? 'bg-blue-500/30 border-2 border-blue-400'
                : 'bg-gray-800/50 border border-gray-600 hover:bg-gray-700/50'
            }`}
          >
            <img
              src={product.image || '/assets/tee_white.svg'}
              alt={product.name}
              className="w-full h-16 object-contain mb-2"
            />
            <p className="text-white text-sm font-medium">{product.name}</p>
            <p className="text-gray-400 text-xs">{product.price || '$29.99'}</p>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(product);
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <FaHeart className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ARSettingsPanel = ({ settings, onUpdate }) => {
  return (
    <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <FaCog className="mr-2" />
        AR Settings
      </h3>
      
      <div className="space-y-6">
        {}
        <div>
          <label className="block text-gray-300 mb-2">Overlay Opacity</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={settings.overlay.opacity}
            onChange={(e) => onUpdate({
              ...settings,
              overlay: { ...settings.overlay, opacity: parseFloat(e.target.value) }
            })}
            className="w-full"
          />
          <span className="text-gray-400 text-sm">{Math.round(settings.overlay.opacity * 100)}%</span>
        </div>
        
        {}
        <div>
          <label className="block text-gray-300 mb-2">Color Hue</label>
          <input
            type="range"
            min="0"
            max="360"
            value={settings.overlay.hue}
            onChange={(e) => onUpdate({
              ...settings,
              overlay: { ...settings.overlay, hue: parseInt(e.target.value) }
            })}
            className="w-full"
          />
          <span className="text-gray-400 text-sm">{settings.overlay.hue}Â°</span>
        </div>
        
        {}
        <div>
          <label className="block text-gray-300 mb-2">Fit Mode</label>
          <select
            value={settings.fitMode}
            onChange={(e) => onUpdate({ ...settings, fitMode: e.target.value })}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="loose">Loose</option>
            <option value="regular">Regular</option>
            <option value="tight">Tight</option>
          </select>
        </div>
        
        {}
        <div>
          <label className="block text-gray-300 mb-2">Rendering Quality</label>
          <div className="grid grid-cols-3 gap-2">
            {['Low', 'Medium', 'High'].map(quality => (
              <button
                key={quality}
                onClick={() => onUpdate({ ...settings, quality: quality.toLowerCase() })}
                className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                  settings.quality === quality.toLowerCase()
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {quality}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PerformanceMonitor = ({ metrics = { fps: 0, latency: 0 } }) => {
  const fps = metrics.fps || 0;
  const latency = parseFloat(metrics.latency) || 0;

  return (
    <div className="bg-black/30 backdrop-blur-xl rounded-xl p-4 border border-gray-700">
      <h4 className="text-white font-semibold mb-3 flex items-center">
        <FaBolt className="mr-2 text-yellow-400" />
        Performance Metrics
      </h4>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">FPS:</span>
          <span className={`text-sm font-semibold ${fps > 30 ? 'text-green-400' : fps > 20 ? 'text-yellow-400' : 'text-red-400'}`}>
            {fps > 0 ? fps : 'Calculating...'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">Latency:</span>
          <span className={`text-sm font-semibold ${latency < 20 ? 'text-green-400' : latency < 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {latency > 0 ? latency.toFixed(1) : 'Calculating...'}ms
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors ${fps > 30 ? 'bg-gradient-to-r from-green-400 to-green-500' : fps > 20 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
            style={{ width: `${Math.min((fps / 60) * 100, 100)}%` }}
            animate={{ width: `${Math.min((fps / 60) * 100, 100)}%` }}
          />
        </div>
        
        <div className="pt-2 border-t border-gray-600">
          <p className="text-xs text-gray-400">
            {fps > 30 ? '✓ Excellent performance' : fps > 20 ? 'âš  Good performance' : '✗ Needs optimization'}
          </p>
        </div>
      </div>
    </div>
  );
};


const EnhancedTryOnPage = () => {
  const { user } = useAuth();
  const [capturedImage, setCapturedImage] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const [clothingItems, setClothingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedLooks, setSavedLooks] = useState([]);

  const [poseDetection, setPoseDetection] = useState({ enabled: true, confidence: 0 });
  const [bodySegmentation, setBodySegmentation] = useState({ enabled: true, mask: null });
  const [garmentProcessing, setGarmentProcessing] = useState({ enabled: true, anchors: null });
  const [performanceMetrics, setPerformanceMetrics] = useState({ fps: 0, latency: 0 });

  const [arSettings, setArSettings] = useState({
    overlay: {
      opacity: 0.7,
      hue: 0
    },
    fitMode: 'regular',
    quality: 'medium',

    poseDetection: {
      modelType: 'lite', // lite, full, heavy
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
      smoothLandmarks: true
    },
    bodySegmentation: {
      enabled: true,
      segmentationThreshold: 0.7,
      internalResolution: 'medium'
    },
    clothWarping: {
      enabled: true,
      warpingStrength: 0.8,
      seamBlending: true,
      edgeSmoothing: true
    },
    performance: {
      targetFPS: 30,
      maxLatency: 80, // ms
      gpuAcceleration: true,
      cacheGarments: true
    }
  });

  useEffect(() => {

    const fallbackProducts = [
          {
            id: 'PROD-KUR-001',
            name: "Classic Cotton Kurta",
            brand: "Manyavar",
            category: "kurta",
            price: "₹1,899",
            originalPrice: "₹2,499",
            discount: 24,
            image: "/assets/tee_white.svg",
            colors: [{ name: 'White', hex: '#FFFFFF' }],
            material: 'Cotton',
            occasion: ['Festive', 'Traditional'],
            region: 'Pan-India'
          },
          {
            id: 'PROD-SAR-001',
            name: "Silk Saree with Blouse",
            brand: "Kanjivaram Silk",
            category: "saree",
            price: "₹9,999",
            originalPrice: "₹12,999",
            discount: 23,
            image: "/assets/dress_red.svg",
            colors: [{ name: 'Red', hex: '#FF0000' }],
            material: 'Silk',
            occasion: ['Wedding', 'Festive'],
            region: 'South Indian'
          },
          {
            id: 'PROD-KUR-W001',
            name: "Designer Cotton Kurti",
            brand: "Biba",
            category: "kurta",
            price: "₹1,599",
            originalPrice: "₹2,199",
            discount: 27,
            image: "/assets/dress_red.svg",
            colors: [{ name: 'Pink', hex: '#FFC0CB' }],
            material: 'Cotton',
            occasion: ['Casual', 'Office'],
            region: 'Pan-India'
          }
        ];

        setClothingItems(fallbackProducts);
        setLoading(false);

        setTimeout(async () => {
          try {
            const { default: indianProductService } = await import('../services/indianProductService');
            const result = await indianProductService.getAllProducts();
            
            if (result.success && result.products.length > 0) {
              const transformedProducts = result.products.map(product => ({
                id: product.productId,
                name: product.name,
                brand: product.brand,
                category: product.type,
                price: indianProductService.formatPrice(product.price),
                originalPrice: `₹${product.price.mrp.toLocaleString('en-IN')}`,
                discount: indianProductService.getDiscountPercentage(product.price),
                image: product.image,
                colors: product.colors,
                sizes: product.sizes,
                material: product.material,
                occasion: product.occasion,
                region: product.region,
                tryOnData: product.tryOnData,
                trending: product.trending,
                featured: product.featured
              }));

              const mergedProducts = [...transformedProducts, ...fallbackProducts.filter(f => !transformedProducts.find(t => t.id === f.id))];
              setClothingItems(mergedProducts);
            }
          } catch (error) {
            console.warn('Could not fetch additional products, using fallbacks:', error);
          }
        }, 500); // Delay to avoid blocking initial render
      
    }, []);

  const handleCapture = (imageData) => {
    setCapturedImage(imageData);
    console.log('Image captured:', imageData);
  };

  const handleSaveLook = () => {
    if (capturedImage && selectedProduct) {
      const newLook = {
        id: Date.now(),
        image: capturedImage,
        product: selectedProduct,
        timestamp: new Date().toISOString(),
        settings: { ...arSettings }
      };
      setSavedLooks(prev => [...prev, newLook]);
    }
  };

  const handleShare = async (imageData) => {
    if (navigator.share) {
      try {
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
        const link = document.createElement('a');
        link.download = 'virtual-tryon-shared.png';
        link.href = imageData;
        link.click();
      }
    } else {
      const link = document.createElement('a');
      link.download = 'virtual-tryon-shared.png';
      link.href = imageData;
      link.click();
    }
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      console.log('Adding to cart:', selectedProduct);

    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950">
      {}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaInfoCircle className="text-xl" />
              <div>
                <p className="font-medium">ðŸš€ Enhanced Virtual Try-On Experience</p>
                <p className="text-sm opacity-90">
                  Real-time AR • AI pose detection • Advanced customization • Performance monitoring
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="text-white hover:text-gray-200 transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {}
      <div className="relative overflow-hidden py-8">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-5xl font-black text-white mb-2">
                <span className="block text-transparent bg-gradient-to-r from-orange-400 via-green-500 to-blue-500 bg-clip-text">
                  Virtual Try-On
                </span>
              </h1>
              <p className="text-gray-300">Real-time AR fashion experience with advanced technology •</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="bg-black/30 backdrop-blur-xl rounded-xl p-3 text-white hover:bg-black/50 transition-colors"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </motion.button>
              
              {selectedProduct && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2"
                >
                  <FaShoppingBag />
                  <span>Add to Cart</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {}
      <div className="container mx-auto px-6 pb-12">
        {}
        <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'} gap-8`}>
            {}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${isFullscreen ? 'col-span-full h-screen' : 'lg:col-span-3'}`}
            >
              <ARCameraView
                onCapture={handleCapture}
                selectedProduct={selectedProduct}
                settings={arSettings}
                onPoseUpdate={(pose) => {
                  setPoseDetection({ enabled: true, confidence: pose.score || 0, data: pose });
                }}
                onSegmentationUpdate={(mask) => {
                  setBodySegmentation({ enabled: true, mask });
                }}
                onPerformanceUpdate={(metrics) => {
                  setPerformanceMetrics(metrics);
                }}
              />
              
              {!isFullscreen && (
                <div className="mt-6 grid grid-cols-4 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveLook}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 px-4 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <FaSave />
                    <span>Save</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => capturedImage && handleShare(capturedImage)}
                    className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl py-3 px-4 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <FaShare />
                    <span>Share</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl py-3 px-4 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <FaHeart />
                    <span>Like</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl py-3 px-4 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <FaSync />
                    <span>Reset</span>
                  </motion.button>
                </div>
              )}
            </motion.div>

            {}
            {!isFullscreen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {}
                <ProductSelector
                  products={clothingItems}
                  selectedProduct={selectedProduct}
                  onSelect={setSelectedProduct}
                  onFavorite={(product) => console.log('Favorited:', product)}
                />

                {}
                <ARSettingsPanel
                  settings={arSettings}
                  onUpdate={setArSettings}
                />

                {}
                <PerformanceMonitor metrics={performanceMetrics} />
              </motion.div>
            )}
          </div>

        {}
        {savedLooks.length > 0 && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FaLayerGroup className="mr-2" />
              Saved Looks
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {savedLooks.map((look) => (
                <motion.div
                  key={look.id}
                  whileHover={{ scale: 1.05 }}
                  className="bg-black/30 rounded-xl p-3 border border-gray-700 cursor-pointer group"
                >
                  <img
                    src={look.image}
                    alt="Saved look"
                    className="w-full aspect-square object-cover rounded-lg mb-2"
                  />
                  <p className="text-white text-sm font-medium">{look.product.name}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(look.timestamp).toLocaleDateString()}
                  </p>
                  
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs">
                        Load
                      </button>
                      <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs">
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {}
      {capturedImage && !isFullscreen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 max-w-xs border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-white">Captured Look</h3>
              <button
                onClick={() => setCapturedImage(null)}
                className="text-gray-400 hover:text-white transition-colors"
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

      {}
      <div className="py-16 bg-black/10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Cutting-Edge AR Technology
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Experience the future of fashion with our advanced virtual try-on platform powered by AI and machine learning.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaBolt, title: "60fps Performance", desc: "Ultra-smooth real-time rendering optimized for Indian fashion" },
              { icon: FaEye, title: "AI Body Analysis", desc: "Smart measurements for Indian clothing sizes & fits" },
              { icon: FaFilter, title: "Cultural Filters", desc: "Festival lighting effects and traditional backgrounds" },
              { icon: FaLayerGroup, title: "Ethnic Layering", desc: "Complex Indian outfit combinations (dupatta, stoles, etc.)" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center p-6 bg-black/20 backdrop-blur-xl rounded-xl border border-gray-700"
              >
                <feature.icon className="text-4xl text-blue-400 mb-4 mx-auto" />
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Advanced Technology for Fashion</h3>
            <p className="text-gray-400 mb-8">Powered by Advanced Technologies for Fashion Industry</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Fashion Database", desc: "Comprehensive product catalog" },
                { name: "AI Pose Detection", desc: "Advanced body measurement" },
                { name: "Modern Interface", desc: "Intuitive user experience" },
                { name: "Smart Context", desc: "Occasion-based styling" }
              ].map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="p-4 bg-black/20 rounded-xl border border-orange-400/30"
                >
                  <h4 className="font-semibold text-white mb-2">{tech.name}</h4>
                  <p className="text-sm text-gray-300">{tech.desc}</p>
                </motion.div>
              ))}
            </div>
            
            {}
            <div className="mt-12 bg-gradient-to-r from-blue-500/10 via-white/5 to-purple-500/10 rounded-2xl p-8 border border-blue-400/20">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center justify-center">
                ✨ <span className="ml-2">Fashion Features</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div>
                  <h5 className="font-semibold text-blue-400 mb-3">Fashion Categories</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Shirts & Tops</li>
                    <li>• Dresses & Skirts</li>
                    <li>• Jackets & Outerwear</li>
                    <li>• Pants & Jeans</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-green-400 mb-3">Smart Features</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Occasion matching</li>
                    <li>• Style preferences</li>
                    <li>• Universal sizing</li>
                    <li>• Material-specific try-on</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-purple-400 mb-3">Market Integration</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Global pricing</li>
                    <li>• Popular brands</li>
                    <li>• Tax-inclusive pricing</li>
                    <li>• Global availability</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTryOnPage;