import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FaBrain, 
  FaEye, 
  FaLightbulb, 
  FaCog, 
  FaChartLine, 
  FaRocket,
  FaMagic,
  FaAtom,
  FaNetworkWired,
  FaUserCog,
  FaRobot,
  FaDatabase,
  FaStream,
  FaMicrochip
} from 'react-icons/fa';

// Neural Network Visualization Component
const NeuralNetworkViz = () => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    // Generate neural network nodes
    const newNodes = [];
    const layers = [8, 12, 16, 12, 6];
    let nodeId = 0;

    layers.forEach((nodeCount, layerIndex) => {
      for (let i = 0; i < nodeCount; i++) {
        newNodes.push({
          id: nodeId++,
          x: (layerIndex * 150) + 50,
          y: (i * 40) + 50 + (Math.random() * 20),
          layer: layerIndex,
          active: Math.random() > 0.3
        });
      }
    });

    // Generate connections
    const newConnections = [];
    newNodes.forEach(node => {
      if (node.layer < layers.length - 1) {
        const nextLayerNodes = newNodes.filter(n => n.layer === node.layer + 1);
        nextLayerNodes.forEach(targetNode => {
          if (Math.random() > 0.2) { // 80% connection probability
            newConnections.push({
              from: node,
              to: targetNode,
              weight: Math.random(),
              active: node.active && targetNode.active
            });
          }
        });
      }
    });

    setNodes(newNodes);
    setConnections(newConnections);
  }, []);

  return (
    <div className="relative w-full h-64 bg-black/20 rounded-xl overflow-hidden">
      <svg className="w-full h-full">
        {/* Render connections */}
        {connections.map((conn, index) => (
          <motion.line
            key={index}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke={conn.active ? '#60a5fa' : '#374151'}
            strokeWidth={conn.weight * 2}
            opacity={conn.active ? 0.8 : 0.3}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: index * 0.01 }}
          />
        ))}
        
        {/* Render nodes */}
        {nodes.map((node, index) => (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={4}
            fill={node.active ? '#3b82f6' : '#6b7280'}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {node.active && (
              <animate
                attributeName="r"
                values="4;6;4"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </motion.circle>
        ))}
      </svg>
      
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
    </div>
  );
};

// Brain Activity Monitor
const BrainActivityMonitor = () => {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivity(prev => {
        const newActivity = Array.from({ length: 50 }, () => Math.random() * 100);
        return newActivity;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-32 bg-black/20 rounded-xl p-4">
      <div className="flex items-end h-full space-x-1">
        {activity.map((value, index) => (
          <motion.div
            key={index}
            className="bg-gradient-to-t from-blue-400 to-purple-400 w-2 rounded-t"
            style={{ height: `${value}%` }}
            animate={{ height: `${value}%` }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>
    </div>
  );
};

// Learning Progress Component
const LearningProgress = ({ userProfile }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(userProfile?.learningProgress || 65);
    }, 1000);
    return () => clearTimeout(timer);
  }, [userProfile]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-300">Neural Learning Progress</span>
        <span className="text-blue-400 font-bold">{progress}%</span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-blue-400 to-purple-500 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-green-400 font-bold">Pattern Recognition</div>
          <div className="text-gray-400">92%</div>
        </div>
        <div className="text-center">
          <div className="text-blue-400 font-bold">Preference Learning</div>
          <div className="text-gray-400">{progress}%</div>
        </div>
        <div className="text-center">
          <div className="text-purple-400 font-bold">Predictive Analysis</div>
          <div className="text-gray-400">78%</div>
        </div>
      </div>
    </div>
  );
};

// AI Insights Panel
const AIInsights = () => {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const mockInsights = [
      {
        type: 'preference',
        icon: FaLightbulb,
        title: 'Style Preference Detected',
        description: 'You show strong preference for minimalist designs with neutral colors',
        confidence: 89,
        color: 'text-yellow-400'
      },
      {
        type: 'behavior',
        icon: FaChartLine,
        title: 'Shopping Pattern Analysis',
        description: 'Peak activity detected on weekends, preference for evening browsing',
        confidence: 94,
        color: 'text-green-400'
      },
      {
        type: 'prediction',
        icon: FaRocket,
        title: 'Trend Prediction',
        description: 'Based on your history, sustainable fashion items are likely to interest you',
        confidence: 76,
        color: 'text-blue-400'
      }
    ];

    setInsights(mockInsights);
  }, []);

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2 }}
          className="bg-black/20 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-start space-x-3">
            <insight.icon className={`${insight.color} text-xl mt-1`} />
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
              <p className="text-gray-300 text-sm mb-2">{insight.description}</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Confidence:</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-20">
                  <motion.div
                    className={`${insight.color.replace('text', 'bg')} h-full rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${insight.confidence}%` }}
                    transition={{ duration: 1, delay: index * 0.3 }}
                  />
                </div>
                <span className={`text-xs ${insight.color}`}>{insight.confidence}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Main Neural Interface Component
const NeuralInterface = () => {
  const { user, userProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [neuralData, setNeuralData] = useState({
    totalInteractions: 1247,
    learningAccuracy: 89,
    adaptationSpeed: 'Real-time',
    predictiveModels: 5
  });

  const sections = [
    { id: 'overview', label: 'Neural Overview', icon: FaBrain },
    { id: 'learning', label: 'Learning Engine', icon: FaDatabase },
    { id: 'predictions', label: 'Predictions', icon: FaEye },
    { id: 'adaptation', label: 'Adaptation', icon: FaCog },
    { id: 'insights', label: 'AI Insights', icon: FaLightbulb }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="absolute inset-0 backdrop-blur-3xl" />
        </div>
        
        <div className="relative container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center items-center space-x-4 mb-6">
              <FaBrain className="text-6xl text-blue-400 animate-pulse" />
              <FaMicrochip className="text-4xl text-purple-400 animate-bounce" />
              <FaAtom className="text-5xl text-pink-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            
            <h1 className="text-6xl font-black text-white mb-4">
              NEURAL
              <span className="block text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text">
                AI INTERFACE
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the future of adaptive fashion intelligence. Our neural network learns from every interaction, 
              continuously evolving to understand your unique style preferences and predict your fashion needs.
            </p>
            
            <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto">
              {Object.entries(neuralData).map(([key, value]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-black/30 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30"
                >
                  <div className="text-2xl font-bold text-blue-400 mb-1">{value}</div>
                  <div className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-6">
        <div className="flex justify-center mb-8">
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-2 border border-gray-700">
            <div className="flex space-x-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto pb-20"
          >
            {activeSection === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <FaNetworkWired className="mr-3 text-blue-400" />
                      Neural Network Architecture
                    </h3>
                    <NeuralNetworkViz />
                    <p className="text-gray-300 mt-4">
                      Our deep learning model processes your fashion preferences through 5 neural layers, 
                      continuously adapting to provide personalized recommendations.
                    </p>
                  </div>

                  <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <FaStream className="mr-3 text-green-400" />
                      Real-time Activity
                    </h3>
                    <BrainActivityMonitor />
                    <p className="text-gray-300 mt-4">
                      Live neural activity showing pattern recognition and learning processes in real-time.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <FaUserCog className="mr-3 text-purple-400" />
                      Learning Progress
                    </h3>
                    <LearningProgress userProfile={userProfile} />
                  </div>

                  <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                      <FaRobot className="mr-3 text-pink-400" />
                      AI Insights
                    </h3>
                    <AIInsights />
                  </div>
                </motion.div>
              </div>
            )}

            {activeSection === 'learning' && (
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">
                  Deep Learning Engine
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaDatabase className="text-3xl text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Data Processing</h3>
                    <p className="text-gray-300">
                      Advanced algorithms process your fashion interactions to build comprehensive preference models.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaMagic className="text-3xl text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Pattern Recognition</h3>
                    <p className="text-gray-300">
                      Machine learning models identify complex patterns in your style preferences and shopping behavior.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaAtom className="text-3xl text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Continuous Evolution</h3>
                    <p className="text-gray-300">
                      The system continuously evolves, improving recommendations and adapting to your changing preferences.
                    </p>
                  </motion.div>
                </div>
              </div>
            )}

            {activeSection === 'predictions' && (
              <div className="space-y-8">
                <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
                  <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    Predictive Fashion Intelligence
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Next Purchase Prediction",
                        prediction: "Sustainable Denim Jacket",
                        probability: "87%",
                        timeframe: "Within 2 weeks",
                        icon: FaEye,
                        color: "blue"
                      },
                      {
                        title: "Style Trend Forecast",
                        prediction: "Minimalist Aesthetic",
                        probability: "92%",
                        timeframe: "Next season",
                        icon: FaRocket,
                        color: "purple"
                      },
                      {
                        title: "Color Preference",
                        prediction: "Earth Tones",
                        probability: "78%",
                        timeframe: "Current preference",
                        icon: FaLightbulb,
                        color: "green"
                      }
                    ].map((prediction, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-black/20 rounded-xl p-6 border border-gray-600"
                      >
                        <prediction.icon className={`text-3xl text-${prediction.color}-400 mb-4`} />
                        <h3 className="text-lg font-semibold text-white mb-2">{prediction.title}</h3>
                        <p className="text-gray-300 mb-3">{prediction.prediction}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Probability:</span>
                            <span className={`text-sm font-semibold text-${prediction.color}-400`}>
                              {prediction.probability}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Timeframe:</span>
                            <span className="text-sm text-gray-300">{prediction.timeframe}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'adaptation' && (
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">
                  Adaptive Interface Controls
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Learning Speed</h3>
                    <div className="space-y-3">
                      {['Conservative', 'Moderate', 'Aggressive'].map((speed, index) => (
                        <label key={speed} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="learning-speed"
                            defaultChecked={index === 1}
                            className="text-blue-500"
                          />
                          <span className="text-gray-300">{speed} Learning</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Adaptation Preferences</h3>
                    <div className="space-y-3">
                      {[
                        'Auto-adapt UI Layout',
                        'Predictive Recommendations',
                        'Personalized Color Schemes',
                        'Smart Navigation'
                      ].map((option) => (
                        <label key={option} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="text-blue-500"
                          />
                          <span className="text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'insights' && (
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">
                  Advanced AI Insights
                </h2>
                <AIInsights />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NeuralInterface;