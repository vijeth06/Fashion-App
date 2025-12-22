import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './auth/AuthModal';
import { 
  FaHome, FaSearch, FaTshirt, FaCamera, FaRobot, FaUsers, 
  FaHeart, FaShoppingCart, FaUser, FaBars, FaTimes,
  FaAtom, FaCube, FaDna, FaGem, FaRocket, FaEye,
  FaMagic, FaInfinity, FaLeaf, FaGlobe
} from 'react-icons/fa';

const Layout = () => {
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
    { path: '/quantum-tryon', label: 'Quantum Try-On', icon: FaAtom, color: 'cyan' },
    { path: '/metaverse', label: 'Metaverse', icon: FaCube, color: 'purple' },
    { path: '/biometric', label: 'DNA Styling', icon: FaDna, color: 'green' },
    { path: '/premium', label: 'Premium NFTs', icon: FaGem, color: 'yellow' },
    { path: '/neural-interface', label: 'Neural UI', icon: FaRocket, color: 'pink' },
    { path: '/sustainability', label: 'Eco Fashion', icon: FaLeaf, color: 'emerald' }
  ];

  const userNavItems = user ? [
    { path: '/wishlist', label: 'Wishlist', icon: FaHeart },
    { path: '/cart', label: 'Cart', icon: FaShoppingCart },
    { path: '/profile', label: 'Profile', icon: FaUser }
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      {}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 60px 60px'
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
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/catalog" className="relative group py-2 px-4 text-gray-300 hover:text-white transition-all duration-300">
                <span className="relative z-10 font-medium tracking-wide">CATALOG</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link to="/try-on" className="relative group py-2 px-4 text-gray-300 hover:text-white transition-all duration-300">
                <span className="relative z-10 font-medium tracking-wide">TRY-ON</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link to="/community" className="relative group py-2 px-4 text-gray-300 hover:text-white transition-all duration-300">
                <span className="relative z-10 font-medium tracking-wide">COMMUNITY</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link to="/recommendations" className="relative group py-2 px-4 text-gray-300 hover:text-white transition-all duration-300">
                <span className="relative z-10 font-medium tracking-wide">AI STYLE</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
              {user ? (
                <>
                  <Link to="/wishlist" className="relative group py-2 px-4 text-gray-300 hover:text-white transition-all duration-300">
                    <span className="relative z-10 font-medium tracking-wide">WISHLIST</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                  <Link to="/cart" className="relative group py-2 px-4 text-gray-300 hover:text-white transition-all duration-300">
                    <span className="relative z-10 font-medium tracking-wide">CART</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-all duration-300 group">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-teal-400 text-black flex items-center justify-center font-bold text-sm shadow-lg">
                          {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute inset-0 w-9 h-9 bg-gradient-to-br from-emerald-400 via-cyan-400 to-teal-400 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                      </div>
                      <span className="text-white font-medium tracking-wide hidden xl:block">{user.displayName || 'PROFILE'}</span>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-black/90 backdrop-blur-2xl rounded-2xl shadow-2xl py-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-emerald-500/20">
                      <div className="px-4 py-2 border-b border-gray-700/50">
                        <p className="text-white font-medium">{user.displayName || 'User'}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-emerald-500/10 transition-all duration-200">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span className="font-medium tracking-wide">PROFILE</span>
                      </Link>
                      <Link to="/favorites" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-emerald-500/10 transition-all duration-200">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        <span className="font-medium tracking-wide">FAVORITES</span>
                      </Link>
                      <Link to="/looks" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-emerald-500/10 transition-all duration-200">
                        <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
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
                </>
              ) : (
                <>
                  <button 
                    onClick={() => openAuthModal('signin')}
                    className="text-gray-300 hover:text-white transition-all duration-300 font-medium tracking-wide px-4 py-2"
                  >
                    SIGN IN
                  </button>
                  <button 
                    onClick={() => openAuthModal('signup')}
                    className="relative group px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold tracking-wide rounded-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 overflow-hidden"
                  >
                    <span className="relative z-10">GET STARTED</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </button>
                </>
              )}
            </nav>

            {}
            <button className="lg:hidden p-2 text-gray-300 hover:text-white focus:outline-none group">
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {}
      <main className="flex-grow pt-20 relative z-10">
        <Outlet />
      </main>

      {}
      <footer className="relative z-10 bg-black/60 backdrop-blur-2xl border-t border-emerald-500/20">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-cyan-400 to-teal-400 rounded-xl rotate-45"></div>
                  <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-emerald-400 via-cyan-400 to-teal-400 rounded-xl blur-lg opacity-50"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    <span className="text-white">VIRTUAL</span>
                    <span className="text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text ml-2">FASHION</span>
                  </h3>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-md">
                Revolutionizing the fashion industry through cutting-edge virtual try-on technology. 
                Experience the future of fashion retail with AI-powered styling and immersive shopping.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="group relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <span className="text-white font-bold text-lg">f</span>
                  </div>
                  <div className="absolute inset-0 w-12 h-12 bg-blue-500 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </a>
                <a href="#" className="group relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <span className="text-white font-bold text-lg">t</span>
                  </div>
                  <div className="absolute inset-0 w-12 h-12 bg-sky-400 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </a>
                <a href="#" className="group relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <span className="text-white font-bold text-lg">i</span>
                  </div>
                  <div className="absolute inset-0 w-12 h-12 bg-pink-500 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </a>
                <a href="#" className="group relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <span className="text-white font-bold text-lg">in</span>
                  </div>
                  <div className="absolute inset-0 w-12 h-12 bg-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>
            
            {}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide relative">
                EXPLORE
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
              </h4>
              <ul className="space-y-4">
                <li><Link to="/catalog" className="text-gray-400 hover:text-emerald-400 transition-all duration-300 hover:translate-x-2 flex items-center group">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  CATALOG
                </Link></li>
                <li><Link to="/try-on" className="text-gray-400 hover:text-emerald-400 transition-all duration-300 hover:translate-x-2 flex items-center group">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  VIRTUAL TRY-ON
                </Link></li>
                <li><Link to="/wishlist" className="text-gray-400 hover:text-emerald-400 transition-all duration-300 hover:translate-x-2 flex items-center group">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  WISHLIST
                </Link></li>
                <li><Link to="/recommendations" className="text-gray-400 hover:text-emerald-400 transition-all duration-300 hover:translate-x-2 flex items-center group">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  AI RECOMMENDATIONS
                </Link></li>
              </ul>
            </div>
            
            {}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide relative">
                COMMUNITY
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-teal-400"></div>
              </h4>
              <ul className="space-y-4">
                <li><Link to="/community" className="text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:translate-x-2 flex items-center group">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  STYLE FEED
                </Link></li>
                <li><Link to="/community" className="text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:translate-x-2 flex items-center group">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  SHARE LOOKS
                </Link></li>
                <li><Link to="/community" className="text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:translate-x-2 flex items-center group">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  TRENDING
                </Link></li>
                {user ? (
                  <>
                    <li><Link to="/profile" className="text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:translate-x-2 flex items-center group">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      PROFILE
                    </Link></li>
                    <li><Link to="/looks" className="text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:translate-x-2 flex items-center group">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      MY LOOKS
                    </Link></li>
                  </>
                ) : (
                  <>
                    <li><button onClick={() => openAuthModal('signin')} className="text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:translate-x-2 flex items-center group">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      SIGN IN
                    </button></li>
                    <li><button onClick={() => openAuthModal('signup')} className="text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:translate-x-2 flex items-center group">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      JOIN NOW
                    </button></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          
          {}
          <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              Â© {new Date().getFullYear()} VIRTUAL FASHION. All rights reserved. 
              <span className="text-emerald-400 font-medium">Powered by AI Innovation.</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300">Support</a>
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

export default Layout;
