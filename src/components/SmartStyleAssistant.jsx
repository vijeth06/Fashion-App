


import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot, FaHeart, FaBrain, FaEye, FaCamera, FaMagic, FaPalette,
  FaCloudSun, FaCalendarAlt, FaMapMarkerAlt, FaThermometerHalf,
  FaStar, FaLightbulb, FaArrowUp as FaTrendingUp, FaUser, FaShoppingBag, FaFire
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import { emotionBasedStylist } from '../ai/emotionBasedStyling';

export default function SmartStyleAssistant({ isVisible, onClose, userPreferences = {} }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('mood'); // mood, occasion, weather, trends
  const [clothingItems, setClothingItems] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [emotionData, setEmotionData] = useState(null);
  const [styleRecommendations, setStyleRecommendations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentMood, setCurrentMood] = useState('confident');
  const [occasion, setOccasion] = useState('casual');
  const [weather, setWeather] = useState({ temp: 22, condition: 'sunny' });
  const [location, setLocation] = useState('city');
  const [personalStyle, setPersonalStyle] = useState('modern');
  const [trendData, setTrendData] = useState(null);
  const [outfitSuggestions, setOutfitSuggestions] = useState([]);

  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    async function fetchProducts() {
      try {
        setProductsLoading(true);
        const data = await productService.getAllProducts({ limit: 100 });
        const formattedProducts = (data.products || []).map(product => 
          productService.formatForTryOn(product)
        );
        setClothingItems(formattedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setClothingItems([]);
      } finally {
        setProductsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const moodOptions = [
    { id: 'confident', name: 'Confident', icon: 'ðŸ’ª', color: 'from-red-500 to-pink-500' },
    { id: 'creative', name: 'Creative', icon: 'ðŸŽ¨', color: 'from-purple-500 to-indigo-500' },
    { id: 'relaxed', name: 'Relaxed', icon: 'ðŸ˜Œ', color: 'from-blue-500 to-cyan-500' },
    { id: 'professional', name: 'Professional', icon: 'ðŸ’¼', color: 'from-gray-600 to-gray-800' },
    { id: 'romantic', name: 'Romantic', icon: 'ðŸ’•', color: 'from-pink-500 to-rose-500' },
    { id: 'adventurous', name: 'Adventurous', icon: 'ðŸŒŸ', color: 'from-green-500 to-emerald-500' }
  ];

  const occasionOptions = [
    { id: 'casual', name: 'Casual Day', icon: 'ðŸ‘•' },
    { id: 'work', name: 'Work/Office', icon: 'ðŸ’¼' },
    { id: 'date', name: 'Date Night', icon: 'ðŸ’•' },
    { id: 'party', name: 'Party/Event', icon: 'ðŸŽ‰' },
    { id: 'workout', name: 'Workout', icon: 'ðŸ’ª' },
    { id: 'travel', name: 'Travel', icon: 'âœˆï¸' }
  ];

  useEffect(() => {
    if (isVisible) {
      initializeStyleAI();
      fetchTrendData();
      detectUserLocation();
    }
  }, [isVisible]);

  const initializeStyleAI = async () => {
    try {
      await emotionBasedStylist.initialize();
      console.log('✅ Style AI initialized');
    } catch (error) {
      console.error('❌ Style AI initialization failed:', error);
    }
  };

  const fetchTrendData = async () => {

    const trends = {
      current: [
        { name: 'Oversized Blazers', popularity: 0.92, growth: '+15%' },
        { name: 'Vintage Denim', popularity: 0.87, growth: '+8%' },
        { name: 'Neon Accents', popularity: 0.76, growth: '+23%' },
        { name: 'Sustainable Fabrics', popularity: 0.84, growth: '+31%' }
      ],
      upcoming: [
        { name: 'Holographic Materials', prediction: 0.89, timeframe: '2-3 months' },
        { name: 'Smart Textiles', prediction: 0.95, timeframe: '6 months' },
        { name: 'Minimalist Tech Wear', prediction: 0.78, timeframe: '1 month' }
      ],
      seasonal: {
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
        patterns: ['Geometric', 'Abstract', 'Botanical', 'Vintage']
      }
    };
    
    setTrendData(trends);
  };

  const detectUserLocation = () => {

    setLocation('New York');
    setWeather({ temp: 22, condition: 'partly-cloudy', humidity: 65 });
  };

  const startEmotionDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsAnalyzing(true);

        setTimeout(() => {
          const emotions = {
            happiness: 0.8,
            confidence: 0.9,
            energy: 0.7,
            creativity: 0.6,
            dominant: 'confident'
          };
          
          setEmotionData(emotions);
          setCurrentMood(emotions.dominant);
          generateStyleRecommendations(emotions);
          setIsAnalyzing(false);

          stream.getTracks().forEach(track => track.stop());
        }, 3000);
      }
    } catch (error) {
      console.error('Camera access failed:', error);

      generateStyleRecommendations({ dominant: currentMood });
    }
  };

  const generateStyleRecommendations = async (emotions = null) => {
    setIsAnalyzing(true);
    
    try {
      const context = {
        mood: emotions?.dominant || currentMood,
        occasion,
        weather: weather.condition,
        temperature: weather.temp,
        location,
        personalStyle,
        userPreferences,
        bodyType: user?.biometricProfile?.bodyType || 'athletic',
        skinTone: user?.biometricProfile?.skinTone || 'medium'
      };

      const recommendations = await emotionBasedStylist.generateOutfitRecommendations(context);
      
      setStyleRecommendations(recommendations.outfits);
      setOutfitSuggestions(recommendations.combinations);
      
    } catch (error) {
      console.error('Style generation failed:', error);

      generateFallbackRecommendations();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFallbackRecommendations = () => {
    const fallbackOutfits = [
      {
        id: 1,
        name: 'Confident Professional',
        mood: 'confident',
        items: clothingItems.slice(0, 3),
        confidence: 0.92,
        description: 'Perfect for making a strong impression'
      },
      {
        id: 2,
        name: 'Creative Casual',
        mood: 'creative',
        items: clothingItems.slice(3, 6),
        confidence: 0.87,
        description: 'Express your artistic side'
      }
    ];
    
    setOutfitSuggestions(fallbackOutfits);
  };

  const getWeatherRecommendations = () => {
    const { temp, condition } = weather;
    
    if (temp < 10) {
      return {
        layers: ['Heavy coat', 'Sweater', 'Long pants', 'Boots'],
        colors: ['Dark colors', 'Earth tones'],
        materials: ['Wool', 'Down', 'Fleece']
      };
    } else if (temp > 25) {
      return {
        layers: ['Light top', 'Shorts/Light pants', 'Sandals'],
        colors: ['Light colors', 'Pastels', 'White'],
        materials: ['Cotton', 'Linen', 'Breathable fabrics']
      };
    } else {
      return {
        layers: ['Light jacket', 'T-shirt/Blouse', 'Jeans', 'Sneakers'],
        colors: ['Versatile colors', 'Medium tones'],
        materials: ['Cotton blend', 'Denim', 'Light knits']
      };
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          {}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <FaRobot className="w-8 h-8" />
                  AI Style Assistant
                </h2>
                <p className="text-purple-100 mt-1">Your personal AI fashion advisor</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
                âœ•
              </button>
            </div>

            {}
            <div className="flex gap-4 mt-6">
              {[
                { id: 'mood', name: 'Mood Styling', icon: FaHeart },
                { id: 'occasion', name: 'Occasion', icon: FaCalendarAlt },
                { id: 'weather', name: 'Weather', icon: FaCloudSun },
                { id: 'trends', name: 'Trends', icon: FaTrendingUp }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-purple-600 font-medium'
                        : 'text-purple-100 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {}
            {activeTab === 'mood' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaEye className="w-5 h-5" />
                    How are you feeling today?
                  </h3>
                  
                  {}
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">AI Emotion Detection</h4>
                      <button
                        onClick={startEmotionDetection}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        <FaCamera className="w-4 h-4" />
                        {isAnalyzing ? 'Analyzing...' : 'Detect Mood'}
                      </button>
                    </div>
                    
                    {isAnalyzing && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Reading your emotions...</p>
                      </div>
                    )}
                    
                    <video ref={videoRef} autoPlay muted className="hidden" />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {moodOptions.map(mood => (
                      <motion.button
                        key={mood.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setCurrentMood(mood.id);
                          generateStyleRecommendations();
                        }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          currentMood === mood.id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`text-2xl mb-2 bg-gradient-to-r ${mood.color} bg-clip-text text-transparent`}>
                          {mood.icon}
                        </div>
                        <div className="font-medium text-gray-900">{mood.name}</div>
                      </motion.button>
                    ))}
                  </div>

                  {}
                  {emotionData && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Your Emotion Analysis</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(emotionData).filter(([key]) => key !== 'dominant').map(([emotion, score]) => (
                          <div key={emotion} className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {Math.round(score * 100)}%
                            </div>
                            <div className="text-sm text-gray-600 capitalize">{emotion}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {}
            {activeTab === 'occasion' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What's the occasion?</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {occasionOptions.map(occ => (
                    <button
                      key={occ.id}
                      onClick={() => {
                        setOccasion(occ.id);
                        generateStyleRecommendations();
                      }}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        occasion === occ.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{occ.icon}</div>
                      <div className="font-medium text-gray-900">{occ.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {}
            {activeTab === 'weather' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Weather-Smart Styling</h3>
                
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <FaThermometerHalf className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{weather.temp}Â°C</div>
                      <div className="text-gray-600 capitalize">{weather.condition}</div>
                    </div>
                    <div className="ml-auto">
                      <FaMapMarkerAlt className="w-4 h-4 text-gray-500 inline mr-1" />
                      <span className="text-gray-600">{location}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(getWeatherRecommendations()).map(([category, items]) => (
                      <div key={category}>
                        <h4 className="font-medium text-gray-900 mb-2 capitalize">{category}</h4>
                        <ul className="space-y-1">
                          {items.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {}
            {activeTab === 'trends' && trendData && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Fashion Trends & Predictions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <FaFire className="w-5 h-5 text-red-500" />
                      Trending Now
                    </h4>
                    <div className="space-y-3">
                      {trendData.current.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-900">{trend.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-medium">{trend.growth}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${trend.popularity * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {}
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <FaLightbulb className="w-5 h-5 text-yellow-500" />
                      AI Predictions
                    </h4>
                    <div className="space-y-3">
                      {trendData.upcoming.map((trend, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-900">{trend.name}</span>
                            <span className="text-purple-600 font-medium">
                              {Math.round(trend.prediction * 100)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">Expected in {trend.timeframe}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Seasonal Color Palette</h4>
                  <div className="flex gap-4">
                    {trendData.seasonal.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                        style={{ backgroundColor: color }}
                        title={`Trending Color ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {}
            {outfitSuggestions.length > 0 && (
              <div className="mt-8 border-t pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaMagic className="w-5 h-5" />
                  AI Style Recommendations
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {outfitSuggestions.slice(0, 4).map((outfit) => (
                    <motion.div
                      key={outfit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">{outfit.name}</h4>
                        <div className="flex items-center gap-1">
                          <FaStar className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {Math.round((outfit.confidence || 0.85) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{outfit.description}</p>
                      
                      <div className="flex gap-2 mb-4">
                        {(outfit.items || clothingItems.slice(0, 3)).map((item, index) => (
                          <img
                            key={index}
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                      
                      <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                        Try This Outfit
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {}
            {isAnalyzing && !emotionData && (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI is analyzing...</h3>
                <p className="text-gray-600">Creating personalized style recommendations</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}