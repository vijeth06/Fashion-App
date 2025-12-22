
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaCircleNotch, FaCog, FaRocket, FaMagic } from 'react-icons/fa';

export const useAsyncOperation = (asyncFunction, dependencies = []) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, data, error, execute };
};

export const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  type = 'spinner',
  message = 'Loading...',
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-blue-500',
    secondary: 'text-purple-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500'
  };

  const icons = {
    spinner: FaSpinner,
    circle: FaCircleNotch,
    cog: FaCog,
    rocket: FaRocket,
    magic: FaMagic
  };

  const Icon = icons[type] || FaSpinner;

  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} ${colorClasses[color]}`}
    >
      <Icon className="w-full h-full" />
    </motion.div>
  );

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
          {spinner}
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {spinner}
      {message && <span className="text-gray-600">{message}</span>}
    </div>
  );
};

export const SkeletonLoader = ({ 
  type = 'text', 
  count = 1, 
  height = '1rem',
  className = '' 
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
      className={`bg-gray-300 rounded ${className}`}
      style={{ height }}
    />
  ));

  const typeClasses = {
    text: 'space-y-2',
    card: 'space-y-4',
    list: 'space-y-3'
  };

  return (
    <div className={typeClasses[type]}>
      {skeletons}
    </div>
  );
};

export const ProgressBar = ({ 
  progress = 0, 
  showPercentage = true,
  color = 'blue',
  height = '4px',
  animated = true 
}) => {
  return (
    <div className="w-full">
      <div 
        className="bg-gray-200 rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: animated ? 0.5 : 0 }}
          className={`h-full bg-${color}-500 rounded-full`}
        />
      </div>
      {showPercentage && (
        <div className="text-right text-sm text-gray-600 mt-1">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export const useLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = (key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isLoading = (key) => Boolean(loadingStates[key]);
  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return { setLoading, isLoading, isAnyLoading, loadingStates };
};

export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false,
  onClick,
  className = '',
  loadingText = 'Loading...',
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative flex items-center justify-center space-x-2 ${className} ${
        loading || disabled ? 'opacity-75 cursor-not-allowed' : ''
      }`}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <LoadingSpinner size="small" />
            <span>{loadingText}</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export const LoadingCard = ({ title, description, progress }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto"
    >
      <div className="text-center">
        <LoadingSpinner size="large" type="magic" color="primary" />
        <h3 className="text-lg font-semibold mt-4 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {progress !== undefined && (
          <ProgressBar progress={progress} />
        )}
      </div>
    </motion.div>
  );
};

export const PageLoader = ({ message = 'Loading page...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <LoadingCard 
        title="VF-TryOn"
        description={message}
      />
    </div>
  );
};

export default {
  LoadingSpinner,
  SkeletonLoader,
  ProgressBar,
  LoadingButton,
  LoadingCard,
  PageLoader,
  useAsyncOperation,
  useLoadingState
};