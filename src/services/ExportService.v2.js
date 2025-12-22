



export class ExportService {
  constructor() {
    this.supportedFormats = ['png', 'jpeg', 'webp'];
    
    this.qualitySettings = {
      low: 0.6,
      medium: 0.8,
      high: 0.92,
      maximum: 0.98
    };

    this.defaultWatermark = {
      text: 'Virtual Fashion Try-On',
      position: 'bottom-right',
      opacity: 0.3,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#ffffff',
      shadow: true
    };
  }

  
  async exportTryOnImage(options) {
    const {
      canvas,
      videoElement,
      overlayCanvas,
      format = 'png',
      quality = 'high',
      watermark = false,
      metadata = null
    } = options;

    try {

      if (!overlayCanvas) {
        throw new Error('Overlay canvas is required');
      }

      if (!canvas && !videoElement) {
        throw new Error('Either canvas or video element is required');
      }

      if (!this.supportedFormats.includes(format)) {
        throw new Error(`Unsupported format: ${format}. Use one of: ${this.supportedFormats.join(', ')}`);
      }

      const compositeCanvas = document.createElement('canvas');
      const ctx = compositeCanvas.getContext('2d', { alpha: true });

      let width, height;
      
      if (videoElement && videoElement.readyState === 4) {
        width = videoElement.videoWidth;
        height = videoElement.videoHeight;
      } else if (canvas) {
        width = canvas.width;
        height = canvas.height;
      } else {
        width = overlayCanvas.width;
        height = overlayCanvas.height;
      }

      if (!width || !height || width <= 0 || height <= 0) {
        throw new Error('Invalid canvas dimensions');
      }

      compositeCanvas.width = width;
      compositeCanvas.height = height;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (videoElement && videoElement.readyState === 4) {
        ctx.drawImage(videoElement, 0, 0, width, height);
      } else if (canvas) {
        ctx.drawImage(canvas, 0, 0, width, height);
      } else {

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(overlayCanvas, 0, 0, width, height);

      if (watermark) {
        this.addWatermark(ctx, width, height, this.defaultWatermark);
      }

      if (metadata && metadata.showOverlay) {
        this.addMetadataOverlay(ctx, metadata, width, height);
      }

      const mimeType = this.getMimeType(format);
      const qualityValue = this.qualitySettings[quality] || 0.92;
      
      const dataURL = compositeCanvas.toDataURL(mimeType, qualityValue);

      return dataURL;

    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Failed to export image: ${error.message}`);
    }
  }

  
  addWatermark(ctx, width, height, watermarkConfig) {
    ctx.save();

    const {
      text,
      position,
      opacity,
      fontSize,
      fontFamily,
      color,
      shadow
    } = watermarkConfig;

    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.font = `${Math.max(fontSize, width * 0.015)}px ${fontFamily}`;

    if (shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    const padding = 20;
    let x, y;

    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';

    switch (position) {
      case 'bottom-right':
        x = width - padding;
        y = height - padding;
        break;
      case 'bottom-left':
        ctx.textAlign = 'left';
        x = padding;
        y = height - padding;
        break;
      case 'top-right':
        ctx.textBaseline = 'top';
        x = width - padding;
        y = padding;
        break;
      case 'top-left':
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        x = padding;
        y = padding;
        break;
      default:
        x = width - padding;
        y = height - padding;
    }

    ctx.fillText(text, x, y);

    ctx.restore();
  }

  
  addMetadataOverlay(ctx, metadata, width, height) {
    ctx.save();

    const padding = 15;
    const lineHeight = 20;
    const fontSize = 14;
    const bgPadding = 10;

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.textBaseline = 'top';

    const lines = [];
    
    if (metadata.clothing && metadata.clothing.length > 0) {
      lines.push('Garments:');
      metadata.clothing.forEach((item, index) => {
        lines.push(`  ${index + 1}. ${item.name || item.type}`);
      });
    }

    if (metadata.timestamp) {
      const date = new Date(metadata.timestamp);
      lines.push(`Date: ${date.toLocaleString()}`);
    }

    if (lines.length === 0) return;

    const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
    const overlayWidth = maxWidth + (bgPadding * 2);
    const overlayHeight = (lines.length * lineHeight) + (bgPadding * 2);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(
      padding,
      padding,
      overlayWidth,
      overlayHeight
    );

    ctx.fillStyle = '#ffffff';
    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        padding + bgPadding,
        padding + bgPadding + (index * lineHeight)
      );
    });

    ctx.restore();
  }

  
  getMimeType(format) {
    const mimeTypes = {
      'png': 'image/png',
      'jpeg': 'image/jpeg',
      'jpg': 'image/jpeg',
      'webp': 'image/webp'
    };

    return mimeTypes[format] || 'image/png';
  }

  
  downloadImage(dataURL, filename = null) {
    if (!dataURL) {
      throw new Error('Data URL is required');
    }

    const defaultFilename = `virtual-tryon-${Date.now()}.png`;
    const finalFilename = filename || defaultFilename;

    try {
      const link = document.createElement('a');
      link.download = finalFilename;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  
  async shareImage(dataURL, shareData = {}) {
    if (!navigator.share) {
      throw new Error('Web Share API not supported in this browser');
    }

    if (!dataURL) {
      throw new Error('Data URL is required');
    }

    try {

      const blob = await this.dataURLToBlob(dataURL);

      const file = new File([blob], 'virtual-tryon.png', { type: blob.type });

      const shareOptions = {
        title: shareData.title || 'Virtual Fashion Try-On',
        text: shareData.text || 'Check out my virtual try-on!',
        files: [file]
      };

      await navigator.share(shareOptions);
      return true;

    } catch (error) {
      if (error.name === 'AbortError') {

        return false;
      }
      console.error('Share failed:', error);
      throw new Error(`Failed to share image: ${error.message}`);
    }
  }

  
  async shareToSocial(platform, dataURL, options = {}) {
    const {
      text = 'Check out my virtual try-on!',
      hashtags = ['VirtualTryOn', 'Fashion']
    } = options;

    try {
      switch (platform.toLowerCase()) {
        case 'twitter':

          return this.openShareWindow(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + ' ' + hashtags.map(t => `#${t}`).join(' '))}`,
            'Share on Twitter'
          );

        case 'facebook':
          return this.openShareWindow(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`,
            'Share on Facebook'
          );

        case 'pinterest':

          this.downloadImage(dataURL);
          return this.openShareWindow(
            `https://pinterest.com/pin/create/button/?description=${encodeURIComponent(text)}`,
            'Share on Pinterest'
          );

        case 'linkedin':
          return this.openShareWindow(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
            'Share on LinkedIn'
          );

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      console.error(`Failed to share to ${platform}:`, error);
      throw error;
    }
  }

  
  openShareWindow(url, title) {
    const width = 600;
    const height = 400;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    window.open(
      url,
      title,
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=no,resizable=yes`
    );

    return true;
  }

  
  async copyToClipboard(dataURL) {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API not supported');
    }

    try {
      const blob = await this.dataURLToBlob(dataURL);
      const clipboardItem = new ClipboardItem({ [blob.type]: blob });
      
      await navigator.clipboard.write([clipboardItem]);
      return true;

    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw new Error(`Failed to copy image: ${error.message}`);
    }
  }

  
  async dataURLToBlob(dataURL) {
    const response = await fetch(dataURL);
    const blob = await response.blob();
    return blob;
  }

  
  async createCollage(imageDataURLs, options = {}) {
    const {
      layout = 'grid', // 'grid', 'horizontal', 'vertical'
      spacing = 10,
      backgroundColor = '#ffffff',
      maxWidth = 1200,
      maxHeight = 1200
    } = options;

    if (!imageDataURLs || imageDataURLs.length === 0) {
      throw new Error('At least one image is required for collage');
    }

    try {

      const images = await Promise.all(
        imageDataURLs.map(url => this.loadImage(url))
      );

      const layoutInfo = this.calculateCollageLayout(images, layout, spacing, maxWidth, maxHeight);

      const canvas = document.createElement('canvas');
      canvas.width = layoutInfo.width;
      canvas.height = layoutInfo.height;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      layoutInfo.positions.forEach((pos, index) => {
        ctx.drawImage(
          images[index],
          pos.x,
          pos.y,
          pos.width,
          pos.height
        );
      });

      return canvas.toDataURL('image/png', 0.95);

    } catch (error) {
      console.error('Collage creation failed:', error);
      throw new Error(`Failed to create collage: ${error.message}`);
    }
  }

  
  async loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  }

  
  calculateCollageLayout(images, layout, spacing, maxWidth, maxHeight) {
    const count = images.length;

    if (layout === 'horizontal') {
      const itemWidth = (maxWidth - (spacing * (count - 1))) / count;
      const maxItemHeight = Math.max(...images.map(img => 
        (img.height / img.width) * itemWidth
      ));

      return {
        width: maxWidth,
        height: Math.min(maxItemHeight, maxHeight),
        positions: images.map((img, i) => ({
          x: i * (itemWidth + spacing),
          y: 0,
          width: itemWidth,
          height: (img.height / img.width) * itemWidth
        }))
      };
    }

    if (layout === 'vertical') {
      const itemHeight = (maxHeight - (spacing * (count - 1))) / count;
      const maxItemWidth = Math.max(...images.map(img => 
        (img.width / img.height) * itemHeight
      ));

      return {
        width: Math.min(maxItemWidth, maxWidth),
        height: maxHeight,
        positions: images.map((img, i) => ({
          x: 0,
          y: i * (itemHeight + spacing),
          width: (img.width / img.height) * itemHeight,
          height: itemHeight
        }))
      };
    }

    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    
    const itemWidth = (maxWidth - (spacing * (cols - 1))) / cols;
    const itemHeight = (maxHeight - (spacing * (rows - 1))) / rows;

    return {
      width: maxWidth,
      height: (itemHeight * rows) + (spacing * (rows - 1)),
      positions: images.map((img, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        return {
          x: col * (itemWidth + spacing),
          y: row * (itemHeight + spacing),
          width: itemWidth,
          height: itemHeight
        };
      })
    };
  }

  
  getExportStats(dataURL) {
    if (!dataURL) {
      return null;
    }

    const base64Length = dataURL.split(',')[1].length;
    const sizeInBytes = (base64Length * 3) / 4;
    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;

    const format = dataURL.split(';')[0].split('/')[1];

    return {
      format,
      sizeBytes: Math.round(sizeInBytes),
      sizeKB: Math.round(sizeInKB * 100) / 100,
      sizeMB: Math.round(sizeInMB * 1000) / 1000,
      dataURL: dataURL.substring(0, 50) + '...'
    };
  }

  
  async compressImage(dataURL, targetSizeKB) {
    const img = await this.loadImage(dataURL);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    let minQuality = 0.1;
    let maxQuality = 0.95;
    let bestDataURL = dataURL;
    
    for (let i = 0; i < 10; i++) {
      const quality = (minQuality + maxQuality) / 2;
      const testDataURL = canvas.toDataURL('image/jpeg', quality);
      const stats = this.getExportStats(testDataURL);

      if (stats.sizeKB <= targetSizeKB) {
        bestDataURL = testDataURL;
        minQuality = quality;
      } else {
        maxQuality = quality;
      }
    }

    return bestDataURL;
  }
}

export default ExportService;
