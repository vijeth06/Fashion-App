import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaHeart, 
  FaComment, 
  FaShare, 
  FaUser, 
  FaPlus,
  FaSearch,
  FaFilter,
  FaStar,
  FaFire,
  FaClock,
  FaCamera,
  FaVideo,
  FaImage,
  FaBookmark,
  FaEllipsisV,
  FaUserPlus,
  FaUserCheck
} from 'react-icons/fa';

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending'); // trending, following, recent
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Mock data for demonstration
  const mockPosts = [
    {
      id: 1,
      user: {
        id: 'user1',
        name: 'Sarah Chen',
        username: '@sarahstyle',
        avatar: '/api/placeholder/50/50',
        verified: true,
        followers: 12500
      },
      content: {
        text: 'Loving this vintage-inspired look! Perfect for autumn vibes 🍂✨',
        images: ['/api/placeholder/400/500', '/api/placeholder/400/500'],
        tags: ['#VintageVibes', '#AutumnStyle', '#OOTD'],
        location: 'New York, NY'
      },
      stats: {
        likes: 245,
        comments: 18,
        shares: 12,
        views: 1200
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: 'outfit'
    },
    {
      id: 2,
      user: {
        id: 'user2',
        name: 'Alex Rivera',
        username: '@alexfashion',
        avatar: '/api/placeholder/50/50',
        verified: false,
        followers: 3400
      },
      content: {
        text: 'Virtual try-on is a game changer! This dress fits perfectly 💃',
        images: ['/api/placeholder/400/600'],
        tags: ['#VirtualTryOn', '#TechFashion', '#FutureFashion'],
        products: [
          { id: 'prod1', name: 'Floral Summer Dress', price: 89 }
        ]
      },
      stats: {
        likes: 156,
        comments: 9,
        shares: 6,
        views: 800
      },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      type: 'try-on'
    },
    {
      id: 3,
      user: {
        id: 'user3',
        name: 'Fashion Weekly',
        username: '@fashionweekly',
        avatar: '/api/placeholder/50/50',
        verified: true,
        followers: 45000
      },
      content: {
        text: 'Top 5 fashion trends for Winter 2024! Which one is your favorite? 🔥',
        images: ['/api/placeholder/600/400'],
        tags: ['#WinterTrends', '#Fashion2024', '#TrendAlert'],
        type: 'trend-post'
      },
      stats: {
        likes: 892,
        comments: 67,
        shares: 34,
        views: 5600
      },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      type: 'trend'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleLike = (postId) => {
    const newLikedPosts = new Set(likedPosts);
    if (likedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);

    // Update post stats
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, stats: { ...post.stats, likes: post.stats.likes + (likedPosts.has(postId) ? -1 : 1) }}
        : post
    ));
  };

  const toggleSave = (postId) => {
    const newSavedPosts = new Set(savedPosts);
    if (savedPosts.has(postId)) {
      newSavedPosts.delete(postId);
    } else {
      newSavedPosts.add(postId);
    }
    setSavedPosts(newSavedPosts);
  };

  const toggleFollow = (userId) => {
    const newFollowingUsers = new Set(followingUsers);
    if (followingUsers.has(userId)) {
      newFollowingUsers.delete(userId);
    } else {
      newFollowingUsers.add(userId);
    }
    setFollowingUsers(newFollowingUsers);
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return `${minutes}m ago`;
    }
  };

  const filteredPosts = posts.filter(post => {
    if (searchQuery.trim()) {
      return post.content.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
             post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             post.content.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
                <FaUser className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community</h1>
                <p className="text-gray-600">Share your style & get inspired</p>
              </div>
            </div>

            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
            >
              <FaPlus className="w-4 h-4" />
              Share Look
            </button>
          </div>

          {/* Search and Tabs */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts, users, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'trending', label: 'Trending', icon: FaFire },
                { id: 'following', label: 'Following', icon: FaUserCheck },
                { id: 'recent', label: 'Recent', icon: FaClock }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === id 
                      ? 'bg-white text-purple-600 shadow-sm font-medium' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No posts found</h2>
            <p className="text-gray-600 mb-8">
              {searchQuery.trim() ? 'Try adjusting your search terms' : 'Be the first to share your style!'}
            </p>
            <button
              onClick={() => setShowCreatePost(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              <FaPlus className="w-4 h-4" />
              Create First Post
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Post Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.user.avatar}
                          alt={post.user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                            {post.user.verified && (
                              <div className="p-1 bg-blue-500 rounded-full">
                                <FaStar className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{post.user.username}</span>
                            <span>•</span>
                            <span>{formatTimestamp(post.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!followingUsers.has(post.user.id) && post.user.id !== currentUser.uid && (
                          <button
                            onClick={() => toggleFollow(post.user.id)}
                            className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                          >
                            <FaUserPlus className="w-3 h-3" />
                            Follow
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                          <FaEllipsisV className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-6 pb-4">
                    <p className="text-gray-900 mb-3">{post.content.text}</p>
                    
                    {/* Tags */}
                    {post.content.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.content.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-purple-200 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Location */}
                    {post.content.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                        <span>📍</span>
                        {post.content.location}
                      </div>
                    )}
                  </div>

                  {/* Images */}
                  {post.content.images && (
                    <div className={`px-6 pb-4 ${post.content.images.length > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
                      {post.content.images.map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt={`Post image ${idx + 1}`}
                          className="w-full rounded-2xl object-cover"
                          style={{ aspectRatio: post.content.images.length > 1 ? '1/1' : '4/5' }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Products */}
                  {post.content.products && (
                    <div className="px-6 pb-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Featured Products</h4>
                        <div className="space-y-2">
                          {post.content.products.map((product, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-gray-700">{product.name}</span>
                              <span className="font-semibold text-purple-600">${product.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="px-6 py-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-2 transition-colors ${
                            likedPosts.has(post.id) 
                              ? 'text-red-500' 
                              : 'text-gray-600 hover:text-red-500'
                          }`}
                        >
                          <FaHeart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                          <span className="font-medium">{post.stats.likes}</span>
                        </button>

                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                          <FaComment className="w-5 h-5" />
                          <span className="font-medium">{post.stats.comments}</span>
                        </button>

                        <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors">
                          <FaShare className="w-5 h-5" />
                          <span className="font-medium">{post.stats.shares}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => toggleSave(post.id)}
                        className={`p-2 rounded-full transition-colors ${
                          savedPosts.has(post.id)
                            ? 'text-yellow-500 bg-yellow-50'
                            : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'
                        }`}
                      >
                        <FaBookmark className={`w-4 h-4 ${savedPosts.has(post.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Post Stats */}
                    <div className="mt-3 text-sm text-gray-500">
                      {post.stats.views.toLocaleString()} views
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Load More */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-white text-gray-700 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 font-medium">
              Load More Posts
            </button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowCreatePost(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Share Your Style</h3>
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <textarea
                    placeholder="What's your style story today?"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows="4"
                  />

                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <FaCamera className="w-4 h-4" />
                      Photo
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <FaVideo className="w-4 h-4" />
                      Video
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <FaImage className="w-4 h-4" />
                      Gallery
                    </button>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setShowCreatePost(false)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityFeed;