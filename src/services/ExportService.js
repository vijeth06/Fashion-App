
export class ExportService {
  constructor() {
    this.supportedFormats = ['png', 'jpeg', 'webp'];
    this.qualitySettings = {
      low: 0.6,
      medium: 0.8,
      high: 0.95
    };
  }

  
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

      const compositeCanvas = document.createElement('canvas');
      const ctx = compositeCanvas.getContext('2d');

      const width = canvas?.width || videoElement?.videoWidth || 640;
      const height = canvas?.height || videoElement?.videoHeight || 480;
      
      compositeCanvas.width = width;
      compositeCanvas.height = height;

      if (videoElement && videoElement.readyState === 4) {
        ctx.drawImage(videoElement, 0, 0, width, height);
      } else if (canvas) {

        ctx.drawImage(canvas, 0, 0, width, height);
      }

      if (overlayCanvas) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(overlayCanvas, 0, 0, width, height);
      }

      if (watermark) {
        this.addWatermark(ctx, width, height);
      }

      if (metadata) {
        this.addMetadataOverlay(ctx, metadata, width, height);
      }

      const mimeType = this.getMimeType(format);
      const qualityValue = this.qualitySettings[quality];
      
      return compositeCanvas.toDataURL(mimeType, qualityValue);

    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export image');
    }
  }

  
  addWatermark(ctx, width, height) {
    ctx.save();

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

  
  addMetadataOverlay(ctx, metadata, width, height) {
    if (!metadata.showOverlay) return;

    ctx.save();

    const overlayHeight = 60;
    const gradient = ctx.createLinearGradient(0, height - overlayHeight, 0, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - overlayHeight, width, overlayHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    const centerY = height - overlayHeight / 2;
    const padding = 15;

    if (metadata.clothing && metadata.clothing.length > 0) {
      const clothingText = metadata.clothing.map(item => item.name).join(', ');
      ctx.fillText(`Wearing: ${clothingText}`, padding, centerY - 10);
    }

    if (metadata.timestamp) {
      const date = new Date(metadata.timestamp).toLocaleString();
      ctx.font = '12px Arial';
      ctx.fillStyle = '#cccccc';
      ctx.fillText(date, padding, centerY + 10);
    }
    
    ctx.restore();
  }

  
  getMimeType(format) {
    const mimeTypes = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      webp: 'image/webp'
    };
    
    return mimeTypes[format.toLowerCase()] || 'image/png';
  }

  
  downloadImage(dataUrl, filename = null, format = 'png') {
    const link = document.createElement('a');
    link.download = filename || `virtual-tryon-${Date.now()}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  
  async shareImage(dataUrl, shareData = {}) {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    try {

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

        return false;
      }
      throw error;
    }
  }

  
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

  
  async copyToClipboard(dataUrl) {
    try {

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);

      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw new Error('Failed to copy image to clipboard');
    }
  }

  
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

  
  async createCollage(images, options = {}) {
    const {
      layout = 'grid',
      maxImages = 4,
      spacing = 10,
      backgroundColor = '#ffffff'
    } = options;

    const limitedImages = images.slice(0, maxImages);
    if (limitedImages.length === 0) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const { width, height, positions } = this.calculateCollageLayout(
      limitedImages.length, 
      layout,
      spacing
    );

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

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

    return {
      width: baseSize,
      height: baseSize,
      positions: [{ x: 0, y: 0, width: baseSize, height: baseSize }]
    };
  }

  
  loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  
  getExportStats(dataUrl) {

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

  
  getFormatFromDataUrl(dataUrl) {
    const match = dataUrl.match(/data:image\/([^;]+)/);
    return match ? match[1] : 'unknown';
  }

  
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