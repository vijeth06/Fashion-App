import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FaHeart, 
  FaEye, 
  FaBrain, 
  FaUserMd, 
  FaChartLine, 
  FaShieldAlt,
  FaThermometerHalf,
  FaWeight,
  FaRuler,
  FaCamera,
  FaPlay,
  FaPause,
  FaStop,
  FaDownload,
  FaShare,
  FaCog,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

// Real-time Biometric Scanner Component
const BiometricScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [biometrics, setBiometrics] = useState({
    heartRate: 72,
    bodyTemp: 98.6,
    posture: 'Good',
    stress: 'Low',
    skinTone: 'Medium',
    bodyType: 'Athletic'
  });

  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            setIsScanning(false);
            return 0;
          }
          return prev + 2;
        });
        
        // Simulate real-time biometric changes
        setBiometrics(prev => ({
          ...prev,
          heartRate: 68 + Math.random() * 10,
          bodyTemp: 98.4 + Math.random() * 0.4,
          stress: Math.random() > 0.7 ? 'Medium' : 'Low'
        }));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <FaUserMd className="mr-3 text-blue-400" />
          Biometric Scanner
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsScanning(!isScanning)}
          className={`rounded-full p-4 transition-colors ${
            isScanning 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isScanning ? <FaStop /> : <FaPlay />}
        </motion.button>
      </div>

      {/* Scanner Progress */}
      {isScanning && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Scanning Progress</span>
            <span className="text-blue-400 font-bold">{scanProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-full rounded-full"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Biometric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(biometrics).map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/20 rounded-xl p-4 border border-gray-600"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              {key === 'heartRate' && <FaHeart className="text-red-400" />}
              {key === 'bodyTemp' && <FaThermometerHalf className="text-orange-400" />}
              {key === 'posture' && <FaRuler className="text-green-400" />}
              {key === 'stress' && <FaBrain className="text-purple-400" />}
              {key === 'skinTone' && <FaEye className="text-yellow-400" />}
              {key === 'bodyType' && <FaWeight className="text-blue-400" />}
            </div>
            <div className="text-white font-semibold">
              {typeof value === 'number' ? value.toFixed(1) : value}
              {key === 'heartRate' && ' BPM'}
              {key === 'bodyTemp' && '°F'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Body Composition Analysis
const BodyCompositionAnalysis = () => {
  const [composition, setComposition] = useState({
    muscle: 45,
    fat: 18,
    bone: 12,
    water: 60
  });

  return (
    <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
        <FaWeight className="mr-3 text-green-400" />
        Body Composition
      </h3>
      
      <div className="space-y-4">
        {Object.entries(composition).map(([component, percentage]) => (
          <div key={component} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 capitalize">{component} Mass</span>
              <span className="text-white font-semibold">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-full rounded-full ${
                  component === 'muscle' ? 'bg-red-400' :
                  component === 'fat' ? 'bg-yellow-400' :
                  component === 'bone' ? 'bg-gray-400' :
                  'bg-blue-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
        <div className="flex items-center space-x-2 text-green-400">
          <FaCheckCircle />
          <span className="font-semibold">Healthy Range</span>
        </div>
        <p className="text-gray-300 text-sm mt-1">
          Your body composition is within optimal health parameters.
        </p>
      </div>
    </div>
  );
};

// Real-time Health Monitoring
const HealthMonitoring = () => {
  const [healthData, setHealthData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDataPoint = {
        timestamp: Date.now(),
        heartRate: 68 + Math.random() * 10,
        stress: Math.random() * 100,
        activity: Math.random() * 100
      };
      
      setHealthData(prev => [...prev.slice(-19), newDataPoint]);
      
      // Generate alerts
      if (newDataPoint.heartRate > 75 && Math.random() > 0.8) {
        setAlerts(prev => [...prev, {
          id: Date.now(),
          type: 'warning',
          message: 'Elevated heart rate detected',
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
        <FaChartLine className="mr-3 text-purple-400" />
        Real-time Monitoring
      </h3>
      
      {/* Live Chart */}
      <div className="h-32 bg-black/20 rounded-xl mb-6 p-4">
        <div className="flex items-end h-full space-x-1">
          {healthData.map((data, index) => (
            <motion.div
              key={data.timestamp}
              className="bg-gradient-to-t from-purple-400 to-blue-400 w-3 rounded-t flex-1"
              style={{ height: `${(data.heartRate / 85) * 100}%` }}
              initial={{ height: 0 }}
              animate={{ height: `${(data.heartRate / 85) * 100}%` }}
            />
          ))}
        </div>
      </div>
      
      {/* Alerts */}
      <div className="space-y-2 max-h-32 overflow-y-auto">
        <h4 className="text-white font-semibold">Health Alerts</h4>
        {alerts.slice(-3).map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30"
          >
            <FaExclamationTriangle className="text-yellow-400" />
            <div className="flex-1">
              <p className="text-yellow-400 text-sm font-medium">{alert.message}</p>
              <p className="text-gray-400 text-xs">{alert.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Fit Prediction Engine
const FitPredictionEngine = () => {
  const [predictions, setPredictions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeFit = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setPredictions([
        {
          item: 'Premium T-Shirt',
          size: 'Medium',
          fit: 'Perfect',
          confidence: 94,
          adjustments: ['Slightly shorter sleeves recommended']
        },
        {
          item: 'Denim Jacket',
          size: 'Large',
          fit: 'Good',
          confidence: 87,
          adjustments: ['Consider size down for fitted look']
        },
        {
          item: 'Athletic Sneakers',
          size: '10',
          fit: 'Excellent',
          confidence: 96,
          adjustments: []
        }
      ]);
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <FaRuler className="mr-3 text-cyan-400" />
          Fit Prediction
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={analyzeFit}
          disabled={isAnalyzing}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Fit'}
        </motion.button>
      </div>
      
      {isAnalyzing && (
        <div className="text-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-300">AI analyzing body measurements...</p>
        </div>
      )}
      
      {predictions.length > 0 && !isAnalyzing && (
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/20 rounded-xl p-4 border border-gray-600"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold">{prediction.item}</h4>
                <div className="flex items-center space-x-2">
                  {prediction.fit === 'Perfect' && <FaCheckCircle className="text-green-400" />}
                  {prediction.fit === 'Good' && <FaCheckCircle className="text-yellow-400" />}
                  {prediction.fit === 'Poor' && <FaTimesCircle className="text-red-400" />}
                  <span className={`text-sm font-medium ${
                    prediction.fit === 'Perfect' ? 'text-green-400' :
                    prediction.fit === 'Good' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {prediction.fit} Fit
                  </span>
                </div>
              </div>
              
              <div className="text-gray-300 text-sm mb-2">
                Recommended Size: <span className="font-semibold">{prediction.size}</span>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-gray-400 text-sm">Confidence:</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-20">
                  <motion.div
                    className="bg-cyan-400 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${prediction.confidence}%` }}
                  />
                </div>
                <span className="text-cyan-400 text-sm">{prediction.confidence}%</span>
              </div>
              
              {prediction.adjustments.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-400 text-sm">Adjustments:</p>
                  <ul className="text-gray-300 text-sm list-disc list-inside">
                    {prediction.adjustments.map((adj, i) => (
                      <li key={i}>{adj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main BiometricAnalysis Component
const BiometricAnalysis = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scanner');
  const [isRecording, setIsRecording] = useState(false);

  const tabs = [
    { id: 'scanner', label: 'Biometric Scanner', icon: FaUserMd },
    { id: 'composition', label: 'Body Analysis', icon: FaWeight },
    { id: 'monitoring', label: 'Health Monitor', icon: FaChartLine },
    { id: 'prediction', label: 'Fit Prediction', icon: FaRuler }
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
              <FaHeart className="text-6xl text-red-400 animate-pulse" />
              <FaEye className="text-4xl text-blue-400" />
              <FaBrain className="text-5xl text-purple-400" />
            </div>
            
            <h1 className="text-6xl font-black text-white mb-4">
              BIOMETRIC
              <span className="block text-transparent bg-gradient-to-r from-red-400 via-blue-500 to-purple-500 bg-clip-text">
                ANALYSIS
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Advanced biometric analysis powered by AI. Monitor your health metrics in real-time, 
              analyze body composition, and get personalized fit predictions for the perfect fashion experience.
            </p>
            
            <div className="flex justify-center items-center space-x-6">
              <div className="bg-black/30 backdrop-blur-xl rounded-xl px-6 py-3 border border-green-500/30">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-semibold">Live Monitoring</span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRecording(!isRecording)}
                className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-6">
        <div className="flex justify-center mb-8">
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-2 border border-gray-700">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'scanner' && <BiometricScanner />}
              {activeTab === 'composition' && <BodyCompositionAnalysis />}
              {activeTab === 'monitoring' && <HealthMonitoring />}
              {activeTab === 'prediction' && <FitPredictionEngine />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="fixed bottom-6 right-6 space-y-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg"
          >
            <FaDownload />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-full shadow-lg"
          >
            <FaShare />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-full shadow-lg"
          >
            <FaCog />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default BiometricAnalysis;