

import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';

export class BodyAnalysisService {
  constructor() {
    this.detector = null;
    this.isInitialized = false;
  }

  
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {

      await tf.ready();
      await tf.setBackend('webgl');

      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
      };
      
      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );

      this.isInitialized = true;
      console.log('Body Analysis Service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize Body Analysis:', error);
      throw new Error('Failed to initialize body analysis: ' + error.message);
    }
  }

  
  async analyzeFromImage(imageElement) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const poses = await this.detector.estimatePoses(imageElement);
      
      if (poses.length === 0) {
        return {
          success: false,
          error: 'No person detected in image'
        };
      }

      const pose = poses[0];
      const measurements = this.calculateMeasurements(pose);
      const bodyType = this.determineBodyType(measurements);
      const sizeRecommendations = this.recommendSizes(measurements);

      return {
        success: true,
        pose,
        measurements,
        bodyType,
        sizeRecommendations,
        confidence: this.calculateConfidence(pose)
      };
    } catch (error) {
      console.error('Body analysis failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  
  calculateMeasurements(pose) {
    const keypoints = pose.keypoints;
    const keypointMap = {};
    
    keypoints.forEach(kp => {
      keypointMap[kp.name] = kp;
    });

    const shoulderWidth = this.calculateDistance(
      keypointMap['left_shoulder'],
      keypointMap['right_shoulder']
    );

    const torsoHeight = this.calculateDistance(
      keypointMap['left_shoulder'],
      keypointMap['left_hip']
    ) || this.calculateDistance(
      keypointMap['right_shoulder'],
      keypointMap['right_hip']
    );

    const hipWidth = this.calculateDistance(
      keypointMap['left_hip'],
      keypointMap['right_hip']
    );

    const scaledShoulder = shoulderWidth ? this.validateMeasurement(shoulderWidth * 0.4, 'shoulder') : 0;
    const scaledChest = shoulderWidth ? this.validateMeasurement(shoulderWidth * 0.6, 'chest') : 0;
    const scaledWaist = hipWidth ? this.validateMeasurement(hipWidth * 0.5, 'waist') : 0;
    const scaledHips = hipWidth ? this.validateMeasurement(hipWidth * 0.7, 'hips') : 0;
    const scaledTorso = torsoHeight ? this.validateMeasurement(torsoHeight * 0.8, 'torso') : 0;
    
    return {
      shoulderWidth: Math.round(scaledShoulder),
      chestCircumference: Math.round(scaledChest), 
      waistCircumference: Math.round(scaledWaist),
      hipCircumference: Math.round(scaledHips),
      torsoLength: Math.round(scaledTorso),
      height: this.estimateHeight(keypointMap),
      unit: 'cm (estimated)',
      confidence: this.calculateMeasurementConfidence({
        shoulderWidth: scaledShoulder,
        chest: scaledChest,
        waist: scaledWaist, 
        hips: scaledHips
      })
    };
  }

  
  validateMeasurement(value, type) {
    const ranges = {
      shoulder: { min: 35, max: 55 },
      chest: { min: 70, max: 130 },
      waist: { min: 60, max: 120 },
      hips: { min: 75, max: 140 },
      torso: { min: 40, max: 80 }
    };
    
    const range = ranges[type];
    if (!range) return Math.max(value, 0);
    
    return Math.min(Math.max(value, range.min), range.max);
  }

  
  calculateMeasurementConfidence(measurements) {
    let totalConfidence = 0;
    let count = 0;
    
    Object.entries(measurements).forEach(([key, value]) => {
      if (value > 0) {

        const normalizedConfidence = key === 'chest' && value > 80 && value < 110 ? 0.9 :
                                    key === 'waist' && value > 70 && value < 95 ? 0.9 :
                                    key === 'hips' && value > 85 && value < 115 ? 0.9 : 0.7;
        totalConfidence += normalizedConfidence;
        count++;
      }
    });
    
    return count > 0 ? totalConfidence / count : 0.5;
  }

  
  calculateDistance(point1, point2) {
    if (!point1 || !point2 || point1.score < 0.3 || point2.score < 0.3) {
      return null;
    }

    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  
  estimateHeight(keypointMap) {
    const nose = keypointMap['nose'];
    const leftAnkle = keypointMap['left_ankle'];
    const rightAnkle = keypointMap['right_ankle'];

    if (!nose || nose.score < 0.3) return 0;
    
    const ankle = leftAnkle && leftAnkle.score > 0.3 
      ? leftAnkle 
      : (rightAnkle && rightAnkle.score > 0.3 ? rightAnkle : null);

    if (!ankle) return 0;

    const heightInPixels = Math.abs(nose.y - ankle.y);

    const estimatedHeight = heightInPixels * 0.35; // Adjusted scaling factor

    const validatedHeight = Math.min(Math.max(estimatedHeight, 140), 220);
    return Math.round(validatedHeight);
  }

  
  determineBodyType(measurements) {
    const { shoulderWidth, waistCircumference, hipCircumference } = measurements;

    if (!shoulderWidth || !waistCircumference || !hipCircumference) {
      return {
        type: 'Unknown',
        description: 'Insufficient data to determine body type',
        confidence: 0
      };
    }

    const shoulderHipRatio = shoulderWidth / (hipCircumference / 160);
    const waistHipRatio = waistCircumference / hipCircumference;

    let type, description;

    if (shoulderHipRatio > 1.05 && waistHipRatio < 0.75) {
      type = 'Inverted Triangle';
      description = 'Broader shoulders, narrower hips';
    } else if (shoulderHipRatio < 0.95 && waistHipRatio < 0.75) {
      type = 'Pear';
      description = 'Narrower shoulders, wider hips';
    } else if (waistHipRatio > 0.85) {
      type = 'Apple';
      description = 'Rounder midsection';
    } else if (Math.abs(shoulderHipRatio - 1) < 0.05 && waistHipRatio < 0.75) {
      type = 'Hourglass';
      description = 'Balanced shoulders and hips, defined waist';
    } else {
      type = 'Rectangle';
      description = 'Similar measurements throughout';
    }

    return {
      type,
      description,
      confidence: 0.75
    };
  }

  
  recommendSizes(measurements) {
    const { chestCircumference, waistCircumference, hipCircumference } = measurements;

    const sizeChart = {
      XS: { chest: [81, 86], waist: [61, 66], hip: [86, 91] },
      S: { chest: [86, 91], waist: [66, 71], hip: [91, 96] },
      M: { chest: [91, 96], waist: [71, 76], hip: [96, 101] },
      L: { chest: [96, 101], waist: [76, 81], hip: [101, 106] },
      XL: { chest: [101, 106], waist: [81, 86], hip: [106, 111] },
      XXL: { chest: [106, 116], waist: [86, 96], hip: [111, 121] }
    };

    const findSize = (measurement, type) => {
      for (const [size, ranges] of Object.entries(sizeChart)) {
        if (measurement >= ranges[type][0] && measurement <= ranges[type][1]) {
          return size;
        }
      }
      return measurement < 81 ? 'XS' : 'XXL';
    };

    return {
      sizes: {
        tops: findSize(chestCircumference, 'chest'),
        bottoms: findSize(waistCircumference, 'waist'),
        dresses: findSize(hipCircumference, 'hip')
      },
      measurements: {
        chest: `${chestCircumference} cm`,
        waist: `${waistCircumference} cm`,
        hips: `${hipCircumference} cm`
      },
      confidence: 0.7,
      note: 'Sizes are estimated based on detected body proportions'
    };
  }

  
  calculateConfidence(pose) {
    if (!pose || !pose.keypoints) return 0;

    const scores = pose.keypoints
      .filter(kp => ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'].includes(kp.name))
      .map(kp => kp.score || 0);

    if (scores.length === 0) return 0;

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(avgScore * 100) / 100;
  }

  
  dispose() {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
    this.isInitialized = false;
  }
}

export default BodyAnalysisService;
