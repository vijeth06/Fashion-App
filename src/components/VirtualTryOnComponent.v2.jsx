

import React, { useReducer, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCamera, 
  FaUpload, 
  FaPlay, 
  FaStop, 
  FaDownload, 
  FaShare,
  FaCog,
  FaTshirt,
  FaRedo,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';

import WebcamComponent from './WebcamComponent';
import PhotoUploadComponent from './PhotoUploadComponent';
import PoseDetectionService from '../services/PoseDetectionService.v2';
import ClothingOverlaySystem from '../services/ClothingOverlaySystem.v2';
import ExportService from '../services/ExportService.v2';


const initialState = {

  mode: 'webcam', // 'webcam' | 'upload'

  status: 'idle', // 'idle' | 'initializing' | 'ready' | 'active' | 'error'
  initializationStep: null,

  poseData: null,
  poseConfidence: 0,

  selectedClothing: [],

  uploadedImage: null,

  fps: 0,
  isRealTime: false,

  settings: {
    showKeypoints: false,
    showPerformanceStats: true,
    poseDetection: true,
    realTimeTracking: true,
    clothingOpacity: 0.85,
    autoRetry: true
  },

  error: null,
  errorType: null, // 'initialization' | 'detection' | 'upload' | 'export'
  retryCount: 0,

  showSettings: false,
  capturedImage: null
};

function tryOnReducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        error: null
      };

    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload.status,
        initializationStep: action.payload.step || state.initializationStep,
        error: action.payload.status === 'error' ? state.error : null
      };

    case 'INITIALIZATION_STEP':
      return {
        ...state,
        initializationStep: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload.message,
        errorType: action.payload.type,
        retryCount: action.payload.resetRetry ? 0 : state.retryCount
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        errorType: null
      };

    case 'INCREMENT_RETRY':
      return {
        ...state,
        retryCount: state.retryCount + 1
      };

    case 'UPDATE_POSE':
      return {
        ...state,
        poseData: action.payload.poseData,
        poseConfidence: action.payload.confidence,
        error: null
      };

    case 'UPDATE_FPS':
      return {
        ...state,
        fps: action.payload,
        isRealTime: action.payload >= 15
      };

    case 'ADD_CLOTHING':
      return {
        ...state,
        selectedClothing: [...state.selectedClothing, action.payload]
      };

    case 'REMOVE_CLOTHING':
      return {
        ...state,
        selectedClothing: state.selectedClothing.filter(
          item => item.id !== action.payload
        )
      };

    case 'CLEAR_CLOTHING':
      return {
        ...state,
        selectedClothing: []
      };

    case 'SET_UPLOADED_IMAGE':
      return {
        ...state,
        uploadedImage: action.payload,
        error: null
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    case 'TOGGLE_SETTINGS':
      return {
        ...state,
        showSettings: !state.showSettings
      };

    case 'SET_CAPTURED_IMAGE':
      return {
        ...state,
        capturedImage: action.payload
      };

    case 'RESET':
      return {
        ...initialState,
        settings: state.settings
      };

    default:
      return state;
  }
}


const VirtualTryOnComponent = ({
  clothingItems = [],
  onCapture,
  onShare,
  className = ''
}) => {
  const [state, dispatch] = useReducer(tryOnReducer, initialState);

  const poseServiceRef = useRef(null);
  const overlaySystemRef = useRef(null);
  const exportServiceRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const cleanupRef = useRef([]);

  
  const initializeServices = useCallback(async () => {
    if (state.status === 'initializing') {
      console.warn('Already initializing...');
      return false;
    }

    dispatch({ type: 'SET_STATUS', payload: { status: 'initializing', step: 'Starting...' } });

    try {

      dispatch({ type: 'INITIALIZATION_STEP', payload: 'Initializing AI pose detection...' });
      
      if (!poseServiceRef.current) {
        poseServiceRef.current = new PoseDetectionService({
          modelComplexity: 0,
          minDetectionConfidence: 0.6,
          maxFPS: 30
        });

        poseServiceRef.current
          .onPoseDetected((poseData) => {
            dispatch({
              type: 'UPDATE_POSE',
              payload: {
                poseData,
                confidence: poseData.confidence
              }
            });
            
            if (overlaySystemRef.current) {
              overlaySystemRef.current.updatePose(poseData);
            }
          })
          .onFPSUpdate((fps) => {
            dispatch({ type: 'UPDATE_FPS', payload: fps });
          })
          .onError((error) => {
            console.error('Pose detection error:', error);
            dispatch({
              type: 'SET_ERROR',
              payload: {
                message: `Pose detection error: ${error.message}`,
                type: 'detection'
              }
            });
          })
          .onInitialized((runtime) => {
            console.log(`Pose detection initialized with ${runtime}`);
          });

        const initialized = await poseServiceRef.current.initialize();
        
        if (!initialized) {
          throw new Error('Failed to initialize pose detection');
        }
      }

      dispatch({ type: 'INITIALIZATION_STEP', payload: 'Setting up clothing overlay...' });
      
      if (canvasRef.current && !overlaySystemRef.current) {
        overlaySystemRef.current = new ClothingOverlaySystem(canvasRef.current, {
          targetFPS: 30
        });

        overlaySystemRef.current.startRealTimeRendering();
      }

      if (!exportServiceRef.current) {
        exportServiceRef.current = new ExportService();
      }

      dispatch({ type: 'SET_STATUS', payload: { status: 'ready' } });
      dispatch({ type: 'CLEAR_ERROR' });
      
      return true;

    } catch (error) {
      console.error('Service initialization error:', error);
      
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: `Initialization failed: ${error.message}`,
          type: 'initialization',
          resetRetry: false
        }
      });
      
      dispatch({ type: 'SET_STATUS', payload: { status: 'error' } });
      
      return false;
    }
  }, [state.status]);

  
  const retryInitialization = useCallback(async () => {
    const maxRetries = 3;
    const backoffMs = Math.min(1000 * Math.pow(2, state.retryCount), 8000);

    if (state.retryCount >= maxRetries) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: 'Failed to initialize after multiple attempts. Please refresh the page.',
          type: 'initialization'
        }
      });
      return false;
    }

    dispatch({ type: 'INCREMENT_RETRY' });
    
    console.log(`Retrying initialization (attempt ${state.retryCount + 1}/${maxRetries}) in ${backoffMs}ms...`);
    
    await new Promise(resolve => setTimeout(resolve, backoffMs));
    
    return initializeServices();
  }, [state.retryCount, initializeServices]);

  
  const startTryOn = useCallback(async () => {
    try {
      console.log('Starting try-on, current status:', state.status, 'mode:', state.mode);

      if (state.status !== 'ready' && state.status !== 'active') {
        console.log('Initializing services first...');
        const initialized = await initializeServices();
        if (!initialized) {
          console.error('Failed to initialize services');
          return;
        }
      }

      console.log('Services ready, activating try-on...');
      dispatch({ type: 'SET_STATUS', payload: { status: 'active' } });

      if (state.mode === 'webcam') {
        console.log('Webcam mode - waiting for video to be ready');

        
        if (videoRef.current && poseServiceRef.current) {
          console.log('Video already ready, starting detection immediately');
          try {
            await poseServiceRef.current.startDetection(videoRef.current);
          } catch (error) {
            console.error('Failed to start detection:', error);
            dispatch({
              type: 'SET_ERROR',
              payload: {
                message: `Failed to start pose detection: ${error.message}`,
                type: 'detection'
              }
            });
          }
        }
        
      } else if (state.mode === 'upload') {
        console.log('Upload mode - analyzing image');
        if (!state.uploadedImage) {
          throw new Error('Please upload an image first');
        }

        const img = new Image();
        img.onload = async () => {
          try {
            console.log('Image loaded, starting pose detection...');
            await poseServiceRef.current.detectOnImage(img);
            console.log('Pose detection completed successfully');
          } catch (error) {
            console.error('Pose detection failed:', error);
            dispatch({
              type: 'SET_ERROR',
              payload: {
                message: 'Could not detect pose in the image. Please use a clear, full-body photo.',
                type: 'detection'
              }
            });
          }
        };
        img.onerror = () => {
          dispatch({
            type: 'SET_ERROR',
            payload: {
              message: 'Failed to load uploaded image',
              type: 'upload'
            }
          });
        };
        img.src = state.uploadedImage.data;
      }

    } catch (error) {
      console.error('Failed to start try-on:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: error.message,
          type: 'detection'
        }
      });
    }
  }, [state.mode, state.status, state.uploadedImage, initializeServices]);

  
  const stopTryOn = useCallback(() => {
    if (poseServiceRef.current) {
      poseServiceRef.current.stopDetection();
    }

    dispatch({ type: 'SET_STATUS', payload: { status: 'ready' } });
    dispatch({ type: 'UPDATE_POSE', payload: { poseData: null, confidence: 0 } });
  }, []);

  
  const handleVideoReady = useCallback(async (video) => {
    console.log('Video ready callback triggered');
    videoRef.current = video;

    if (canvasRef.current) {
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      
      console.log(`Setting canvas size to ${width}x${height}`);
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      if (overlaySystemRef.current) {
        overlaySystemRef.current.setCanvasSize(width, height);
      }
    }

    if (state.status === 'active' && poseServiceRef.current) {
      console.log('Starting pose detection on video...');
      try {
        await poseServiceRef.current.startDetection(video);
        console.log('Pose detection started successfully');
      } catch (error) {
        console.error('Failed to start detection:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: {
            message: `Failed to start pose detection: ${error.message}`,
            type: 'detection'
          }
        });
      }
    } else {
      console.log('Not starting detection yet - status:', state.status);
    }
  }, [state.status]);

  
  const handleImageUpload = useCallback((imageData, imageInfo) => {
    console.log('Image uploaded:', imageInfo);
    dispatch({
      type: 'SET_UPLOADED_IMAGE',
      payload: { data: imageData, info: imageInfo }
    });

    if (canvasRef.current) {
      console.log(`Setting canvas size to ${imageInfo.width}x${imageInfo.height} for uploaded image`);
      canvasRef.current.width = imageInfo.width;
      canvasRef.current.height = imageInfo.height;

      if (overlaySystemRef.current) {
        overlaySystemRef.current.setCanvasSize(imageInfo.width, imageInfo.height);
      }
    }

    if (state.status === 'idle') {
      console.log('Auto-initializing services after image upload...');
      initializeServices();
    }
  }, [state.status, initializeServices]);

  
  const addClothingItem = useCallback(async (item) => {
    if (!overlaySystemRef.current) {
      console.warn('Overlay system not initialized');
      return;
    }

    try {
      const itemId = await overlaySystemRef.current.addClothingItem(item);
      
      dispatch({
        type: 'ADD_CLOTHING',
        payload: { ...item, id: itemId }
      });

    } catch (error) {
      console.error('Failed to add clothing item:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: `Failed to add ${item.name}: ${error.message}`,
          type: 'detection'
        }
      });
    }
  }, []);

  
  const removeClothingItem = useCallback((itemId) => {
    if (overlaySystemRef.current) {
      overlaySystemRef.current.removeClothingItem(itemId);
    }
    dispatch({ type: 'REMOVE_CLOTHING', payload: itemId });
  }, []);

  
  const clearAllClothing = useCallback(() => {
    if (overlaySystemRef.current) {
      overlaySystemRef.current.clearAllItems();
    }
    dispatch({ type: 'CLEAR_CLOTHING' });
  }, []);

  
  const captureFrame = useCallback(async () => {
    if (!canvasRef.current || !exportServiceRef.current) {
      throw new Error('Services not initialized');
    }

    try {
      let baseCanvas = null;
      let baseVideo = null;

      if (state.mode === 'webcam') {
        baseVideo = videoRef.current;
      } else if (state.mode === 'upload' && state.uploadedImage) {

        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = state.uploadedImage.data;
        });

        const offscreen = document.createElement('canvas');
        offscreen.width = img.width;
        offscreen.height = img.height;
        const ctx = offscreen.getContext('2d');
        ctx.drawImage(img, 0, 0);
        baseCanvas = offscreen;
      }

      const dataURL = await exportServiceRef.current.exportTryOnImage({
        canvas: baseCanvas,
        videoElement: baseVideo,
        overlayCanvas: canvasRef.current,
        format: 'png',
        quality: 'high',
        watermark: false,
        metadata: {
          showOverlay: false,
          clothing: state.selectedClothing,
          timestamp: Date.now()
        }
      });

      dispatch({ type: 'SET_CAPTURED_IMAGE', payload: dataURL });

      if (onCapture) {
        onCapture(dataURL);
      }

      return dataURL;

    } catch (error) {
      console.error('Capture failed:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: `Failed to capture image: ${error.message}`,
          type: 'export'
        }
      });
      return null;
    }
  }, [state.mode, state.uploadedImage, state.selectedClothing, onCapture]);

  
  const downloadCapture = useCallback(async () => {
    try {
      const dataURL = await captureFrame();
      
      if (dataURL && exportServiceRef.current) {
        exportServiceRef.current.downloadImage(dataURL, `virtual-tryon-${Date.now()}.png`);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [captureFrame]);

  
  const shareCapture = useCallback(async () => {
    try {
      const dataURL = state.capturedImage || await captureFrame();
      
      if (dataURL && exportServiceRef.current) {
        await exportServiceRef.current.shareImage(dataURL, {
          title: 'Virtual Fashion Try-On',
          text: 'Check out my virtual try-on!'
        });

        if (onShare) {
          onShare(dataURL);
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: `Failed to share: ${error.message}`,
          type: 'export'
        }
      });
    }
  }, [state.capturedImage, captureFrame, onShare]);

  
  const updateSettings = useCallback((newSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  }, []);

  
  useEffect(() => {
    initializeServices();

    return () => {
      console.log('VirtualTryOnComponent: Cleaning up...');

      if (poseServiceRef.current) {
        poseServiceRef.current.dispose();
        poseServiceRef.current = null;
      }

      if (overlaySystemRef.current) {
        overlaySystemRef.current.dispose();
        overlaySystemRef.current = null;
      }

      cleanupRef.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      });
    };
  }, []); // Empty deps - only run once

  
  useEffect(() => {
    if (
      state.errorType === 'initialization' &&
      state.settings.autoRetry &&
      state.retryCount < 3
    ) {
      retryInitialization();
    }

  }, [state.errorType, state.settings.autoRetry, state.retryCount]);

  
  const clothingCategories = useMemo(() => {
    const categories = {
      tops: [],
      bottoms: [],
      dresses: [],
      accessories: []
    };

    clothingItems.forEach(item => {
      const category = item.category || 'accessories';
      if (categories[category]) {
        categories[category].push(item);
      }
    });

    return categories;
  }, [clothingItems]);

  
  const StatusIndicator = () => {
    if (state.status === 'initializing') {
      return (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <FaSpinner className="animate-spin" />
          <span>{state.initializationStep || 'Initializing...'}</span>
        </div>
      );
    }

    if (state.status === 'ready' || state.status === 'active') {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <FaCheckCircle />
          <span>AI Ready</span>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <FaExclamationTriangle />
          <span>Error</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`} role="main" aria-label="Virtual Fashion Try-On">
      {}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Virtual Fashion Try-On
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Experience realistic virtual fitting with AI-powered pose detection
        </p>
      </header>

      {}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  {state.errorType === 'initialization' && 'Initialization Error'}
                  {state.errorType === 'detection' && 'Detection Error'}
                  {state.errorType === 'upload' && 'Upload Error'}
                  {state.errorType === 'export' && 'Export Error'}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">{state.error}</p>
              </div>
              <div className="flex gap-2">
                {state.errorType === 'initialization' && state.retryCount < 3 && (
                  <button
                    onClick={retryInitialization}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    aria-label="Retry initialization"
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
                  className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-lg transition-colors"
                  aria-label="Dismiss error"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-2 flex" role="tablist">
          <button
            onClick={() => dispatch({ type: 'SET_MODE', payload: 'webcam' })}
            disabled={state.status === 'initializing'}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              state.mode === 'webcam'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50'
            }`}
            role="tab"
            aria-selected={state.mode === 'webcam'}
            aria-label="Live webcam try-on"
          >
            <FaCamera />
            Live Try-On
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_MODE', payload: 'upload' })}
            disabled={state.status === 'initializing'}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              state.mode === 'upload'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50'
            }`}
            role="tab"
            aria-selected={state.mode === 'upload'}
            aria-label="Upload photo try-on"
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
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {}
                  {state.mode === 'webcam' && (
                    <button
                      onClick={state.status === 'active' ? stopTryOn : startTryOn}
                      disabled={state.status === 'initializing' || state.status === 'error'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        state.status === 'active'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-label={state.status === 'active' ? 'Stop try-on' : 'Start try-on'}
                    >
                      {state.status === 'active' ? <FaStop /> : <FaPlay />}
                      {state.status === 'active' ? 'Stop' : 'Start'} Try-On
                    </button>
                  )}

                  {state.mode === 'upload' && state.uploadedImage && (
                    <button
                      onClick={startTryOn}
                      disabled={state.status === 'initializing' || state.status === 'active'}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-all disabled:opacity-50"
                      aria-label="Analyze uploaded photo"
                    >
                      <FaPlay />
                      Analyze Photo
                    </button>
                  )}

                  {}
                  <StatusIndicator />

                  {}
                  {state.poseData && state.status === 'active' && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Pose: {Math.round(state.poseConfidence * 100)}%
                    </div>
                  )}

                  {state.status === 'active' && !state.poseData && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      Searching for pose...
                    </div>
                  )}
                </div>

                {}
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadCapture}
                    disabled={state.status !== 'active' && !state.uploadedImage}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download image"
                    aria-label="Download image"
                  >
                    <FaDownload />
                  </button>
                  <button
                    onClick={shareCapture}
                    disabled={!state.capturedImage}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Share image"
                    aria-label="Share image"
                  >
                    <FaShare />
                  </button>
                  <button
                    onClick={clearAllClothing}
                    disabled={state.selectedClothing.length === 0}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Clear all clothing"
                    aria-label="Clear all clothing"
                  >
                    <FaRedo />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Settings"
                    aria-label="Settings"
                    aria-expanded={state.showSettings}
                  >
                    <FaCog />
                  </button>
                  <button
                    onClick={captureFrame}
                    disabled={state.status !== 'active' && !state.uploadedImage}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Capture full outfit preview"
                    aria-label="Capture full outfit"
                  >
                    <FaCamera />
                  </button>
                </div>
              </div>
            </div>

            {}
            <div className="relative bg-gray-900 min-h-[600px]" aria-live="polite">
              {state.mode === 'webcam' ? (
                <WebcamComponent
                  onVideoReady={handleVideoReady}
                  onError={(err) => dispatch({
                    type: 'SET_ERROR',
                    payload: { message: err.message, type: 'detection' }
                  })}
                  className="w-full h-full"
                />
              ) : (
                <div className="p-8">
                  {!state.uploadedImage ? (
                    <PhotoUploadComponent
                      onImageSelect={handleImageUpload}
                      onError={(err) => dispatch({
                        type: 'SET_ERROR',
                        payload: { message: err.message, type: 'upload' }
                      })}
                    />
                  ) : (
                    <div className="relative">
                      <img
                        src={state.uploadedImage.data}
                        alt="Uploaded for virtual try-on"
                        className="w-full max-h-96 object-contain mx-auto"
                      />
                      <button
                        onClick={() => dispatch({ type: 'SET_UPLOADED_IMAGE', payload: null })}
                        className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        aria-label="Remove uploaded image"
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
                style={{ mixBlendMode: 'normal' }}
                aria-label="Clothing overlay"
              />

              {}
              {state.settings.showKeypoints && state.poseData && (
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                  {Object.entries(state.poseData.keypoints).map(([joint, position]) => (
                    position.visibility > 0.4 && (
                      <div
                        key={joint}
                        className="absolute w-2 h-2 bg-green-400 rounded-full border border-white"
                        style={{
                          left: `${position.x}px`,
                          top: `${position.y}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        title={joint}
                      />
                    )
                  ))}
                </div>
              )}

              {}
              {state.settings.showPerformanceStats && state.status === 'active' && (
                <div 
                  className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm font-mono"
                  role="status"
                  aria-live="polite"
                  aria-label="Performance statistics"
                >
                  <div className={`flex items-center gap-2 mb-1 ${state.isRealTime ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${state.isRealTime ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    {state.isRealTime ? 'LIVE' : 'BUFFERING'}
                  </div>
                  <div className="space-y-1">
                    <div className={`${state.fps >= 20 ? 'text-green-400' : state.fps >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                      FPS: {state.fps}
                    </div>
                    <div className={`${state.poseConfidence >= 0.7 ? 'text-green-400' : state.poseConfidence >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      Confidence: {(state.poseConfidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {}
              <AnimatePresence>
                {state.status === 'initializing' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 flex items-center justify-center"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="text-center text-white">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"
                        aria-hidden="true"
                      />
                      <p className="text-lg font-medium">{state.initializationStep || 'Initializing...'}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {}
            <AnimatePresence>
              {state.showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 dark:border-gray-600 overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
                    
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-700 dark:text-gray-300">Show Keypoints</span>
                      <input
                        type="checkbox"
                        checked={state.settings.showKeypoints}
                        onChange={(e) => updateSettings({ showKeypoints: e.target.checked })}
                        className="w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-700 dark:text-gray-300">Show Performance Stats</span>
                      <input
                        type="checkbox"
                        checked={state.settings.showPerformanceStats}
                        onChange={(e) => updateSettings({ showPerformanceStats: e.target.checked })}
                        className="w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-700 dark:text-gray-300">Auto-Retry on Error</span>
                      <input
                        type="checkbox"
                        checked={state.settings.autoRetry}
                        onChange={(e) => updateSettings({ autoRetry: e.target.checked })}
                        className="w-4 h-4"
                      />
                    </label>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        Clothing Opacity: {Math.round(state.settings.clothingOpacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={state.settings.clothingOpacity}
                        onChange={(e) => updateSettings({ clothingOpacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaTshirt />
              Clothing
            </h2>

            {}
            {state.selectedClothing.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Selected</h3>
                <div className="space-y-2">
                  {state.selectedClothing.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-sm text-gray-900 dark:text-white">{item.name}</span>
                      <button
                        onClick={() => removeClothingItem(item.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                        aria-label={`Remove ${item.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(clothingCategories).map(([category, items]) => (
                items.length > 0 && (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize">
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => addClothingItem(item)}
                          disabled={state.selectedClothing.some(selected => selected.id === item.id)}
                          className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Add ${item.name}`}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-16 object-contain mb-1"
                          />
                          <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                            {item.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOnComponent;
