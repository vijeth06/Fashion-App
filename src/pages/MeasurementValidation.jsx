import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiometricValidator } from '../data/biometricProfile';
import { 
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaRuler,
  FaWeight,
  FaUser,
  FaHistory
} from 'react-icons/fa';

/**
 * Measurement Validation Component
 * Shows realistic vs unrealistic measurements with validation
 */
const MeasurementValidation = () => {
  const [measurements, setMeasurements] = useState({});
  const [validationResults, setValidationResults] = useState({});
  const [showRealistic, setShowRealistic] = useState(false);

  useEffect(() => {
    // Show the problematic measurements you encountered
    const problematicMeasurements = {
      chest: 104497, // Your original problematic value
      waist: 55489,  // Your original problematic value
      hips: 63416    // Your original problematic value
    };

    // Generate realistic measurements for comparison
    const realisticMeasurements = BiometricValidator.generateRealisticMockMeasurements();

    setMeasurements(showRealistic ? realisticMeasurements : problematicMeasurements);
  }, [showRealistic]);

  useEffect(() => {
    // Validate all measurements
    const results = {};
    Object.entries(measurements).forEach(([type, value]) => {
      if (value !== undefined && value !== null) {
        results[type] = BiometricValidator.validateMeasurement(value, type);
      }
    });
    setValidationResults(results);
  }, [measurements]);

  const getValidationIcon = (result) => {
    if (!result) return null;
    if (result.valid) return <FaCheckCircle className="text-green-500" />;
    return <FaTimesCircle className="text-red-500" />;
  };

  const getValidationColor = (result) => {
    if (!result) return 'text-gray-400';
    return result.valid ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Measurement Validation Demo
          </h1>
          <p className="text-gray-300 text-lg">
            Demonstrating the difference between unrealistic and validated measurements
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center space-x-4">
              <span className={`font-medium ${!showRealistic ? 'text-red-400' : 'text-gray-400'}`}>
                Problematic Data
              </span>
              <motion.button
                className={`w-16 h-8 rounded-full p-1 transition-colors ${
                  showRealistic ? 'bg-green-500' : 'bg-red-500'
                }`}
                onClick={() => setShowRealistic(!showRealistic)}
              >
                <motion.div
                  className="w-6 h-6 bg-white rounded-full"
                  animate={{ x: showRealistic ? 32 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
              </motion.button>
              <span className={`font-medium ${showRealistic ? 'text-green-400' : 'text-gray-400'}`}>
                Validated Data
              </span>
            </div>
          </div>
        </div>

        {/* Measurements Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(measurements).map(([type, value]) => {
            const result = validationResults[type];
            const isValid = result?.valid;
            
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-black/30 backdrop-blur-xl rounded-2xl p-6 border transition-colors ${
                  isValid ? 'border-green-500/50' : 'border-red-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white capitalize flex items-center">
                    <FaRuler className="mr-2" />
                    {type}
                  </h3>
                  {getValidationIcon(result)}
                </div>
                
                <div className="mb-4">
                  <div className={`text-3xl font-bold ${getValidationColor(result)}`}>
                    {value ? value.toFixed(1) : 'N/A'} cm
                  </div>
                  {value > 1000 && (
                    <div className="text-yellow-400 text-sm mt-1">
                      = {(value / 100).toFixed(1)} meters = {(value / 100000).toFixed(3)} km!
                    </div>
                  )}
                </div>

                {result && !result.valid && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="text-red-300 text-sm">
                        {result.reason}
                      </div>
                    </div>
                  </div>
                )}

                {result?.valid && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="text-green-300 text-sm">
                        Valid human measurement
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <FaHistory className="mr-2" />
            What Was Fixed
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-3">❌ Previous Issues:</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Chest: 104,497 cm (over 1 kilometer!)</li>
                <li>• Waist: 55,489 cm (555 meters)</li>
                <li>• Hips: 63,416 cm (634 meters)</li>
                <li>• No validation or range checking</li>
                <li>• Arbitrary pixel multipliers (×100, ×150)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Fixed Implementation:</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Realistic measurement ranges (70-130 cm chest)</li>
                <li>• Proper validation and error detection</li>
                <li>• Scaled pixel calculations (×0.4-0.8 factors)</li>
                <li>• Confidence scoring based on realistic ranges</li>
                <li>• Protection against corrupted/incorrect data</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <FaUser className="text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <div className="text-blue-300 font-semibold mb-2">For Reference - Typical Human Measurements:</div>
                <div className="text-gray-300 text-sm grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>Height: 150-200 cm</div>
                  <div>Chest: 75-130 cm</div>
                  <div>Waist: 60-120 cm</div>
                  <div>Hips: 80-140 cm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementValidation;