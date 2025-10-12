import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

/**
 * Advanced Pose Detection Service
 * Provides real-time human pose estimation using MediaPipe and TensorFlow.js
 */
export class PoseDetectionService {
  constructor() {
    this.pose = null;
    this.camera = null;
    this.detector = null;
    this.isInitialized = false;
    this.currentPose = null;
    this.callbacks = {
      onPoseDetected: null,
      onError: null,
      onFPSUpdate: null
    };
    
    // Performance tracking
    this.fps = 0;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fpsUpdateInterval = null;
    
    // Real-time optimization settings
    this.config = {
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
      modelType: 'lite', // Use lite for better performance
      enableSegmentation: false, // Disable for better performance
      smoothLandmarks: true,
      minDetectionConfidence: 0.7, // Increased for stability
      minTrackingConfidence: 0.5,
      maxFPS: 30,
      targetFrameTime: 33.33 // ~30 FPS
    };
  }

  /**
   * Initialize pose detection models
   */
  async initialize() {
    try {
      console.log('Initializing pose detection...');
      
      // Initialize TensorFlow.js backend
      await tf.ready();
      console.log('TensorFlow.js ready');

      // Try MediaPipe first
      await this.initializeMediaPipe();
      
      this.isInitialized = true;
      console.log('Pose detection initialized successfully');
      return true;
      
    } catch (error) {
      console.warn('MediaPipe failed, falling back to TensorFlow.js', error);
      
      try {
        await this.initializeTensorFlowJS();
        this.isInitialized = true;
        console.log('TensorFlow.js pose detection initialized');
        return true;
      } catch (tfError) {
        console.error('Failed to initialize pose detection:', tfError);
        if (this.callbacks.onError) {
          this.callbacks.onError(tfError);
        }
        return false;
      }
    }
  }

  /**
   * Initialize MediaPipe Pose with optimized settings for real-time performance
   */
  async initializeMediaPipe() {
    this.pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    // Optimized settings for real-time performance
    this.pose.setOptions({
      modelComplexity: 0, // Use fastest model (0 = lite, 1 = full, 2 = heavy)
      smoothLandmarks: true,
      enableSegmentation: this.config.enableSegmentation,
      smoothSegmentation: false, // Disable for better performance
      minDetectionConfidence: this.config.minDetectionConfidence,
      minTrackingConfidence: this.config.minTrackingConfidence,
    });

    this.pose.onResults((results) => {
      this.processPoseResults(results);
    });

    // Start FPS monitoring
    this.startFPSMonitoring();
  }

  /**
   * Initialize TensorFlow.js pose detection as fallback
   */
  async initializeTensorFlowJS() {
    const model = poseDetection.SupportedModels.PoseNet;
    this.detector = await poseDetection.createDetector(model, {
      quantBytes: 4,
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: 640, height: 480 },
      multiplier: 0.75
    });
  }

  /**
   * Start pose detection on video element
   */
  startDetection(videoElement) {
    console.log('PoseDetectionService: Starting detection...');
    
    if (!this.isInitialized) {
      console.error('PoseDetectionService: Not initialized. Call initialize() first.');
      throw new Error('Pose detection not initialized. Call initialize() first.');
    }

    if (!videoElement) {
      console.error('PoseDetectionService: No video element provided');
      throw new Error('Video element is required for pose detection');
    }

    console.log('PoseDetectionService: Video element ready state:', videoElement.readyState);

    if (this.pose) {
      console.log('PoseDetectionService: Using MediaPipe implementation');
      // MediaPipe implementation
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (videoElement.readyState >= 2) {
            await this.pose.send({ image: videoElement });
          }
        },
        width: 1280,
        height: 720
      });
      this.camera.start();
      console.log('PoseDetectionService: MediaPipe camera started');
    } else if (this.detector) {
      console.log('PoseDetectionService: Using TensorFlow.js implementation');
      // TensorFlow.js implementation
      this.startTensorFlowDetection(videoElement);
    } else {
      console.error('PoseDetectionService: No detection method available');
      throw new Error('No pose detection method available');
    }
  }

  /**
   * Start TensorFlow.js pose detection loop
   */
  async startTensorFlowDetection(videoElement) {
    const detectFrame = async () => {
      if (videoElement.readyState === 4) {
        try {
          const poses = await this.detector.estimatePoses(videoElement);
          if (poses.length > 0) {
            this.processTensorFlowPose(poses[0]);
          }
        } catch (error) {
          console.error('TensorFlow pose detection error:', error);
        }
      }
      requestAnimationFrame(detectFrame);
    };
    detectFrame();
  }

  /**
   * Run pose detection on a static image (Image/Canvas/Video element)
   * Useful for uploaded photos.
   */
  async detectOnImage(imageElement) {
    if (!this.isInitialized) {
      throw new Error('Pose detection not initialized. Call initialize() first.');
    }

    if (!imageElement) {
      throw new Error('Image element is required for static pose detection');
    }

    try {
      if (this.pose) {
        // MediaPipe will invoke onResults -> processPoseResults
        await this.pose.send({ image: imageElement });
      } else if (this.detector) {
        // TensorFlow.js direct estimation
        const poses = await this.detector.estimatePoses(imageElement);
        if (poses && poses.length > 0) {
          this.processTensorFlowPose(poses[0]);
        } else if (this.callbacks.onError) {
          this.callbacks.onError(new Error('No pose detected in image'));
        }
      } else {
        throw new Error('No pose detection backend available');
      }
      return true;
    } catch (err) {
      console.error('detectOnImage failed:', err);
      if (this.callbacks.onError) this.callbacks.onError(err);
      return false;
    }
  }

  /**
   * Process MediaPipe pose results with performance optimization
   */
  processPoseResults(results) {
    // Check if we should process this frame (FPS throttling)
    if (!this.updateFrameCount()) {
      return;
    }
    
    console.log('PoseDetectionService: Processing pose results', results);
    
    if (!results.poseLandmarks) {
      console.log('PoseDetectionService: No pose landmarks found');
      return;
    }

    const pose = this.convertMediaPipePose(results);
    this.currentPose = pose;

    console.log('PoseDetectionService: Pose detected with confidence:', pose.confidence);

    if (this.callbacks.onPoseDetected) {
      this.callbacks.onPoseDetected(pose);
    }
  }

  /**
   * Process TensorFlow.js pose results
   */
  processTensorFlowPose(pose) {
    const convertedPose = this.convertTensorFlowPose(pose);
    this.currentPose = convertedPose;

    if (this.callbacks.onPoseDetected) {
      this.callbacks.onPoseDetected(convertedPose);
    }
  }

  /**
   * Convert MediaPipe pose format to standardized format
   */
  convertMediaPipePose(results) {
    const landmarks = results.poseLandmarks;
    
    return {
      keypoints: {
        // Head
        nose: landmarks[0],
        leftEye: landmarks[2],
        rightEye: landmarks[5],
        leftEar: landmarks[7],
        rightEar: landmarks[8],
        
        // Torso
        leftShoulder: landmarks[11],
        rightShoulder: landmarks[12],
        leftElbow: landmarks[13],
        rightElbow: landmarks[14],
        leftWrist: landmarks[15],
        rightWrist: landmarks[16],
        leftHip: landmarks[23],
        rightHip: landmarks[24],
        
        // Legs
        leftKnee: landmarks[25],
        rightKnee: landmarks[26],
        leftAnkle: landmarks[27],
        rightAnkle: landmarks[28]
      },
      boundingBox: this.calculateBoundingBox(landmarks),
      confidence: this.calculateAverageConfidence(landmarks),
      bodySegmentation: results.segmentationMask,
      clothingAnchorPoints: this.calculateClothingAnchors(landmarks)
    };
  }

  /**
   * Convert TensorFlow.js pose format to standardized format
   */
  convertTensorFlowPose(pose) {
    const keypoints = {};
    
    // Map TensorFlow.js keypoint names to our standard format
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

    pose.keypoints.forEach(kp => {
      if (keypointMap[kp.name] && kp.score > 0.3) {
        keypoints[keypointMap[kp.name]] = {
          x: kp.x,
          y: kp.y,
          z: kp.z || 0,
          visibility: kp.score
        };
      }
    });

    return {
      keypoints,
      boundingBox: this.calculateBoundingBoxFromKeypoints(Object.values(keypoints)),
      confidence: pose.score || 0.5,
      bodySegmentation: null,
      clothingAnchorPoints: this.calculateClothingAnchors(Object.values(keypoints))
    };
  }

  /**
   * Calculate clothing anchor points for different garment types
   */
  calculateClothingAnchors(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;

    const keypoints = Array.isArray(landmarks) ? landmarks : Object.values(landmarks);
    
    // Find key body landmarks
    const leftShoulder = this.findLandmark(keypoints, 'leftShoulder') || keypoints[11];
    const rightShoulder = this.findLandmark(keypoints, 'rightShoulder') || keypoints[12];
    const leftHip = this.findLandmark(keypoints, 'leftHip') || keypoints[23];
    const rightHip = this.findLandmark(keypoints, 'rightHip') || keypoints[24];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      return null;
    }

    return {
      // T-shirt/Top anchors
      shirt: {
        neckline: {
          x: (leftShoulder.x + rightShoulder.x) / 2,
          y: Math.min(leftShoulder.y, rightShoulder.y) - 20
        },
        shoulders: {
          left: leftShoulder,
          right: rightShoulder
        },
        waist: {
          x: (leftHip.x + rightHip.x) / 2,
          y: (leftShoulder.y + leftHip.y) * 0.7
        }
      },
      
      // Pants/Bottom anchors
      pants: {
        waist: {
          left: leftHip,
          right: rightHip,
          center: {
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2
          }
        }
      },
      
      // Dress anchors
      dress: {
        neckline: {
          x: (leftShoulder.x + rightShoulder.x) / 2,
          y: Math.min(leftShoulder.y, rightShoulder.y) - 20
        },
        shoulders: {
          left: leftShoulder,
          right: rightShoulder
        },
        waist: {
          x: (leftHip.x + rightHip.x) / 2,
          y: (leftShoulder.y + leftHip.y) * 0.7
        },
        hips: {
          left: leftHip,
          right: rightHip
        }
      }
    };
  }

  /**
   * Find a specific landmark by name
   */
  findLandmark(landmarks, name) {
    return landmarks.find(lm => lm.name === name);
  }

  /**
   * Calculate bounding box from landmarks
   */
  calculateBoundingBox(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;

    const validLandmarks = landmarks.filter(lm => 
      lm && typeof lm.x === 'number' && typeof lm.y === 'number'
    );

    if (validLandmarks.length === 0) return null;

    const xs = validLandmarks.map(lm => lm.x);
    const ys = validLandmarks.map(lm => lm.y);

    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  }

  /**
   * Calculate bounding box from keypoints object
   */
  calculateBoundingBoxFromKeypoints(keypoints) {
    if (!keypoints || keypoints.length === 0) return null;
    return this.calculateBoundingBox(keypoints);
  }

  /**
   * Calculate average confidence score
   */
  calculateAverageConfidence(landmarks) {
    if (!landmarks || landmarks.length === 0) return 0;
    
    const validLandmarks = landmarks.filter(lm => 
      lm && typeof lm.visibility === 'number'
    );
    
    if (validLandmarks.length === 0) return 0.5;
    
    const totalConfidence = validLandmarks.reduce((sum, lm) => sum + lm.visibility, 0);
    return totalConfidence / validLandmarks.length;
  }

  /**
   * Set callback for pose detection events
   */
  onPoseDetected(callback) {
    this.callbacks.onPoseDetected = callback;
  }

  /**
   * Set callback for error events
   */
  onError(callback) {
    this.callbacks.onError = callback;
  }

  /**
   * Start FPS monitoring for real-time performance tracking
   */
  startFPSMonitoring() {
    this.fpsUpdateInterval = setInterval(() => {
      this.fps = this.frameCount;
      this.frameCount = 0;
      
      if (this.callbacks.onFPSUpdate) {
        this.callbacks.onFPSUpdate(this.fps);
      }
      
      // Log performance warnings
      if (this.fps < 15) {
        console.warn(`Low FPS detected: ${this.fps}fps. Consider reducing quality settings.`);
      }
    }, 1000);
  }

  /**
   * Update frame count for FPS calculation
   */
  updateFrameCount() {
    this.frameCount++;
    
    // Throttle processing if needed for performance
    const currentTime = performance.now();
    if (currentTime - this.lastFrameTime < this.config.targetFrameTime) {
      return false; // Skip this frame
    }
    this.lastFrameTime = currentTime;
    return true; // Process this frame
  }

  /**
   * Set callback for FPS updates
   */
  onFPSUpdate(callback) {
    this.callbacks.onFPSUpdate = callback;
  }

  /**
   * Get current FPS
   */
  getFPS() {
    return this.fps;
  }

  /**
   * Stop pose detection
   */
  stopDetection() {
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
    
    // Stop FPS monitoring
    if (this.fpsUpdateInterval) {
      clearInterval(this.fpsUpdateInterval);
      this.fpsUpdateInterval = null;
    }
    
    this.currentPose = null;
  }

  /**
   * Get the current pose data
   */
  getCurrentPose() {
    return this.currentPose;
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.stopDetection();
    if (this.pose) {
      this.pose.close();
      this.pose = null;
    }
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
    this.isInitialized = false;
  }
}

export default PoseDetectionService;