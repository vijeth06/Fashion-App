/**
 * Enhanced Pose Detection Service
 * Inspired by OpenPose implementation from clothes-virtual-try-on
 * 
 * Features:
 * - 17+ keypoint detection
 * - Body part segmentation
 * - Pose confidence scoring
 * - Garment-specific pose analysis
 */

import * as poseDetection from '@tensorflow-models/pose-detection';

export class EnhancedPoseDetection {
  constructor() {
    this.poseDetector = null;
    this.isInitialized = false;
    
    // Garment-relevant keypoint groups
    this.keypointGroups = {
      upperBody: [
        'left_shoulder', 'right_shoulder',
        'left_elbow', 'right_elbow',
        'left_wrist', 'right_wrist',
        'nose', 'left_eye', 'right_eye'
      ],
      lowerBody: [
        'left_hip', 'right_hip',
        'left_knee', 'right_knee',
        'left_ankle', 'right_ankle'
      ],
      torso: [
        'left_shoulder', 'right_shoulder',
        'left_hip', 'right_hip'
      ]
    };
  }

  /**
   * Initialize pose detection model
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🕺 Initializing Enhanced Pose Detection...');
      
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
        enableSmoothing: true,
        minPoseScore: 0.25
      };
      
      this.poseDetector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      
      this.isInitialized = true;
      console.log('✅ Enhanced Pose Detection initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize pose detection:', error);
      throw error;
    }
  }

  /**
   * Detect pose with enhanced keypoint analysis
   */
  async detectPose(imageElement) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const poses = await this.poseDetector.estimatePoses(imageElement);
      
      if (poses.length === 0) {
        return {
          success: false,
          keypoints: [],
          confidence: 0,
          message: 'No pose detected'
        };
      }
      
      const pose = poses[0];
      
      // Enhance keypoints with additional analysis
      const enhancedKeypoints = this.enhanceKeypoints(pose.keypoints);
      
      // Calculate body measurements
      const measurements = this.calculateBodyMeasurements(enhancedKeypoints);
      
      // Detect body orientation
      const orientation = this.detectBodyOrientation(enhancedKeypoints);
      
      return {
        success: true,
        keypoints: enhancedKeypoints,
        measurements,
        orientation,
        confidence: pose.score || 0,
        poseType: this.classifyPoseType(enhancedKeypoints)
      };
      
    } catch (error) {
      console.error('❌ Pose detection failed:', error);
      return {
        success: false,
        keypoints: [],
        confidence: 0,
        error: error.message
      };
    }
  }

  /**
   * Enhance keypoints with additional metadata
   */
  enhanceKeypoints(keypoints) {
    return keypoints.map(kp => ({
      ...kp,
      visible: kp.score > 0.3,
      bodyPart: this.getBodyPart(kp.name),
      garmentRelevance: this.getGarmentRelevance(kp.name)
    }));
  }

  /**
   * Calculate body measurements from keypoints
   */
  calculateBodyMeasurements(keypoints) {
    const measurements = {
      shoulderWidth: 0,
      torsoLength: 0,
      armLength: 0,
      legLength: 0,
      hipWidth: 0
    };
    
    const getKeypoint = (name) => keypoints.find(kp => kp.name === name);
    
    // Shoulder width
    const leftShoulder = getKeypoint('left_shoulder');
    const rightShoulder = getKeypoint('right_shoulder');
    if (leftShoulder && rightShoulder) {
      measurements.shoulderWidth = this.calculateDistance(leftShoulder, rightShoulder);
    }
    
    // Torso length (shoulder to hip)
    const leftHip = getKeypoint('left_hip');
    if (leftShoulder && leftHip) {
      measurements.torsoLength = this.calculateDistance(leftShoulder, leftHip);
    }
    
    // Arm length (shoulder to wrist)
    const leftElbow = getKeypoint('left_elbow');
    const leftWrist = getKeypoint('left_wrist');
    if (leftShoulder && leftElbow && leftWrist) {
      const upperArm = this.calculateDistance(leftShoulder, leftElbow);
      const forearm = this.calculateDistance(leftElbow, leftWrist);
      measurements.armLength = upperArm + forearm;
    }
    
    // Leg length (hip to ankle)
    const leftKnee = getKeypoint('left_knee');
    const leftAnkle = getKeypoint('left_ankle');
    if (leftHip && leftKnee && leftAnkle) {
      const thigh = this.calculateDistance(leftHip, leftKnee);
      const shin = this.calculateDistance(leftKnee, leftAnkle);
      measurements.legLength = thigh + shin;
    }
    
    // Hip width
    const rightHip = getKeypoint('right_hip');
    if (leftHip && rightHip) {
      measurements.hipWidth = this.calculateDistance(leftHip, rightHip);
    }
    
    return measurements;
  }

  /**
   * Calculate Euclidean distance between two keypoints
   */
  calculateDistance(kp1, kp2) {
    const dx = kp1.x - kp2.x;
    const dy = kp1.y - kp2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Detect body orientation (front, side, back)
   */
  detectBodyOrientation(keypoints) {
    const getKeypoint = (name) => keypoints.find(kp => kp.name === name);
    
    const nose = getKeypoint('nose');
    const leftShoulder = getKeypoint('left_shoulder');
    const rightShoulder = getKeypoint('right_shoulder');
    const leftHip = getKeypoint('left_hip');
    const rightHip = getKeypoint('right_hip');
    
    if (!nose || !leftShoulder || !rightShoulder) {
      return { type: 'unknown', confidence: 0 };
    }
    
    // Calculate shoulder width and hip width
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const hipWidth = leftHip && rightHip ? Math.abs(leftHip.x - rightHip.x) : 0;
    
    // Front facing: nose visible, shoulders roughly equal distance from center
    const noseX = nose.x;
    const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
    const noseOffset = Math.abs(noseX - shoulderCenterX);
    
    let orientationType = 'unknown';
    let confidence = 0;
    
    if (noseOffset < shoulderWidth * 0.2) {
      orientationType = 'front';
      confidence = 0.9;
    } else if (noseOffset < shoulderWidth * 0.4) {
      orientationType = 'three-quarter';
      confidence = 0.7;
    } else {
      orientationType = 'side';
      confidence = 0.6;
    }
    
    return {
      type: orientationType,
      confidence,
      angle: this.calculateBodyAngle(keypoints)
    };
  }

  /**
   * Calculate body angle (useful for pose correction)
   */
  calculateBodyAngle(keypoints) {
    const getKeypoint = (name) => keypoints.find(kp => kp.name === name);
    
    const leftShoulder = getKeypoint('left_shoulder');
    const rightShoulder = getKeypoint('right_shoulder');
    
    if (!leftShoulder || !rightShoulder) {
      return 0;
    }
    
    // Calculate angle of shoulder line relative to horizontal
    const dx = rightShoulder.x - leftShoulder.x;
    const dy = rightShoulder.y - leftShoulder.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    return angle;
  }

  /**
   * Classify pose type for better garment fitting
   */
  classifyPoseType(keypoints) {
    const getKeypoint = (name) => keypoints.find(kp => kp.name === name);
    
    const leftElbow = getKeypoint('left_elbow');
    const rightElbow = getKeypoint('right_elbow');
    const leftShoulder = getKeypoint('left_shoulder');
    const rightShoulder = getKeypoint('right_shoulder');
    
    if (!leftElbow || !rightElbow || !leftShoulder || !rightShoulder) {
      return 'standing';
    }
    
    // Check if arms are raised
    const leftArmRaised = leftElbow.y < leftShoulder.y;
    const rightArmRaised = rightElbow.y < rightShoulder.y;
    
    if (leftArmRaised && rightArmRaised) {
      return 'arms-raised';
    } else if (leftArmRaised || rightArmRaised) {
      return 'one-arm-raised';
    } else {
      return 'arms-down';
    }
  }

  /**
   * Get body part category for a keypoint
   */
  getBodyPart(keypointName) {
    if (this.keypointGroups.upperBody.includes(keypointName)) {
      return 'upper_body';
    } else if (this.keypointGroups.lowerBody.includes(keypointName)) {
      return 'lower_body';
    } else if (this.keypointGroups.torso.includes(keypointName)) {
      return 'torso';
    }
    return 'other';
  }

  /**
   * Get garment relevance for a keypoint
   */
  getGarmentRelevance(keypointName) {
    const relevanceMap = {
      'left_shoulder': 1.0,
      'right_shoulder': 1.0,
      'left_hip': 0.9,
      'right_hip': 0.9,
      'left_elbow': 0.8,
      'right_elbow': 0.8,
      'left_wrist': 0.7,
      'right_wrist': 0.7,
      'left_knee': 0.9,
      'right_knee': 0.9,
      'left_ankle': 0.8,
      'right_ankle': 0.8,
      'nose': 0.5,
      'left_eye': 0.3,
      'right_eye': 0.3
    };
    
    return relevanceMap[keypointName] || 0.5;
  }

  /**
   * Get keypoints for specific garment type
   */
  getGarmentKeypoints(keypoints, garmentType) {
    let relevantGroup = [];
    
    switch (garmentType) {
      case 'upper_body':
        relevantGroup = this.keypointGroups.upperBody;
        break;
      case 'lower_body':
        relevantGroup = this.keypointGroups.lowerBody;
        break;
      case 'full_body':
        relevantGroup = [...this.keypointGroups.upperBody, ...this.keypointGroups.lowerBody];
        break;
      default:
        relevantGroup = keypoints.map(kp => kp.name);
    }
    
    return keypoints.filter(kp => relevantGroup.includes(kp.name));
  }

  /**
   * Dispose of model and free memory
   */
  dispose() {
    if (this.poseDetector) {
      this.poseDetector.dispose();
    }
    this.isInitialized = false;
    console.log('🗑️ Enhanced Pose Detection disposed');
  }
}

// Export singleton instance
export const enhancedPoseDetection = new EnhancedPoseDetection();
export default enhancedPoseDetection;
