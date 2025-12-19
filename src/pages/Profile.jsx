import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useOutfit } from '../context/OutfitContext';
import { FaUser, FaEdit, FaHeart, FaShoppingBag, FaCog, FaCamera, FaUpload, FaSave, FaTimes, FaEye, FaBox, FaChartLine, FaBell } from 'react-icons/fa';

export default function Profile() {
  const { user, userProfile, updateProfile } = useAuth();
  const { outfitHistory } = useOutfit();
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    measurements: {
      height: '',
      weight: '',
      chest: '',
      waist: '',
      hips: ''
    },
    preferences: {
      style: 'casual',
      colors: [],
      brands: []
    }
  });

  const tabs = [
    { id: 'overview', label: 'OVERVIEW', icon: FaUser },
    { id: 'orders', label: 'ORDERS', icon: FaBox },
    { id: 'wishlist', label: 'WISHLIST', icon: FaHeart },
    { id: 'settings', label: 'SETTINGS', icon: FaCog }
  ];

  const handleSave = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Modern Geometric Background */}
      <div className="absolute inset-0">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        ></div>
        
        {/* Floating modern shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute ${
              i % 3 === 0 ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10' :
              i % 3 === 1 ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10' :
              'bg-gradient-to-br from-indigo-500/10 to-purple-500/10'
            } backdrop-blur-3xl rounded-3xl`}
            animate={!reduceMotion ? {
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            } : undefined}
            transition={!reduceMotion ? {
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            } : undefined}
            style={{
              width: `${100 + i * 40}px`,
              height: `${60 + i * 20}px`,
              left: `${10 + i * 15}%`,
              top: `${15 + i * 12}%`
            }}
          />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0.05 } : { duration: 0.6 }}
          className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Profile Avatar */}
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user?.displayName || 'avatar'}
                  className="w-32 h-32 rounded-full object-cover shadow-2xl"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-2xl">
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </div>
              )}

              <button className="absolute bottom-2 right-2 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors shadow-lg">
                <FaCamera className="w-4 h-4" />
              </button>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                { /* Show skeletons if user profile data hasn't arrived yet */ }
                {(!user || !user.displayName) ? (
                  <div className="space-y-2 w-full lg:w-auto">
                    <div className="h-8 w-64 bg-gray-300/30 rounded-md animate-pulse" />
                    <div className="h-6 w-40 bg-gray-300/20 rounded-md mt-2 animate-pulse" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-bold text-white">
                      {user.displayName || 'Fashion Enthusiast'}
                    </h1>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="self-center lg:self-auto w-fit px-6 py-2 bg-purple-500/20 backdrop-blur-xl border border-purple-400/30 text-purple-300 rounded-full hover:bg-purple-500/30 transition-all duration-300 flex items-center gap-2"
                    >
                      <FaEdit className="w-4 h-4" />
                      EDIT PROFILE
                    </button>
                  </>
                )}
              </div>
              
              <p className="text-purple-200 text-lg mb-4">{user?.email || <span className="inline-block h-4 w-48 bg-gray-300/20 rounded animate-pulse" />}</p>
              <p className="text-gray-300 text-base leading-relaxed max-w-2xl">
                Welcome to your personal fashion command center. Manage your style preferences, 
                track your orders, and discover new looks tailored just for you.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                    {userProfile ? (
                      <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{userProfile.stats?.outfitsTried || 12}</div>
                    ) : (
                      <div className="h-8 w-20 mx-auto bg-gray-300/30 rounded animate-pulse" />
                    )}
                    <div className="text-gray-400 text-sm">OUTFITS TRIED</div>
                </div>
                <div className="text-center">
                    {userProfile ? (
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{userProfile.stats?.totalOrders || 5}</div>
                    ) : (
                      <div className="h-8 w-16 mx-auto bg-gray-300/30 rounded animate-pulse" />
                    )}
                    <div className="text-gray-400 text-sm">ORDERS PLACED</div>
                </div>
                <div className="text-center">
                    {userProfile ? (
                      <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{userProfile.wishlist?.length || 18}</div>
                    ) : (
                      <div className="h-8 w-16 mx-auto bg-gray-300/30 rounded animate-pulse" />
                    )}
                    <div className="text-gray-400 text-sm">WISHLIST ITEMS</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0.05 } : { delay: 0.2 }}
          className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 p-2 mb-8"
        >
          <LayoutGroup>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium tracking-wide transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl"
                      layoutId="activeTab"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <tab.icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </LayoutGroup>
        </motion.div>
        
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8"
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white mb-6">Account Overview</h2>
                
                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {userProfile ? (
                        [
                          { action: 'Tried on Summer Dress', time: '2 hours ago', icon: FaEye },
                          { action: 'Added item to wishlist', time: '1 day ago', icon: FaHeart },
                          { action: 'Placed order #12345', time: '3 days ago', icon: FaShoppingBag }
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              <activity.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">{activity.action}</p>
                              <p className="text-gray-400 text-sm">{activity.time}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          {[0,1,2].map((n) => (
                            <div key={n} className="flex items-center gap-4 p-4 bg-white/3 rounded-xl border border-white/6">
                              <div className="w-10 h-10 bg-gray-300/20 rounded-full animate-pulse" />
                              <div className="flex-1">
                                <div className="h-4 w-48 bg-gray-300/20 rounded animate-pulse mb-2" />
                                <div className="h-3 w-32 bg-gray-300/20 rounded animate-pulse" />
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-4">Style Preferences</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-white font-medium mb-2">Preferred Style</p>
                        <p className="text-purple-300">Casual & Contemporary</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-white font-medium mb-2">Favorite Colors</p>
                        <div className="flex gap-2 mt-2">
                          {['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'].map((color, index) => (
                            <div key={index} className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: color }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Order History</h2>
                <div className="text-center py-12">
                  <FaBox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No orders yet</p>
                  <p className="text-gray-500">Start shopping to see your order history here</p>
                </div>
              </div>
            )}
            
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Wishlist</h2>
                <div className="text-center py-12">
                  <FaHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Your wishlist is empty</p>
                  <p className="text-gray-500">Save items you love to access them quickly</p>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block text-white font-medium">Display Name</label>
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-white/20 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-white font-medium">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-xl text-gray-300 cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <button
                      onClick={handleSave}
                      className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2"
                    >
                      <FaSave className="w-4 h-4" />
                      SAVE CHANGES
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
