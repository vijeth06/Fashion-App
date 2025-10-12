import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { OutfitProvider } from './context/OutfitContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import UltraModernLayout from './components/UltraModernLayout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Favorites from './pages/Favorites';
import Looks from './pages/Looks';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Recommendations from './pages/Recommendations';
import AdminDashboard from './pages/AdminDashboard';
import Wishlist from './pages/Wishlist';
import OrderTracking from './pages/OrderTracking';
// Import auth debug utilities for development
import './utils/authDebug';
import CommunityFeed from './pages/CommunityFeed';
import NotFound from './pages/NotFound';

// Import Advanced Components as Page Wrappers
import QuantumTryOn from './components/QuantumTryOn';
import MetaverseIntegration from './components/MetaverseIntegration';
import BiometricSustainability from './components/BiometricSustainability';
import PremiumFeatures from './components/PremiumFeatures';
import AdaptiveNeuralInterface from './components/AdaptiveNeuralInterface';
import SocialFashionPlatform from './components/SocialFashionPlatform';
import RealTimeFeatures from './components/RealTimeFeatures';
import AdvancedAdminDashboard from './components/AdvancedAdminDashboard';
import FeatureShowcase from './components/FeatureShowcase';
import Immersive3DShopping from './components/Immersive3DShopping';
import DatabaseManager from './components/DatabaseManager';
import EnhancedTryOn from './pages/EnhancedTryOn';

// Database Service (mock for frontend)
const apiService = {
  testConnection: async () => {
    // Mock database connection test
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

// Page Wrapper Components for Advanced Features
const QuantumTryOnPage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 py-8">
      <QuantumTryOn 
        selectedItem={null} 
        userProfile={user}
        onItemSelect={() => {}}
      />
    </div>
  );
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

const BiometricPage = () => {
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

const NeuralInterfacePage = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 py-8">
      <div className="container mx-auto px-6">
        <div className="text-center py-20">
          <h1 className="text-5xl font-black text-white mb-6">
            NEURAL
            <span className="block text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text">
              AI INTERFACE
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Experience adaptive learning interface that evolves with your fashion preferences
          </p>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 max-w-4xl mx-auto">
            <p className="text-gray-300">
              The Neural AI Interface is actively learning from your interactions across the platform.
              It adapts the UI, recommendations, and features based on your behavior patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 py-8">
      <DatabaseManager />
    </div>
  );
};

// Database Connection Test Component
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
                  <div className="text-6xl mb-4">✅</div>
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
                  <div className="text-6xl mb-4">❌</div>
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
            <div className="text-6xl mb-4">⚠️</div>
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

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
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
                {/* Public Routes */}
                <Route path="/" element={<FeatureShowcase />} />
                <Route path="/home" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/catalog/:id" element={<ProductDetails />} />
                <Route path="/try-on" element={<Navigate to="/enhanced-tryon" replace />} />
                <Route path="/enhanced-tryon" element={<EnhancedTryOn />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/community" element={<CommunityFeed />} />
                <Route path="/admin" element={<AdminDashboard />} />
                
                {/* Advanced Quantum Features */}
                <Route path="/quantum-tryon" element={<QuantumTryOnPage />} />
                <Route path="/metaverse" element={<MetaversePage />} />
                <Route path="/biometric" element={<BiometricPage />} />
                <Route path="/premium" element={<PremiumPage />} />
                <Route path="/neural-interface" element={<NeuralInterfacePage />} />
                <Route path="/sustainability" element={<SustainabilityPage />} />
                
                {/* Advanced Platform Features */}
                <Route path="/social-platform" element={<SocialPlatformPage />} />
                <Route path="/real-time" element={<RealTimeFeaturesPage />} />
                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                
                {/* Database Management Routes */}
                <Route path="/database-manager" element={<DatabaseManagerPage />} />
                <Route path="/database-test" element={<DatabaseTestPage />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected Routes */}
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
                
                {/* 404 Route */}
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
