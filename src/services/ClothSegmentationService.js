/**
 * Cloth Segmentation Service
 * Inspired by clothes-virtual-try-on repository
 * 
 * Features:
 * - Automatic cloth detection and segmentation
 * - Cloth mask generation
 * - Garment boundary detection
 * - Multi-garment type support
 */

import * as tf from '@tensorflow/tfjs';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import { colorSegmentationToLabelMatrix } from './segmentationColorMap';

export class ClothSegmentationService {
  constructor() {
    this.segmentationModel = null;
    this.isInitialized = false;
    
    // Supported garment types
    this.garmentTypes = {
      UPPER_BODY: 'upper_body',  // Shirts, jackets, dresses (top)
      LOWER_BODY: 'lower_body',  // Pants, skirts, shorts
      FULL_BODY: 'full_body',    // Dresses, jumpsuits
      ACCESSORIES: 'accessories'  // Hats, scarves, jewelry
    };
  }

  /**
   * Initialize segmentation models
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🎨 Initializing Cloth Segmentation Service...');
      
      // Load body segmentation model for cloth isolation
      const segmentationConfig = {
        runtime: 'tfjs',
        modelType: 'general'
      };
      
      this.segmentationModel = await bodySegmentation.createSegmenter(
        bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
        segmentationConfig
      );
      
      this.isInitialized = true;
      console.log('✅ Cloth Segmentation Service initialized');
      
    } catch (error) {
      console.error('❌ Failed to initialize Cloth Segmentation:', error);
      throw error;
    }
  }

  /**
   * Segment cloth from garment image
   * @param {HTMLImageElement|HTMLCanvasElement} garmentImage - The garment image
   * @param {string} garmentType - Type of garment (upper_body, lower_body, etc.)
   * @returns {Object} Segmentation result with mask and boundaries
   */
  async segmentCloth(garmentImage, garmentType = this.garmentTypes.UPPER_BODY) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Convert image to tensor
      const imageTensor = tf.browser.fromPixels(garmentImage);
      
      // Get cloth mask using color-based segmentation
      const clothMask = await this.createClothMask(imageTensor, garmentType);
      
      // Detect garment boundaries
      const boundaries = await this.detectGarmentBoundaries(clothMask);
      
      // Extract key points for garment warping
      const keyPoints = await this.extractGarmentKeyPoints(boundaries, garmentType);
      
      return {
        mask: clothMask,
        boundaries,
        keyPoints,
        garmentType,
        confidence: this.calculateMaskConfidence(clothMask)
      };
      
    } catch (error) {
      console.error('❌ Cloth segmentation failed:', error);
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

  /**
   * Create cloth mask from garment image
   * Uses background removal and color-based segmentation
   */
  async createClothMask(imageTensor, garmentType) {
    const [height, width] = imageTensor.shape.slice(0, 2);
    
    // If caller passed an HTMLImage/Canvas element wrapped by a tf.Tensor, try
    // to use color-based segmentation provided by Vastra's mapping when the
    // image looks like a segmentation map (many exact colors).
    try {
      // Create an offscreen canvas to hold the image and convert to label map.
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const imageData = new ImageData(Uint8ClampedArray.from(await tf.browser.toPixels(imageTensor)), width, height);
      ctx.putImageData(imageData, 0, 0);

      // Convert color segmentation to label matrix and then to tf tensor mask
      const labelMatrix = colorSegmentationToLabelMatrix(canvas);
  const flat = Float32Array.from(labelMatrix.flat().map(v => (v > 0 ? 1 : 0)));
  const mask = tf.tensor(flat, [height, width]);
      const cleaned = this.applyMorphologicalOps(mask);
      return cleaned;
    } catch (err) {
      console.warn('Color segmentation parsing failed or not applicable, falling back to thresholding:', err.message || err);

      // Background removal using simple color thresholding
  const mask = tf.tidy(() => {
        // Convert to grayscale for background detection
        const gray = tf.image.rgbToGrayscale(imageTensor);

        // Threshold to separate cloth from background (simple approach)
        // In production, use more sophisticated background removal (rembg, U2Net)
        const threshold = tf.scalar(240);
        const backgroundMask = tf.less(gray, threshold);

        // Apply morphological operations to clean mask
        const cleanedMask = this.applyMorphologicalOps(backgroundMask);

        return cleanedMask;
      });

  return mask;
    }
  }

  /**
   * Apply morphological operations to clean the mask
   */
  applyMorphologicalOps(mask) {
    return tf.tidy(() => {
      // Apply dilation to fill small gaps in the mask
      const expanded = mask.expandDims(-1);
      const dilated = tf.dilation2d(expanded, [3, 3], [1, 1], 'same');
      
      // Apply custom erosion using max pooling with inverted values
      // Erosion = inverted dilation of inverted image
      const inverted = tf.sub(1, dilated);
      const invertedDilated = tf.dilation2d(inverted, [3, 3], [1, 1], 'same');
      const eroded = tf.sub(1, invertedDilated);
      
      return eroded.squeeze();
    });
  }

  /**
   * Detect garment boundaries for warping
   */
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
    
    // Detect top boundary (collar/neckline)
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (maskArray[y][x] > 0.5) {
          boundaries.top.push({ x, y });
          break;
        }
      }
    }
    
    // Detect bottom boundary (hem)
    for (let x = 0; x < width; x++) {
      for (let y = height - 1; y >= 0; y--) {
        if (maskArray[y][x] > 0.5) {
          boundaries.bottom.push({ x, y });
          break;
        }
      }
    }
    
    // Detect left and right boundaries
    for (let y = 0; y < height; y++) {
      // Left boundary
      for (let x = 0; x < width; x++) {
        if (maskArray[y][x] > 0.5) {
          boundaries.left.push({ x, y });
          break;
        }
      }
      
      // Right boundary
      for (let x = width - 1; x >= 0; x--) {
        if (maskArray[y][x] > 0.5) {
          boundaries.right.push({ x, y });
          break;
        }
      }
    }
    
    return boundaries;
  }

  /**
   * Extract key points for garment warping (like shoulders, collar, etc.)
   */
  async extractGarmentKeyPoints(boundaries, garmentType) {
    const keyPoints = {
      shoulders: [],
      collar: [],
      sleeves: [],
      waist: [],
      hem: []
    };
    
    if (garmentType === this.garmentTypes.UPPER_BODY) {
      // Detect shoulder points
      if (boundaries.top.length > 0) {
        const topPoints = boundaries.top;
        const quarterPoint = Math.floor(topPoints.length / 4);
        const threeQuarterPoint = Math.floor((topPoints.length * 3) / 4);
        
        keyPoints.shoulders = [
          topPoints[quarterPoint],      // Left shoulder
          topPoints[threeQuarterPoint]  // Right shoulder
        ];
        
        // Collar/neckline center
        keyPoints.collar = [topPoints[Math.floor(topPoints.length / 2)]];
      }
      
      // Detect sleeve endpoints
      if (boundaries.left.length > 0 && boundaries.right.length > 0) {
        const midHeight = Math.floor(boundaries.left.length / 2);
        keyPoints.sleeves = [
          boundaries.left[midHeight],
          boundaries.right[midHeight]
        ];
      }
    }
    
    if (garmentType === this.garmentTypes.LOWER_BODY) {
      // Detect waist points
      if (boundaries.top.length > 0) {
        keyPoints.waist = boundaries.top;
      }
      
      // Detect hem points
      if (boundaries.bottom.length > 0) {
        keyPoints.hem = boundaries.bottom;
      }
    }
    
    return keyPoints;
  }

  /**
   * Calculate confidence score for the mask quality
   */
  calculateMaskConfidence(mask) {
    return tf.tidy(() => {
      // Calculate mask coverage ratio
      const totalPixels = mask.size;
      const maskedPixels = mask.sum().dataSync()[0];
      const coverage = maskedPixels / totalPixels;
      
      // Check for holes or discontinuities (simple metric)
      const edges = tf.image.sobelEdges(mask.expandDims(-1));
      const edgeDensity = edges.magnitude.mean().dataSync()[0];
      
      // Combine metrics for overall confidence
      // Good masks have 20-80% coverage and moderate edge density
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

  /**
   * Remove background from garment image
   * Simplified version - in production, integrate with rembg or U2Net
   */
  async removeBackground(garmentImage) {
    try {
      const imageTensor = tf.browser.fromPixels(garmentImage);
      
      // Simple background removal using color thresholding
      // For production: integrate with backend service using rembg library
      const cleanedImage = tf.tidy(() => {
        const [r, g, b] = tf.split(imageTensor, 3, -1);
        
        // Detect white/light backgrounds
        const threshold = 240;
        const isBackground = tf.logicalAnd(
          tf.logicalAnd(
            tf.greater(r, threshold),
            tf.greater(g, threshold)
          ),
          tf.greater(b, threshold)
        );
        
        // Create alpha channel
        const alpha = tf.where(
          isBackground,
          tf.zerosLike(r),
          tf.onesLike(r).mul(255)
        );
        
        // Combine RGBA
        return tf.concat([r, g, b, alpha], -1);
      });
      
      return cleanedImage;
      
    } catch (error) {
      console.error('Background removal failed:', error);
      return tf.browser.fromPixels(garmentImage);
    }
  }

  /**
   * Dispose of models and free memory
   */
  dispose() {
    if (this.segmentationModel) {
      this.segmentationModel.dispose();
    }
    this.isInitialized = false;
    console.log('🗑️ Cloth Segmentation Service disposed');
  }
}

// Export singleton instance
export const clothSegmentationService = new ClothSegmentationService();
export default clothSegmentationService;
