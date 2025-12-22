import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCamera, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaLightbulb, 
  FaStar,
  FaUpload,
  FaSpinner,
  FaVideo,
  FaStop
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import CameraService from '../services/CameraService';
import BodyAnalysisService from '../services/BodyAnalysisService';
import OutfitRecommendationService from '../services/OutfitRecommendationService';
import { getAnalytics } from '../services/AnalyticsService';
import { sampleClothingItems } from '../data/clothingData';


export const BodyAnalysisPage = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  
  const videoRef = useRef(null);
  const cameraServiceRef = useRef(null);
  const bodyAnalysisServiceRef = useRef(null);
  const analytics = getAnalytics();

  useEffect(() => {
    cameraServiceRef.current = new CameraService();
    bodyAnalysisServiceRef.current = new BodyAnalysisService();

    analytics.trackPageView('Body Analysis');

    return () => {
      if (cameraServiceRef.current) {
        cameraServiceRef.current.dispose();
      }
      if (bodyAnalysisServiceRef.current) {
        bodyAnalysisServiceRef.current.dispose();
      }
    };

  }, []);

  useEffect(() => {
    if (user?.uid) {
      analytics.setUserId(user.uid);
    }

  }, [user]);

  const handleStartCamera = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!CameraService.isSupported()) {
        throw new Error('Camera is not supported in this browser');
      }

      await cameraServiceRef.current.requestPermissions();
      await cameraServiceRef.current.startCamera(videoRef.current, {
        width: 1280,
        height: 720,
        facingMode: 'user'
      });

      setCameraActive(true);
      setLoading(false);
      
      analytics.trackButtonClick('start_camera', { page: 'body_analysis' });
    } catch (err) {
      console.error('Camera error:', err);
      setError(err.message);
      setLoading(false);
      analytics.trackError('camera_error', err.message, { page: 'body_analysis' });
    }
  };

  const handleStopCamera = () => {
    if (cameraServiceRef.current) {
      cameraServiceRef.current.stopCamera();
      setCameraActive(false);
    }
  };

  const handleCaptureAnalyze = async () => {
    if (!cameraActive) {
      setError('Please start the camera first');
      return;
    }

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {

      const frame = cameraServiceRef.current.captureFrame();

      const img = new Image();
      img.src = frame.dataUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const result = await bodyAnalysisServiceRef.current.analyzeFromImage(img);
      
      const endTime = Date.now();
      const processingTimeMs = endTime - startTime;
      setProcessingTime(processingTimeMs);

      if (result.success) {
        setAnalysis(result);
        setError(null);

        analytics.trackBodyAnalysis({
          success: true,
          bodyType: result.bodyType?.type,
          confidence: result.confidence,
          processingTime: processingTimeMs
        });
      } else {
        setError(result.error || 'Analysis failed');
        analytics.trackError('body_analysis_failed', result.error);
      }

      setLoading(false);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze body: ' + err.message);
      setLoading(false);
      analytics.trackError('body_analysis_error', err.message);
    }
  };

  const handleUploadAnalyze = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = async (e) => {
        img.src = e.target.result;
        
        img.onload = async () => {
          try {
            const result = await bodyAnalysisServiceRef.current.analyzeFromImage(img);
            
            const endTime = Date.now();
            const processingTimeMs = endTime - startTime;
            setProcessingTime(processingTimeMs);

            if (result.success) {
              setAnalysis(result);
              setError(null);
              
              analytics.trackBodyAnalysis({
                success: true,
                bodyType: result.bodyType?.type,
                confidence: result.confidence,
                processingTime: processingTimeMs,
                source: 'upload'
              });
            } else {
              setError(result.error || 'Analysis failed');
            }

            setLoading(false);
          } catch (err) {
            setError('Failed to analyze image: ' + err.message);
            setLoading(false);
          }
        };
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read file: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Body Analysis
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get precise body measurements and size recommendations using AI-powered pose detection
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Capture Your Photo</h2>
            
            {}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {}
            <div className="mb-6">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
                    <FaCamera className="text-6xl text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {}
            <div className="space-y-3">
              {!cameraActive ? (
                <button
                  onClick={handleStartCamera}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-purple-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Starting Camera...
                    </>
                  ) : (
                    <>
                      <FaVideo />
                      Start Camera
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCaptureAnalyze}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-green-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FaCamera />
                        Capture & Analyze
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleStopCamera}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-red-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <FaStop />
                    Stop Camera
                  </button>
                </>
              )}

              {}
              <div className="relative">
                <input
                  type="file"
                  accept="image}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Measurements</h2>
            {analysis ? (
              <div className="space-y-4">
                {}
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-600">Analysis Confidence</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(analysis.confidence || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-blue-700">
                      {Math.round((analysis.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>

                {}
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-gray-600">Body Type</p>
                  <p className="text-2xl font-bold text-purple-700">{analysis.bodyType?.type}</p>
                  <p className="text-sm text-gray-600 mt-1">{analysis.bodyType?.description}</p>
                </div>

                {}
                <div className="p-4 bg-pink-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Measurements</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Chest</p>
                      <p className="font-bold text-pink-700">{analysis.sizeRecommendations?.measurements?.chest}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Waist</p>
                      <p className="font-bold text-pink-700">{analysis.sizeRecommendations?.measurements?.waist}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Hips</p>
                      <p className="font-bold text-pink-700">{analysis.sizeRecommendations?.measurements?.hips}</p>
                    </div>
                  </div>
                </div>

                {}
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Recommended Sizes</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Tops</p>
                      <p className="text-xl font-bold text-green-700">{analysis.sizeRecommendations?.sizes?.tops}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Bottoms</p>
                      <p className="text-xl font-bold text-green-700">{analysis.sizeRecommendations?.sizes?.bottoms}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Dresses</p>
                      <p className="text-xl font-bold text-green-700">{analysis.sizeRecommendations?.sizes?.dresses}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {analysis.sizeRecommendations?.note}
                  </p>
                </div>

                {}
                {processingTime > 0 && (
                  <div className="text-center text-sm text-gray-500">
                    âš¡ Processed in {(processingTime / 1000).toFixed(2)}s
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FaInfoCircle className="text-4xl mx-auto mb-4" />
                <p>Capture or upload a photo to get your analysis</p>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">ðŸ“</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Precise Measurements</h3>
            <p className="text-gray-600 text-sm">AI-powered body analysis from pose detection</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">ðŸ‘•</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Size Recommendations</h3>
            <p className="text-gray-600 text-sm">Get accurate size suggestions for every item</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">âœ¨</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Style Advice</h3>
            <p className="text-gray-600 text-sm">Personalized fitting recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
};


export const OutfitRecommendationsPage = () => {
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [score, setScore] = useState(null);
  const [preferences, setPreferences] = useState({
    style: 'casual',
    occasion: 'casual',
    season: 'spring'
  });

  const outfitServiceRef = useRef(null);
  const analytics = getAnalytics();

  useEffect(() => {
    outfitServiceRef.current = new OutfitRecommendationService();
    analytics.trackPageView('Outfit Recommendations');

    setAvailableItems(sampleClothingItems);

  }, []);

  useEffect(() => {
    if (user?.uid) {
      analytics.setUserId(user.uid);
    }

  }, [user]);

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    outfitServiceRef.current.setUserPreferences(newPreferences);

    if (selectedItems.length > 0) {
      handleScoreOutfit();
    }
  };

  const handleAddItem = (item) => {
    if (!selectedItems.find(i => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);

      setTimeout(() => handleScoreOutfit(), 100);
    }
  };

  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleScoreOutfit = () => {
    if (selectedItems.length === 0) {
      setScore(null);
      return;
    }

    outfitServiceRef.current.setUserPreferences(preferences);
    const result = outfitServiceRef.current.scoreOutfit(selectedItems);
    setScore(result);

    analytics.trackOutfitRecommendation({
      itemsCount: selectedItems.length,
      score: result.overallScore,
      style: preferences.style
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-xl p-8 text-white mb-8">
            <h1 className="text-5xl font-black mb-4">AI Outfit Scorer</h1>
            <p className="text-xl opacity-90">
              Get personalized outfit recommendations and style scores
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Build Your Outfit</h2>

            {}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <select
                  value={preferences.style}
                  onChange={(e) => handlePreferenceChange('style', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                >
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="business">Business</option>
                  <option value="sporty">Sporty</option>
                  <option value="elegant">Elegant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
                <select
                  value={preferences.occasion}
                  onChange={(e) => handlePreferenceChange('occasion', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                >
                  <option value="casual">Casual</option>
                  <option value="work">Work</option>
                  <option value="party">Party</option>
                  <option value="workout">Workout</option>
                  <option value="date">Date</option>
                </select>
              </div>
            </div>

            {}
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-gray-900">Selected Items ({selectedItems.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items selected</p>
                ) : (
                  selectedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-gray-200">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 block">{item.name}</span>
                          <span className="text-sm text-gray-500">{item.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {}
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-gray-900">Available Items</h3>
              <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {availableItems.slice(0, 12).map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    disabled={selectedItems.find(i => i.id === item.id)}
                    className="relative group bg-white rounded-lg p-2 border-2 border-transparent hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title={item.name}
                  >
                    <div className="w-full aspect-square bg-gray-100 rounded overflow-hidden mb-1">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">${item.price}</p>
                    {selectedItems.find(i => i.id === item.id) && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                        <FaCheckCircle className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {}
            <div className="space-y-3">
              <button
                onClick={handleScoreOutfit}
                disabled={selectedItems.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaStar />
                Score Outfit ({selectedItems.length} items)
              </button>
            </div>
          </div>

          {}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Outfit Score</h2>
            
            {score ? (
              <div className="space-y-6">
                {}
                <div className="text-center">
                  <div className={`text-6xl font-black mb-2 ${
                    score.overallScore >= 80 ? 'text-green-600' :
                    score.overallScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {score.overallScore}
                  </div>
                  <p className="text-gray-600">Out of 100</p>
                </div>

                {}
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900">Score Breakdown</h3>
                  {Object.entries(score.breakdown).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-bold">{value}</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            value >= 80 ? 'bg-green-500' :
                            value >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {}
                {score.suggestions && score.suggestions.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3 text-gray-900">Suggestions</h3>
                    <ul className="space-y-2">
                      {score.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <FaLightbulb className="text-yellow-500 mt-1 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {}
                {score.strengths && score.strengths.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3 text-gray-900">Strengths</h3>
                    <div className="flex flex-wrap gap-2">
                      {score.strengths.map((strength, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                        >
                          <FaCheckCircle className="inline mr-1" />
                          {strength.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FaStar className="text-4xl mx-auto mb-4" />
                <p>Add items and click "Score Outfit" to see results</p>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">How It Works</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold mb-2 text-purple-600">AI Analysis</h4>
                <p className="text-gray-600 text-sm">
                  Our AI analyzes color harmony, style coherence, and occasion appropriateness
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-purple-600">Personalized</h4>
                <p className="text-gray-600 text-sm">
                  Recommendations based on your style preferences and body type
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-purple-600">Real-time Scoring</h4>
                <p className="text-gray-600 text-sm">
                  Instant feedback as you build your outfit
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-purple-600">Style Rules</h4>
                <p className="text-gray-600 text-sm">
                  Based on fashion industry best practices and trends
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
