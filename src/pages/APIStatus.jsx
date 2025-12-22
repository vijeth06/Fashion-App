import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner, 
  FaServer,
  FaDatabase,
  FaChartLine,
  FaUser,
  FaShoppingCart,
  FaHeart,
  FaImage,
  FaExclamationTriangle
} from 'react-icons/fa';
import APIConnectionTester from '../utils/apiConnectionTester';


const APIStatusDashboard = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {

    runTests();
  }, []);

  const runTests = async () => {
    setTesting(true);
    setError(null);

    try {
      const tester = new APIConnectionTester();
      const testResults = await tester.runAllTests();
      setResults(testResults);
    } catch (err) {
      setError(err.message);
      console.error('API testing error:', err);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (success) => {
    if (success) {
      return <FaCheckCircle className="text-green-500 text-2xl" />;
    }
    return <FaTimesCircle className="text-red-500 text-2xl" />;
  };

  const getCategoryIcon = (name) => {
    if (name.includes('Health') || name.includes('Database')) {
      return <FaDatabase className="text-blue-500" />;
    }
    if (name.includes('Auth')) {
      return <FaUser className="text-purple-500" />;
    }
    if (name.includes('Products')) {
      return <FaShoppingCart className="text-green-500" />;
    }
    if (name.includes('Wishlist')) {
      return <FaHeart className="text-red-500" />;
    }
    if (name.includes('Analytics')) {
      return <FaChartLine className="text-yellow-500" />;
    }
    if (name.includes('Looks') || name.includes('Upload')) {
      return <FaImage className="text-pink-500" />;
    }
    return <FaServer className="text-gray-500" />;
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800';
    if (status >= 500) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaServer className="text-5xl text-blue-600" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              API Status Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Real-time monitoring of all backend API connections
          </p>
        </motion.div>

        {}
        <div className="text-center mb-8">
          <button
            onClick={runTests}
            disabled={testing}
            className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {testing ? (
              <>
                <FaSpinner className="animate-spin" />
                Testing Connections...
              </>
            ) : (
              <>
                <FaServer />
                Run Connection Tests
              </>
            )}
          </button>
        </div>

        {}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-2xl" />
              <div>
                <h3 className="font-bold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <FaServer className="text-3xl text-blue-500" />
                <span className="text-3xl font-black text-gray-800">
                  {results.summary.total}
                </span>
              </div>
              <p className="text-gray-600 font-medium">Total Endpoints</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <FaCheckCircle className="text-3xl text-green-500" />
                <span className="text-3xl font-black text-green-600">
                  {results.summary.successful}
                </span>
              </div>
              <p className="text-gray-600 font-medium">Successful</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <FaTimesCircle className="text-3xl text-red-500" />
                <span className="text-3xl font-black text-red-600">
                  {results.summary.failed}
                </span>
              </div>
              <p className="text-gray-600 font-medium">Failed</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <FaChartLine className="text-3xl text-purple-500" />
                <span className="text-3xl font-black text-purple-600">
                  {results.summary.successRate}
                </span>
              </div>
              <p className="text-gray-600 font-medium">Success Rate</p>
            </div>
          </motion.div>
        )}

        {}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600">
              <h2 className="text-2xl font-bold text-white">
                API Endpoint Status
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Endpoint</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Method</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Response Code</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.results.map((result, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.success)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(result.name)}
                          <div>
                            <p className="font-medium text-gray-900">{result.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-md">
                              {result.url}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          result.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                          result.method === 'POST' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          getStatusColor(result.status)
                        }`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-mono">
                          {result.duration}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {}
            <div className="p-6 bg-gray-50 border-t">
              <details className="cursor-pointer">
                <summary className="font-bold text-gray-700 hover:text-gray-900">
                  View Raw Test Results
                </summary>
                <pre className="mt-4 p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>
            </div>
          </motion.div>
        )}

        {}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6"
        >
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <FaServer />
            Backend Status
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>âœ“ Backend Server: <strong>http://localhost:5000</strong></p>
            <p>âœ“ API Base URL: <strong>http://localhost:5000/api/v1</strong></p>
            <p>âœ“ Health Check: <a href="http://localhost:5000/health" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">http://localhost:5000/health</a></p>
            <p>âœ“ Database: <strong>MongoDB Atlas Connected</strong></p>
          </div>
        </motion.div>

        {}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <a
            href="http://localhost:5000/health"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white rounded-xl shadow hover:shadow-lg transition-all text-center"
          >
            <FaServer className="text-3xl text-blue-500 mx-auto mb-2" />
            <p className="font-bold text-gray-900">Health Check</p>
            <p className="text-xs text-gray-500">View server status</p>
          </a>

          <a
            href="http://localhost:5000/api/test-db"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white rounded-xl shadow hover:shadow-lg transition-all text-center"
          >
            <FaDatabase className="text-3xl text-green-500 mx-auto mb-2" />
            <p className="font-bold text-gray-900">Database Test</p>
            <p className="text-xs text-gray-500">Check DB connection</p>
          </a>

          <a
            href="http://localhost:5000/api/db-status"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-white rounded-xl shadow hover:shadow-lg transition-all text-center"
          >
            <FaChartLine className="text-3xl text-purple-500 mx-auto mb-2" />
            <p className="font-bold text-gray-900">DB Status</p>
            <p className="text-xs text-gray-500">View initialization status</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default APIStatusDashboard;
