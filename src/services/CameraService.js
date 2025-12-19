/**
 * Camera Service - Robust webcam/camera access
 * Handles permissions, device selection, and stream management
 * @version 1.0.0
 */

export class CameraService {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.devices = [];
    this.currentDeviceId = null;
    this.isActive = false;
  }

  /**
   * Check if camera is supported
   */
  static isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );
  }

  /**
   * Request camera permissions
   */
  async requestPermissions() {
    if (!CameraService.isSupported()) {
      throw new Error('Camera API not supported in this browser');
    }

    try {
      // Request minimal permissions first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      return { granted: true };
    } catch (error) {
      console.error('Camera permission denied:', error);
      
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera found on this device.');
      } else if (error.name === 'NotReadableError') {
        throw new Error('Camera is in use by another application.');
      }
      
      throw new Error('Failed to access camera: ' + error.message);
    }
  }

  /**
   * Get list of available camera devices
   */
  async getDevices() {
    try {
      if (!CameraService.isSupported()) {
        return [];
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          id: device.deviceId,
          label: device.label || `Camera ${this.devices.length + 1}`,
          groupId: device.groupId
        }));
      
      return this.devices;
    } catch (error) {
      console.error('Error getting devices:', error);
      return [];
    }
  }

  /**
   * Start camera stream
   */
  async startCamera(videoElement, options = {}) {
    try {
      // Stop any existing stream
      this.stopCamera();

      const constraints = {
        video: {
          width: { ideal: options.width || 1280 },
          height: { ideal: options.height || 720 },
          facingMode: options.facingMode || 'user',
          frameRate: { ideal: options.frameRate || 30 },
          ...(this.currentDeviceId && {
            deviceId: { exact: this.currentDeviceId }
          })
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement = videoElement;

      if (videoElement) {
        videoElement.srcObject = this.stream;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          videoElement.onloadedmetadata = () => {
            videoElement.play()
              .then(resolve)
              .catch(reject);
          };
          
          // Timeout after 10 seconds
          setTimeout(() => reject(new Error('Camera initialization timeout')), 10000);
        });

        this.isActive = true;
        
        // Get actual stream settings
        const track = this.stream.getVideoTracks()[0];
        const settings = track.getSettings();
        
        return {
          success: true,
          settings: {
            width: settings.width,
            height: settings.height,
            frameRate: settings.frameRate,
            facingMode: settings.facingMode
          }
        };
      }

      throw new Error('Video element not provided');

    } catch (error) {
      console.error('Failed to start camera:', error);
      this.stopCamera();
      throw error;
    }
  }

  /**
   * Stop camera stream
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.isActive = false;
  }

  /**
   * Switch camera device
   */
  async switchCamera(deviceId) {
    const wasActive = this.isActive;
    const videoElement = this.videoElement;
    
    if (wasActive) {
      this.stopCamera();
      this.currentDeviceId = deviceId;
      
      if (videoElement) {
        return await this.startCamera(videoElement);
      }
    } else {
      this.currentDeviceId = deviceId;
    }
    
    return { success: true };
  }

  /**
   * Capture frame from video
   */
  captureFrame() {
    if (!this.videoElement || !this.isActive) {
      throw new Error('Camera not active');
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoElement, 0, 0);
    
    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
      blob: null, // Will be set below
      width: canvas.width,
      height: canvas.height
    };
  }

  /**
   * Get current stream status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      hasStream: !!this.stream,
      deviceId: this.currentDeviceId,
      settings: this.stream
        ? this.stream.getVideoTracks()[0].getSettings()
        : null
    };
  }

  /**
   * Cleanup
   */
  dispose() {
    this.stopCamera();
    this.devices = [];
    this.currentDeviceId = null;
  }
}

export default CameraService;
