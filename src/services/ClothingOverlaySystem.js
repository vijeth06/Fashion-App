/**
 * Virtual Clothing Overlay System
 * Handles realistic placement and rendering of clothing items using pose detection
 * Optimized for real-time performance
 */
export class ClothingOverlaySystem {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.clothingItems = new Map();
    this.activeItems = [];
    this.poseData = null;
    
    // Performance optimization
    this.lastRenderTime = 0;
    this.targetFPS = 30;
    this.frameDelay = 1000 / this.targetFPS;
    this.imageCache = new Map();
    this.isRendering = false;
    
    // Canvas optimization
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'low'; // Fast rendering
    
    // Clothing type configurations
    this.clothingConfigs = {
      shirt: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'waist'],
        scaling: {
          widthRatio: 1.2,  // Slightly wider than shoulder span
          heightRatio: 0.6,  // From shoulders to waist
          offsetY: -20      // Slight upward offset for neckline
        }
      },
      dress: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
        scaling: {
          widthRatio: 1.1,
          heightRatio: 0.8,
          offsetY: -15
        }
      },
      jacket: {
        anchorPoints: ['leftShoulder', 'rightShoulder', 'waist'],
        scaling: {
          widthRatio: 1.3,
          heightRatio: 0.65,
          offsetY: -10
        }
      },
      pants: {
        anchorPoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
        scaling: {
          widthRatio: 1.0,
          heightRatio: 0.5,
          offsetY: 0
        }
      },
      skirt: {
        anchorPoints: ['leftHip', 'rightHip'],
        scaling: {
          widthRatio: 1.1,
          heightRatio: 0.3,
          offsetY: 0
        }
      }
    };
  }

  /**
   * Update pose data for clothing positioning
   */
  updatePose(poseData) {
    this.poseData = poseData;
    this.renderFrame();
  }

  /**
   * Add a clothing item to be rendered
   */
  addClothingItem(item) {
    const clothingItem = {
      id: item.id || Date.now(),
      image: null,
      type: item.type || 'shirt',
      color: item.color || '#ffffff',
      imageUrl: item.imageUrl,
      scale: item.scale || 1,
      opacity: item.opacity || 0.8,
      rotation: item.rotation || 0,
      offset: item.offset || { x: 0, y: 0 },
      loaded: false
    };

    // Load the clothing image
    this.loadClothingImage(clothingItem).then(() => {
      this.clothingItems.set(clothingItem.id, clothingItem);
      this.activeItems.push(clothingItem.id);
      this.renderFrame();
    });

    return clothingItem.id;
  }

  /**
   * Load clothing image with caching
   */
  async loadClothingImage(clothingItem) {
    // Check cache first
    if (this.imageCache.has(clothingItem.imageUrl)) {
      clothingItem.image = this.imageCache.get(clothingItem.imageUrl);
      clothingItem.loaded = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Cache the image
        this.imageCache.set(clothingItem.imageUrl, img);
        clothingItem.image = img;
        clothingItem.loaded = true;
        resolve();
      };
      
      img.onerror = () => {
        console.error(`Failed to load clothing image: ${clothingItem.imageUrl}`);
        reject(new Error('Image load failed'));
      };
      
      img.src = clothingItem.imageUrl;
    });
  }

  /**
   * Remove a clothing item
   */
  removeClothingItem(itemId) {
    this.clothingItems.delete(itemId);
    this.activeItems = this.activeItems.filter(id => id !== itemId);
    this.renderFrame();
  }

  /**
   * Clear all clothing items
   */
  clearAllItems() {
    this.clothingItems.clear();
    this.activeItems = [];
    this.renderFrame();
  }

  /**
   * Main rendering function with performance optimization
   */
  renderFrame() {
    // Performance throttling for real-time rendering
    const currentTime = performance.now();
    if (currentTime - this.lastRenderTime < this.frameDelay) {
      return; // Skip frame if too soon
    }
    
    if (this.isRendering) {
      return; // Skip if already rendering
    }
    
    this.isRendering = true;
    this.lastRenderTime = currentTime;

    if (!this.poseData || !this.poseData.keypoints) {
      this.isRendering = false;
      return;
    }

    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
      try {
        // Clear canvas efficiently
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render each active clothing item
        this.activeItems.forEach(itemId => {
          const item = this.clothingItems.get(itemId);
          if (item && item.loaded) {
            this.renderClothingItem(item);
          }
        });
      } finally {
        this.isRendering = false;
      }
    });
  }

  /**
   * Optimized real-time rendering loop
   */
  startRealTimeRendering() {
    const renderLoop = () => {
      this.renderFrame();
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }

  /**
   * Render individual clothing item
   */
  renderClothingItem(item) {
    const config = this.clothingConfigs[item.type];
    if (!config) {
      console.warn(`No configuration found for clothing type: ${item.type}`);
      return;
    }

    // Calculate positioning based on pose keypoints
    const positioning = this.calculateClothingPosition(item, config);
    if (!positioning) return;

    this.ctx.save();

    // Set opacity
    this.ctx.globalAlpha = item.opacity;

    // Apply transformations
    this.ctx.translate(positioning.centerX, positioning.centerY);
    this.ctx.rotate((item.rotation * Math.PI) / 180);
    this.ctx.scale(item.scale, item.scale);

    // Apply additional offset
    this.ctx.translate(item.offset.x, item.offset.y);

    // Draw the clothing item
    this.ctx.drawImage(
      item.image,
      -positioning.width / 2,
      -positioning.height / 2,
      positioning.width,
      positioning.height
    );

    this.ctx.restore();
  }

  /**
   * Calculate clothing position and size based on pose keypoints
   */
  calculateClothingPosition(item, config) {
    const keypoints = this.poseData.keypoints;
    const anchorPoints = config.anchorPoints;

    // Get required anchor points
    const anchors = {};
    let validAnchors = 0;

    anchorPoints.forEach(pointName => {
      if (keypoints[pointName] && this.isValidKeypoint(keypoints[pointName])) {
        anchors[pointName] = keypoints[pointName];
        validAnchors++;
      }
    });

    // Need at least 2 anchor points for positioning
    if (validAnchors < 2) {
      console.warn(`Insufficient anchor points for ${item.type}: ${validAnchors}/${anchorPoints.length}`);
      return null;
    }

    // Calculate position based on clothing type
    switch (item.type) {
      case 'shirt':
      case 'jacket':
        return this.calculateTorsoClothingPosition(anchors, config);
      case 'dress':
        return this.calculateDressPosition(anchors, config);
      case 'pants':
        return this.calculatePantsPosition(anchors, config);
      case 'skirt':
        return this.calculateSkirtPosition(anchors, config);
      default:
        return this.calculateDefaultPosition(anchors, config);
    }
  }

  /**
   * Calculate position for torso clothing (shirts, jackets)
   */
  calculateTorsoClothingPosition(anchors, config) {
    const { leftShoulder, rightShoulder } = anchors;
    
    if (!leftShoulder || !rightShoulder) return null;

    // Calculate shoulder span and center
    const shoulderSpan = Math.abs(rightShoulder.x - leftShoulder.x);
    const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
    const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;

    // Calculate clothing dimensions
    const width = shoulderSpan * config.scaling.widthRatio;
    const height = shoulderSpan * config.scaling.heightRatio;

    // Position slightly above shoulder center for neckline
    const centerX = shoulderCenterX;
    const centerY = shoulderCenterY + config.scaling.offsetY;

    return {
      centerX,
      centerY,
      width,
      height
    };
  }

  /**
   * Calculate position for dresses
   */
  calculateDressPosition(anchors, config) {
    const { leftShoulder, rightShoulder, leftHip, rightHip } = anchors;
    
    if (!leftShoulder || !rightShoulder) return null;

    const shoulderSpan = Math.abs(rightShoulder.x - leftShoulder.x);
    const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
    const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;

    // If hips are available, use them for height calculation
    let height = shoulderSpan * config.scaling.heightRatio;
    if (leftHip && rightHip) {
      const hipCenterY = (leftHip.y + rightHip.y) / 2;
      height = Math.abs(hipCenterY - shoulderCenterY) * 1.2;
    }

    const width = shoulderSpan * config.scaling.widthRatio;
    const centerX = shoulderCenterX;
    const centerY = shoulderCenterY + config.scaling.offsetY;

    return {
      centerX,
      centerY,
      width,
      height
    };
  }

  /**
   * Calculate position for pants
   */
  calculatePantsPosition(anchors, config) {
    const { leftHip, rightHip, leftKnee, rightKnee } = anchors;
    
    if (!leftHip || !rightHip) return null;

    const hipSpan = Math.abs(rightHip.x - leftHip.x);
    const hipCenterX = (leftHip.x + rightHip.x) / 2;
    const hipCenterY = (leftHip.y + rightHip.y) / 2;

    // Calculate height to knees if available
    let height = hipSpan * config.scaling.heightRatio;
    if (leftKnee && rightKnee) {
      const kneeCenterY = (leftKnee.y + rightKnee.y) / 2;
      height = Math.abs(kneeCenterY - hipCenterY);
    }

    const width = hipSpan * config.scaling.widthRatio;
    const centerX = hipCenterX;
    const centerY = hipCenterY + height / 2;

    return {
      centerX,
      centerY,
      width,
      height
    };
  }

  /**
   * Calculate position for skirts
   */
  calculateSkirtPosition(anchors, config) {
    const { leftHip, rightHip } = anchors;
    
    if (!leftHip || !rightHip) return null;

    const hipSpan = Math.abs(rightHip.x - leftHip.x);
    const hipCenterX = (leftHip.x + rightHip.x) / 2;
    const hipCenterY = (leftHip.y + rightHip.y) / 2;

    const width = hipSpan * config.scaling.widthRatio;
    const height = hipSpan * config.scaling.heightRatio;

    const centerX = hipCenterX;
    const centerY = hipCenterY + height / 2;

    return {
      centerX,
      centerY,
      width,
      height
    };
  }

  /**
   * Default position calculation
   */
  calculateDefaultPosition(anchors, config) {
    // Use first two available anchor points
    const anchorArray = Object.values(anchors);
    if (anchorArray.length < 2) return null;

    const point1 = anchorArray[0];
    const point2 = anchorArray[1];

    const distance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );

    const centerX = (point1.x + point2.x) / 2;
    const centerY = (point1.y + point2.y) / 2;

    return {
      centerX,
      centerY,
      width: distance * config.scaling.widthRatio,
      height: distance * config.scaling.heightRatio
    };
  }

  /**
   * Check if keypoint is valid and visible
   */
  isValidKeypoint(keypoint) {
    return keypoint && 
           typeof keypoint.x === 'number' && 
           typeof keypoint.y === 'number' &&
           (keypoint.visibility === undefined || keypoint.visibility > 0.3);
  }

  /**
   * Update item properties
   */
  updateItemProperties(itemId, properties) {
    const item = this.clothingItems.get(itemId);
    if (item) {
      Object.assign(item, properties);
      this.renderFrame();
    }
  }

  /**
   * Get item by ID
   */
  getItem(itemId) {
    return this.clothingItems.get(itemId);
  }

  /**
   * Get all active items
   */
  getActiveItems() {
    return this.activeItems.map(id => this.clothingItems.get(id));
  }

  /**
   * Set canvas size
   */
  setCanvasSize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.renderFrame();
  }

  /**
   * Export current frame as image
   */
  exportFrame(format = 'image/png', quality = 0.9) {
    return this.canvas.toDataURL(format, quality);
  }

  /**
   * Dispose of resources
   */
  dispose() {
    this.clothingItems.clear();
    this.activeItems = [];
    this.poseData = null;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

export default ClothingOverlaySystem;