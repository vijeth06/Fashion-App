/**
 * Advanced Pose Detection Service - REBUILT VERSION
 * 
 * Features:
 * - Proper error handling and recovery
 * - Memory leak prevention
 * - Robust initialization
 * - Performance optimization
 * - TypeScript-like JSDoc annotations
 * 
 * @version 2.0.0
 */

import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

/**
 * @typedef {Object} PoseKeypoint
 * @property {number} x - X coordinate (normalized 0-1 or pixel)
 * @property {number} y - Y coordinate (normalized 0-1 or pixel)
 * @property {number} z - Z coordinate (depth)
 * @property {number} visibility - Confidence score (0-1)
 */

/**
 * @typedef {Object} PoseData
 * @property {Object.<string, PoseKeypoint>} keypoints - Named keypoints
 * @property {Object} boundingBox - Bounding box around the person
 * @property {number} confidence - Overall pose confidence
 * @property {ImageData|null} bodySegmentation - Segmentation mask
 * @property {Object} clothingAnchors - Calculated anchor points for clothing
 */

/**
 * @typedef {Object} PoseConfig
 * @property {'mediapipe'|'tensorflow'} runtime - Detection backend
 * @property {0|1|2} modelComplexity - Model complexity level
 * @property {number} minDetectionConfidence - Minimum detection confidence
 * @property {number} minTrackingConfidence - Minimum tracking confidence
 * @property {number} maxFPS - Target maximum FPS
 */

export class PoseDetectionService {
  /**
   * @param {Partial<PoseConfig>} config - Configuration options
   */
  constructor(config = {}) {
    // State
    this.pose = null;
    this.camera = null;
    this.detector = null;
    this.isInitialized = false;
    this.isDetecting = false;
    this.currentPose = null;
    this.videoElement = null;
    
    // Callbacks
    this.callbacks = {
      onPoseDetected: null,
      onError: null,
      onFPSUpdate: null,
      onInitialized: null,
      onStopped: null
    };
    
    // Performance tracking
    this.fps = 0;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fpsUpdateInterval = null;
    this.lastProcessTime = 0;
    
    // Configuration with defaults
    this.config = {
      runtime: 'mediapipe',
      modelComplexity: 0, // 0=lite, 1=full, 2=heavy
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
      maxFPS: 30,
      enableSegmentation: false,
      smoothLandmarks: true,
      ...config
    };
    
    this.targetFrameTime = 1000 / this.config.maxFPS;
    
    // Cleanup tracking
    this.cleanupTasks = [];
  }

  /**
   * Initialize the pose detection system
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('PoseDetectionService: Already initialized');
      return true;
    }

    try {
      console.log('PoseDetectionService: Initializing...');
      
      // Initialize TensorFlow.js backend
      await tf.ready();
      await tf.setBackend('webgl');
      console.log('TensorFlow.js ready with backend:', tf.getBackend());

      // Try MediaPipe first (better accuracy)
      try {
        await this.initializeMediaPipe();
        this.config.runtime = 'mediapipe';
        console.log('PoseDetectionService: MediaPipe initialized successfully');
      } catch (mpError) {
        console.warn('MediaPipe initialization failed, falling back to TensorFlow:', mpError);
        await this.initializeTensorFlow();
        this.config.runtime = 'tensorflow';
        console.log('PoseDetectionService: TensorFlow.js initialized successfully');
      }

      // Start performance monitoring
      this.startFPSMonitoring();
      
      this.isInitialized = true;
      
      if (this.callbacks.onInitialized) {
        this.callbacks.onInitialized(this.config.runtime);
      }
      
      return true;
      
    } catch (error) {
      console.error('PoseDetectionService: Initialization failed:', error);
      this.handleError(new Error(`Failed to initialize pose detection: ${error.message}`));
      return false;
    }
  }

  /**
   * Initialize MediaPipe Pose
   * @private
   */
  async initializeMediaPipe() {
    return new Promise((resolve, reject) => {
      try {
        this.pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        // Configure options
        this.pose.setOptions({
          modelComplexity: this.config.modelComplexity,
          smoothLandmarks: this.config.smoothLandmarks,
          enableSegmentation: this.config.enableSegmentation,
          smoothSegmentation: false, // Disable for performance
          minDetectionConfidence: this.config.minDetectionConfidence,
          minTrackingConfidence: this.config.minTrackingConfidence,
        });

        // Set up results handler
        this.pose.onResults((results) => {
          this.processMediaPipeResults(results);
        });

        // Track for cleanup
        this.cleanupTasks.push(() => {
          if (this.pose) {
            this.pose.close();
            this.pose = null;
          }
        });

        resolve();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Initialize TensorFlow.js PoseNet
   * @private
   */
  async initializeTensorFlow() {
    try {
      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
        minPoseScore: this.config.minDetectionConfidence,
      };
      
      this.detector = await poseDetection.createDetector(model, detectorConfig);

      // Track for cleanup
      this.cleanupTasks.push(async () => {
        if (this.detector) {
          await this.detector.dispose();
          this.detector = null;
        }
      });
      
    } catch (error) {
      throw new Error(`TensorFlow.js initialization failed: ${error.message}`);
    }
  }

  /**
   * Start real-time pose detection on a video element
   * @param {HTMLVideoElement} videoElement - Video source
   * @returns {Promise<boolean>} Success status
   */
  async startDetection(videoElement) {
    if (!this.isInitialized) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    if (this.isDetecting) {
      console.warn('Detection already running. Stopping previous session.');
      this.stopDetection();
    }

    if (!videoElement) {
      throw new Error('Video element is required');
    }

    // Wait for video to be ready
    if (videoElement.readyState < 2) {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Video load timeout')), 10000);
        videoElement.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          resolve();
        }, { once: true });
      });
    }

    this.videoElement = videoElement;
    this.isDetecting = true;

    try {
      if (this.config.runtime === 'mediapipe' && this.pose) {
        await this.startMediaPipeDetection(videoElement);
      } else if (this.config.runtime === 'tensorflow' && this.detector) {
        await this.startTensorFlowDetection(videoElement);
      } else {
        throw new Error('No detection backend available');
      }
      
      return true;
      
    } catch (error) {
      this.isDetecting = false;
      throw new Error(`Failed to start detection: ${error.message}`);
    }
  }

  /**
   * Start MediaPipe detection loop
   * @private
   */
  async startMediaPipeDetection(videoElement) {
    if (!this.pose) throw new Error('MediaPipe not initialized');

    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (!this.isDetecting || videoElement.readyState < 2) return;
        
        try {
          await this.pose.send({ image: videoElement });
        } catch (error) {
          console.error('MediaPipe frame processing error:', error);
        }
      },
      width: videoElement.videoWidth || 640,
      height: videoElement.videoHeight || 480,
      facingMode: 'user'
    });

    await this.camera.start();

    // Track for cleanup
    this.cleanupTasks.push(() => {
      if (this.camera) {
        this.camera.stop();
        this.camera = null;
      }
    });
  }

  /**
   * Start TensorFlow.js detection loop
   * @private
   */
  async startTensorFlowDetection(videoElement) {
    if (!this.detector) throw new Error('TensorFlow detector not initialized');

    const detectFrame = async () => {
      if (!this.isDetecting) return;

      try {
        if (videoElement.readyState === 4) {
          const poses = await this.detector.estimatePoses(videoElement, {
            flipHorizontal: false
          });
          
          if (poses && poses.length > 0) {
            this.processTensorFlowPose(poses[0]);
          }
        }
      } catch (error) {
        console.error('TensorFlow detection error:', error);
      }

      if (this.isDetecting) {
        requestAnimationFrame(detectFrame);
      }
    };

    detectFrame();
  }

  /**
   * Detect pose on a static image
   * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} imageElement
   * @returns {Promise<PoseData|null>}
   */
  async detectOnImage(imageElement) {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    if (!imageElement) {
      throw new Error('Image element is required');
    }

    try {
      if (this.config.runtime === 'mediapipe' && this.pose) {
        // MediaPipe processes via callback
        await this.pose.send({ image: imageElement });
        // Result will be delivered via processMediaPipeResults
        return this.currentPose;
        
      } else if (this.config.runtime === 'tensorflow' && this.detector) {
        const poses = await this.detector.estimatePoses(imageElement, {
          flipHorizontal: false
        });
        
        if (poses && poses.length > 0) {
          const poseData = this.processTensorFlowPose(poses[0]);
          return poseData;
        } else {
          throw new Error('No pose detected in image');
        }
      }
      
      throw new Error('No detection backend available');
      
    } catch (error) {
      console.error('Static image detection error:', error);
      this.handleError(error);
      return null;
    }
  }

  /**
   * Process MediaPipe results
   * @private
   */
  processMediaPipeResults(results) {
    // FPS throttling
    if (!this.shouldProcessFrame()) return;

    if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
      return;
    }

    try {
      const poseData = this.convertMediaPipePose(results);
      this.currentPose = poseData;
      this.updateFrameCount();

      if (this.callbacks.onPoseDetected) {
        this.callbacks.onPoseDetected(poseData);
      }
    } catch (error) {
      console.error('Error processing MediaPipe results:', error);
    }
  }

  /**
   * Process TensorFlow.js pose
   * @private
   */
  processTensorFlowPose(pose) {
    // FPS throttling
    if (!this.shouldProcessFrame()) return null;

    try {
      const poseData = this.convertTensorFlowPose(pose);
      this.currentPose = poseData;
      this.updateFrameCount();

      if (this.callbacks.onPoseDetected) {
        this.callbacks.onPoseDetected(poseData);
      }

      return poseData;
    } catch (error) {
      console.error('Error processing TensorFlow pose:', error);
      return null;
    }
  }

  /**
   * Convert MediaPipe pose to standard format
   * @private
   * @returns {PoseData}
   */
  convertMediaPipePose(results) {
    const landmarks = results.poseLandmarks;
    
    // MediaPipe POSE_LANDMARKS indices
    const keypointIndices = {
      nose: 0,
      leftEyeInner: 1,
      leftEye: 2,
      leftEyeOuter: 3,
      rightEyeInner: 4,
      rightEye: 5,
      rightEyeOuter: 6,
      leftEar: 7,
      rightEar: 8,
      mouthLeft: 9,
      mouthRight: 10,
      leftShoulder: 11,
      rightShoulder: 12,
      leftElbow: 13,
      rightElbow: 14,
      leftWrist: 15,
      rightWrist: 16,
      leftPinky: 17,
      leftIndex: 19,
      leftThumb: 21,
      rightPinky: 18,
      rightIndex: 20,
      rightThumb: 22,
      leftHip: 23,
      rightHip: 24,
      leftKnee: 25,
      rightKnee: 26,
      leftAnkle: 27,
      rightAnkle: 28,
      leftHeel: 29,
      leftFootIndex: 31,
      rightHeel: 30,
      rightFootIndex: 32
    };

    const keypoints = {};
    for (const [name, index] of Object.entries(keypointIndices)) {
      if (landmarks[index]) {
        keypoints[name] = {
          x: landmarks[index].x,
          y: landmarks[index].y,
          z: landmarks[index].z || 0,
          visibility: landmarks[index].visibility || 0
        };
      }
    }

    return {
      keypoints,
      boundingBox: this.calculateBoundingBox(Object.values(keypoints)),
      confidence: this.calculateAverageConfidence(Object.values(keypoints)),
      bodySegmentation: results.segmentationMask || null,
      clothingAnchors: this.calculateClothingAnchors(keypoints),
      timestamp: Date.now()
    };
  }

  /**
   * Convert TensorFlow pose to standard format
   * @private
   * @returns {PoseData}
   */
  convertTensorFlowPose(pose) {
    const keypointMap = {
      'nose': 'nose',
      'left_eye': 'leftEye',
      'right_eye': 'rightEye',
      'left_ear': 'leftEar',
      'right_ear': 'rightEar',
      'left_shoulder': 'leftShoulder',
      'right_shoulder': 'rightShoulder',
      'left_elbow': 'leftElbow',
      'right_elbow': 'rightElbow',
      'left_wrist': 'leftWrist',
      'right_wrist': 'rightWrist',
      'left_hip': 'leftHip',
      'right_hip': 'rightHip',
      'left_knee': 'leftKnee',
      'right_knee': 'rightKnee',
      'left_ankle': 'leftAnkle',
      'right_ankle': 'rightAnkle'
    };

    const keypoints = {};
    pose.keypoints.forEach(kp => {
      const mappedName = keypointMap[kp.name];
      if (mappedName && kp.score > 0.3) {
        keypoints[mappedName] = {
          x: kp.x,
          y: kp.y,
          z: kp.z || 0,
          visibility: kp.score
        };
      }
    });

    return {
      keypoints,
      boundingBox: this.calculateBoundingBox(Object.values(keypoints)),
      confidence: pose.score || 0.5,
      bodySegmentation: null,
      clothingAnchors: this.calculateClothingAnchors(keypoints),
      timestamp: Date.now()
    };
  }

  /**
   * Calculate clothing anchor points for garment overlay
   * @private
   */
  calculateClothingAnchors(keypoints) {
    const { leftShoulder, rightShoulder, leftHip, rightHip, leftElbow, rightElbow, leftWrist, rightWrist } = keypoints;

    if (!leftShoulder || !rightShoulder) {
      return null;
    }

    const shoulderCenter = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };

    const hipCenter = leftHip && rightHip ? {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    } : null;

    return {
      // Top garments (shirts, jackets)
      top: {
        neckline: {
          x: shoulderCenter.x,
          y: shoulderCenter.y - Math.abs(rightShoulder.x - leftShoulder.x) * 0.15
        },
        shoulderLeft: leftShoulder,
        shoulderRight: rightShoulder,
        shoulderCenter: shoulderCenter,
        elbowLeft: leftElbow || null,
        elbowRight: rightElbow || null,
        wristLeft: leftWrist || null,
        wristRight: rightWrist || null,
        waist: hipCenter ? {
          x: shoulderCenter.x,
          y: shoulderCenter.y + Math.abs(hipCenter.y - shoulderCenter.y) * 0.7
        } : null
      },
      
      // Bottom garments (pants, skirts)
      bottom: hipCenter ? {
        waistCenter: hipCenter,
        hipLeft: leftHip,
        hipRight: rightHip
      } : null,

      // Full body (dresses)
      full: {
        top: shoulderCenter,
        bottom: hipCenter
      }
    };
  }

  /**
   * Calculate bounding box from keypoints
   * @private
   */
  calculateBoundingBox(keypoints) {
    if (!keypoints || keypoints.length === 0) return null;

    const validPoints = keypoints.filter(kp => 
      kp && typeof kp.x === 'number' && typeof kp.y === 'number' && kp.visibility > 0.3
    );

    if (validPoints.length === 0) return null;

    const xs = validPoints.map(kp => kp.x);
    const ys = validPoints.map(kp => kp.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
  }

  /**
   * Calculate average confidence
   * @private
   */
  calculateAverageConfidence(keypoints) {
    if (!keypoints || keypoints.length === 0) return 0;

    const validPoints = keypoints.filter(kp => kp && typeof kp.visibility === 'number');
    if (validPoints.length === 0) return 0.5;

    const sum = validPoints.reduce((acc, kp) => acc + kp.visibility, 0);
    return sum / validPoints.length;
  }

  /**
   * Check if current frame should be processed (FPS throttling)
   * @private
   */
  shouldProcessFrame() {
    const currentTime = performance.now();
    if (currentTime - this.lastProcessTime < this.targetFrameTime) {
      return false;
    }
    this.lastProcessTime = currentTime;
    return true;
  }

  /**
   * Update frame count for FPS calculation
   * @private
   */
  updateFrameCount() {
    this.frameCount++;
  }

  /**
   * Start FPS monitoring
   * @private
   */
  startFPSMonitoring() {
    if (this.fpsUpdateInterval) {
      clearInterval(this.fpsUpdateInterval);
    }

    this.fpsUpdateInterval = setInterval(() => {
      this.fps = this.frameCount;
      this.frameCount = 0;

      if (this.callbacks.onFPSUpdate) {
        this.callbacks.onFPSUpdate(this.fps);
      }

      // Performance warnings
      if (this.fps < 10 && this.isDetecting) {
        console.warn(`Low FPS detected: ${this.fps}fps`);
      }
    }, 1000);

    // Track for cleanup
    this.cleanupTasks.push(() => {
      if (this.fpsUpdateInterval) {
        clearInterval(this.fpsUpdateInterval);
        this.fpsUpdateInterval = null;
      }
    });
  }

  /**
   * Stop pose detection
   */
  stopDetection() {
    if (!this.isDetecting) return;

    this.isDetecting = false;

    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }

    this.videoElement = null;
    this.currentPose = null;

    if (this.callbacks.onStopped) {
      this.callbacks.onStopped();
    }
  }

  /**
   * Handle errors
   * @private
   */
  handleError(error) {
    console.error('PoseDetectionService error:', error);
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
  }

  /**
   * Set callbacks
   */
  onPoseDetected(callback) {
    this.callbacks.onPoseDetected = callback;
    return this;
  }

  onError(callback) {
    this.callbacks.onError = callback;
    return this;
  }

  onFPSUpdate(callback) {
    this.callbacks.onFPSUpdate = callback;
    return this;
  }

  onInitialized(callback) {
    this.callbacks.onInitialized = callback;
    return this;
  }

  onStopped(callback) {
    this.callbacks.onStopped = callback;
    return this;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      isDetecting: this.isDetecting,
      runtime: this.config.runtime,
      fps: this.fps,
      currentPose: this.currentPose
    };
  }

  /**
   * Get current pose
   */
  getCurrentPose() {
    return this.currentPose;
  }

  /**
   * Get current FPS
   */
  getFPS() {
    return this.fps;
  }

  /**
   * Dispose and cleanup all resources
   */
  async dispose() {
    console.log('PoseDetectionService: Disposing...');
    
    this.stopDetection();

    // Run all cleanup tasks
    for (const cleanup of this.cleanupTasks) {
      try {
        await cleanup();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }

    this.cleanupTasks = [];
    this.isInitialized = false;
    this.callbacks = {
      onPoseDetected: null,
      onError: null,
      onFPSUpdate: null,
      onInitialized: null,
      onStopped: null
    };

    console.log('PoseDetectionService: Disposed');
  }
}

export default PoseDetectionService;
