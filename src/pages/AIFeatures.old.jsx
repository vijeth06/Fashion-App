import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaCamera, 
  FaInfoCircle, 
  FaPlus, 
  FaCheckCircle, 
  FaLightbulb, 
  FaStar 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';


export const BodyAnalysisPage = () => {

  const [analysis] = React.useState(null);


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
            Get precise body measurements and personalized size recommendations
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Upload Your Photo</h2>
            <div className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-500 transition-colors cursor-pointer">
              <FaCamera className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Take a photo or upload an image</p>
              <p className="text-sm text-gray-500">Stand straight, arms slightly away from body</p>
            </div>
          </div>

          {}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Your Measurements</h2>
            {analysis ? (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-gray-600">Body Type</p>
                  <p className="text-2xl font-bold text-purple-700">{analysis.bodyType?.type}</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-xl">
                  <p className="text-sm text-gray-600">Recommended Size</p>
                  <p className="text-2xl font-bold text-pink-700">{analysis.sizeRecommendations?.sizes?.tops}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FaInfoCircle className="text-4xl mx-auto mb-4" />
                <p>Upload a photo to get your analysis</p>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">ðŸ“</div>
            <h3 className="font-bold text-lg mb-2">Precise Measurements</h3>
            <p className="text-gray-600 text-sm">AI-powered body analysis from pose detection</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">ðŸ‘•</div>
            <h3 className="font-bold text-lg mb-2">Size Recommendations</h3>
            <p className="text-gray-600 text-sm">Get accurate size suggestions for every item</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">âœ¨</div>
            <h3 className="font-bold text-lg mb-2">Style Advice</h3>
            <p className="text-gray-600 text-sm">Personalized fitting recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
};


export const OutfitRecommendationsPage = () => {

  const [score] = React.useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Outfit Recommendations
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered outfit scoring based on color harmony and style compatibility
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Build Your Outfit</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <FaPlus className="text-3xl text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Add Top</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <FaPlus className="text-3xl text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Add Bottom</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <FaPlus className="text-3xl text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Add Shoes</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <FaPlus className="text-3xl text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Add Accessory</p>
              </div>
            </div>
          </div>

          {}
          {score && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-xl p-8 text-white mb-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Outfit Score</h2>
                <div className="text-7xl font-black mb-4">{score.score}/100</div>
                <p className="text-xl mb-6">{score.level}</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                    <p className="text-sm opacity-80">Color Harmony</p>
                    <p className="text-2xl font-bold">{score.breakdown?.colorHarmony}%</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                    <p className="text-sm opacity-80">Style Match</p>
                    <p className="text-2xl font-bold">{score.breakdown?.styleCompatibility}%</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                    <p className="text-sm opacity-80">Variety</p>
                    <p className="text-2xl font-bold">{score.breakdown?.variety}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">AI Suggestions</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <FaCheckCircle className="text-green-600 text-xl" />
                <p className="text-gray-700">Colors complement each other well</p>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <FaLightbulb className="text-blue-600 text-xl" />
                <p className="text-gray-700">Try adding a neutral accessory for balance</p>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <FaStar className="text-purple-600 text-xl" />
                <p className="text-gray-700">Perfect for a casual outing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
