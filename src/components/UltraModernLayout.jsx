import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './auth/AuthModal';
import ModernNavBar from './ModernNavBar';

const UltraModernLayout = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('signin');
  const location = useLocation();

  const openAuthModal = (tab = 'signin') => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden">
      
      {}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {}
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10,
          }}
        />

        {}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-white/20 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 10,
            }}
          />
        ))}

        {}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {}
      <ModernNavBar />

      {}
      <main className="relative z-10 pt-16 lg:pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {}
      <footer className="relative z-10 bg-gradient-to-t from-slate-950 via-slate-900/95 to-transparent backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                >
                  VF
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    VirtualFashion
                  </h3>
                  <p className="text-slate-400 text-sm">Future of Fashion Retail</p>
                </div>
              </div>
              
              <p className="text-slate-400 leading-relaxed mb-8 max-w-md">
                Experience the revolutionary virtual try-on technology that's transforming 
                the way we shop for fashion. Join millions of users discovering their perfect style.
              </p>
              
              {}
              <div className="flex space-x-4">
                {[
                  { name: 'Twitter', color: 'from-blue-400 to-blue-500', to: '/community' },
                  { name: 'Instagram', color: 'from-pink-500 to-purple-500', to: '/community' },
                  { name: 'Facebook', color: 'from-blue-600 to-blue-700', to: '/community' },
                  { name: 'LinkedIn', color: 'from-blue-500 to-blue-600', to: '/community' }
                ].map((social, index) => (
                  <motion.div
                    key={social.name}
                    className={`w-12 h-12 bg-gradient-to-br ${social.color} rounded-xl flex items-center justify-center text-white font-bold hover:shadow-lg transition-all duration-300 cursor-pointer`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social.name[0]}
                  </motion.div>
                ))}
              </div>
            </div>
            
            {}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">
                Explore
              </h4>
              <ul className="space-y-4">
                {[
                  { to: '/catalog', label: 'Fashion Catalog' },
                  { to: '/try-on', label: 'Virtual Try-On' },
                  { to: '/recommendations', label: 'AI Styling' },
                  { to: '/community', label: 'Style Community' }
                ].map((link) => (
                  <li key={link.to}>
                    <motion.div
                      className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group cursor-pointer"
                      whileHover={{ x: 5 }}
                    >
                      <Link to={link.to} className="flex items-center">
                        <motion.div
                          className="w-1 h-1 bg-purple-400 rounded-full mr-3 opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.5 }}
                        />
                        {link.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </div>
            
            {}
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">
                Account
              </h4>
              <ul className="space-y-4">
                {(user ? [
                  { to: '/profile', label: 'My Profile' },
                  { to: '/favorites', label: 'Favorites' },
                  { to: '/cart', label: 'Shopping Cart' },
                  { to: '/looks', label: 'My Looks' }
                ] : [
                  { action: () => openAuthModal('signin'), label: 'Sign In' },
                  { action: () => openAuthModal('signup'), label: 'Create Account' },
                  { to: '/catalog', label: 'Browse Catalog' },
                  { to: '/try-on', label: 'Try Virtual Try-On' }
                ]).map((link, index) => (
                  <li key={index}>
                    {link.to ? (
                      <motion.div
                        className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group cursor-pointer"
                        whileHover={{ x: 5 }}
                      >
                        <Link to={link.to} className="flex items-center">
                          <motion.div
                            className="w-1 h-1 bg-pink-400 rounded-full mr-3 opacity-0 group-hover:opacity-100"
                            whileHover={{ scale: 1.5 }}
                          />
                          {link.label}
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.button
                        onClick={link.action}
                        className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center group"
                        whileHover={{ x: 5 }}
                      >
                        <motion.div
                          className="w-1 h-1 bg-pink-400 rounded-full mr-3 opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.5 }}
                        />
                        {link.label}
                      </motion.button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {}
          <div className="border-t border-slate-800 mt-16 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center">
              <div className="text-slate-400 text-sm mb-4 lg:mb-0">
                Â© {new Date().getFullYear()} VirtualFashion. All rights reserved.
                <span className="text-purple-400 ml-2">Powered by AI Innovation</span>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors duration-300">
                  Terms of Service
                </a>
                <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors duration-300">
                  Support
                </a>
                <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors duration-300">
                  Contact
                </a>
              </div>
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

export default UltraModernLayout;