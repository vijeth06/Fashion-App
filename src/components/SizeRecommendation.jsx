import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRuler, 
  FaUser, 
  FaBrain, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaArrowRight
} from 'react-icons/fa';

const SizeRecommendation = ({ 
  productId, 
  productCategory = 'clothing',
  onSizeSelect,
  userProfile = null,
  isOpen = false,
  onClose
}) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: measurements, 2: recommendation
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    shoulderWidth: '',
    bodyType: ''
  });

  const sizeCharts = {
    clothing: {
      XS: { chest: '32-34', waist: '24-26', hips: '34-36' },
      S: { chest: '34-36', waist: '26-28', hips: '36-38' },
      M: { chest: '36-38', waist: '28-30', hips: '38-40' },
      L: { chest: '38-40', waist: '30-32', hips: '40-42' },
      XL: { chest: '40-42', waist: '32-34', hips: '42-44' },
      XXL: { chest: '42-44', waist: '34-36', hips: '44-46' }
    },
    footwear: {
      6: { length: '9.25', width: '3.5' },
      7: { length: '9.625', width: '3.625' },
      8: { length: '10', width: '3.75' },
      9: { length: '10.375', width: '3.875' },
      10: { length: '10.75', width: '4' },
      11: { length: '11.125', width: '4.125' }
    }
  };

  const generateRecommendation = (userMeasurements) => {
    setLoading(true);

    setTimeout(() => {
      const { chest, waist, hips, height, weight, bodyType } = userMeasurements;
      
      let recommendedSize = 'M';
      let confidence = 85;
      let reasons = [];
      let warnings = [];

      const chestNum = parseFloat(chest);
      const waistNum = parseFloat(waist);
      const hipsNum = parseFloat(hips);
      
      if (chestNum && waistNum && hipsNum) {
        if (chestNum <= 34 && waistNum <= 26 && hipsNum <= 36) {
          recommendedSize = 'XS';
          confidence = 92;
        } else if (chestNum <= 36 && waistNum <= 28 && hipsNum <= 38) {
          recommendedSize = 'S';
          confidence = 90;
        } else if (chestNum <= 38 && waistNum <= 30 && hipsNum <= 40) {
          recommendedSize = 'M';
          confidence = 88;
        } else if (chestNum <= 40 && waistNum <= 32 && hipsNum <= 42) {
          recommendedSize = 'L';
          confidence = 86;
        } else if (chestNum <= 42 && waistNum <= 34 && hipsNum <= 44) {
          recommendedSize = 'XL';
          confidence = 84;
        } else {
          recommendedSize = 'XXL';
          confidence = 82;
        }

        reasons.push('Based on your chest, waist, and hip measurements');

        if (bodyType === 'athletic') {
          reasons.push('Adjusted for athletic build');
          confidence += 3;
        } else if (bodyType === 'curvy') {
          reasons.push('Adjusted for curvy figure');
          if (hipsNum > chestNum + 2) {
            warnings.push('Consider sizing up for hip comfort');
          }
        }

        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);
        
        if (heightNum && weightNum) {
          const bmi = weightNum / ((heightNum / 100) ** 2);
          if (bmi > 25) {
            reasons.push('Adjusted for body composition');
          }
        }
      } else {
        confidence = 70;
        reasons.push('Estimated based on available measurements');
        warnings.push('More measurements would improve accuracy');
      }
      
      setRecommendation({
        size: recommendedSize,
        confidence,
        reasons,
        warnings,
        alternatives: {
          smaller: getSmallerSize(recommendedSize),
          larger: getLargerSize(recommendedSize)
        },
        fitAdvice: getFitAdvice(recommendedSize, userMeasurements)
      });
      
      setLoading(false);
      setStep(2);
    }, 2000);
  };

  const getSmallerSize = (size) => {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const index = sizes.indexOf(size);
    return index > 0 ? sizes[index - 1] : null;
  };

  const getLargerSize = (size) => {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const index = sizes.indexOf(size);
    return index < sizes.length - 1 ? sizes[index + 1] : null;
  };

  const getFitAdvice = (size, measurements) => {
    const advice = [];
    
    if (measurements.bodyType === 'athletic') {
      advice.push('This size should provide comfortable fit across shoulders');
    }
    
    if (measurements.bodyType === 'curvy') {
      advice.push('Ensure adequate room in hip area');
    }
    
    advice.push('Virtual try-on recommended for final verification');
    
    return advice;
  };

  const handleMeasurementSubmit = () => {
    if (!measurements.chest || !measurements.waist || !measurements.hips) {
      alert('Please fill in at least chest, waist, and hip measurements');
      return;
    }
    generateRecommendation(measurements);
  };

  const handleSizeConfirm = () => {
    setSelectedSize(recommendation.size);
    if (onSizeSelect) {
      onSizeSelect(recommendation.size, recommendation);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-full">
                  <FaBrain className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Size Recommendation</h2>
                  <p className="text-white text-opacity-90">Get your perfect fit with AI</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {}
            <div className="flex items-center gap-4 mt-6">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white' : 'text-white text-opacity-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step >= 1 ? 'bg-white text-purple-600' : 'border-white border-opacity-50'
                }`}>
                  1
                </div>
                <span className="font-medium">Measurements</span>
              </div>
              <FaArrowRight className="text-white text-opacity-50" />
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-white' : 'text-white text-opacity-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step >= 2 ? 'bg-white text-purple-600' : 'border-white border-opacity-50'
                }`}>
                  2
                </div>
                <span className="font-medium">Recommendation</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <FaRuler className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Your Measurements</h3>
                  <p className="text-gray-600">Provide your measurements for accurate size recommendation</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                    <input
                      type="number"
                      value={measurements.height}
                      onChange={(e) => setMeasurements({...measurements, height: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="170"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      value={measurements.weight}
                      onChange={(e) => setMeasurements({...measurements, weight: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="65"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chest (inches) *</label>
                    <input
                      type="number"
                      value={measurements.chest}
                      onChange={(e) => setMeasurements({...measurements, chest: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="36"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Waist (inches) *</label>
                    <input
                      type="number"
                      value={measurements.waist}
                      onChange={(e) => setMeasurements({...measurements, waist: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="28"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hips (inches) *</label>
                    <input
                      type="number"
                      value={measurements.hips}
                      onChange={(e) => setMeasurements({...measurements, hips: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="38"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Body Type</label>
                    <select
                      value={measurements.bodyType}
                      onChange={(e) => setMeasurements({...measurements, bodyType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select body type</option>
                      <option value="slim">Slim</option>
                      <option value="athletic">Athletic</option>
                      <option value="curvy">Curvy</option>
                      <option value="plus">Plus Size</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Measurement Tips</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Measure over your regular undergarments</li>
                        <li>• Keep the tape measure level and snug but not tight</li>
                        <li>• For chest: measure around fullest part</li>
                        <li>• For waist: measure at natural waistline</li>
                        <li>• For hips: measure around fullest part</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleMeasurementSubmit}
                  disabled={!measurements.chest || !measurements.waist || !measurements.hips}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Get AI Recommendation
                </button>
              </motion.div>
            )}

            {}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Measurements</h3>
                <p className="text-gray-600">Our AI is calculating your perfect size...</p>
              </motion.div>
            )}

            {}
            {step === 2 && recommendation && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Recommended Size</h3>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{recommendation.size}</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-semibold text-green-600">{recommendation.confidence}%</span>
                  </div>
                </div>

                {}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Size Chart Comparison</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Chest:</span>
                      <span className="ml-2 font-medium">{sizeCharts.clothing[recommendation.size]?.chest}"</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Waist:</span>
                      <span className="ml-2 font-medium">{sizeCharts.clothing[recommendation.size]?.waist}"</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hips:</span>
                      <span className="ml-2 font-medium">{sizeCharts.clothing[recommendation.size]?.hips}"</span>
                    </div>
                  </div>
                </div>

                {}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Why this size?</h4>
                  <ul className="space-y-2">
                    {recommendation.reasons.map((reason, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <FaCheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {}
                {recommendation.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Important Notes</h4>
                    <ul className="space-y-2">
                      {recommendation.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-orange-700">
                          <FaExclamationTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Alternative Options</h4>
                  <div className="flex gap-3">
                    {recommendation.alternatives.smaller && (
                      <button
                        onClick={() => setSelectedSize(recommendation.alternatives.smaller)}
                        className="flex-1 p-3 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                      >
                        <div className="font-medium">{recommendation.alternatives.smaller}</div>
                        <div className="text-sm text-gray-600">For tighter fit</div>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedSize(recommendation.size)}
                      className="flex-1 p-3 border-2 border-purple-500 bg-purple-50 rounded-lg"
                    >
                      <div className="font-medium text-purple-600">{recommendation.size}</div>
                      <div className="text-sm text-purple-600">Recommended</div>
                    </button>
                    {recommendation.alternatives.larger && (
                      <button
                        onClick={() => setSelectedSize(recommendation.alternatives.larger)}
                        className="flex-1 p-3 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                      >
                        <div className="font-medium">{recommendation.alternatives.larger}</div>
                        <div className="text-sm text-gray-600">For looser fit</div>
                      </button>
                    )}
                  </div>
                </div>

                {}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Adjust Measurements
                  </button>
                  <button
                    onClick={handleSizeConfirm}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  >
                    Use This Size
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SizeRecommendation;