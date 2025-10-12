import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiService from '../services/apiService';
import { 
  FaDatabase, 
  FaCheck, 
  FaTimes, 
  FaSpinner, 
  FaSync, 
  FaExclamationTriangle,
  FaInfoCircle,
  FaRocket
} from 'react-icons/fa';

const DatabaseManager = () => {
  const [status, setStatus] = useState({
    connected: false,
    initialized: false,
    loading: true,
    error: null
  });
  const [dbStats, setDbStats] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check database status on component mount
  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      
      // Test connection
      const connectionResult = await apiService.testDatabase();
      
      // Get initialization status
      const statusResult = await apiService.getDatabaseStatus();
      
      setStatus({
        connected: connectionResult.connected,
        initialized: statusResult.status?.initialized || false,
        loading: false,
        error: null
      });
      
      setDbStats(statusResult.status);
    } catch (error) {
      setStatus({
        connected: false,
        initialized: false,
        loading: false,
        error: error.message
      });
    }
  };

  const initializeDatabase = async () => {
    try {
      setActionLoading(true);
      const result = await apiService.initializeDatabase();
      
      if (result.success) {
        await checkDatabaseStatus();
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, error: error.message }));
    } finally {
      setActionLoading(false);
    }
  };

  const refreshStatus = async () => {
    await checkDatabaseStatus();
  };

  if (status.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full mx-auto mb-4"
          />
          <p className="text-white text-xl">Checking database status...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-6">
            <FaDatabase className="text-purple-400" />
            <span className="text-white font-mono text-sm tracking-widest">DATABASE.MANAGER</span>
          </div>
          
          <h1 className="text-5xl font-black text-white mb-4">
            DATABASE
            <span className="block text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              CONTROL PANEL
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Monitor and manage your MongoDB Atlas database connection and collections
          </p>
        </motion.div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Connection Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-2xl backdrop-blur-xl border ${
              status.connected 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                status.connected ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {status.connected ? (
                  <FaCheck className="w-6 h-6 text-green-400" />
                ) : (
                  <FaTimes className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Database Connection
                </h3>
                <p className={`text-sm ${
                  status.connected ? 'text-green-400' : 'text-red-400'
                }`}>
                  {status.connected ? 'Connected to MongoDB Atlas' : 'Connection Failed'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Initialization Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-2xl backdrop-blur-xl border ${
              status.initialized 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-yellow-500/10 border-yellow-500/30'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                status.initialized ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}>
                {status.initialized ? (
                  <FaCheck className="w-6 h-6 text-green-400" />
                ) : (
                  <FaExclamationTriangle className="w-6 h-6 text-yellow-400" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Database Initialization
                </h3>
                <p className={`text-sm ${
                  status.initialized ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {status.initialized ? 'Collections Ready' : 'Needs Initialization'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Error Display */}
        {status.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center space-x-3">
              <FaTimes className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-bold text-red-400">Error</h3>
            </div>
            <p className="text-red-300 mt-2">{status.error}</p>
          </motion.div>
        )}

        {/* Database Statistics */}
        {dbStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <FaInfoCircle className="text-blue-400" />
              <span>Database Statistics</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {dbStats.collections?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Collections</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">
                  {dbStats.documentCounts ? Object.values(dbStats.documentCounts).reduce((a, b) => a + b, 0) : 0}
                </div>
                <div className="text-sm text-gray-400">Total Documents</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {dbStats.documentCounts?.products || 0}
                </div>
                <div className="text-sm text-gray-400">Products</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {dbStats.documentCounts?.users || 0}
                </div>
                <div className="text-sm text-gray-400">Users</div>
              </div>
            </div>

            {dbStats.collections && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-3">Collections</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dbStats.collections.map((collection) => (
                    <div key={collection} className="bg-slate-800/30 rounded-lg p-3">
                      <div className="text-white font-medium">{collection}</div>
                      <div className="text-sm text-gray-400">
                        {dbStats.documentCounts?.[collection] || 0} documents
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={refreshStatus}
            disabled={actionLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-800/50 border border-slate-600/50 text-white rounded-xl hover:bg-slate-700/50 transition-all duration-300 disabled:opacity-50"
          >
            <FaSync className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>

          {!status.initialized && status.connected && (
            <button
              onClick={initializeDatabase}
              disabled={actionLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50"
            >
              {actionLoading ? (
                <FaSpinner className="w-4 h-4 animate-spin" />
              ) : (
                <FaRocket className="w-4 h-4" />
              )}
              <span>Initialize Database</span>
            </button>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-slate-900/20 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Setup Instructions</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">1</div>
              <div>
                <strong>Database Connection:</strong> Ensure your MongoDB Atlas connection string is configured in the backend
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">2</div>
              <div>
                <strong>Initialize Collections:</strong> Click "Initialize Database" to create collections and sample data
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">3</div>
              <div>
                <strong>Firebase Integration:</strong> Your Firebase authentication will sync with MongoDB automatically
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DatabaseManager;