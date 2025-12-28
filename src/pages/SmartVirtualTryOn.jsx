import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCamera,
  FaVideo,
  FaStop,
  FaMagic,
  FaStar,
  FaComments,
  FaShare,
  FaSave,
  FaRobot,
  FaUsers,
  FaHeart,
  FaShoppingBag,
  FaChartLine
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getOrchestrator } from '../services/VirtualTryOnOrchestrator';
import { getAIStylist } from '../services/AIPersonalStylist';
import { getSocialHub } from '../services/SocialFashionHub';
const SmartVirtualTryOn = () => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [orchestrator] = useState(() => getOrchestrator());
  const [aiStylist] = useState(() => getAIStylist());
  const [socialHub] = useState(() => getSocialHub());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOutfit, setCurrentOutfit] = useState([]);
  const [currentGarment, setCurrentGarment] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [outfitScore, setOutfitScore] = useState(null);
  const [bodyAnalysis, setBodyAnalysis] = useState(null);
  const [showBodyAnalysis, setShowBodyAnalysis] = useState(false);
  const [stylistChat, setStylistChat] = useState([]);
  const [stylistInput, setStylistInput] = useState('');
  const [showStylist, setShowStylist] = useState(false);
  const [userStyleDNA, setUserStyleDNA] = useState(null);
  const [showSocialPanel, setShowSocialPanel] = useState(false);
  const [liveViewers, setLiveViewers] = useState(0);
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [activeTab, setActiveTab] = useState('try-on'); // 'try-on', 'recommendations', 'social'
  const [notification, setNotification] = useState(null);
  useEffect(() => {
    const init = async () => {
      try {
        const result = await orchestrator.initialize(user);
        if (result.success) {
          setIsInitialized(true);
          setupOrchestratorListeners();
          if (user?.uid) {
            socialHub.setUser(user);
            const dna = await aiStylist.analyzeUserStyleDNA(user.uid);
            setUserStyleDNA(dna);
          }
          showNotification('🎉 Smart Try-On Ready!', 'success');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Failed to initialize: ' + error.message, 'error');
      }
    };
    init();
    return () => {
      orchestrator.dispose();
    };
  }, [user]);
  const setupOrchestratorListeners = () => {
    orchestrator.on('cameraStarted', handleCameraStarted);
    orchestrator.on('bodyAnalyzed', handleBodyAnalyzed);
    orchestrator.on('garmentApplied', handleGarmentApplied);
    orchestrator.on('outfitUpdated', handleOutfitUpdated);
    orchestrator.on('recommendationsUpdated', handleRecommendationsUpdated);
  };
  const handleStartCamera = async () => {
    try {
      setIsProcessing(true);
      const result = await orchestrator.startCamera(videoRef.current);
      if (result.success) {
        setIsCameraActive(true);
        showNotification('📹 Camera started!', 'success');
      }
    } catch (error) {
      showNotification('Camera error: ' + error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleStopCamera = () => {
    orchestrator.cameraService.stopCamera();
    setIsCameraActive(false);
    showNotification('Camera stopped', 'info');
  };
  const handleAnalyzeBody = async () => {
    if (!isCameraActive) {
      showNotification('Start camera first!', 'warning');
      return;
    }
    try {
      setIsProcessing(true);
      const analysis = await orchestrator.analyzeBody(videoRef.current);
      setBodyAnalysis(analysis);
      setShowBodyAnalysis(true);
      const advice = await aiStylist.chat(
        `I have ${analysis.bodyType?.type} body type. What should I wear?`,
        { bodyType: analysis.bodyType?.type }
      );
      addStylistMessage(advice);
    } catch (error) {
      showNotification('Analysis failed: ' + error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleApplyGarment = async (garment) => {
    try {
      setIsProcessing(true);
      await orchestrator.applyGarment(videoRef.current, garment);
      setCurrentGarment(garment);
    } catch (error) {
      showNotification('Failed to apply garment: ' + error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleSaveOutfit = async () => {
    if (currentOutfit.length === 0) {
      showNotification('Add items to outfit first!', 'warning');
      return;
    }
    const outfitName = prompt('Name your outfit:');
    if (!outfitName) return;
    try {
      const result = await orchestrator.saveOutfit(outfitName, ['my-style']);
      if (result.success) {
        showNotification('✅ Outfit saved!', 'success');
      }
    } catch (error) {
      showNotification('Save failed: ' + error.message, 'error');
    }
  };
  const handleShareOutfit = async () => {
    if (currentOutfit.length === 0) {
      showNotification('Create an outfit first!', 'warning');
      return;
    }
    const caption = prompt('Add a caption (optional):');
    try {
      const result = await socialHub.shareOutfitLook(
        { items: currentOutfit, score: outfitScore },
        {
          caption,
          tags: ['virtual-tryon', 'fashion'],
          occasion: 'casual'
        }
      );
      if (result.success) {
        showNotification('🎉 Shared to community!', 'success');
      }
    } catch (error) {
      showNotification('Share failed: ' + error.message, 'error');
    }
  };
  const handleStartLiveSession = async () => {
    try {
      const result = await socialHub.startLiveStylingSession({
        title: `${user?.displayName}'s Live Try-On`,
        description: 'Trying on outfits in real-time!',
        category: 'outfit-building'
      });
      if (result.success) {
        setIsLiveSession(true);
        showNotification('🔴 Live session started!', 'success');
      }
    } catch (error) {
      showNotification('Failed to start live: ' + error.message, 'error');
    }
  };
  const handleStylistChat = async () => {
    if (!stylistInput.trim()) return;
    const userMessage = stylistInput;
    setStylistInput('');
    setStylistChat(prev => [...prev, {
      role: 'user',
      message: userMessage,
      timestamp: Date.now()
    }]);
    const response = await aiStylist.chat(userMessage, {
      currentOutfit,
      bodyType: bodyAnalysis?.bodyType?.type,
      userStyleDNA
    });
    addStylistMessage(response);
  };
  const addStylistMessage = (message) => {
    setStylistChat(prev => [...prev, {
      role: 'assistant',
      message,
      timestamp: Date.now()
    }]);
  };
  const handleCameraStarted = (data) => {
    console.log('Camera started:', data);
  };
  const handleBodyAnalyzed = (analysis) => {
    setBodyAnalysis(analysis);
  };
  const handleGarmentApplied = ({ garment }) => {
    showNotification(`✨ ${garment.name} applied!`, 'success');
  };
  const handleOutfitUpdated = ({ outfit }) => {
    setCurrentOutfit(outfit);
  };
  const handleRecommendationsUpdated = ({ score, recommendations }) => {
    setOutfitScore(score);
    setRecommendations(recommendations);
  };
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950 text-white">
      {}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Smart Virtual Try-On
            </h1>
            <p className="text-gray-400 mt-2">AI-Powered Fashion Experience</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowStylist(!showStylist)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition"
            >
              <FaRobot /> AI Stylist
            </button>
            {user && (
              <button
                onClick={handleStartLiveSession}
                disabled={isLiveSession}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition disabled:opacity-50"
              >
                {isLiveSession ? <FaVideo /> : <FaUsers />}
                {isLiveSession ? 'LIVE' : 'Go Live'}
              </button>
            )}
          </div>
        </div>
      </div>
      {}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
              {}
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
                {isLiveSession && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="font-bold text-sm">LIVE</span>
                    <span className="text-sm">{liveViewers} watching</span>
                  </div>
                )}
                {outfitScore && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur px-6 py-3 rounded-full">
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-300" />
                      <span className="font-bold text-xl">{outfitScore.overallScore}</span>
                      <span className="text-sm">/100</span>
                    </div>
                  </div>
                )}
              </div>
              {}
              <div className="flex flex-wrap gap-3">
                {!isCameraActive ? (
                  <button
                    onClick={handleStartCamera}
                    disabled={!isInitialized || isProcessing}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-105 transition disabled:opacity-50"
                  >
                    <FaCamera /> Start Camera
                  </button>
                ) : (
                  <button
                    onClick={handleStopCamera}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-105 transition"
                  >
                    <FaStop /> Stop Camera
                  </button>
                )}
                <button
                  onClick={handleAnalyzeBody}
                  disabled={!isCameraActive || isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition disabled:opacity-50"
                >
                  <FaMagic /> Analyze Body
                </button>
                <button
                  onClick={handleSaveOutfit}
                  disabled={currentOutfit.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition disabled:opacity-50"
                >
                  <FaSave /> Save Outfit
                </button>
                <button
                  onClick={handleShareOutfit}
                  disabled={currentOutfit.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transition disabled:opacity-50"
                >
                  <FaShare /> Share
                </button>
              </div>
            </div>
            {}
            {currentOutfit.length > 0 && (
              <div className="mt-6 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold mb-4">Current Outfit</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentOutfit.map((item, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">{item.icon || '👕'}</div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {}
          <div className="space-y-6">
            {}
            {bodyAnalysis && showBodyAnalysis && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Body Analysis</h3>
                  <button onClick={() => setShowBodyAnalysis(false)} className="text-gray-400 hover:text-white">
                    ×
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400">Body Type</div>
                    <div className="text-lg font-bold text-purple-400">
                      {bodyAnalysis.bodyType?.type || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Confidence</div>
                    <div className="text-lg font-bold">
                      {Math.round((bodyAnalysis.confidence || 0) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Size Recommendation</div>
                    <div className="text-lg font-bold text-green-400">
                      {bodyAnalysis.sizeRecommendations?.recommended || 'M'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {}
            {showStylist && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 h-96 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FaRobot className="text-purple-400" /> AI Stylist Aria
                  </h3>
                  <button onClick={() => setShowStylist(false)} className="text-gray-400 hover:text-white">
                    ×
                  </button>
                </div>
                {}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {stylistChat.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl ${
                        msg.role === 'user'
                          ? 'bg-purple-500/20 ml-8'
                          : 'bg-pink-500/20 mr-8'
                      }`}
                    >
                      <div className="text-sm">{msg.message}</div>
                    </div>
                  ))}
                </div>
                {}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={stylistInput}
                    onChange={(e) => setStylistInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleStylistChat()}
                    placeholder="Ask Aria anything..."
                    className="flex-1 px-4 py-2 bg-gray-800/50 rounded-xl border border-purple-500/30 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleStylistChat}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:scale-105 transition"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
            {}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaShoppingBag className="text-purple-400" /> Recommendations
              </h3>
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800 cursor-pointer transition"
                      onClick={() => handleApplyGarment(item)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{item.icon || '👗'}</div>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-400">{item.reason}</div>
                        </div>
                        <div className="text-yellow-400">
                          <FaStar />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Start trying on items to get personalized recommendations!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl font-semibold shadow-2xl ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' :
              notification.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default SmartVirtualTryOn;
