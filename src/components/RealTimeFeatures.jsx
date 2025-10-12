// ⚡ REAL-TIME FEATURES SYSTEM
// Features: Live try-on streaming, collaborative styling, real-time recommendations

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaUsers,
  FaStream, FaShare, FaStream as FaBroadcast, FaEye, FaComment, FaHeart,
  FaShoppingCart, FaCamera, FaRecord, FaPlay, FaPause, FaStop,
  FaCog, FaExpand, FaCompress, FaBell, FaRocket, FaBolt as FaLightning,
  FaHome, FaCompass, FaTimes, FaEllipsisV, FaCrown
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { clothingItems } from '../data/clothingItems';

// WebRTC Connection Manager
class WebRTCManager {
  constructor() {
    this.localStream = null;
    this.remoteStreams = new Map();
    this.connections = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: true
      });
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('WebRTC initialization failed:', error);
      return false;
    }
  }

  createPeerConnection(userId) {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const connection = new RTCPeerConnection(config);
    this.connections.set(userId, connection);

    // Add local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        connection.addTrack(track, this.localStream);
      });
    }

    return connection;
  }

  async startCollaborativeSession(participants) {
    // Mock collaborative session start
    console.log('Starting collaborative session with:', participants);
    return { sessionId: Date.now().toString(), success: true };
  }

  stopStreaming() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    this.connections.forEach(conn => conn.close());
    this.connections.clear();
  }
}

// Real-time Recommendation Engine
class RealTimeRecommendationEngine {
  constructor() {
    this.recommendations = [];
    this.preferences = {};
    this.isActive = false;
  }

  startRealtimeRecommendations(userContext) {
    this.isActive = true;
    this.preferences = userContext;
    
    // Start real-time processing
    this.recommendationInterval = setInterval(() => {
      this.generateRecommendations();
    }, 5000);
  }

  generateRecommendations() {
    // Mock AI recommendations based on current context
    const newRecommendations = [
      {
        id: Date.now(),
        type: 'trending',
        item: clothingItems[Math.floor(Math.random() * clothingItems.length)],
        reason: 'Trending among users with similar style',
        confidence: 0.89,
        urgency: 'high'
      },
      {
        id: Date.now() + 1,
        type: 'personalized',
        item: clothingItems[Math.floor(Math.random() * clothingItems.length)],
        reason: 'Perfect match for your body type',
        confidence: 0.94,
        urgency: 'medium'
      }
    ];

    this.recommendations = [...newRecommendations, ...this.recommendations.slice(0, 8)];
    return this.recommendations;
  }

  stopRecommendations() {
    this.isActive = false;
    if (this.recommendationInterval) {
      clearInterval(this.recommendationInterval);
    }
  }
}

// Live Stream Component
function LiveStreamViewer({ stream, isHost = false, participants = [], onAction }) {
  const videoRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: 'You',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden">
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={!isHost}
        className="w-full h-96 object-cover"
      />

      {/* Stream Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">LIVE</span>
          </div>
          
          <div className="flex items-center gap-1 bg-black/50 text-white px-3 py-1 rounded-full">
            <FaEye className="w-4 h-4" />
            <span className="text-sm">{participants.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <FaComment className="w-4 h-4" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Participant Avatars */}
      <div className="absolute top-4 right-4 flex gap-2">
        {participants.slice(0, 5).map((participant, index) => (
          <img
            key={participant.id}
            src={participant.avatar}
            alt={participant.name}
            className="w-8 h-8 rounded-full border-2 border-white object-cover"
            title={participant.name}
          />
        ))}
        {participants.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center border-2 border-white">
            +{participants.length - 5}
          </div>
        )}
      </div>

      {/* Live Chat */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 w-80 h-full bg-white/95 backdrop-blur-sm border-l border-gray-200"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Live Chat</h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto h-64">
              <div className="space-y-3">
                {chatMessages.map(message => (
                  <div key={message.id} className="text-sm">
                    <div className="font-medium text-purple-600">{message.user}</div>
                    <div className="text-gray-700">{message.text}</div>
                    <div className="text-xs text-gray-500">{message.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Real-time Recommendations Panel
function RealTimeRecommendations({ recommendations, onTryOn, onAddToCart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <FaLightning className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-900">Real-time Recommendations</h3>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>

      <div className="space-y-4">
        {recommendations.map(rec => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors"
          >
            <img
              src={rec.item.imageUrl}
              alt={rec.item.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">{rec.item.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  rec.urgency === 'high' 
                    ? 'bg-red-100 text-red-700' 
                    : rec.urgency === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {rec.urgency} priority
                </span>
                
                <span className="text-xs text-gray-500">
                  {Math.round(rec.confidence * 100)}% match
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => onTryOn(rec.item)}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try On
              </button>
              
              <button
                onClick={() => onAddToCart(rec.item)}
                className="px-3 py-1 border border-purple-600 text-purple-600 text-sm rounded-lg hover:bg-purple-50 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Collaborative Styling Session
function CollaborativeSession({ isActive, participants, onInvite, onEnd }) {
  const [sessionMode, setSessionMode] = useState('styling'); // styling, shopping, consultation

  if (!isActive) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Start Collaborative Session</h3>
        <p className="text-gray-600 mb-6">
          Invite friends, stylists, or fashion experts to help you create the perfect look
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { id: 'styling', name: 'Style Together', icon: '👗', desc: 'Get help styling outfits' },
            { id: 'shopping', name: 'Shop Together', icon: '🛍️', desc: 'Shop with friends' },
            { id: 'consultation', name: 'Expert Consultation', icon: '👨‍💼', desc: 'Get professional advice' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setSessionMode(mode.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                sessionMode === mode.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <div className="font-medium text-gray-900">{mode.name}</div>
              <div className="text-sm text-gray-600">{mode.desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => onInvite(sessionMode)}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Start Session
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-xl font-bold text-gray-900">Active Session</h3>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
            {participants.length} participants
          </span>
        </div>
        
        <button
          onClick={onEnd}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          End Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {participants.map(participant => (
          <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={participant.avatar}
              alt={participant.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{participant.name}</div>
              <div className="text-sm text-gray-600">{participant.role}</div>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Real-time Features Component
export default function RealTimeFeatures() {
  const { user } = useAuth();
  const [isStreaming, setIsStreaming] = useState(false);
  const [collaborativeSession, setCollaborativeSession] = useState(null);
  const [realTimeRecs, setRealTimeRecs] = useState([]);
  const [streamingMode, setStreamingMode] = useState('tryOn'); // tryOn, styling, shopping
  
  // Managers
  const [webRTC] = useState(() => new WebRTCManager());
  const [recsEngine] = useState(() => new RealTimeRecommendationEngine());
  
  const streamRef = useRef();

  // Mock participants
  const mockParticipants = [
    {
      id: 1,
      name: 'Sophie Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b890?w=50',
      role: 'Fashion Stylist'
    },
    {
      id: 2,
      name: 'Marcus Rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50',
      role: 'Friend'
    }
  ];

  useEffect(() => {
    // Initialize real-time recommendations
    recsEngine.startRealtimeRecommendations({
      userId: user?.uid,
      preferences: user?.fashionProfile || {}
    });

    // Update recommendations periodically
    const interval = setInterval(() => {
      const newRecs = recsEngine.generateRecommendations();
      setRealTimeRecs(newRecs);
    }, 3000);

    return () => {
      clearInterval(interval);
      recsEngine.stopRecommendations();
      webRTC.stopStreaming();
    };
  }, [user, recsEngine, webRTC]);

  const startStreaming = async () => {
    const initialized = await webRTC.initialize();
    if (initialized) {
      setIsStreaming(true);
      streamRef.current = webRTC.localStream;
    }
  };

  const stopStreaming = () => {
    webRTC.stopStreaming();
    setIsStreaming(false);
    streamRef.current = null;
  };

  const startCollaborativeSession = async (mode) => {
    const session = await webRTC.startCollaborativeSession(mockParticipants);
    if (session.success) {
      setCollaborativeSession({
        id: session.sessionId,
        mode,
        participants: mockParticipants,
        isActive: true
      });
    }
  };

  const endCollaborativeSession = () => {
    setCollaborativeSession(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Real-time Fashion Experience
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stream your try-ons, collaborate with friends, and get instant AI recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Streaming */}
          <div className="lg:col-span-2 space-y-6">
            {!isStreaming ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <FaVideo className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Live Try-On</h3>
                <p className="text-gray-600 mb-6">
                  Share your fashion journey with friends and get real-time feedback
                </p>
                
                <div className="flex justify-center gap-4 mb-6">
                  {[
                    { id: 'tryOn', name: 'Try-On Stream', icon: '👗' },
                    { id: 'styling', name: 'Styling Session', icon: '✨' },
                    { id: 'shopping', name: 'Shopping Together', icon: '🛍️' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setStreamingMode(mode.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        streamingMode === mode.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="text-2xl mb-2">{mode.icon}</div>
                      <div className="font-medium text-sm">{mode.name}</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={startStreaming}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <FaBroadcast className="w-5 h-5 inline mr-2" />
                  Go Live
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <LiveStreamViewer
                  stream={streamRef.current}
                  isHost={true}
                  participants={mockParticipants}
                />
                
                <div className="flex justify-center">
                  <button
                    onClick={stopStreaming}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                  >
                    <FaStop className="w-5 h-5 inline mr-2" />
                    End Stream
                  </button>
                </div>
              </div>
            )}

            {/* Collaborative Session */}
            <CollaborativeSession
              isActive={collaborativeSession?.isActive}
              participants={collaborativeSession?.participants || []}
              onInvite={startCollaborativeSession}
              onEnd={endCollaborativeSession}
            />
          </div>

          {/* Real-time Recommendations */}
          <div className="space-y-6">
            <RealTimeRecommendations
              recommendations={realTimeRecs}
              onTryOn={(item) => console.log('Try on:', item.name)}
              onAddToCart={(item) => console.log('Add to cart:', item.name)}
            />

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-3">
                  <FaBell className="w-5 h-5" />
                  Notify when friends are online
                </button>
                
                <button className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-3">
                  <FaRocket className="w-5 h-5" />
                  Join trending try-on sessions
                </button>
                
                <button className="w-full px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-3">
                  <FaUsers className="w-5 h-5" />
                  Find styling experts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}