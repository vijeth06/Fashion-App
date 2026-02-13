import { TryOnEngine } from './TryOnEngine';
import { CameraService } from './CameraService';
import { BodyAnalysisService } from './BodyAnalysisService';
import { OutfitRecommendationService } from './OutfitRecommendationService';
import enhancedPoseDetection from './EnhancedPoseDetection';
import clothSegmentationService from './ClothSegmentationService';
import { getAnalytics } from './AnalyticsService';
import apiService from './apiService';
import productService from './productService';
export class VirtualTryOnOrchestrator {
  constructor() {
    this.tryOnEngine = new TryOnEngine();
    this.cameraService = new CameraService();
    this.bodyAnalysisService = new BodyAnalysisService();
    this.outfitRecommendationService = new OutfitRecommendationService();
    this.analytics = getAnalytics();
    this.state = {
      isInitialized: false,
      isCameraActive: false,
      currentUser: null,
      currentGarment: null,
      currentPose: null,
      currentBodyAnalysis: null,
      currentOutfit: [],
      recommendations: [],
      tryOnHistory: []
    };
    this.performanceMetrics = {
      fps: 0,
      latency: 0,
      processingTimes: []
    };
    this.listeners = new Map();
  }
  async initialize(user = null) {
    if (this.state.isInitialized) {
      console.log('✅ Orchestrator already initialized');
      return { success: true };
    }
    try {
      console.log('🎬 Initializing Virtual Try-On Orchestrator...');
      this.state.currentUser = user;
      await this.tryOnEngine.initialize();
      await this.bodyAnalysisService.initialize();
      await enhancedPoseDetection.initialize();
      if (user?.uid) {
        await this.loadUserPreferences(user.uid);
      }
      this.state.isInitialized = true;
      this.analytics.trackEvent('orchestrator_initialized', {
        userId: user?.uid,
        timestamp: Date.now()
      });
      console.log('✅ Virtual Try-On Orchestrator initialized successfully');
      return { 
        success: true,
        message: 'All services initialized'
      };
    } catch (error) {
      console.error('❌ Failed to initialize orchestrator:', error);
      this.analytics.trackError('orchestrator_init_failed', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async startCamera(videoElement, options = {}) {
    try {
      await this.cameraService.requestPermissions();
      await this.cameraService.startCamera(videoElement, {
        width: 1280,
        height: 720,
        facingMode: 'user',
        frameRate: 30,
        ...options
      });
      this.state.isCameraActive = true;
      this.emit('cameraStarted', {
        resolution: { width: 1280, height: 720 }
      });
      this.analytics.trackEvent('camera_started');
      return { success: true };
    } catch (error) {
      console.error('Camera start error:', error);
      this.analytics.trackError('camera_start_failed', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  async analyzeBody(videoElement) {
    if (!this.state.isCameraActive) {
      throw new Error('Camera must be active to analyze body');
    }
    try {
      const startTime = performance.now();
      const frame = this.cameraService.captureFrame();
      const img = new Image();
      img.src = frame.dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const bodyAnalysis = await this.bodyAnalysisService.analyzeFromImage(img);
      if (bodyAnalysis.success) {
        this.state.currentBodyAnalysis = bodyAnalysis;
        if (this.state.currentUser?.uid) {
          await this.updateUserBodyProfile(bodyAnalysis);
        }
        this.emit('bodyAnalyzed', bodyAnalysis);
        const processingTime = performance.now() - startTime;
        this.analytics.trackEvent('body_analysis_success', {
          processingTime,
          bodyType: bodyAnalysis.bodyType?.type,
          confidence: bodyAnalysis.confidence
        });
        return bodyAnalysis;
      } else {
        throw new Error(bodyAnalysis.error);
      }
    } catch (error) {
      console.error('Body analysis error:', error);
      this.analytics.trackError('body_analysis_failed', error.message);
      throw error;
    }
  }
  async applyGarment(videoElement, garmentData) {
    if (!this.state.isInitialized) {
      throw new Error('Orchestrator not initialized');
    }
    try {
      const startTime = performance.now();
      this.state.currentGarment = garmentData;
      const tryOnResult = await this.tryOnEngine.processTryOn(
        videoElement,
        garmentData,
        {
          bodyAnalysis: this.state.currentBodyAnalysis,
          userPreferences: this.state.currentUser?.preferences
        }
      );
      this.addToCurrentOutfit(garmentData);
      await this.updateRecommendations();
      this.emit('garmentApplied', {
        garment: garmentData,
        tryOnResult
      });
      const processingTime = performance.now() - startTime;
      this.analytics.trackEvent('garment_applied', {
        garmentId: garmentData.id,
        processingTime,
        fps: tryOnResult.fps
      });
      return tryOnResult;
    } catch (error) {
      console.error('Garment application error:', error);
      this.analytics.trackError('garment_apply_failed', error.message);
      throw error;
    }
  }
  async updateRecommendations() {
    try {
      const context = {
        currentOutfit: this.state.currentOutfit,
        bodyAnalysis: this.state.currentBodyAnalysis,
        userPreferences: this.state.currentUser?.preferences,
        occasion: this.state.currentUser?.preferences?.occasion || 'casual',
        season: this.getCurrentSeason()
      };
      this.outfitRecommendationService.setUserPreferences({
        style: context.userPreferences?.style,
        favoriteColors: context.userPreferences?.favoriteColors,
        bodyType: context.bodyAnalysis?.bodyType?.type,
        occasion: context.occasion,
        season: context.season
      });
      const outfitScore = this.outfitRecommendationService.scoreOutfit(
        this.state.currentOutfit
      );
      const recommendations = await this.getComplementaryItems(
        this.state.currentOutfit,
        outfitScore
      );
      this.state.recommendations = recommendations;
      this.emit('recommendationsUpdated', {
        score: outfitScore,
        recommendations
      });
      return {
        score: outfitScore,
        recommendations
      };
    } catch (error) {
      console.error('Recommendation update error:', error);
      return { score: null, recommendations: [] };
    }
  }
  addToCurrentOutfit(garment) {
    this.state.currentOutfit = this.state.currentOutfit.filter(
      item => item.category !== garment.category
    );
    this.state.currentOutfit.push(garment);
    this.emit('outfitUpdated', {
      outfit: this.state.currentOutfit
    });
  }
  removeFromOutfit(garmentId) {
    this.state.currentOutfit = this.state.currentOutfit.filter(
      item => item.id !== garmentId
    );
    this.emit('outfitUpdated', {
      outfit: this.state.currentOutfit
    });
    this.updateRecommendations();
  }
  async saveOutfit(name, tags = []) {
    try {
      const outfit = {
        id: Date.now().toString(),
        name,
        items: this.state.currentOutfit,
        bodyAnalysis: this.state.currentBodyAnalysis,
        score: await this.outfitRecommendationService.scoreOutfit(
          this.state.currentOutfit
        ),
        tags,
        createdAt: new Date().toISOString(),
        userId: this.state.currentUser?.uid
      };
      if (this.state.currentUser?.uid) {
        await apiService.post('/looks/create', outfit);
      } else {
        const saved = JSON.parse(localStorage.getItem('vf_saved_outfits') || '[]');
        saved.push(outfit);
        localStorage.setItem('vf_saved_outfits', JSON.stringify(saved));
      }
      this.state.tryOnHistory.push(outfit);
      this.emit('outfitSaved', outfit);
      this.analytics.trackEvent('outfit_saved', {
        itemCount: outfit.items.length,
        score: outfit.score.overallScore
      });
      return { success: true, outfit };
    } catch (error) {
      console.error('Save outfit error:', error);
      return { success: false, error: error.message };
    }
  }
  async getComplementaryItems(currentItems, currentScore) {
    try {
      const allProducts = await this.fetchAvailableProducts();
      const scoredProducts = allProducts
        .filter(product => {
          return !currentItems.some(item => item.category === product.category);
        })
        .map(product => {
          const testOutfit = [...currentItems, product];
          const score = this.outfitRecommendationService.scoreOutfit(testOutfit);
          return {
            ...product,
            complementScore: score.overallScore,
            reasoning: score.suggestions
          };
        })
        .sort((a, b) => b.complementScore - a.complementScore)
        .slice(0, 10); // Top 10 recommendations
      return scoredProducts;
    } catch (error) {
      console.error('Error getting complementary items:', error);
      return [];
    }
  }
  async fetchAvailableProducts() {
    try {
      const response = await productService.getAllProducts({ limit: 200 });
      return response.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }
  async loadUserPreferences(userId) {
    try {
      const response = await apiService.get(`/users/${userId}/preferences`);
      if (response.success && this.state.currentUser) {
        this.state.currentUser.preferences = response.preferences || {};
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }
  async updateUserBodyProfile(bodyAnalysis) {
    try {
      await apiService.put(`/users/${this.state.currentUser.uid}/body-profile`, {
        bodyType: bodyAnalysis.bodyType,
        measurements: bodyAnalysis.measurements,
        confidence: bodyAnalysis.confidence,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating body profile:', error);
    }
  }
  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
  dispose() {
    if (this.cameraService) {
      this.cameraService.stopCamera();
    }
    if (this.tryOnEngine) {
    }
    this.listeners.clear();
    console.log('🧹 Orchestrator disposed');
  }
  getState() {
    return {
      ...this.state,
      performanceMetrics: this.performanceMetrics
    };
  }
}
let orchestratorInstance = null;
export const getOrchestrator = () => {
  if (!orchestratorInstance) {
    orchestratorInstance = new VirtualTryOnOrchestrator();
  }
  return orchestratorInstance;
};
export default VirtualTryOnOrchestrator;
