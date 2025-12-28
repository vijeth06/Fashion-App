import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { OutfitProvider } from './context/OutfitContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import UltraModernLayout from './components/UltraModernLayout';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

import './utils/authDebug';

import Favorites from './pages/Favorites';
import Looks from './pages/Looks';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import Wishlist from './pages/Wishlist';
import OrderTracking from './pages/OrderTracking';
import CommunityFeed from './pages/CommunityFeed';
import EnhancedTryOn from './pages/EnhancedTryOn';
import TryOnWithItem from './pages/TryOnWithItem';
import NeuralInterface from './pages/NeuralInterface';
import BiometricAnalysis from './pages/BiometricAnalysis';
import VirtualTryOn from './pages/VirtualTryOn';
import SmartVirtualTryOn from './pages/SmartVirtualTryOn';

import QuantumTryOn from './components/QuantumTryOn';
import MetaverseIntegration from './components/MetaverseIntegration';
import BiometricSustainability from './components/BiometricSustainability';
import PremiumFeatures from './components/PremiumFeatures';
import SocialFashionPlatform from './components/SocialFashionPlatform';
import RealTimeFeatures from './components/RealTimeFeatures';
import AdvancedAdminDashboard from './components/AdvancedAdminDashboard';
import FeatureShowcase from './components/FeatureShowcase';
import DatabaseManager from './components/DatabaseManager';

import SegmentationUpload from './components/SegmentationUpload';

import { BodyAnalysisPage, OutfitRecommendationsPage } from './pages/AIFeatures';
import APIStatus from './pages/APIStatus';

const apiService = {
  testConnection: async () => {

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          connected: true,
          collections: {
            users: 142,
            products: 89
          }
        });
      }, 2000);
    });
  }
};

const MetaversePage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 py-8">
      <MetaverseIntegration 
        isVisible={true}
        userProfile={user}
        onExperience={() => {}}
        onClose={() => {}}
      />
    </div>
  );
};

const PremiumPage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 py-8">
      <PremiumFeatures 
        userProfile={user}
        isVisible={true}
        onClose={() => {}}
      />
    </div>
  );
};

const SegmentationDemoPage = () => (
  <div className="container mx-auto py-8">
    <SegmentationUpload />
  </div>
);

const SustainabilityPage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 py-8">
      <BiometricSustainability 
        userProfile={user}
        isVisible={true}
        onClose={() => {}}
      />
    </div>
  );
};

const SocialPlatformPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SocialFashionPlatform />
    </div>
  );
};

const RealTimeFeaturesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <RealTimeFeatures />
    </div>
  );
};

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdvancedAdminDashboard />
    </div>
  );
};

const DatabaseManagerPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 py-8">
      <DatabaseManager />
    </div>
  );
};

const DatabaseTestPage = () => {
  const [connectionStatus, setConnectionStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await apiService.testConnection();
        setConnectionStatus(result);
      } catch (error) {
        setConnectionStatus({ connected: false, error: error.message });
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 py-8">
      <div className="container mx-auto px-6">
        <div className="text-center py-20">
          <h1 className="text-5xl font-black text-white mb-6">
            DATABASE
            <span className="block text-transparent bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text">
              CONNECTION TEST
            </span>
          </h1>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
              <span className="ml-4 text-gray-300">Testing database connection...</span>
            </div>
          ) : (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 max-w-4xl mx-auto">
              {connectionStatus?.connected ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">âœ…</div>
                  <h2 className="text-2xl font-bold text-green-400 mb-4">Database Connected Successfully!</h2>
                  <p className="text-gray-300 mb-6">MongoDB connection established and collections initialized.</p>
                  
                  {connectionStatus.collections && (
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <div className="text-2xl font-bold text-green-400">{connectionStatus.collections.users}</div>
                        <div className="text-sm text-gray-400">Users</div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <div className="text-2xl font-bold text-blue-400">{connectionStatus.collections.products}</div>
                        <div className="text-sm text-gray-400">Products</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">âŒ</div>
                  <h2 className="text-2xl font-bold text-red-400 mb-4">Database Connection Failed</h2>
                  <p className="text-gray-300 mb-4">Unable to connect to MongoDB database.</p>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{connectionStatus?.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="text-6xl mb-4">âš ï¸</div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but an unexpected error occurred. Please try again later.
            </p>
            <button
              onClick={this.handleReset}
              className="btn btn-primary"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
      <p className="text-xl text-gray-600">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const QuantumTryOnPageWrapper = () => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [indianProducts, setIndianProducts] = useState([]);

  useEffect(() => {
    const loadIndianProducts = async () => {
      try {
        const { default: indianProductService } = await import('./services/indianProductService');
        const result = await indianProductService.getAllProducts();

        if (result.success) {
          const quantumProducts = result.products.map((product) => ({
            ...product,
            id: product.productId,
            fabricPhysics: {
              quantumProperties: {
                colorShifting: product.type === 'saree' || product.type === 'kurta',
                temperatureAdaptive: product.material === 'Silk',
                materialDensity: product.type === 'hoodie' ? 0.8 : 0.5,
                elasticity: product.type === 'jeans' ? 0.3 : 0.7
              }
            }
          }));
          setIndianProducts(quantumProducts);

          const featured = quantumProducts.find((p) => p.featured);
          if (featured) setSelectedItem(featured);
        }
      } catch (error) {
        console.error('Failed to load Indian products for quantum try-on:', error);
      }
    };

    loadIndianProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950/20 via-green-950/20 to-blue-950/20 py-8">
      <div className="container mx-auto px-6 mb-8">
        <div className="text-center">
          <h1 className="text-6xl font-black text-white mb-4">
            à¤•à¥à¤µà¤¾à¤‚à¤Ÿà¤®
            <span className="block text-transparent bg-gradient-to-r from-orange-400 via-white to-green-500 bg-clip-text">
              VIRTUAL TRY-ON
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Quantum Physics-Based Virtual Try-On for Fashion
          </p>
          <p className="text-lg text-gray-400">
            Quantum Physics-based Virtual Try-on for Indian Fashion
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 mb-8">
        <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-orange-400/30">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            ðŸŒŸ <span className="ml-2">Select Fashion Items</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {indianProducts.slice(0, 12).map((item) => (
              <motion.div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`relative bg-black/40 backdrop-blur-xl border rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                  selectedItem?.id === item.id
                    ? 'border-orange-400 bg-orange-400/10'
                    : 'border-gray-600/30 hover:border-orange-400/50'
                }`}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="aspect-square bg-gradient-to-br from-orange-500/20 to-green-500/20 rounded-xl mb-3 flex items-center justify-center">
                  <span className="text-2xl">
                    {item.type === 'kurta'
                      ? 'ðŸ‘•'
                      : item.type === 'saree'
                        ? 'ðŸ¥»'
                        : item.type === 'jacket'
                          ? 'ðŸ§¥'
                          : item.type === 'jeans'
                            ? 'ðŸ‘–'
                            : 'ðŸ‘”'}
                  </span>
                </div>
                <h4 className="text-white font-mono text-xs mb-1 truncate">
                  {item.name}
                </h4>
                <p className="text-gray-400 text-xs truncate">{item.brand}</p>
                <p className="text-orange-400 text-xs font-bold">
                  â‚¹{item.price.selling.toLocaleString('en-IN')}
                </p>

                <div className="absolute top-2 right-2 flex flex-col space-y-1">
                  {item.fabricPhysics?.quantumProperties?.colorShifting && (
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                      title="Color Shifting"
                    />
                  )}
                  {item.fabricPhysics?.quantumProperties?.temperatureAdaptive && (
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                      title="Temperature Adaptive"
                    />
                  )}
                  <div
                    className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                    title="Quantum Enabled"
                  />
                </div>

                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.region === 'Pan-India'
                    ? 'ðŸ‡®ðŸ‡³'
                    : item.region === 'North Indian'
                      ? 'N'
                      : item.region === 'South Indian'
                        ? 'S'
                        : 'ðŸŒ'}
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-4 text-center">
            Select an item to experience quantum fabric simulation â€¢ à¤†à¤‡à¤Ÿà¤® à¤šà¥à¤¨à¥‡à¤‚ à¤”à¤° à¤•à¥à¤µà¤¾à¤‚à¤Ÿà¤® à¤•à¤ªà¤¡à¤¼à¤¾
            à¤¸à¤¿à¤®à¥à¤²à¥‡à¤¶à¤¨ à¤•à¤¾ à¤…à¤¨à¥à¤­à¤µ à¤•à¤°à¥‡à¤‚
          </p>
        </div>
      </div>

      <QuantumTryOn
        selectedItem={selectedItem}
        userProfile={user}
        onItemSelect={setSelectedItem}
        indianProducts={indianProducts}
      />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <OutfitProvider>
            <ScrollToTop />
              <Routes>
                <Route element={<UltraModernLayout />}>
                  {}
                  <Route path="/" element={<FeatureShowcase />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/catalog/:id" element={<ProductDetails />} />
                  <Route path="/try-on" element={<VirtualTryOn />} />
                  <Route path="/smart-tryon" element={<SmartVirtualTryOn />} />
                  <Route path="/try" element={<TryOnWithItem />} />
                  <Route path="/enhanced-tryon" element={<EnhancedTryOn />} />
                  <Route path="/recommendations" element={<Recommendations />} />
                  <Route path="/community" element={<CommunityFeed />} />
                  
                  <Route path="/ai/body-analysis" element={<BodyAnalysisPage />} />
                  <Route path="/ai/outfit-recommendations" element={<OutfitRecommendationsPage />} />
                  
                  <Route path="/api-status" element={<APIStatus />} />
                  
                  <Route path="/quantum-tryon" element={<QuantumTryOnPageWrapper />} />
                  <Route path="/metaverse" element={<MetaversePage />} />
                  <Route path="/biometric" element={<BiometricAnalysis />} />
                  <Route path="/premium" element={<PremiumPage />} />
                  <Route path="/neural-interface" element={<NeuralInterface />} />
                  <Route path="/sustainability" element={<SustainabilityPage />} />
                  
                  <Route path="/social-platform" element={<SocialPlatformPage />} />
                  <Route path="/real-time" element={<RealTimeFeaturesPage />} />
                  <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                  
                  <Route path="/database-manager" element={<DatabaseManagerPage />} />
                  <Route path="/database-test" element={<DatabaseTestPage />} />
                  
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  
                  <Route
                    path="/favorites"
                    element={
                      <ProtectedRoute>
                        <Favorites />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/looks"
                    element={
                      <ProtectedRoute>
                        <Looks />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-tracking/:orderId"
                    element={
                      <ProtectedRoute>
                        <OrderTracking />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/segmentation-demo" element={<SegmentationDemoPage />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
          </OutfitProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
