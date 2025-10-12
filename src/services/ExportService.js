/**
 * Export and Sharing Service
 * Handles image export, format conversion, and social sharing
 */
export class ExportService {
  constructor() {
    this.supportedFormats = ['png', 'jpeg', 'webp'];
    this.qualitySettings = {
      low: 0.6,
      medium: 0.8,
      high: 0.95
    };
  }

  /**
   * Export try-on image with various options
   */
  async exportTryOnImage({
    canvas,
    videoElement,
    overlayCanvas,
    format = 'png',
    quality = 'high',
    watermark = false,
    metadata = null
  }) {
    try {
      // Create composite canvas
      const compositeCanvas = document.createElement('canvas');
      const ctx = compositeCanvas.getContext('2d');

      // Set canvas dimensions
      const width = canvas?.width || videoElement?.videoWidth || 640;
      const height = canvas?.height || videoElement?.videoHeight || 480;
      
      compositeCanvas.width = width;
      compositeCanvas.height = height;

      // Draw background (video or uploaded image)
      if (videoElement && videoElement.readyState === 4) {
        ctx.drawImage(videoElement, 0, 0, width, height);
      } else if (canvas) {
        // Draw existing canvas content
        ctx.drawImage(canvas, 0, 0, width, height);
      }

      // Draw clothing overlay
      if (overlayCanvas) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(overlayCanvas, 0, 0, width, height);
      }

      // Add watermark if requested
      if (watermark) {
        this.addWatermark(ctx, width, height);
      }

      // Add metadata overlay
      if (metadata) {
        this.addMetadataOverlay(ctx, metadata, width, height);
      }

      // Convert to desired format
      const mimeType = this.getMimeType(format);
      const qualityValue = this.qualitySettings[quality];
      
      return compositeCanvas.toDataURL(mimeType, qualityValue);

    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export image');
    }
  }

  /**
   * Add watermark to the image
   */
  addWatermark(ctx, width, height) {
    ctx.save();
    
    // Semi-transparent watermark
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.max(16, width * 0.02)}px Arial`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    
    const text = 'Virtual Fashion Try-On';
    const padding = 20;
    
    ctx.fillText(text, width - padding, height - padding);
    
    ctx.restore();
  }

  /**
   * Add metadata overlay (clothing info, date, etc.)
   */
  addMetadataOverlay(ctx, metadata, width, height) {
    if (!metadata.showOverlay) return;

    ctx.save();
    
    // Background for metadata
    const overlayHeight = 60;
    const gradient = ctx.createLinearGradient(0, height - overlayHeight, 0, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - overlayHeight, width, overlayHeight);
    
    // Text styling
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    const centerY = height - overlayHeight / 2;
    const padding = 15;
    
    // Clothing items
    if (metadata.clothing && metadata.clothing.length > 0) {
      const clothingText = metadata.clothing.map(item => item.name).join(', ');
      ctx.fillText(`Wearing: ${clothingText}`, padding, centerY - 10);
    }
    
    // Date and time
    if (metadata.timestamp) {
      const date = new Date(metadata.timestamp).toLocaleString();
      ctx.font = '12px Arial';
      ctx.fillStyle = '#cccccc';
      ctx.fillText(date, padding, centerY + 10);
    }
    
    ctx.restore();
  }

  /**
   * Get MIME type for format
   */
  getMimeType(format) {
    const mimeTypes = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      webp: 'image/webp'
    };
    
    return mimeTypes[format.toLowerCase()] || 'image/png';
  }

  /**
   * Download image with custom filename
   */
  downloadImage(dataUrl, filename = null, format = 'png') {
    const link = document.createElement('a');
    link.download = filename || `virtual-tryon-${Date.now()}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Share using Web Share API
   */
  async shareImage(dataUrl, shareData = {}) {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'virtual-tryon.png', { type: 'image/png' });

      const defaultShareData = {
        title: 'My Virtual Try-On Look',
        text: 'Check out my virtual fashion try-on!',
        files: [file]
      };

      await navigator.share({ ...defaultShareData, ...shareData });
      return true;

    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled sharing
        return false;
      }
      throw error;
    }
  }

  /**
   * Share to specific social platforms
   */
  shareToSocial(dataUrl, platform, customText = '') {
    const encodedText = encodeURIComponent(customText || 'Check out my virtual fashion try-on!');
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(window.location.href)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    } else {
      console.error(`Platform ${platform} not supported`);
    }
  }

  /**
   * Copy image to clipboard
   */
  async copyToClipboard(dataUrl) {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);

      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw new Error('Failed to copy image to clipboard');
    }
  }

  /**
   * Generate multiple format exports
   */
  async exportMultipleFormats(exportOptions) {
    const exports = {};
    
    for (const format of this.supportedFormats) {
      try {
        exports[format] = await this.exportTryOnImage({
          ...exportOptions,
          format
        });
      } catch (error) {
        console.error(`Failed to export ${format}:`, error);
      }
    }
    
    return exports;
  }

  /**
   * Create a shareable collection/collage
   */
  async createCollage(images, options = {}) {
    const {
      layout = 'grid',
      maxImages = 4,
      spacing = 10,
      backgroundColor = '#ffffff'
    } = options;

    // Limit images
    const limitedImages = images.slice(0, maxImages);
    if (limitedImages.length === 0) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Calculate canvas size based on layout
    const { width, height, positions } = this.calculateCollageLayout(
      limitedImages.length, 
      layout,
      spacing
    );

    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Load and draw images
    const imageElements = await Promise.all(
      limitedImages.map(dataUrl => this.loadImage(dataUrl))
    );

    imageElements.forEach((img, index) => {
      if (positions[index]) {
        const { x, y, width: imgWidth, height: imgHeight } = positions[index];
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
      }
    });

    return canvas.toDataURL('image/png', 0.9);
  }

  /**
   * Calculate layout for collage
   */
  calculateCollageLayout(count, layout, spacing) {
    const baseSize = 300;
    
    if (layout === 'grid') {
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      
      const width = cols * baseSize + (cols - 1) * spacing;
      const height = rows * baseSize + (rows - 1) * spacing;
      
      const positions = [];
      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positions.push({
          x: col * (baseSize + spacing),
          y: row * (baseSize + spacing),
          width: baseSize,
          height: baseSize
        });
      }
      
      return { width, height, positions };
    }
    
    // Default single image layout
    return {
      width: baseSize,
      height: baseSize,
      positions: [{ x: 0, y: 0, width: baseSize, height: baseSize }]
    };
  }

  /**
   * Load image from data URL
   */
  loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  /**
   * Get export statistics
   */
  getExportStats(dataUrl) {
    // Estimate file size
    const base64Length = dataUrl.split(',')[1]?.length || 0;
    const sizeInBytes = (base64Length * 3) / 4;
    const sizeInKB = Math.round(sizeInBytes / 1024);
    const sizeInMB = Math.round(sizeInKB / 1024 * 100) / 100;

    return {
      sizeInBytes,
      sizeInKB,
      sizeInMB,
      format: this.getFormatFromDataUrl(dataUrl),
      dimensions: this.getDimensionsFromCanvas(dataUrl)
    };
  }

  /**
   * Get format from data URL
   */
  getFormatFromDataUrl(dataUrl) {
    const match = dataUrl.match(/data:image\/([^;]+)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Get dimensions by creating temporary image
   */
  getDimensionsFromCanvas(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = dataUrl;
    });
  }
}

export default ExportService;