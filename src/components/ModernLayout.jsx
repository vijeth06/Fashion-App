import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './auth/AuthModal';
import { 
  FaHome, FaSearch, FaTshirt, FaCamera, FaRobot, FaUsers, 
  FaHeart, FaShoppingCart, FaUser, FaBars, FaTimes,
  FaAtom, FaCube, FaDna, FaGem, FaRocket, FaEye,
  FaMagic, FaInfinity, FaLeaf, FaGlobe, FaStar
} from 'react-icons/fa';

const ModernLayout = () => {
  const { user, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('signin');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const location = useLocation();

  const openAuthModal = (tab = 'signin') => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const mainNavItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/catalog', label: 'Catalog', icon: FaSearch },
    { path: '/try-on', label: 'Try-On', icon: FaCamera },
    { path: '/recommendations', label: 'AI Style', icon: FaRobot },
    { path: '/community', label: 'Community', icon: FaUsers }
  ];

  const advancedNavItems = [
    { path: '/quantum-tryon', label: 'Quantum Try-On', icon: FaAtom, color: 'blue', desc: 'Advanced quantum fabric simulation' },
    { path: '/metaverse', label: 'Metaverse Hub', icon: FaCube, color: 'purple', desc: 'AR/VR fashion experiences' },
    { path: '/biometric', label: 'DNA Styling', icon: FaDna, color: 'green', desc: 'Genetic style analysis' },
    { path: '/premium', label: 'Premium NFTs', icon: FaGem, color: 'yellow', desc: 'Blockchain fashion assets' },
    { path: '/neural-interface', label: 'Neural AI', icon: FaRocket, color: 'pink', desc: 'Adaptive learning interface' },
    { path: '/sustainability', label: 'Eco Fashion', icon: FaLeaf, color: 'emerald', desc: 'Sustainable fashion tracking' }
  ];

  const userNavItems = user ? [
    { path: '/wishlist', label: 'Wishlist', icon: FaHeart },
    { path: '/cart', label: 'Cart', icon: FaShoppingCart },
    { path: '/favorites', label: 'Favorites', icon: FaStar },
    { path: '/profile', label: 'Profile', icon: FaUser }
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      {}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px),
            radial-gradient(circle at 25% 25%, rgba(14, 165, 233, 0.1) 2px, transparent 2px)
          `,
          backgroundSize: '60px 60px, 60px 60px, 40px 40px'
        }}></div>
      </div>
      
      {}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -40, 0],
            y: [0, -50, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/90 backdrop-blur-3xl border-b border-blue-500/30 shadow-2xl shadow-blue-500/10' 
          : 'bg-black/20 backdrop-blur-xl border-b border-white/10'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {}
            <Link to="/" className="group flex items-center space-x-3">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 rounded-2xl"
                  animate={{ 
                    rotate: [0, 360],
                    borderRadius: ['1rem', '2rem', '1rem']
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="absolute inset-2 bg-black/20 rounded-xl flex items-center justify-center">
                  <FaAtom className="text-white text-lg" />
                </div>
              </motion.div>
              <div>
                <motion.h1 
                  className="text-3xl font-black tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="text-white">QUANTUM</span>
                  <span className="text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-400 bg-clip-text ml-2">FASHION</span>
                </motion.h1>
                <motion.div 
                  className="h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </Link>

            {}
            <nav className="hidden lg:flex items-center space-x-6">
              {}
              <div className="flex items-center space-x-4">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative group px-4 py-2 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30' 
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`text-sm ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`} />
                        <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                      </div>
                      {isActive && (
                        <motion.div 
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                          layoutId="activeTab"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              {}
              <div className="relative">
                <motion.button
                  onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaMagic className="text-sm" />
                  <span className="font-semibold text-sm">QUANTUM FEATURES</span>
                  <motion.div
                    animate={{ rotate: showAdvancedFeatures ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaRocket className="text-xs" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {showAdvancedFeatures && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full mt-3 right-0 w-80 bg-black/95 backdrop-blur-2xl rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden"
                    >
                      <div className="p-2">
                        {advancedNavItems.map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <motion.div
                              key={item.path}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Link
                                to={item.path}
                                className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-600/10 group"
                                onClick={() => setShowAdvancedFeatures(false)}
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                  <Icon className="text-white text-sm" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-white font-semibold text-sm">{item.label}</div>
                                  <div className="text-gray-400 text-xs">{item.desc}</div>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {}
              {user && (
                <div className="flex items-center space-x-2">
                  {userNavItems.slice(0, 3).map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="relative group p-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        <Icon className="text-lg group-hover:text-blue-400 transition-colors duration-300" />
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {}
              {user ? (
                <div className="relative group">
                  <motion.button 
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      <motion.div 
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </motion.div>
                      <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                    </div>
                    <span className="text-white font-medium tracking-wide hidden xl:block">{user.displayName || 'USER'}</span>
                  </motion.button>
                  
                  <div className="absolute right-0 top-full mt-2 w-64 bg-black/95 backdrop-blur-2xl rounded-2xl shadow-2xl py-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-blue-500/20">
                    <div className="px-4 py-2 border-b border-gray-700/50">
                      <p className="text-white font-medium">{user.displayName || 'User'}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-blue-500/10 transition-all duration-200">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="font-medium tracking-wide">PROFILE</span>
                    </Link>
                    <Link to="/favorites" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="font-medium tracking-wide">FAVORITES</span>
                    </Link>
                    <Link to="/looks" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-indigo-500/10 transition-all duration-200">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      <span className="font-medium tracking-wide">MY LOOKS</span>
                    </Link>
                    <div className="h-px bg-gray-700/50 my-2"></div>
                    <button
                      onClick={signOut}
                      disabled={loading}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 transition-all duration-200"
                    >
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="font-medium tracking-wide">{loading ? 'SIGNING OUT...' : 'SIGN OUT'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => openAuthModal('signin')}
                    className="text-gray-300 hover:text-white transition-all duration-300 font-medium tracking-wide px-4 py-2"
                  >
                    SIGN IN
                  </button>
                  <motion.button 
                    onClick={() => openAuthModal('signup')}
                    className="relative group px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold tracking-wide rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">GET STARTED</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </motion.button>
                </div>
              )}
            </nav>

            {}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
        
        {}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-black/95 backdrop-blur-2xl border-t border-gray-700/50"
            >
              <div className="container mx-auto px-6 py-4 space-y-2">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                <div className="border-t border-gray-700/50 pt-4 mt-4">
                  <div className="text-gray-400 text-sm font-semibold mb-2">QUANTUM FEATURES</div>
                  {advancedNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
                
                {user && (
                  <div className="border-t border-gray-700/50 pt-4 mt-4">
                    {userNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {}
      <main className="flex-grow pt-20 relative z-10">
        <Outlet />
      </main>

      {}
      <footer className="relative z-10 bg-black/80 backdrop-blur-2xl border-t border-blue-500/20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <FaAtom className="text-white text-lg" />
                </div>
                <h3 className="text-2xl font-bold">
                  <span className="text-white">QUANTUM</span>
                  <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text ml-2">FASHION</span>
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Experience the future of fashion with our revolutionary AI-powered platform featuring quantum try-on technology, DNA-based styling, and metaverse integration.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">FEATURES</h4>
              <ul className="space-y-2">
                <li><Link to="/try-on" className="text-gray-400 hover:text-blue-400 transition-colors">Virtual Try-On</Link></li>
                <li><Link to="/recommendations" className="text-gray-400 hover:text-blue-400 transition-colors">AI Styling</Link></li>
                <li><Link to="/metaverse" className="text-gray-400 hover:text-blue-400 transition-colors">Metaverse</Link></li>
                <li><Link to="/premium" className="text-gray-400 hover:text-blue-400 transition-colors">NFT Collection</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">COMPANY</h4>
              <ul className="space-y-2">
                <li><Link to="/community" className="text-gray-400 hover:text-purple-400 transition-colors">Community</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              Â© {new Date().getFullYear()} QUANTUM FASHION. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
      
      {}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab={authTab}
      />
    </div>
  );
};

export default ModernLayout;