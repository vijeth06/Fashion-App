import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCamera, FaVideo, FaDownload, FaShare, FaExpand, FaCompress,
  FaPalette, FaSync, FaHeart, FaShoppingCart, FaPlay, FaPause,
  FaVolumeUp, FaMicrophone, FaCog, FaMagic, FaBolt, FaEye,
  FaRuler, FaUsers, FaStar, FaChartLine, FaRobot, FaCube
} from 'react-icons/fa';

import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

import { getAnalytics } from '../services/AnalyticsService';

const analytics = getAnalytics();

class AdvancedPoseEngine {
  constructor() {
    this.detector = null;
    this.segmenter = null;
    this.isInitialized = false;
    this.poseHistory = [];
    this.maxHistorySize = 10;
    this.calibrationData = null;
    this.bodyMeasurements = {
      height: 0,
      shoulderWidth: 0,
      chestWidth: 0,
      waistWidth: 0,
      armLength: 0,
      legLength: 0,
      torsoLength: 0,
      confidence: 0,
      stability: 0
    };
    this.measurementCalibration = {
      pixelsPerCm: 1, // To be calibrated
      referenceHeight: 170, // Default reference in cm
      isCalibrated: false
    };
  }

  async initialize() {
    try {

      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER, // Higher accuracy model
          enableSmoothing: true,
          multiPoseMaxDimension: 1024, // Higher resolution
          enableTracking: true,
          trackerType: poseDetection.TrackerType.BoundingBox
        }
      );

      this.segmenter = await bodySegmentation.createSegmenter(
        bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
        {
          runtime: 'tfjs',
          modelType: 'landscape' // Better for full body detection
        }
      );

      this.isInitialized = true;
      console.log('Enhanced Pose Engine initialized with high accuracy settings');
    } catch (error) {
      console.error('Pose Engine initialization failed:', error);

      try {
        this.detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true
          }
        );
        this.isInitialized = true;
        console.log('Fallback pose detection initialized');
      } catch (fallbackError) {
        console.error('Fallback initialization also failed:', fallbackError);
      }
    }
  }

  async detectPose(videoElement) {
    if (!this.isInitialized || !this.detector) return null;

    try {
      const poses = await this.detector.estimatePoses(videoElement);
      if (poses.length > 0) {
        const pose = poses[0];

        this.addToHistory(pose);

        this.calculateAdvancedBodyMeasurements(pose);

        const segmentation = await this.getBodySegmentation(videoElement);
        
        return this.enhancePoseData(pose, segmentation);
      }
    } catch (error) {
      console.error('Pose detection error:', error);
    }
    return null;
  }

  addToHistory(pose) {
    this.poseHistory.push({
      pose,
      timestamp: Date.now()
    });
    
    if (this.poseHistory.length > this.maxHistorySize) {
      this.poseHistory.shift();
    }
  }

  async getBodySegmentation(videoElement) {
    if (!this.segmenter) return null;
    
    try {
      const segmentation = await this.segmenter.segmentPeople(videoElement);
      return segmentation;
    } catch (error) {
      console.error('Body segmentation error:', error);
      return null;
    }
  }

  calculateAdvancedBodyMeasurements(pose) {
    if (!pose.keypoints) return;

    const keypoints = pose.keypoints;
    const getKeypoint = (name) => keypoints.find(kp => kp.name === name);

    const smoothedKeypoints = this.applySmoothingToKeypoints(keypoints);

    try {

      const nose = getKeypoint('nose');
      const leftEye = getKeypoint('left_eye');
      const rightEye = getKeypoint('right_eye');
      const leftShoulder = getKeypoint('left_shoulder');
      const rightShoulder = getKeypoint('right_shoulder');
      const leftElbow = getKeypoint('left_elbow');
      const rightElbow = getKeypoint('right_elbow');
      const leftWrist = getKeypoint('left_wrist');
      const rightWrist = getKeypoint('right_wrist');
      const leftHip = getKeypoint('left_hip');
      const rightHip = getKeypoint('right_hip');
      const leftKnee = getKeypoint('left_knee');
      const rightKnee = getKeypoint('right_knee');
      const leftAnkle = getKeypoint('left_ankle');
      const rightAnkle = getKeypoint('right_ankle');

      if (this.areKeyPointsVisible([leftShoulder, rightShoulder], 0.6)) {
        const shoulderWidth = this.calculateDistance(leftShoulder, rightShoulder);
        this.bodyMeasurements.shoulderWidth = this.applyTemporalSmoothing('shoulderWidth', shoulderWidth);
      }

      if (this.areKeyPointsVisible([leftHip, rightHip], 0.6)) {
        const waistWidth = this.calculateDistance(leftHip, rightHip);
        this.bodyMeasurements.waistWidth = this.applyTemporalSmoothing('waistWidth', waistWidth);
      }

      if (this.areKeyPointsVisible([leftShoulder, rightShoulder, leftHip, rightHip], 0.5)) {
        const chestWidth = (this.bodyMeasurements.shoulderWidth + this.bodyMeasurements.waistWidth) / 2;
        this.bodyMeasurements.chestWidth = this.applyTemporalSmoothing('chestWidth', chestWidth);
      }

      if (nose && this.areKeyPointsVisible([leftAnkle, rightAnkle], 0.5)) {
        const avgAnkle = {
          x: (leftAnkle.x + rightAnkle.x) / 2,
          y: (leftAnkle.y + rightAnkle.y) / 2
        };
        const height = Math.abs(avgAnkle.y - nose.y);
        this.bodyMeasurements.height = this.applyTemporalSmoothing('height', height);
      }

      if (this.areKeyPointsVisible([leftShoulder, leftElbow, leftWrist], 0.6)) {
        const leftArmLength = this.calculateDistance(leftShoulder, leftElbow) + 
                             this.calculateDistance(leftElbow, leftWrist);
        this.bodyMeasurements.armLength = this.applyTemporalSmoothing('armLength', leftArmLength);
      } else if (this.areKeyPointsVisible([rightShoulder, rightElbow, rightWrist], 0.6)) {
        const rightArmLength = this.calculateDistance(rightShoulder, rightElbow) + 
                              this.calculateDistance(rightElbow, rightWrist);
        this.bodyMeasurements.armLength = this.applyTemporalSmoothing('armLength', rightArmLength);
      }

      if (this.areKeyPointsVisible([leftHip, leftKnee, leftAnkle], 0.6)) {
        const leftLegLength = this.calculateDistance(leftHip, leftKnee) + 
                             this.calculateDistance(leftKnee, leftAnkle);
        this.bodyMeasurements.legLength = this.applyTemporalSmoothing('legLength', leftLegLength);
      } else if (this.areKeyPointsVisible([rightHip, rightKnee, rightAnkle], 0.6)) {
        const rightLegLength = this.calculateDistance(rightHip, rightKnee) + 
                              this.calculateDistance(rightKnee, rightAnkle);
        this.bodyMeasurements.legLength = this.applyTemporalSmoothing('legLength', rightLegLength);
      }

      if (this.areKeyPointsVisible([leftShoulder, rightShoulder, leftHip, rightHip], 0.5)) {
        const shoulderCenter = {
          x: (leftShoulder.x + rightShoulder.x) / 2,
          y: (leftShoulder.y + rightShoulder.y) / 2
        };
        const hipCenter = {
          x: (leftHip.x + rightHip.x) / 2,
          y: (leftHip.y + rightHip.y) / 2
        };
        const torsoLength = this.calculateDistance(shoulderCenter, hipCenter);
        this.bodyMeasurements.torsoLength = this.applyTemporalSmoothing('torsoLength', torsoLength);
      }

      const avgConfidence = keypoints.reduce((sum, kp) => sum + (kp.score || 0), 0) / keypoints.length;
      this.bodyMeasurements.confidence = avgConfidence;
      this.bodyMeasurements.stability = this.calculatePoseStability();

    } catch (error) {
      console.error('Advanced measurement calculation error:', error);
    }
  }

  areKeyPointsVisible(keypoints, minConfidence = 0.5) {
    return keypoints.every(kp => kp && kp.score >= minConfidence);
  }

  calculateDistance(point1, point2) {
    if (!point1 || !point2) return 0;
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  applyTemporalSmoothing(measurement, newValue, smoothingFactor = 0.3) {
    const currentValue = this.bodyMeasurements[measurement] || newValue;
    return currentValue * (1 - smoothingFactor) + newValue * smoothingFactor;
  }

  applySmoothingToKeypoints(keypoints) {

    if (this.poseHistory.length < 3) return keypoints;
    
    return keypoints.map((kp, index) => {
      const recentPoses = this.poseHistory.slice(-3);
      const historicalKp = recentPoses.map(h => h.pose.keypoints[index]).filter(Boolean);
      
      if (historicalKp.length < 2) return kp;
      
      const avgX = historicalKp.reduce((sum, hkp) => sum + hkp.x, 0) / historicalKp.length;
      const avgY = historicalKp.reduce((sum, hkp) => sum + hkp.y, 0) / historicalKp.length;
      const avgScore = historicalKp.reduce((sum, hkp) => sum + hkp.score, 0) / historicalKp.length;
      
      return {
        ...kp,
        x: kp.x * 0.7 + avgX * 0.3, // Blend current with history
        y: kp.y * 0.7 + avgY * 0.3,
        score: Math.max(kp.score, avgScore * 0.9)
      };
    });
  }

  calculatePoseStability() {
    if (this.poseHistory.length < 5) return 0;
    
    const recentPoses = this.poseHistory.slice(-5);
    const movements = [];
    
    for (let i = 1; i < recentPoses.length; i++) {
      const prev = recentPoses[i - 1].pose.keypoints;
      const curr = recentPoses[i].pose.keypoints;
      
      let totalMovement = 0;
      let validKeypoints = 0;
      
      for (let j = 0; j < Math.min(prev.length, curr.length); j++) {
        if (prev[j].score > 0.5 && curr[j].score > 0.5) {
          const movement = this.calculateDistance(prev[j], curr[j]);
          totalMovement += movement;
          validKeypoints++;
        }
      }
      
      if (validKeypoints > 0) {
        movements.push(totalMovement / validKeypoints);
      }
    }
    
    if (movements.length === 0) return 0;
    
    const avgMovement = movements.reduce((sum, m) => sum + m, 0) / movements.length;
    const stability = Math.max(0, 1 - (avgMovement / 50)); // Normalize to 0-1
    
    return stability;
  }

  calculateBodyMeasurements(keypoints) {
    try {
      const getKeypoint = (name) => keypoints.find(kp => kp.part === name);
      
      const nose = getKeypoint('nose');
      const leftShoulder = getKeypoint('leftShoulder');
      const rightShoulder = getKeypoint('rightShoulder');
      const leftHip = getKeypoint('leftHip');
      const rightHip = getKeypoint('rightHip');
      const leftAnkle = getKeypoint('leftAnkle');

      if (leftShoulder && rightShoulder && leftHip && rightHip) {

        const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
        const bodyHeight = nose && leftAnkle ? Math.abs(leftAnkle.y - nose.y) : 0;
        const chestWidth = shoulderWidth * 0.8; // Approximate
        const waistWidth = Math.abs(rightHip.x - leftHip.x);

        const avgConfidence = keypoints.reduce((sum, kp) => sum + (kp.score || 0), 0) / keypoints.length;

        this.bodyMeasurements = {
          height: bodyHeight,
          shoulderWidth,
          chestWidth,
          waistWidth,
          armLength: leftShoulder && getKeypoint('left_wrist') ? 
            Math.abs(getKeypoint('left_wrist').x - leftShoulder.x) : 0,
          confidence: avgConfidence
        };
      }
    } catch (error) {
      console.error('Body measurement calculation error:', error);
    }
  }

  enhancePoseData(pose) {
    return {
      ...pose,
      bodyMeasurements: this.bodyMeasurements,
      clothingAnchorPoints: this.calculateClothingAnchors(pose),
      fittingScore: this.calculateFittingScore(pose),
      timestamp: Date.now()
    };
  }

  calculateClothingAnchors(pose) {
    if (!pose.keypoints) return [];
    
    const keypoints = pose.keypoints;
    const getKeypoint = (name) => keypoints.find(kp => kp.name === name);
    
    return [
      { type: 'shoulder_left', ...getKeypoint('left_shoulder'), weight: 1.0 },
      { type: 'shoulder_right', ...getKeypoint('right_shoulder'), weight: 1.0 },
      { type: 'elbow_left', ...getKeypoint('left_elbow'), weight: 0.8 },
      { type: 'elbow_right', ...getKeypoint('right_elbow'), weight: 0.8 },
      { type: 'wrist_left', ...getKeypoint('left_wrist'), weight: 0.6 },
      { type: 'wrist_right', ...getKeypoint('right_wrist'), weight: 0.6 },
      { type: 'hip_left', ...getKeypoint('left_hip'), weight: 0.9 },
      { type: 'hip_right', ...getKeypoint('right_hip'), weight: 0.9 }
    ].filter(anchor => anchor.x && anchor.y);
  }

  calculateFittingScore(pose) {
    if (!pose.keypoints || !this.bodyMeasurements.confidence) return 0;

    const poseStability = this.calculatePoseStability(pose);
    const measurementAccuracy = this.bodyMeasurements.confidence;
    const keyPointVisibility = pose.keypoints.filter(kp => kp.score > 0.5).length / pose.keypoints.length;
    
    return Math.min(1.0, (poseStability * 0.4 + measurementAccuracy * 0.4 + keyPointVisibility * 0.2));
  }

  calculatePoseStability(pose) {

    const avgConfidence = pose.keypoints.reduce((sum, kp) => sum + (kp.score || 0), 0) / pose.keypoints.length;
    return Math.min(1.0, avgConfidence * 1.2);
  }

  async segmentBody(videoElement) {
    if (!this.isInitialized || !this.segmenter) return null;

    try {
      const segmentation = await this.segmenter.segmentPeople(videoElement);
      return segmentation;
    } catch (error) {
      console.error('Body segmentation error:', error);
      return null;
    }
  }
}

class ClothWarpingEngine {
  constructor() {
    this.fabricPhysics = {
      elasticity: 0.7,
      gravity: 0.3,
      windResistance: 0.1,
      materialDensity: 0.5,
      stretchLimit: 1.5,
      compressionLimit: 0.7
    };
    this.meshResolution = 32; // Higher resolution mesh for better warping
    this.lightingModel = {
      ambientLight: 0.3,
      directionalLight: 0.7,
      specularHighlight: 0.2
    };
  }

  warpClothingToBody(clothingImage, pose, bodySegmentation, fabricType = 'cotton') {
    if (!pose || !pose.clothingAnchorPoints) return null;

    const warpedClothing = this.applyAdvancedWarping({
      image: clothingImage,
      anchorPoints: pose.clothingAnchorPoints,
      bodyMeasurements: pose.bodyMeasurements,
      segmentation: bodySegmentation,
      fabricProperties: this.getFabricProperties(fabricType),
      lightingConditions: this.detectLightingConditions(pose),
      movementVector: this.calculateMovementVector(pose),
      bodyContour: this.extractBodyContour(bodySegmentation)
    });

    return warpedClothing;
  }

  getFabricProperties(fabricType) {
    const fabrics = {
      cotton: { 
        elasticity: 0.3, drape: 0.6, shine: 0.1, thickness: 0.4, 
        breathability: 0.8, wrinkleResistance: 0.3, stretch: 0.2 
      },
      silk: { 
        elasticity: 0.4, drape: 0.9, shine: 0.8, thickness: 0.2, 
        breathability: 0.9, wrinkleResistance: 0.4, stretch: 0.3 
      },
      wool: { 
        elasticity: 0.2, drape: 0.5, shine: 0.0, thickness: 0.8, 
        breathability: 0.6, wrinkleResistance: 0.6, stretch: 0.1 
      },
      polyester: { 
        elasticity: 0.6, drape: 0.4, shine: 0.3, thickness: 0.3, 
        breathability: 0.3, wrinkleResistance: 0.8, stretch: 0.7 
      },
      denim: { 
        elasticity: 0.1, drape: 0.2, shine: 0.0, thickness: 0.9, 
        breathability: 0.4, wrinkleResistance: 0.9, stretch: 0.15 
      },
      lycra: { 
        elasticity: 0.9, drape: 0.7, shine: 0.2, thickness: 0.2, 
        breathability: 0.7, wrinkleResistance: 0.9, stretch: 0.95 
      }
    };
    return fabrics[fabricType] || fabrics.cotton;
  }

  applyAdvancedWarping(config) {

    const clothMesh = this.createClothMesh(config.image, this.meshResolution);

    const deformedMesh = this.deformMeshToBody(clothMesh, config);

    const simulatedMesh = this.simulateClothPhysics(deformedMesh, config);

    const shadedMesh = this.applyLightingEffects(simulatedMesh, config);

    const warpedImage = this.renderWarpedImage(shadedMesh, config);
    
    return {
      warpedImage,
      confidence: this.calculateWarpingConfidence(config),
      realism: this.calculateRealismScore(config),
      processingTime: Date.now(),
      fabricBehavior: this.simulateFabricBehavior(config),
      shadowsAndHighlights: this.generateAdvancedShadows(config),
      fittingQuality: this.assessFittingQuality(config)
    };
  }

  createClothMesh(image, resolution) {
    const mesh = [];
    for (let i = 0; i <= resolution; i++) {
      mesh[i] = [];
      for (let j = 0; j <= resolution; j++) {
        mesh[i][j] = {
          x: (i / resolution) * image.width,
          y: (j / resolution) * image.height,
          originalX: (i / resolution) * image.width,
          originalY: (j / resolution) * image.height,
          velocity: { x: 0, y: 0 },
          pinned: false,
          textureCoords: { u: i / resolution, v: j / resolution }
        };
      }
    }
    return mesh;
  }

  deformMeshToBody(mesh, config) {
    const { anchorPoints, bodyMeasurements, fabricProperties } = config;

    anchorPoints.forEach(anchor => {
      const meshPoint = this.findNearestMeshPoint(mesh, anchor.position);
      if (meshPoint) {
        const deformation = this.calculateDeformation(anchor, bodyMeasurements, fabricProperties);
        meshPoint.x += deformation.x * fabricProperties.elasticity;
        meshPoint.y += deformation.y * fabricProperties.elasticity;
        meshPoint.pinned = anchor.type === 'fixed';
      }
    });

    return this.applySmoothDeformation(mesh, config);
  }

  simulateClothPhysics(mesh, config) {
    const { fabricProperties } = config;
    const iterations = 5; // Physics solver iterations
    
    for (let iter = 0; iter < iterations; iter++) {

      this.applySpringConstraints(mesh, fabricProperties);

      this.applyGravityAndForces(mesh, fabricProperties);

      this.applyBodyCollision(mesh, config);

      this.updateMeshPositions(mesh);
    }
    
    return mesh;
  }

  applySpringConstraints(mesh, fabricProperties) {
    const restLength = 1.0; // Normalized rest length
    const springStrength = fabricProperties.elasticity * 0.8;
    
    for (let i = 0; i < mesh.length - 1; i++) {
      for (let j = 0; j < mesh[i].length - 1; j++) {
        const current = mesh[i][j];
        const right = mesh[i + 1][j];
        const down = mesh[i][j + 1];

        this.applySpringForce(current, right, restLength, springStrength);

        this.applySpringForce(current, down, restLength, springStrength);
      }
    }
  }

  applySpringForce(point1, point2, restLength, strength) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const force = (distance - restLength) * strength;
    
    const fx = (dx / distance) * force * 0.5;
    const fy = (dy / distance) * force * 0.5;
    
    if (!point1.pinned) {
      point1.velocity.x += fx;
      point1.velocity.y += fy;
    }
    
    if (!point2.pinned) {
      point2.velocity.x -= fx;
      point2.velocity.y -= fy;
    }
  }

  applyGravityAndForces(mesh, fabricProperties) {
    const gravity = this.fabricPhysics.gravity * fabricProperties.thickness;
    const damping = 0.95; // Velocity damping
    
    mesh.forEach(row => {
      row.forEach(point => {
        if (!point.pinned) {

          point.velocity.y += gravity;

          point.velocity.x *= damping;
          point.velocity.y *= damping;
        }
      });
    });
  }

  applyBodyCollision(mesh, config) {
    const { bodyContour } = config;
    if (!bodyContour) return;
    
    mesh.forEach(row => {
      row.forEach(point => {
        if (!point.pinned) {

          const collision = this.checkPointBodyCollision(point, bodyContour);
          if (collision) {

            point.x = collision.correctedX;
            point.y = collision.correctedY;
            point.velocity.x *= 0.5; // Reduce velocity on collision
            point.velocity.y *= 0.5;
          }
        }
      });
    });
  }

  extractBodyContour(bodySegmentation) {
    if (!bodySegmentation || !bodySegmentation.mask) return null;

    return {
      points: [], // Would contain actual contour points
      bounds: { minX: 0, maxX: 640, minY: 0, maxY: 480 }
    };
  }

  calculateWarpingConfidence(config) {
    let confidence = 0.8; // Base confidence

    if (config.anchorPoints && config.anchorPoints.length >= 6) {
      confidence += 0.1;
    }

    if (config.bodyMeasurements && config.bodyMeasurements.confidence > 0.7) {
      confidence += config.bodyMeasurements.confidence * 0.15;
    }

    if (config.lightingConditions && config.lightingConditions.quality < 0.5) {
      confidence -= 0.1;
    }
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  assessFittingQuality(config) {
    const { bodyMeasurements, fabricProperties } = config;
    
    return {
      sizeMatch: this.calculateSizeMatch(bodyMeasurements),
      stretchFit: this.calculateStretchFit(bodyMeasurements, fabricProperties),
      proportionalFit: this.calculateProportionalFit(bodyMeasurements),
      comfort: this.calculateComfortScore(bodyMeasurements, fabricProperties),
      overall: 0.85 // Composite score
    };
  }

  simulateFabricBehavior(config) {
    return {
      wrinkles: this.generateWrinkles(config.anchorPoints, config.fabricProperties),
      folds: this.calculateFolds(config.bodyMeasurements),
      stretch: this.calculateStretch(config.movementVector),
      flow: this.calculateFlow(config.fabricProperties)
    };
  }

  generateWrinkles(anchorPoints, fabricProps) {

    return anchorPoints.map(point => ({
      x: point.x + Math.random() * 10 - 5,
      y: point.y + Math.random() * 10 - 5,
      intensity: fabricProps.elasticity * Math.random()
    }));
  }

  calculateFolds(measurements) {
    return {
      shoulderFolds: measurements.shoulderWidth > 150 ? 'prominent' : 'subtle',
      waistFolds: measurements.waistWidth < 100 ? 'tight' : 'loose',
      armFolds: measurements.armLength > 200 ? 'extended' : 'relaxed'
    };
  }

  calculateStretch(movementVector) {
    return {
      horizontal: Math.abs(movementVector?.x || 0) * 0.1,
      vertical: Math.abs(movementVector?.y || 0) * 0.1
    };
  }

  calculateFlow(fabricProps) {
    return {
      drapeCoefficient: fabricProps.drape,
      flowDirection: Math.random() * 360,
      amplitude: fabricProps.elasticity * 0.5
    };
  }

  generateShadows(config) {
    return {
      selfShadows: this.calculateSelfShadows(config.anchorPoints),
      castShadows: this.calculateCastShadows(config.bodyMeasurements),
      ambientOcclusion: this.calculateAmbientOcclusion(config.segmentation)
    };
  }

  calculateSelfShadows(anchorPoints) {
    return anchorPoints.map(point => ({
      x: point.x + 2,
      y: point.y + 2,
      opacity: 0.3 * (point.weight || 1),
      blur: 5
    }));
  }

  calculateCastShadows(measurements) {
    return {
      chestShadow: { intensity: 0.4, direction: 'down' },
      armShadows: { intensity: 0.3, direction: 'diagonal' }
    };
  }

  calculateAmbientOcclusion(segmentation) {
    return {
      bodyOcclusion: 0.2,
      clothingOcclusion: 0.15,
      blendMode: 'multiply'
    };
  }

  detectLightingConditions() {
    return {
      direction: { x: 0.3, y: -0.7, z: 0.6 },
      intensity: 0.8,
      color: { r: 255, g: 250, b: 240 },
      ambient: 0.3
    };
  }

  calculateMovementVector(pose) {

    return { x: 0, y: 0, velocity: 0 };
  }
}

const AdvancedCameraView = ({ selectedProduct, filters, onCapture, onMeasurementUpdate }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const poseEngineRef = useRef(null);
  const clothWarpEngineRef = useRef(null);
  
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPose, setCurrentPose] = useState(null);
  const [bodySegmentation, setBodySegmentation] = useState(null);
  const [aiMetrics, setAiMetrics] = useState({
    fittingScore: 0,
    poseStability: 0,
    measurementAccuracy: 0,
    processingFPS: 0
  });
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [virtualClothing, setVirtualClothing] = useState(null);
  const [poses, setPoses] = useState([]);
  const [overlayStyle, setOverlayStyle] = useState({
    blend: 'multiply',
    opacity: 0.8
  });
  const [isRecording, setIsRecording] = useState(false);

  const captureImage = useCallback(() => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      
      const imageData = canvas.toDataURL('image/png');
      if (onCapture) {
        onCapture({
          image: imageData,
          pose: currentPose,
          measurements: aiMetrics,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [onCapture, currentPose, aiMetrics]);

  useEffect(() => {
    initializeAI();
    return () => cleanup();
  }, []);

  const initializeAI = async () => {
    setIsProcessing(true);
    try {
      poseEngineRef.current = new AdvancedPoseEngine();
      clothWarpEngineRef.current = new ClothWarpingEngine();
      
      await poseEngineRef.current.initialize();
      
      console.log('AI engines initialized successfully');
      startCamera();
    } catch (error) {
      console.error('AI initialization failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsActive(true);
          startAIProcessing();
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setIsActive(false);
    }
  };

  const startAIProcessing = useCallback(() => {
    let frameCount = 0;
    let lastTime = Date.now();
    
    const processFrame = async () => {
      if (!isActive || !videoRef.current || !poseEngineRef.current?.isInitialized) {
        return;
      }

      try {
        frameCount++;
        const currentTime = Date.now();

        if (frameCount % 30 === 0) {
          const fps = 30000 / (currentTime - lastTime);
          setAiMetrics(prev => ({ ...prev, processingFPS: Math.round(fps) }));
          lastTime = currentTime;
        }

        const pose = await poseEngineRef.current.detectPose(videoRef.current);
        
        if (pose) {
          setCurrentPose(pose);

          if (pose.keypoints) {
            setPoses(pose.keypoints.map(kp => ({
              x: kp.x,
              y: kp.y,
              score: kp.score
            })));
          }

          setAiMetrics(prev => ({
            ...prev,
            fittingScore: Math.round(pose.fittingScore * 100),
            poseStability: Math.round(pose.bodyMeasurements.confidence * 100),
            measurementAccuracy: Math.round(pose.bodyMeasurements.confidence * 100)
          }));

          if (onMeasurementUpdate) {
            onMeasurementUpdate(pose.bodyMeasurements);
          }

          if (frameCount % 10 === 0) { // Run segmentation every 10 frames for performance
            const segmentation = await poseEngineRef.current.segmentBody(videoRef.current);
            setBodySegmentation(segmentation);
          }

          if (selectedProduct && clothWarpEngineRef.current) {
            const warpedClothing = clothWarpEngineRef.current.warpClothingToBody(
              selectedProduct.image,
              pose,
              bodySegmentation,
              selectedProduct.fabric || 'cotton'
            );
            setVirtualClothing(warpedClothing);
          }

          renderAROverlay(pose, virtualClothing);
        }
      } catch (error) {
        console.error('AI processing frame error:', error);
      }

      if (isActive) {
        requestAnimationFrame(processFrame);
      }
    };
    
    requestAnimationFrame(processFrame);
  }, [isActive, selectedProduct, bodySegmentation]);

  const renderAROverlay = useCallback((pose, clothing) => {
    const overlayCanvas = overlayCanvasRef.current;
    const video = videoRef.current;
    
    if (!overlayCanvas || !video || !pose) return;
    
    const ctx = overlayCanvas.getContext('2d');
    overlayCanvas.width = video.videoWidth;
    overlayCanvas.height = video.videoHeight;

    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (calibrationMode && pose.clothingAnchorPoints) {
      drawPoseSkeleton(ctx, pose.clothingAnchorPoints);
    }

    drawBodyMeasurements(ctx, pose.bodyMeasurements);

    if (clothing && selectedProduct) {
      drawVirtualClothing(ctx, clothing, pose);
    }

    drawAIIndicators(ctx, pose);
  }, [calibrationMode, selectedProduct]);

  const drawPoseSkeleton = (ctx, anchorPoints) => {
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#00ff41';

    anchorPoints.forEach(point => {
      if (point.x && point.y && point.score > 0.5) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6 * point.weight, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(point.type.split('_')[1], point.x + 10, point.y - 5);
        ctx.fillStyle = '#00ff41';
      }
    });

    const connections = [
      ['shoulder_left', 'shoulder_right'],
      ['shoulder_left', 'elbow_left'],
      ['shoulder_right', 'elbow_right'],
      ['elbow_left', 'wrist_left'],
      ['elbow_right', 'wrist_right'],
      ['hip_left', 'hip_right']
    ];
    
    connections.forEach(([start, end]) => {
      const startPoint = anchorPoints.find(p => p.type === start);
      const endPoint = anchorPoints.find(p => p.type === end);
      
      if (startPoint && endPoint && startPoint.score > 0.5 && endPoint.score > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    });
  };

  const drawBodyMeasurements = (ctx, measurements) => {
    if (!measurements || measurements.confidence < 0.3) return;
    
    ctx.fillStyle = 'rgba(0, 255, 65, 0.8)';
    ctx.font = 'bold 16px Arial';
    
    const measurementText = [
      `Height: ${Math.round(measurements.height)}px`,
      `Shoulder: ${Math.round(measurements.shoulderWidth)}px`,
      `Chest: ${Math.round(measurements.chestWidth)}px`,
      `Waist: ${Math.round(measurements.waistWidth)}px`,
      `Confidence: ${Math.round(measurements.confidence * 100)}%`
    ];
    
    measurementText.forEach((text, index) => {
      ctx.fillText(text, 20, 30 + index * 25);
    });
  };

  const drawVirtualClothing = (ctx, clothing, pose) => {
    if (!clothing || !clothing.warpedImage || !pose.clothingAnchorPoints) return;
    
    try {

      ctx.globalCompositeOperation = 'source-over';

      if (clothing.shadowsAndHighlights) {
        drawClothingShadows(ctx, clothing.shadowsAndHighlights, pose);
      }

      drawWarpedClothing(ctx, clothing, pose);

      if (clothing.fabricBehavior) {
        drawFabricDetails(ctx, clothing.fabricBehavior, pose);
      }

      ctx.globalCompositeOperation = 'source-over';
    } catch (error) {
      console.error('Virtual clothing rendering error:', error);
    }
  };

  const drawClothingShadows = (ctx, shadows, pose) => {
    ctx.globalCompositeOperation = 'multiply';
    
    if (shadows.selfShadows) {
      shadows.selfShadows.forEach(shadow => {
        const gradient = ctx.createRadialGradient(
          shadow.x, shadow.y, 0,
          shadow.x, shadow.y, shadow.blur * 2
        );
        gradient.addColorStop(0, `rgba(0, 0, 0, ${shadow.opacity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(shadow.x, shadow.y, shadow.blur * 2, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  };

  const drawWarpedClothing = (ctx, clothing, pose) => {

    const anchorPoints = pose.clothingAnchorPoints;
    
    if (anchorPoints.length >= 4) {
      const leftShoulder = anchorPoints.find(p => p.type === 'shoulder_left');
      const rightShoulder = anchorPoints.find(p => p.type === 'shoulder_right');
      const leftHip = anchorPoints.find(p => p.type === 'hip_left');
      const rightHip = anchorPoints.find(p => p.type === 'hip_right');
      
      if (leftShoulder && rightShoulder && leftHip && rightHip) {

        ctx.strokeStyle = selectedProduct?.color || '#4f46e5';
        ctx.fillStyle = `${selectedProduct?.color || '#4f46e5'}40`;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(leftShoulder.x, leftShoulder.y);
        ctx.lineTo(rightShoulder.x, rightShoulder.y);
        ctx.lineTo(rightHip.x + 30, rightHip.y);
        ctx.lineTo(leftHip.x - 30, leftHip.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        drawFabricTexture(ctx, leftShoulder, rightShoulder, leftHip, rightHip);
      }
    }
  };

  const drawFabricTexture = (ctx, leftShoulder, rightShoulder, leftHip, rightHip) => {
    const fabricType = selectedProduct?.fabric || 'cotton';

    switch (fabricType) {
      case 'silk':

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const y = leftShoulder.y + (leftHip.y - leftShoulder.y) * (i / 5);
          ctx.beginPath();
          ctx.moveTo(leftShoulder.x, y);
          ctx.lineTo(rightShoulder.x, y);
          ctx.stroke();
        }
        break;
        
      case 'denim':

        ctx.strokeStyle = 'rgba(0, 0, 100, 0.2)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const x = leftShoulder.x + (rightShoulder.x - leftShoulder.x) * (i / 3);
          ctx.beginPath();
          ctx.moveTo(x, leftShoulder.y);
          ctx.lineTo(x, leftHip.y);
          ctx.stroke();
        }
        break;
        
      default:

        ctx.strokeStyle = 'rgba(200, 200, 200, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
          const y = leftShoulder.y + (leftHip.y - leftShoulder.y) * (i / 10);
          ctx.beginPath();
          ctx.moveTo(leftShoulder.x, y);
          ctx.lineTo(rightShoulder.x, y);
          ctx.stroke();
        }
    }
  };

  const drawFabricDetails = (ctx, fabricBehavior, pose) => {

    if (fabricBehavior.wrinkles) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      
      fabricBehavior.wrinkles.forEach(wrinkle => {
        if (wrinkle.intensity > 0.3) {
          ctx.beginPath();
          ctx.moveTo(wrinkle.x - 5, wrinkle.y);
          ctx.lineTo(wrinkle.x + 5, wrinkle.y);
          ctx.stroke();
        }
      });
    }
  };

  const drawAIIndicators = (ctx, pose) => {

    const indicatorSize = 100;
    const x = ctx.canvas.width - indicatorSize - 20;
    const y = 20;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(x + indicatorSize/2, y + indicatorSize/2, indicatorSize/2, 0, 2 * Math.PI);
    ctx.fill();

    const confidence = pose.fittingScore || 0;
    ctx.strokeStyle = confidence > 0.7 ? '#00ff41' : confidence > 0.4 ? '#ffaa00' : '#ff4444';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(
      x + indicatorSize/2, 
      y + indicatorSize/2, 
      indicatorSize/2 - 10, 
      -Math.PI/2, 
      -Math.PI/2 + (confidence * 2 * Math.PI)
    );
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${Math.round(confidence * 100)}%`,
      x + indicatorSize/2,
      y + indicatorSize/2 + 5
    );
    ctx.textAlign = 'left';
  };

  const captureHighQualityImage = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (overlayCanvas) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(overlayCanvas, 0, 0, canvas.width, canvas.height);
    }

    if (filters) {
      applyAdvancedFilters(ctx, filters);
    }
    
    const imageData = canvas.toDataURL('image/png', 1.0);
    onCapture({
      image: imageData,
      pose: currentPose,
      measurements: currentPose?.bodyMeasurements,
      aiMetrics,
      timestamp: Date.now()
    });
  };

  const applyAdvancedFilters = (ctx, filters) => {
    if (filters.vintage) {
      ctx.filter = 'sepia(0.8) contrast(1.2) brightness(0.9)';
      ctx.drawImage(ctx.canvas, 0, 0);
    }
    
    if (filters.beauty) {
      ctx.filter = 'blur(0.5px) brightness(1.1) contrast(0.9)';
      ctx.drawImage(ctx.canvas, 0, 0);
    }
    
    if (filters.dramatic) {
      ctx.filter = 'contrast(1.5) saturate(1.3) brightness(0.8)';
      ctx.drawImage(ctx.canvas, 0, 0);
    }
    
    ctx.filter = 'none';
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
  };

  const applyVirtualClothing = (ctx, width, height) => {
    if (!selectedProduct) return;

    ctx.save();

    ctx.globalCompositeOperation = overlayStyle.blend;
    ctx.globalAlpha = overlayStyle.opacity;

    const centerX = width * 0.5;
    const centerY = height * 0.4;
    const clothWidth = width * 0.35;
    const clothHeight = height * 0.45;

    const gradient = ctx.createLinearGradient(
      centerX - clothWidth/2, centerY,
      centerX + clothWidth/2, centerY + clothHeight
    );

    const productColors = {
      shirt: ['#3B82F6', '#1E40AF'],
      dress: ['#EC4899', '#BE185D'],
      jacket: ['#059669', '#047857'],
      tshirt: ['#F59E0B', '#D97706']
    };
    
    const colors = productColors[selectedProduct.category] || ['#6366F1', '#4338CA'];
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.roundRect(
      centerX - clothWidth/2,
      centerY,
      clothWidth,
      clothHeight,
      20
    );
    ctx.fill();

    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    
    for (let i = 0; i < 20; i++) {
      const x = (centerX - clothWidth/2) + Math.random() * clothWidth;
      const y = centerY + Math.random() * clothHeight;
      ctx.fillRect(x, y, 2, 2);
    }

    ctx.restore();
  };

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden h-full">
      {}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {}
      <canvas ref={canvasRef} className="hidden" />
      
      {}
      <div className="absolute inset-0 pointer-events-none">
        {poses.map((pose, index) => (
          <motion.div
            key={index}
            className="absolute w-3 h-3 bg-blue-400 rounded-full"
            style={{
              left: pose.x,
              top: pose.y,
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)'
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          />
        ))}
        
        {}
        {poses.length >= 6 && (
          <svg className="absolute inset-0 w-full h-full">
            <path
              d={`M ${poses[0]?.x} ${poses[0]?.y} 
                  L ${poses[1]?.x} ${poses[1]?.y}
                  L ${poses[3]?.x} ${poses[3]?.y}
                  L ${poses[5]?.x} ${poses[5]?.y}
                  L ${poses[4]?.x} ${poses[4]?.y}
                  L ${poses[2]?.x} ${poses[2]?.y}
                  Z`}
              stroke="rgba(59, 130, 246, 0.5)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="10,5"
            />
          </svg>
        )}
      </div>
      
      {}
      <div className="absolute top-4 left-4 space-y-2">
        <motion.div 
          className="bg-black/50 backdrop-blur rounded-full px-3 py-1 text-white text-sm flex items-center space-x-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>AR Active</span>
        </motion.div>
        
        {selectedProduct && (
          <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1 text-white text-sm">
            {selectedProduct.name}
          </div>
        )}
        
        <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1 text-white text-sm">
          Poses: {poses.length}
        </div>
      </div>
      
      {}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={captureImage}
            className="bg-white/90 backdrop-blur rounded-full p-4 text-gray-800 shadow-lg"
          >
            <FaCamera className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsRecording(!isRecording)}
            className={`backdrop-blur rounded-full p-4 shadow-lg ${
              isRecording ? 'bg-red-500/90 text-white' : 'bg-white/90 text-gray-800'
            }`}
          >
            <FaVideo className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOverlayStyle(prev => ({
              ...prev,
              opacity: prev.opacity === 0.8 ? 0.5 : 0.8
            }))}
            className="bg-white/90 backdrop-blur rounded-full p-3 text-gray-800 shadow-lg"
          >
            <FaPalette className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

const ProductGrid = ({ products, selectedProduct, onSelect }) => {
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', 'shirt', 'dress', 'jacket', 'tshirt', 'pants'];
  
  const filteredProducts = products.filter(product => {
    const matchesCategory = category === 'all' || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Choose Your Style</h3>
      
      {}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/30 text-white rounded-lg px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(cat => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              category === cat
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/20 text-gray-300 hover:bg-white/30'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </motion.button>
        ))}
      </div>
      
      {}
      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        {filteredProducts.map(product => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(product)}
            className={`cursor-pointer rounded-xl p-4 transition-all ${
              selectedProduct?.id === product.id
                ? 'bg-blue-500/30 border-2 border-blue-400 shadow-xl'
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
          >
            <div className="w-full h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg mb-3 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {product.name.charAt(0)}
              </span>
            </div>
            
            <h4 className="text-white font-semibold text-sm mb-1">{product.name}</h4>
            <p className="text-gray-400 text-xs mb-2">{product.brand}</p>
            <div className="flex justify-between items-center">
              <span className="text-green-400 font-bold text-sm">{product.price}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-red-400 hover:text-red-300"
              >
                <FaHeart className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const SettingsPanel = ({ settings, onUpdate }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">AR Settings</h3>
      
      <div className="space-y-6">
        {}
        <div>
          <label className="block text-gray-300 mb-2 text-sm">Overlay Opacity</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={settings.opacity}
            onChange={(e) => onUpdate({ ...settings, opacity: parseFloat(e.target.value) })}
            className="w-full accent-blue-500"
          />
          <span className="text-gray-400 text-xs">{Math.round(settings.opacity * 100)}%</span>
        </div>
        
        {}
        <div>
          <label className="block text-gray-300 mb-2 text-sm">Blend Mode</label>
          <select
            value={settings.blendMode}
            onChange={(e) => onUpdate({ ...settings, blendMode: e.target.value })}
            className="w-full bg-black/30 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="multiply">Multiply</option>
            <option value="overlay">Overlay</option>
            <option value="screen">Screen</option>
            <option value="soft-light">Soft Light</option>
          </select>
        </div>
        
        {}
        <div>
          <label className="block text-gray-300 mb-2 text-sm">Fit</label>
          <div className="grid grid-cols-3 gap-2">
            {['Loose', 'Regular', 'Tight'].map(fit => (
              <motion.button
                key={fit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdate({ ...settings, fit: fit.toLowerCase() })}
                className={`py-2 px-3 rounded-lg text-xs transition-all ${
                  settings.fit === fit.toLowerCase()
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/20 text-gray-300 hover:bg-white/30'
                }`}
              >
                {fit}
              </motion.button>
            ))}
          </div>
        </div>
        
        {}
        <div>
          <label className="block text-gray-300 mb-2 text-sm">Filters</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.vintage}
                onChange={(e) => onUpdate({ ...settings, vintage: e.target.checked })}
                className="accent-blue-500"
              />
              <span className="text-gray-300 text-xs">Vintage</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.dramatic}
                onChange={(e) => onUpdate({ ...settings, dramatic: e.target.checked })}
                className="accent-blue-500"
              />
              <span className="text-gray-300 text-xs">Dramatic</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const VirtualTryOn = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bodyMeasurements, setBodyMeasurements] = useState({
    height: 0,
    shoulderWidth: 0,
    chestWidth: 0,
    waistWidth: 0,
    confidence: 0
  });
  const [settings, setSettings] = useState({
    opacity: 0.8,
    blendMode: 'multiply',
    fit: 'regular',
    vintage: false,
    dramatic: false,
    beauty: false
  });

  useEffect(() => {
    analytics.initialize();
    analytics.trackEvent('virtual_tryon_page_loaded', {
      timestamp: new Date().toISOString()
    });

    return () => {
      analytics.trackEvent('virtual_tryon_page_unloaded', {
        sessionDuration: Date.now() - performance.timing.navigationStart
      });
    };
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      analytics.trackEvent('product_selected', {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        category: selectedProduct.category,
        brand: selectedProduct.brand
      });

      analytics.trackTryOn('start', selectedProduct.id, {
        fittingScore: 0,
        poseStability: 0,
        processingTime: 0
      });
    }
  }, [selectedProduct]);

  const products = [
    { id: 1, name: 'Classic T-Shirt', category: 'tshirt', brand: 'StyleCo', price: '$29.99' },
    { id: 2, name: 'Elegant Dress', category: 'dress', brand: 'Fashion Plus', price: '$79.99' },
    { id: 3, name: 'Denim Jacket', category: 'jacket', brand: 'Urban Style', price: '$89.99' },
    { id: 4, name: 'Casual Shirt', category: 'shirt', brand: 'ComfortWear', price: '$45.99' },
    { id: 5, name: 'Slim Jeans', category: 'pants', brand: 'DeniMax', price: '$65.99' },
    { id: 6, name: 'Summer Dress', category: 'dress', brand: 'Beach Vibes', price: '$55.99' },
  ];

  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);

    analytics.trackEvent('product_view', {
      productId: product.id,
      productName: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price
    });

    analytics.updateProductAnalytics(product.id, 'view', 1, {
      timestamp: new Date().toISOString()
    });
  }, []);

  const handleCapture = (captureData) => {
    const newCapture = {
      id: Date.now(),
      image: captureData.image || captureData, // Support both old and new format
      product: selectedProduct,
      timestamp: new Date().toISOString(),
      settings: { ...settings },
      measurements: captureData.measurements || null,
      aiMetrics: captureData.aiMetrics || null,
      pose: captureData.pose || null
    };
    setCapturedImages(prev => [newCapture, ...prev]);

    analytics.trackEvent('virtual_tryon_capture', {
      productId: selectedProduct?.id,
      captureId: newCapture.id,
      hasAiMetrics: !!captureData.aiMetrics,
      hasPoseData: !!captureData.pose,
      settings: settings
    });

    if (captureData.aiMetrics) {
      analytics.trackEvent('ai_performance', {
        fittingScore: captureData.aiMetrics.fittingScore,
        poseStability: captureData.aiMetrics.poseStability,
        processingTime: captureData.aiMetrics.processingTime,
        confidence: captureData.aiMetrics.confidence || captureData.aiMetrics.fittingScore
      });

      analytics.trackTryOn('success', selectedProduct?.id, captureData.aiMetrics);
    }
  };

  const handleMeasurementUpdate = (measurements) => {
    setBodyMeasurements(measurements);
  };

  const handleShare = async (imageData) => {
    if (navigator.share) {
      try {
        const response = await fetch(imageData);
        const blob = await response.blob();
        const file = new File([blob], 'virtual-tryon.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My Virtual Try-On',
          text: 'Check out how I look in this outfit!',
          files: [file]
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {

      const link = document.createElement('a');
      link.download = 'virtual-tryon.png';
      link.href = imageData;
      link.click();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 ${isFullscreen ? 'p-0' : 'p-6'}`}>
      {}
      {!isFullscreen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-black text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text mb-4">
            Virtual Try-On
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the future of fashion with our AI-powered virtual try-on technology. 
            See how you look in any outfit instantly!
          </p>
        </motion.div>
      )}

      {}
      <div className={`${isFullscreen ? 'h-screen' : 'max-w-7xl mx-auto'}`}>
        <div className={`grid ${isFullscreen ? 'grid-cols-1 h-full' : 'grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]'}`}>
          
          {}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${isFullscreen ? 'col-span-full' : 'lg:col-span-3'} relative`}
          >
            <AdvancedCameraView
              selectedProduct={selectedProduct}
              filters={settings}
              onCapture={handleCapture}
              onMeasurementUpdate={handleMeasurementUpdate}
            />
            
            {}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-black/50 backdrop-blur rounded-full p-3 text-white hover:bg-black/70"
            >
              {isFullscreen ? <FaCompress className="w-5 h-5" /> : <FaExpand className="w-5 h-5" />}
            </motion.button>
          </motion.div>

          {}
          {!isFullscreen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 overflow-y-auto"
            >
              {}
              <ProductGrid
                products={products}
                selectedProduct={selectedProduct}
                onSelect={handleProductSelect}
              />

              {}
              <SettingsPanel
                settings={settings}
                onUpdate={setSettings}
              />
            </motion.div>
          )}
        </div>

        {}
        {selectedProduct && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-6 space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg flex items-center space-x-2"
            >
              <FaShoppingCart />
              <span>Add to Cart</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg flex items-center space-x-2"
            >
              <FaHeart />
              <span>Save Look</span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {}
      {capturedImages.length > 0 && !isFullscreen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 max-w-7xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Your Looks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {capturedImages.map((capture) => (
              <motion.div
                key={capture.id}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group cursor-pointer"
              >
                <img
                  src={capture.image}
                  alt="Captured look"
                  className="w-full aspect-square object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleShare(capture.image)}
                    className="bg-white/20 backdrop-blur rounded-full p-2 text-white"
                  >
                    <FaShare className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = `look-${capture.id}.png`;
                      link.href = capture.image;
                      link.click();
                    }}
                    className="bg-white/20 backdrop-blur rounded-full p-2 text-white"
                  >
                    <FaDownload className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black/70 backdrop-blur rounded-lg p-2">
                    <p className="text-white text-xs font-semibold">{capture.product.name}</p>
                    <p className="text-gray-300 text-xs">{new Date(capture.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {}
      {!isFullscreen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 max-w-7xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Our Virtual Try-On?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Experience cutting-edge technology that revolutionizes online shopping
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FaEye,
                title: "Real-time AR",
                description: "See yourself in clothes instantly with advanced augmented reality"
              },
              {
                icon: FaBolt,
                title: "Lightning Fast",
                description: "Zero lag, 60fps rendering for smooth and responsive experience"
              },
              {
                icon: FaMagic,
                title: "AI-Powered",
                description: "Smart pose detection and realistic clothing simulation"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/20"
              >
                <feature.icon className="text-5xl text-blue-400 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VirtualTryOn;