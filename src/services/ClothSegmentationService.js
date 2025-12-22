

import * as tf from '@tensorflow/tfjs';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import { colorSegmentationToLabelMatrix } from './segmentationColorMap';

export class ClothSegmentationService {
  constructor() {
    this.segmentationModel = null;
    this.isInitialized = false;

    this.garmentTypes = {
      UPPER_BODY: 'upper_body',  // Shirts, jackets, dresses (top)
      LOWER_BODY: 'lower_body',  // Pants, skirts, shorts
      FULL_BODY: 'full_body',    // Dresses, jumpsuits
      ACCESSORIES: 'accessories'  // Hats, scarves, jewelry
    };
  }

  
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('ðŸŽ¨ Initializing Cloth Segmentation Service...');

      const segmentationConfig = {
        runtime: 'tfjs',
        modelType: 'general'
      };
      
      this.segmentationModel = await bodySegmentation.createSegmenter(
        bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
        segmentationConfig
      );
      
      this.isInitialized = true;
      console.log('âœ… Cloth Segmentation Service initialized');
      
    } catch (error) {
      console.error('âŒ Failed to initialize Cloth Segmentation:', error);
      throw error;
    }
  }

  
  async segmentCloth(garmentImage, garmentType = this.garmentTypes.UPPER_BODY) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {

      const imageTensor = tf.browser.fromPixels(garmentImage);

      const clothMask = await this.createClothMask(imageTensor, garmentType);

      const boundaries = await this.detectGarmentBoundaries(clothMask);

      const keyPoints = await this.extractGarmentKeyPoints(boundaries, garmentType);
      
      return {
        mask: clothMask,
        boundaries,
        keyPoints,
        garmentType,
        confidence: this.calculateMaskConfidence(clothMask)
      };
      
    } catch (error) {
      console.error('âŒ Cloth segmentation failed:', error);
      return {
        mask: null,
        boundaries: [],
        keyPoints: [],
        garmentType,
        confidence: 0,
        error: error.message
      };
    }
  }

  
  async createClothMask(imageTensor, garmentType) {
    const [height, width] = imageTensor.shape.slice(0, 2);

    try {

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const imageData = new ImageData(Uint8ClampedArray.from(await tf.browser.toPixels(imageTensor)), width, height);
      ctx.putImageData(imageData, 0, 0);

      const labelMatrix = colorSegmentationToLabelMatrix(canvas);
  const flat = Float32Array.from(labelMatrix.flat().map(v => (v > 0 ? 1 : 0)));
  const mask = tf.tensor(flat, [height, width]);
      const cleaned = this.applyMorphologicalOps(mask);
      return cleaned;
    } catch (err) {
      console.warn('Color segmentation parsing failed or not applicable, falling back to thresholding:', err.message || err);

  const mask = tf.tidy(() => {

        const gray = tf.image.rgbToGrayscale(imageTensor);

        const threshold = tf.scalar(240);
        const backgroundMask = tf.less(gray, threshold);

        const cleanedMask = this.applyMorphologicalOps(backgroundMask);

        return cleanedMask;
      });

  return mask;
    }
  }

  
  applyMorphologicalOps(mask) {
    return tf.tidy(() => {

      const expanded = mask.expandDims(-1);
      const dilated = tf.dilation2d(expanded, [3, 3], [1, 1], 'same');

      const inverted = tf.sub(1, dilated);
      const invertedDilated = tf.dilation2d(inverted, [3, 3], [1, 1], 'same');
      const eroded = tf.sub(1, invertedDilated);
      
      return eroded.squeeze();
    });
  }

  
  async detectGarmentBoundaries(mask) {
    const maskArray = await mask.array();
    const [height, width] = mask.shape;
    
    const boundaries = {
      top: [],
      bottom: [],
      left: [],
      right: [],
      shoulders: [],
      sleeves: [],
      waist: [],
      hem: []
    };

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (maskArray[y][x] > 0.5) {
          boundaries.top.push({ x, y });
          break;
        }
      }
    }

    for (let x = 0; x < width; x++) {
      for (let y = height - 1; y >= 0; y--) {
        if (maskArray[y][x] > 0.5) {
          boundaries.bottom.push({ x, y });
          break;
        }
      }
    }

    for (let y = 0; y < height; y++) {

      for (let x = 0; x < width; x++) {
        if (maskArray[y][x] > 0.5) {
          boundaries.left.push({ x, y });
          break;
        }
      }

      for (let x = width - 1; x >= 0; x--) {
        if (maskArray[y][x] > 0.5) {
          boundaries.right.push({ x, y });
          break;
        }
      }
    }
    
    return boundaries;
  }

  
  async extractGarmentKeyPoints(boundaries, garmentType) {
    const keyPoints = {
      shoulders: [],
      collar: [],
      sleeves: [],
      waist: [],
      hem: []
    };
    
    if (garmentType === this.garmentTypes.UPPER_BODY) {

      if (boundaries.top.length > 0) {
        const topPoints = boundaries.top;
        const quarterPoint = Math.floor(topPoints.length / 4);
        const threeQuarterPoint = Math.floor((topPoints.length * 3) / 4);
        
        keyPoints.shoulders = [
          topPoints[quarterPoint],      // Left shoulder
          topPoints[threeQuarterPoint]  // Right shoulder
        ];

        keyPoints.collar = [topPoints[Math.floor(topPoints.length / 2)]];
      }

      if (boundaries.left.length > 0 && boundaries.right.length > 0) {
        const midHeight = Math.floor(boundaries.left.length / 2);
        keyPoints.sleeves = [
          boundaries.left[midHeight],
          boundaries.right[midHeight]
        ];
      }
    }
    
    if (garmentType === this.garmentTypes.LOWER_BODY) {

      if (boundaries.top.length > 0) {
        keyPoints.waist = boundaries.top;
      }

      if (boundaries.bottom.length > 0) {
        keyPoints.hem = boundaries.bottom;
      }
    }
    
    return keyPoints;
  }

  
  calculateMaskConfidence(mask) {
    return tf.tidy(() => {

      const totalPixels = mask.size;
      const maskedPixels = mask.sum().dataSync()[0];
      const coverage = maskedPixels / totalPixels;

      const edges = tf.image.sobelEdges(mask.expandDims(-1));
      const edgeDensity = edges.magnitude.mean().dataSync()[0];

      let confidence = 0;
      
      if (coverage > 0.2 && coverage < 0.8) {
        confidence += 0.5;
      }
      
      if (edgeDensity > 0.1 && edgeDensity < 0.5) {
        confidence += 0.5;
      }
      
      return confidence;
    });
  }

  
  async removeBackground(garmentImage) {
    try {
      const imageTensor = tf.browser.fromPixels(garmentImage);

      const cleanedImage = tf.tidy(() => {
        const [r, g, b] = tf.split(imageTensor, 3, -1);

        const threshold = 240;
        const isBackground = tf.logicalAnd(
          tf.logicalAnd(
            tf.greater(r, threshold),
            tf.greater(g, threshold)
          ),
          tf.greater(b, threshold)
        );

        const alpha = tf.where(
          isBackground,
          tf.zerosLike(r),
          tf.onesLike(r).mul(255)
        );

        return tf.concat([r, g, b, alpha], -1);
      });
      
      return cleanedImage;
      
    } catch (error) {
      console.error('Background removal failed:', error);
      return tf.browser.fromPixels(garmentImage);
    }
  }

  
  dispose() {
    if (this.segmentationModel) {
      this.segmentationModel.dispose();
    }
    this.isInitialized = false;
    console.log('ðŸ—‘ï¸ Cloth Segmentation Service disposed');
  }
}

export const clothSegmentationService = new ClothSegmentationService();
export default clothSegmentationService;
