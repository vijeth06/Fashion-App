import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaSearch, FaCamera, FaRobot, FaUsers, 
  FaHeart, FaShoppingCart, FaUser, FaBars, FaTimes,
  FaSignOutAlt, FaEye, FaStar, FaChevronDown
} from 'react-icons/fa';

const ModernNavBar = () => {
  const { user, signOut, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location]);

  const navigationItems = [
    { to: '/', label: 'Home', icon: FaHome },
    { to: '/catalog', label: 'Catalog', icon: FaSearch },
    { to: '/enhanced-tryon', label: 'Virtual Try-On', icon: FaCamera, badge: 'AI' },
    { to: '/recommendations', label: 'AI Style', icon: FaRobot },
    { to: '/community', label: 'Community', icon: FaUsers },
    { to: '/quantum-tryon', label: 'Quantum', icon: FaStar }
  ];

  const userMenuItems = user ? [
    { to: '/profile', label: 'Profile', icon: FaUser },
    { to: '/favorites', label: 'Favorites', icon: FaHeart },
    { to: '/wishlist', label: 'Wishlist', icon: FaStar },
    { to: '/cart', label: 'Cart', icon: FaShoppingCart },
    { to: '/looks', label: 'My Looks', icon: FaEye }
  ] : [];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl shadow-purple-500/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                VF
              </div>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-xl blur-lg opacity-0 group-hover:opacity-60"
                whileHover={{ opacity: 0.6 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <div className="hidden sm:block">
              <motion.span 
                className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                VirtualFashion
              </motion.span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 group ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </NavLink>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-800/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <motion.div 
                      className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg"
                      whileHover={{ rotate: 5 }}
                    >
                      {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </motion.div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"></div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {user.email?.substring(0, 20)}...
                      </p>
                    </div>
                  </div>
                  <FaChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                </motion.button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-700/50">
                        <p className="font-semibold text-white">{user.displayName || 'User'}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                      
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                      
                      <div className="border-t border-slate-700/50 mt-2 pt-2">
                        <button
                          onClick={() => {
                            signOut();
                            setIsProfileMenuOpen(false);
                          }}
                          disabled={loading}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 transition-all duration-200"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span className="font-medium">{loading ? 'Signing out...' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaTimes className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaBars className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-slate-800/50"
            >
              <div className="py-4 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                        }`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}

                {user ? (
                  <>
                    <div className="border-t border-slate-700/50 my-4"></div>
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      disabled={loading}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl disabled:opacity-50 transition-all duration-200"
                    >
                      <FaSignOutAlt className="w-5 h-5" />
                      <span className="font-medium">{loading ? 'Signing out...' : 'Sign Out'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="border-t border-slate-700/50 my-4"></div>
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-slate-300 hover:text-white font-medium rounded-xl hover:bg-slate-800/50 transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default ModernNavBar;