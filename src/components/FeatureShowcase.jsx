
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaVrCardboard, FaRobot, FaCreditCard, FaUsers, FaStream, FaHeartbeat,
  FaPalette, FaHeart, FaShoppingBag, FaCamera, FaMagic, FaBolt,
  FaArrowRight, FaCheckCircle, FaStar, FaFire, FaHome, FaCompass
} from 'react-icons/fa';

const features = [
  {
    id: 'ar-tryon',
    title: 'Advanced AR Try-On',
    description: 'Experience revolutionary WebXR try-on with gesture controls, real-time physics, and body tracking',
    icon: FaVrCardboard,
    path: '/quantum-tryon',
    color: 'from-purple-500 to-indigo-600',
    status: 'complete',
    highlights: ['WebXR Integration', 'Hand Tracking', 'Physics Simulation', 'Body Detection']
  },
  {
    id: 'ai-assistant',
    title: 'Smart Style Assistant',
    description: 'AI-powered emotion detection, trend prediction, and personalized outfit recommendations',
    icon: FaRobot,
    path: '/neural-interface',
    color: 'from-blue-500 to-cyan-600',
    status: 'complete',
    highlights: ['Emotion AI', 'Trend Analysis', 'Outfit Matching', 'Style Coaching']
  },
  {
    id: 'payment-gateway',
    title: 'Advanced Payment System',
    description: 'Multi-gateway payment processing with fraud detection and smart routing',
    icon: FaCreditCard,
    path: '/checkout',
    color: 'from-green-500 to-emerald-600',
    status: 'complete',
    highlights: ['Multi-gateway', 'Fraud Detection', 'Smart Routing', 'Global Payments']
  },
  {
    id: 'social-platform',
    title: 'Social Fashion Platform',
    description: 'Community features, style sharing, influencer collaboration, and social commerce',
    icon: FaUsers,
    path: '/social-platform',
    color: 'from-pink-500 to-rose-600',
    status: 'complete',
    highlights: ['Community Feed', 'Style Sharing', 'Influencer System', 'Social Commerce']
  },
  {
    id: 'real-time',
    title: 'Real-time Features',
    description: 'Live streaming, collaborative styling, and instant AI recommendations',
    icon: FaStream,
    path: '/real-time',
    color: 'from-orange-500 to-amber-600',
    status: 'complete',
    highlights: ['Live Streaming', 'Collaborative Styling', 'Real-time AI', 'WebRTC']
  },
  {
    id: 'biometric-analysis',
    title: 'Biometric Analysis',
    description: 'Real-time health monitoring and fit prediction with advanced biometric analysis',
    icon: FaHeartbeat,
    path: '/biometric',
    color: 'from-red-500 to-pink-600',
    status: 'complete',
    highlights: ['Health Monitoring', 'Fit Prediction', 'Body Composition', 'Real-time Analysis']
  },
  {
    id: 'catalog',
    title: '360Â° Digital Catalog',
    description: 'Revolutionary product catalog with 360Â° views, AI search, and advanced filtering',
    icon: FaPalette,
    path: '/catalog',
    color: 'from-teal-500 to-green-600',
    status: 'complete',
    highlights: ['360Â° Views', 'AI Search', 'Smart Filters', '3D Visualization']
  },
  {
    id: 'try-on-items',
    title: 'Item Try-On',
    description: 'Try specific fashion items with advanced AR fitting and real-time customization',
    icon: FaCamera,
    path: '/try?item=1',
    color: 'from-violet-500 to-purple-600',
    status: 'complete',
    highlights: ['Item-specific AR', 'Real-time Fitting', 'Color Customization', 'Size Adjustment']
  }
];

function FeatureCard({ feature }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300"
    >
      <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white`}>
            <feature.icon className="w-6 h-6" />
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <FaCheckCircle className="w-3 h-3" />
            Available
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>

        <div className="space-y-2 mb-6">
          {feature.highlights.map((highlight, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <FaStar className="w-3 h-3 text-yellow-500" />
              {highlight}
            </div>
          ))}
        </div>

        <Link
          to={feature.path}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${feature.color} text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 w-full justify-center`}
        >
          Try Feature
          <FaArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function FeatureShowcase() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <FaFire className="w-8 h-8 text-orange-500" />
            <h1 className="text-5xl font-black text-gray-900">
              Next-Gen Fashion Platform
            </h1>
            <FaBolt className="w-8 h-8 text-yellow-500" />
          </div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Revolutionary virtual fashion shopping experience with cutting-edge AR, AI, and social features. 
            Discover the future of fashion technology!
          </p>

          <motion.div
            animate={{ 
              background: [
                'linear-gradient(45deg, #8B5CF6, #EC4899)',
                'linear-gradient(45deg, #EC4899, #F59E0B)',
                'linear-gradient(45deg, #F59E0B, #10B981)',
                'linear-gradient(45deg, #10B981, #3B82F6)',
                'linear-gradient(45deg, #3B82F6, #8B5CF6)'
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="inline-block px-8 py-3 text-white rounded-2xl font-bold text-lg shadow-lg"
          >
            ✨ Experience Virtual Fashion Try-On
          </motion.div>
        </motion.div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Platform Features & Capabilities
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              'Virtual Try-On', 'Social Fashion', 'AR/VR Mode', '3D Visualization', 'Smart Styling',
              'Mobile Ready', 'Real-time Fitting', 'Video Recording', 'AI Recommendations', 'Secure Payments',
              'Wishlist', 'User Profiles'
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="text-sm font-medium text-gray-900">{feature}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-12 text-center"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Start Your Fashion Journey</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/catalog"
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Shop Fashion
            </Link>
            <Link
              to="/try-on"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Virtual Try-On
            </Link>
            <Link
              to="/community"
              className="px-6 py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition-colors"
            >
              Fashion Community
            </Link>
            <Link
              to="/profile"
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              My Profile
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}