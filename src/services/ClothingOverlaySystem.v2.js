/**
 * Clothing Overlay System - REBUILT VERSION
 * 
 * Features:
 * - Accurate garment placement using pose keypoints
 * - Advanced perspective transformation
 * - Performance-optimized rendering
 * - Memory-safe image caching
 * - Proper error handling
 * - Modular garment configurations
 * 
 * @version 2.0.0
 */

/**
 * @typedef {Object} ClothingItem
 * @property {string} id - Unique identifier
 * @property {string} type - Garment type (shirt, dress, pants, etc.)
 * @property {string} imageUrl - Image URL or data URL
 * @property {HTMLImageElement|null} image - Loaded image element
 * @property {number} scale - Scale multiplier
 * @property {number} opacity - Transparency (0-1)
 * @property {number} rotation - Rotation in degrees
 * @property {Object} offset - Position offset {x, y}
 * @property {boolean} loaded - Load status
 * @property {string} color - Color tint
 */

/**
 * @typedef {Object} GarmentConfig
 * @property {string[]} anchorPoints - Required keypoints
 * @property {Object} scaling - Size calculation parameters
 * @property {Function} positionCalculator - Custom position calculation
 */

export class ClothingOverlaySystem {
  /**
   * @param {HTMLCanvasElement} canvasElement - Target canvas
   * @param {Object} options - Configuration options
   */
  constructor(canvasElement, options = {}) {
    if (!canvasElement || !(canvasElement instanceof HTMLCanvasElement)) {
      throw new Error('Valid canvas element is required');
    }

    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: true, willReadFrequently: false });
    
    // State
    this.clothingItems = new Map();
    this.activeItemIds = [];
    this.poseData = null;
    this.isRendering = false;
    this.renderLoopId = null;
    
    // Performance
    this.imageCache = new Map();
    this.lastRenderTime = 0;
    this.targetFPS = options.targetFPS || 30;
    this.frameDelay = 1000 / this.targetFPS;
    this.renderStats = {
      fps: 0,
      frameCount: 0,
      droppedFrames: 0
    };
    
    // Canvas optimization
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Garment type configurations
    this.garmentConfigs = this.initializeGarmentConfigs();
    
    // Cleanup tracking
    this.cleanupTasks = [];
    
    // Start FPS monitoring
    this.startPerformanceMonitoring();
  }

  /**
   * Initialize garment configuration templates
   * @private
   * @returns {Object.<string, GarmentConfig>}
   */
  initializeGarmentConfigs() {
    return {
      // T-shirts, blouses, tops
      shirt: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
        requiredAnchors: ['leftShoulder', 'rightShoulder'],
        scaling: {
          widthRatio: 1.25,    // 125% of shoulder width
          heightRatio: 1.8,     // Height relative to shoulder width
          necklineOffset: 0.18, // Neckline above shoulder center
          waistOffset: 0.65     // Waist position ratio
        },
        blend: 'multiply',
        defaultOpacity: 0.85
      },

      // Dresses, gowns
      dress: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
        requiredAnchors: ['leftShoulder', 'rightShoulder'],
        scaling: {
          widthRatio: 1.2,
          heightRatio: 2.5,
          necklineOffset: 0.15,
          hemOffset: 1.8
        },
        blend: 'multiply',
        defaultOpacity: 0.88
      },

      // Jackets, blazers
      jacket: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftElbow', 'rightElbow'],
        requiredAnchors: ['leftShoulder', 'rightShoulder'],
        scaling: {
          widthRatio: 1.35,
          heightRatio: 1.9,
          necklineOffset: 0.12,
          shoulderPad: 0.08
        },
        blend: 'normal',
        defaultOpacity: 0.92
      },

      // Hoodies
      hoodie: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftElbow', 'rightElbow'],
        requiredAnchors: ['leftShoulder', 'rightShoulder'],
        scaling: {
          widthRatio: 1.4,
          heightRatio: 2.0,
          necklineOffset: 0.15,
          shoulderPad: 0.1
        },
        blend: 'normal',
        defaultOpacity: 0.9
      },

      // Sweaters
      sweater: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
        requiredAnchors: ['leftShoulder', 'rightShoulder'],
        scaling: {
          widthRatio: 1.3,
          heightRatio: 1.85,
          necklineOffset: 0.16,
          waistOffset: 0.65
        },
        blend: 'multiply',
        defaultOpacity: 0.88
      },

      // Pants, jeans, trousers
      pants: {
        anchorPoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'],
        requiredAnchors: ['leftHip', 'rightHip'],
        scaling: {
          widthRatio: 1.15,
          heightRatio: 2.8,
          waistOffset: 0,
          inseamRatio: 0.85
        },
        blend: 'multiply',
        defaultOpacity: 0.87
      },

      // Skirts
      skirt: {
        anchorPoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
        requiredAnchors: ['leftHip', 'rightHip'],
        scaling: {
          widthRatio: 1.25,
          heightRatio: 1.5,
          waistOffset: 0,
          hemRatio: 0.6
        },
        blend: 'multiply',
        defaultOpacity: 0.86
      },

      // Jeans (same as pants)
      jeans: {
        anchorPoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'],
        requiredAnchors: ['leftHip', 'rightHip'],
        scaling: {
          widthRatio: 1.15,
          heightRatio: 2.8,
          waistOffset: 0,
          inseamRatio: 0.85
        },
        blend: 'multiply',
        defaultOpacity: 0.87
      },

      // Shorts
      shorts: {
        anchorPoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
        requiredAnchors: ['leftHip', 'rightHip'],
        scaling: {
          widthRatio: 1.2,
          heightRatio: 1.2,
          waistOffset: 0,
          inseamRatio: 0.4
        },
        blend: 'multiply',
        defaultOpacity: 0.87
      },

      // T-shirt (alias for shirt)
      tshirt: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
        requiredAnchors: ['leftShoulder', 'rightShoulder'],
        scaling: {
          widthRatio: 1.25,
          heightRatio: 1.8,
          necklineOffset: 0.18,
          waistOffset: 0.65
        },
        blend: 'multiply',
        defaultOpacity: 0.85
      },

      // Top (similar to shirt)
      top: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
        requiredAnchors: ['leftShoulder', 'rightShoulder'],
        scaling: {
          widthRatio: 1.2,
          heightRatio: 1.7,
          necklineOffset: 0.2,
          waistOffset: 0.6
        },
        blend: 'multiply',
        defaultOpacity: 0.86
      },

      // Blouse
      blouse: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
        requiredAnchors: ['leftShoulder', 'rightShoulder'],
        scaling: {
          widthRatio: 1.3,
          heightRatio: 1.75,
          necklineOffset: 0.17,
          waistOffset: 0.63
        },
        blend: 'multiply',
        defaultOpacity: 0.87
      },

      // Coat (longer jacket)
      coat: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
        requiredAnchors: ['leftShoulder', 'rightShoulder'],
        scaling: {
          widthRatio: 1.4,
          heightRatio: 2.5,
          necklineOffset: 0.12,
          shoulderPad: 0.1
        },
        blend: 'normal',
        defaultOpacity: 0.91
      },

      // Vest
      vest: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
        requiredAnchors: ['leftShoulder', 'rightShoulder'],
        scaling: {
          widthRatio: 1.15,
          heightRatio: 1.5,
          necklineOffset: 0.15,
          waistOffset: 0.5
        },
        blend: 'normal',
        defaultOpacity: 0.89
      },

      // Accessories - hats
      hat: {
        anchorPoints: ['nose', 'leftEar', 'rightEar'],
        requiredAnchors: ['nose'],
        scaling: {
          widthRatio: 1.8,
          heightRatio: 1.2,
          verticalOffset: -0.4
        },
        blend: 'normal',
        defaultOpacity: 0.9
      },

      // Accessories - necklaces
      necklace: {
        anchorPoints: ['leftShoulder', 'rightShoulder'],
        requiredAnchors: ['leftShoulder', 'rightShoulder'],
        scaling: {
          widthRatio: 0.9,
          heightRatio: 0.15,
          verticalOffset: 0.12
        },
        blend: 'normal',
        defaultOpacity: 0.95
      },

      // Accessories - glasses
      glasses: {
        anchorPoints: ['leftEye', 'rightEye', 'nose'],
        requiredAnchors: ['leftEye', 'rightEye'],
        scaling: {
          widthRatio: 1.6,
          heightRatio: 0.4,
          verticalOffset: 0
        },
        blend: 'normal',
        defaultOpacity: 0.92
      }
    };
  }

  /**
   * Update pose data and trigger render
   * @param {Object} poseData - Pose detection results
   */
  updatePose(poseData) {
    if (!poseData || !poseData.keypoints) {
      console.warn('Invalid pose data received');
      return;
    }

    this.poseData = poseData;
    this.requestRender();
  }

  /**
   * Add a clothing item to the overlay
   * @param {Object} item - Clothing item configuration
   * @returns {Promise<string>} Item ID
   */
  async addClothingItem(item) {
    if (!item || !item.imageUrl) {
      throw new Error('Invalid clothing item: imageUrl is required');
    }

    const garmentType = item.type || 'shirt';
    const config = this.garmentConfigs[garmentType];

    if (!config) {
      throw new Error(`Unknown garment type: ${garmentType}`);
    }

    const clothingItem = {
      id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      image: null,
      type: garmentType,
      imageUrl: item.imageUrl,
      scale: item.scale || 1.0,
      opacity: item.opacity || config.defaultOpacity,
      rotation: item.rotation || 0,
      offset: item.offset || { x: 0, y: 0 },
      color: item.color || null,
      loaded: false,
      loadError: false,
      config: config
    };

    try {
      // Load the image
      await this.loadClothingImage(clothingItem);
      
      // Add to collections
      this.clothingItems.set(clothingItem.id, clothingItem);
      this.activeItemIds.push(clothingItem.id);
      
      // Trigger render
      this.requestRender();
      
      return clothingItem.id;
      
    } catch (error) {
      console.error(`Failed to add clothing item: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load and cache clothing image
   * @private
   * @param {ClothingItem} clothingItem
   * @returns {Promise<void>}
   */
  async loadClothingImage(clothingItem) {
    // Check cache first
    if (this.imageCache.has(clothingItem.imageUrl)) {
      const cachedImage = this.imageCache.get(clothingItem.imageUrl);
      clothingItem.image = cachedImage;
      clothingItem.loaded = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 15000); // 15 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        
        // Validate image
        if (img.width === 0 || img.height === 0) {
          reject(new Error('Invalid image dimensions'));
          return;
        }
        
        // Cache the image
        this.imageCache.set(clothingItem.imageUrl, img);
        clothingItem.image = img;
        clothingItem.loaded = true;
        
        resolve();
      };
      
      img.onerror = (error) => {
        clearTimeout(timeout);
        clothingItem.loadError = true;
        reject(new Error(`Image failed to load: ${clothingItem.imageUrl}`));
      };
      
      img.src = clothingItem.imageUrl;
    });
  }

  /**
   * Remove a clothing item
   * @param {string} itemId - Item ID to remove
   * @returns {boolean} Success status
   */
  removeClothingItem(itemId) {
    if (!this.clothingItems.has(itemId)) {
      return false;
    }

    this.clothingItems.delete(itemId);
    this.activeItemIds = this.activeItemIds.filter(id => id !== itemId);
    this.requestRender();
    
    return true;
  }

  /**
   * Clear all clothing items
   */
  clearAllItems() {
    this.clothingItems.clear();
    this.activeItemIds = [];
    this.requestRender();
  }

  /**
   * Request a render (throttled)
   * @private
   */
  requestRender() {
    const currentTime = performance.now();
    
    // Throttle render requests
    if (currentTime - this.lastRenderTime < this.frameDelay) {
      this.renderStats.droppedFrames++;
      return;
    }

    if (this.isRendering) {
      return;
    }

    this.renderFrame();
  }

  /**
   * Main render function
   * @private
   */
  renderFrame() {
    if (this.isRendering) return;
    
    this.isRendering = true;
    this.lastRenderTime = performance.now();

    requestAnimationFrame(() => {
      try {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Skip if no pose data
        if (!this.poseData || !this.poseData.keypoints) {
          return;
        }

        // Render each active item
        for (const itemId of this.activeItemIds) {
          const item = this.clothingItems.get(itemId);
          if (item && item.loaded && !item.loadError) {
            try {
              this.renderClothingItem(item);
            } catch (error) {
              console.error(`Error rendering item ${itemId}:`, error);
            }
          }
        }

        // Update stats
        this.renderStats.frameCount++;

      } finally {
        this.isRendering = false;
      }
    });
  }

  /**
   * Render individual clothing item with proper transforms
   * @private
   * @param {ClothingItem} item
   */
  renderClothingItem(item) {
    const position = this.calculateItemPosition(item);
    
    if (!position) {
      console.warn(`Could not calculate position for item ${item.id} (type: ${item.type})`);
      return;
    }

    this.ctx.save();

    // Set blend mode
    this.ctx.globalCompositeOperation = item.config.blend || 'source-over';

    // Set opacity
    this.ctx.globalAlpha = item.opacity;

    // Apply transformations
    this.ctx.translate(position.centerX, position.centerY);
    
    // Apply rotation
    if (item.rotation !== 0) {
      this.ctx.rotate((item.rotation * Math.PI) / 180);
    }

    // Apply scale
    const finalScale = item.scale * (position.scale || 1.0);
    this.ctx.scale(finalScale, finalScale);

    // Apply offset
    this.ctx.translate(item.offset.x, item.offset.y);

    // Apply color tint if specified
    if (item.color) {
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(
        -position.width / 2,
        -position.height / 2,
        position.width,
        position.height
      );
      this.ctx.globalCompositeOperation = 'multiply';
    }

    // Draw the garment
    this.ctx.drawImage(
      item.image,
      -position.width / 2,
      -position.height / 2,
      position.width,
      position.height
    );

    this.ctx.restore();
  }

  /**
   * Calculate garment position based on pose keypoints
   * @private
   * @param {ClothingItem} item
   * @returns {Object|null} Position data
   */
  calculateItemPosition(item) {
    const keypoints = this.poseData.keypoints;
    const config = item.config;

    // Validate required anchor points
    const hasRequiredAnchors = config.requiredAnchors.every(
      anchor => keypoints[anchor] && keypoints[anchor].visibility > 0.4
    );

    if (!hasRequiredAnchors) {
      return null;
    }

    // Delegate to type-specific calculator
    switch (item.type) {
      case 'shirt':
      case 'jacket':
        return this.calculateTopGarmentPosition(keypoints, config);
      
      case 'dress':
        return this.calculateDressPosition(keypoints, config);
      
      case 'pants':
        return this.calculatePantsPosition(keypoints, config);
      
      case 'skirt':
        return this.calculateSkirtPosition(keypoints, config);
      
      case 'hat':
        return this.calculateHatPosition(keypoints, config);
      
      case 'necklace':
        return this.calculateNecklacePosition(keypoints, config);
      
      case 'glasses':
        return this.calculateGlassesPosition(keypoints, config);
      
      default:
        return this.calculateDefaultPosition(keypoints, config);
    }
  }

  /**
   * Calculate position for top garments (shirts, jackets)
   * @private
   */
  calculateTopGarmentPosition(keypoints, config) {
    const { leftShoulder, rightShoulder, leftHip, rightHip } = keypoints;

    const shoulderSpan = Math.sqrt(
      Math.pow(rightShoulder.x - leftShoulder.x, 2) +
      Math.pow(rightShoulder.y - leftShoulder.y, 2)
    );

    const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
    const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;

    // Calculate neckline position
    const necklineY = shoulderCenterY - (shoulderSpan * config.scaling.necklineOffset);

    // Calculate garment dimensions
    const width = shoulderSpan * config.scaling.widthRatio;
    const height = shoulderSpan * config.scaling.heightRatio;

    // Calculate center position (slightly below neckline)
    const centerY = necklineY + (height * 0.42);

    return {
      centerX: shoulderCenterX,
      centerY: centerY,
      width: width,
      height: height,
      scale: 1.0
    };
  }

  /**
   * Calculate position for dresses
   * @private
   */
  calculateDressPosition(keypoints, config) {
    const { leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee } = keypoints;

    const shoulderSpan = Math.sqrt(
      Math.pow(rightShoulder.x - leftShoulder.x, 2) +
      Math.pow(rightShoulder.y - leftShoulder.y, 2)
    );

    const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
    const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;

    // Calculate dress length based on available keypoints
    let dressHeight = shoulderSpan * config.scaling.heightRatio;
    
    if (leftHip && rightHip) {
      const hipCenterY = (leftHip.y + rightHip.y) / 2;
      const torsoLength = Math.abs(hipCenterY - shoulderCenterY);
      
      if (leftKnee && rightKnee) {
        const kneeCenterY = (leftKnee.y + rightKnee.y) / 2;
        dressHeight = Math.abs(kneeCenterY - shoulderCenterY) * 1.1;
      } else {
        dressHeight = torsoLength * 1.8;
      }
    }

    const necklineY = shoulderCenterY - (shoulderSpan * config.scaling.necklineOffset);
    const centerY = necklineY + (dressHeight * 0.45);

    return {
      centerX: shoulderCenterX,
      centerY: centerY,
      width: shoulderSpan * config.scaling.widthRatio,
      height: dressHeight,
      scale: 1.0
    };
  }

  /**
   * Calculate position for pants
   * @private
   */
  calculatePantsPosition(keypoints, config) {
    const { leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle } = keypoints;

    const hipSpan = Math.sqrt(
      Math.pow(rightHip.x - leftHip.x, 2) +
      Math.pow(rightHip.y - leftHip.y, 2)
    );

    const hipCenterX = (leftHip.x + rightHip.x) / 2;
    const hipCenterY = (leftHip.y + rightHip.y) / 2;

    // Calculate pants length
    let pantsHeight = hipSpan * config.scaling.heightRatio;
    
    if (leftAnkle && rightAnkle) {
      const ankleCenterY = (leftAnkle.y + rightAnkle.y) / 2;
      pantsHeight = Math.abs(ankleCenterY - hipCenterY) * 1.05;
    } else if (leftKnee && rightKnee) {
      const kneeCenterY = (leftKnee.y + rightKnee.y) / 2;
      pantsHeight = Math.abs(kneeCenterY - hipCenterY) * 1.8;
    }

    return {
      centerX: hipCenterX,
      centerY: hipCenterY + (pantsHeight * 0.48),
      width: hipSpan * config.scaling.widthRatio,
      height: pantsHeight,
      scale: 1.0
    };
  }

  /**
   * Calculate position for skirts
   * @private
   */
  calculateSkirtPosition(keypoints, config) {
    const { leftHip, rightHip, leftKnee, rightKnee } = keypoints;

    const hipSpan = Math.sqrt(
      Math.pow(rightHip.x - leftHip.x, 2) +
      Math.pow(rightHip.y - leftHip.y, 2)
    );

    const hipCenterX = (leftHip.x + rightHip.x) / 2;
    const hipCenterY = (leftHip.y + rightHip.y) / 2;

    let skirtHeight = hipSpan * config.scaling.heightRatio;
    
    if (leftKnee && rightKnee) {
      const kneeCenterY = (leftKnee.y + rightKnee.y) / 2;
      skirtHeight = Math.abs(kneeCenterY - hipCenterY) * config.scaling.hemRatio;
    }

    return {
      centerX: hipCenterX,
      centerY: hipCenterY + (skirtHeight * 0.5),
      width: hipSpan * config.scaling.widthRatio,
      height: skirtHeight,
      scale: 1.0
    };
  }

  /**
   * Calculate position for hats
   * @private
   */
  calculateHatPosition(keypoints, config) {
    const { nose, leftEar, rightEar } = keypoints;

    const headCenterX = nose.x;
    let headCenterY = nose.y;
    let headWidth = 100; // default

    if (leftEar && rightEar) {
      const earSpan = Math.abs(rightEar.x - leftEar.x);
      headWidth = earSpan * config.scaling.widthRatio;
      headCenterY = Math.min(leftEar.y, rightEar.y, nose.y);
    }

    return {
      centerX: headCenterX,
      centerY: headCenterY + (headWidth * config.scaling.verticalOffset),
      width: headWidth,
      height: headWidth * config.scaling.heightRatio,
      scale: 1.0
    };
  }

  /**
   * Calculate position for necklaces
   * @private
   */
  calculateNecklacePosition(keypoints, config) {
    const { leftShoulder, rightShoulder } = keypoints;

    const shoulderSpan = Math.abs(rightShoulder.x - leftShoulder.x);
    const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
    const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;

    return {
      centerX: shoulderCenterX,
      centerY: shoulderCenterY + (shoulderSpan * config.scaling.verticalOffset),
      width: shoulderSpan * config.scaling.widthRatio,
      height: shoulderSpan * config.scaling.heightRatio,
      scale: 1.0
    };
  }

  /**
   * Calculate position for glasses
   * @private
   */
  calculateGlassesPosition(keypoints, config) {
    const { leftEye, rightEye, nose } = keypoints;

    const eyeSpan = Math.abs(rightEye.x - leftEye.x);
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const eyeCenterY = (leftEye.y + rightEye.y) / 2;

    return {
      centerX: eyeCenterX,
      centerY: eyeCenterY + (eyeSpan * config.scaling.verticalOffset),
      width: eyeSpan * config.scaling.widthRatio,
      height: eyeSpan * config.scaling.heightRatio,
      scale: 1.0
    };
  }

  /**
   * Default position calculation fallback
   * @private
   */
  calculateDefaultPosition(keypoints, config) {
    // Use shoulder span as default reference
    const { leftShoulder, rightShoulder } = keypoints;
    
    if (!leftShoulder || !rightShoulder) return null;

    const shoulderSpan = Math.abs(rightShoulder.x - leftShoulder.x);
    const centerX = (leftShoulder.x + rightShoulder.x) / 2;
    const centerY = (leftShoulder.y + rightShoulder.y) / 2;

    return {
      centerX,
      centerY,
      width: shoulderSpan * (config.scaling.widthRatio || 1.2),
      height: shoulderSpan * (config.scaling.heightRatio || 1.5),
      scale: 1.0
    };
  }

  /**
   * Start real-time rendering loop
   */
  startRealTimeRendering() {
    if (this.renderLoopId) {
      console.warn('Rendering loop already active');
      return;
    }

    const renderLoop = () => {
      this.renderFrame();
      this.renderLoopId = requestAnimationFrame(renderLoop);
    };

    this.renderLoopId = requestAnimationFrame(renderLoop);

    // Track for cleanup
    this.cleanupTasks.push(() => {
      if (this.renderLoopId) {
        cancelAnimationFrame(this.renderLoopId);
        this.renderLoopId = null;
      }
    });
  }

  /**
   * Stop rendering loop
   */
  stopRealTimeRendering() {
    if (this.renderLoopId) {
      cancelAnimationFrame(this.renderLoopId);
      this.renderLoopId = null;
    }
  }

  /**
   * Set canvas size
   * @param {number} width
   * @param {number} height
   */
  setCanvasSize(width, height) {
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid canvas dimensions');
    }

    this.canvas.width = width;
    this.canvas.height = height;
    
    // Re-apply context settings
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    this.requestRender();
  }

  /**
   * Export current frame as data URL
   * @param {string} format - Image format (png, jpeg, webp)
   * @param {number} quality - Quality (0-1)
   * @returns {string} Data URL
   */
  exportFrame(format = 'png', quality = 0.95) {
    const mimeType = `image/${format}`;
    return this.canvas.toDataURL(mimeType, quality);
  }

  /**
   * Start performance monitoring
   * @private
   */
  startPerformanceMonitoring() {
    const monitorInterval = setInterval(() => {
      this.renderStats.fps = this.renderStats.frameCount;
      this.renderStats.frameCount = 0;

      if (this.renderStats.fps < 15) {
        console.warn(`Low rendering FPS: ${this.renderStats.fps}`);
      }
    }, 1000);

    this.cleanupTasks.push(() => {
      clearInterval(monitorInterval);
    });
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance stats
   */
  getStats() {
    return {
      ...this.renderStats,
      activeItems: this.activeItemIds.length,
      cachedImages: this.imageCache.size,
      targetFPS: this.targetFPS
    };
  }

  /**
   * Clear image cache
   */
  clearCache() {
    this.imageCache.clear();
  }

  /**
   * Dispose and cleanup all resources
   */
  dispose() {
    console.log('ClothingOverlaySystem: Disposing...');

    this.stopRealTimeRendering();

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Clear collections
    this.clothingItems.clear();
    this.activeItemIds = [];
    this.imageCache.clear();

    // Run cleanup tasks
    for (const cleanup of this.cleanupTasks) {
      try {
        cleanup();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }

    this.cleanupTasks = [];
    this.poseData = null;

    console.log('ClothingOverlaySystem: Disposed');
  }
}

export default ClothingOverlaySystem;
