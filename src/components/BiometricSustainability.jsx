// 🧬 BIOMETRIC & SUSTAINABILITY SYSTEM
// Features: DNA-Based Styling, Eco-Fashion Tracking, Sustainability AI

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDna, FaLeaf, FaHeart, FaRecycle, FaTree, FaWater } from 'react-icons/fa';

// 🧬 MAIN BIOMETRIC SUSTAINABILITY ENGINE
export class BiometricSustainabilityEngine {
  constructor() {
    this.dnaAnalyzer = new DNAStyleAnalyzer();
    this.sustainabilityTracker = new SustainabilityTracker();
    this.ecoFashionAI = new EcoFashionAI();
    this.circularEngine = new CircularFashionEngine();
  }

  async analyzeBiometricSustainability(userProfile) {
    console.log('🧬 Analyzing Biometric & Sustainability Profile...');
    
    const [dnaProfile, sustainabilityScore, ecoRecommendations, circularOpportunities] = await Promise.all([
      this.dnaAnalyzer.analyzeGeneticStyleMarkers(userProfile),
      this.sustainabilityTracker.calculateSustainabilityScore(userProfile),
      this.ecoFashionAI.generateEcoRecommendations(userProfile),
      this.circularEngine.identifyCircularOpportunities(userProfile)
    ]);

    return {
      dnaProfile,
      sustainability: { score: sustainabilityScore, ecoRecommendations, circularOpportunities },
      actionPlan: this.createSustainabilityActionPlan(sustainabilityScore)
    };
  }

  createSustainabilityActionPlan(score) {
    return {
      immediate: ['Choose sustainable brands', 'Repair existing items', 'Reduce fast fashion purchases'],
      shortTerm: ['Build capsule wardrobe', 'Learn clothing care', 'Join clothing swaps'],
      longTerm: ['Invest in quality pieces', 'Support circular fashion', 'Advocate for sustainability']
    };
  }
}

// 🧬 DNA STYLE ANALYZER
export class DNAStyleAnalyzer {
  async analyzeGeneticStyleMarkers(userProfile) {
    const mockDNA = this.generateMockDNAProfile(userProfile);
    
    return {
      geneticStyleSignature: {
        primary: 'Creative-Minimalist Hybrid',
        uniqueness: 0.78,
        adaptability: 0.85
      },
      colorDNA: {
        dominantColorFamily: 'cool',
        geneticColorPreferences: ['#4A90E2', '#50C878', '#6A5ACD'],
        sensitivity: 'normal'
      },
      bodyDNA: {
        naturalBodyType: 'balanced',
        optimalSilhouettes: ['A-line', 'straight', 'fitted'],
        metabolicNeeds: 'temperature-adaptive'
      },
      personalityDNA: {
        riskTaking: 0.6,
        creativity: 0.8,
        environmentalAwareness: 0.9
      }
    };
  }

  generateMockDNAProfile(userProfile) {
    return {
      markers: {
        OCA2: Math.random() > 0.7 ? 'AA' : 'Aa',
        DRD4: Math.random() > 0.5 ? '7R+' : '7R-'
      }
    };
  }
}

// 🌱 SUSTAINABILITY TRACKER
export class SustainabilityTracker {
  async calculateSustainabilityScore(userProfile) {
    return {
      overall: 0.73,
      breakdown: {
        wardrobe: 0.68,
        purchasing: 0.75,
        usage: 0.82,
        disposal: 0.60
      },
      impact: {
        carbonFootprint: '2.1 tons CO2/year',
        waterUsage: '15,000L/year',
        wasteGeneration: '30kg/year'
      },
      improvements: [
        'Switch to sustainable brands',
        'Increase item usage frequency',
        'Improve disposal methods'
      ]
    };
  }
}

// 💚 ECO FASHION AI
export class EcoFashionAI {
  async generateEcoRecommendations(userProfile) {
    return {
      sustainableBrands: [
        { name: 'Patagonia', match: 0.92, focus: 'Outdoor sustainable fashion' },
        { name: 'Eileen Fisher', match: 0.86, focus: 'Minimalist eco-luxury' },
        { name: 'Reformation', match: 0.78, focus: 'Trendy sustainable pieces' }
      ],
      ecoMaterials: ['Organic Cotton', 'Tencel', 'Recycled Polyester', 'Hemp'],
      localOptions: ['Vintage stores', 'Local designers', 'Repair shops'],
      impact: {
        potentialCarbonReduction: '0.8 tons CO2/year',
        waterSavings: '5,000L/year'
      }
    };
  }
}

// ♻️ CIRCULAR FASHION ENGINE
export class CircularFashionEngine {
  async identifyCircularOpportunities(userProfile) {
    return {
      repair: { items: 5, value: '$150', impact: 'Extend lifespan 2-5 years' },
      resale: { items: 8, value: '$320', impact: 'Recover 40% original value' },
      upcycle: { projects: 3, value: '$90', impact: 'Creative transformation' },
      recycle: { items: 12, impact: 'Proper material recovery' },
      circularityScore: 0.65
    };
  }
}

// 🌟 MAIN UI COMPONENT
export default function BiometricSustainabilityDashboard({ userProfile, isVisible = false, onClose }) {
  const [engine] = useState(() => new BiometricSustainabilityEngine());
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dna');

  useEffect(() => {
    if (isVisible && userProfile) {
      initializeAnalysis();
    }
  }, [isVisible, userProfile]);

  const initializeAnalysis = async () => {
    setLoading(true);
    try {
      const result = await engine.analyzeBiometricSustainability(userProfile);
      setAnalysis(result);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-green-400/30 rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">
                BIOMETRIC
                <span className="block text-transparent bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text">
                  SUSTAINABILITY.DNA
                </span>
              </h2>
              <p className="text-gray-400">Your genetic style signature and eco-impact analysis</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
          </div>

          {loading ? (
            <LoadingScreen />
          ) : analysis ? (
            <>
              <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabContent activeTab={activeTab} analysis={analysis} />
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-red-400">Failed to load analysis</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function LoadingScreen() {
  return (
    <div className="text-center py-16">
      <motion.div className="flex justify-center space-x-4 mb-8">
        {[FaDna, FaLeaf, FaHeart].map((Icon, i) => (
          <motion.div key={i} animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
            <Icon className="text-3xl text-green-400" />
          </motion.div>
        ))}
      </motion.div>
      <p className="text-green-400 font-mono">Analyzing DNA & Sustainability...</p>
    </div>
  );
}

function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dna', label: 'DNA Profile', icon: FaDna },
    { id: 'sustainability', label: 'Eco Impact', icon: FaLeaf },
    { id: 'action', label: 'Action Plan', icon: FaRecycle }
  ];

  return (
    <div className="flex space-x-4 mb-8 border-b border-gray-700 pb-4">
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon />
            <span className="font-mono">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TabContent({ activeTab, analysis }) {
  if (activeTab === 'dna') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center">
            <FaDna className="mr-2" />
            Genetic Style Signature
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-bold mb-2">Primary Type</h4>
              <p className="text-gray-300">{analysis.dnaProfile.geneticStyleSignature.primary}</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-2">Uniqueness Score</h4>
              <div className="bg-gray-800 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-purple-500 h-full"
                  style={{ width: `${analysis.dnaProfile.geneticStyleSignature.uniqueness * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-400/30 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-green-400 mb-4">Color DNA</h3>
          <div className="flex space-x-2">
            {analysis.dnaProfile.colorDNA.geneticColorPreferences.map((color, i) => (
              <div key={i} className="w-8 h-8 rounded-full border border-gray-600" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (activeTab === 'sustainability') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-6">
          <h3 className="text-2xl font-bold text-green-400 mb-4 flex items-center">
            <FaLeaf className="mr-2" />
            Sustainability Score
          </h3>
          <div className="text-center">
            <div className="text-4xl font-black text-green-400 mb-2">
              {Math.round(analysis.sustainability.score.overall * 100)}
            </div>
            <p className="text-gray-300">Overall Score</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center">
          <FaRecycle className="mr-2" />
          Sustainability Action Plan
        </h3>
        <div className="space-y-4">
          {Object.entries(analysis.actionPlan).map(([timeframe, actions]) => (
            <div key={timeframe}>
              <h4 className="text-white font-bold mb-2 capitalize">{timeframe}</h4>
              <ul className="space-y-1">
                {actions.map((action, i) => (
                  <li key={i} className="text-gray-300 text-sm">• {action}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
