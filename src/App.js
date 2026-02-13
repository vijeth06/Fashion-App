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
import QuantumTryOnPage from './pages/QuantumTryOnPage';
import HighQualityTryOn from './pages/HighQualityTryOn';

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
import apiService from './services/apiService';

const apiServiceProxy = {
  testConnection: async () => {
    return apiService.testDatabase();
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
        const result = await apiServiceProxy.testConnection();
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
                  <div className="text-6xl mb-4">?</div>
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
                  <div className="text-6xl mb-4">?</div>
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
            <div className="text-6xl mb-4">??</div>
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
                  <Route path="/hq-tryon" element={<HighQualityTryOn />} />
                  <Route path="/recommendations" element={<Recommendations />} />
                  <Route path="/community" element={<CommunityFeed />} />
                  
                  <Route path="/ai/body-analysis" element={<BodyAnalysisPage />} />
                  <Route path="/ai/outfit-recommendations" element={<OutfitRecommendationsPage />} />
                  
                  <Route path="/api-status" element={<APIStatus />} />
                  
                  <Route path="/quantum-tryon" element={<QuantumTryOnPage />} />
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
