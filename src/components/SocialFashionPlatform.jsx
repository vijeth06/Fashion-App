


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeart, FaComment, FaShare, FaUser, FaCamera, FaPlus, FaFire,
  FaStar, FaShoppingBag, FaEye, FaUserFriends, FaCrown, FaGift,
  FaThumbsUp, FaBookmark, FaVideo, FaImage, FaMagic, FaFilter,
  FaSearch, FaTags, FaUsers, FaChartLine, FaDollarSign, FaTimes,
  FaHome, FaCompass
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';

const mockInfluencers = [
  {
    id: 1,
    name: 'Sophie Chen',
    username: '@sophie_style',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b890?w=150',
    followers: 125000,
    verified: true,
    specialty: 'Sustainable Fashion'
  },
  {
    id: 2,
    name: 'Marcus Rivera',
    username: '@marcus_fashion',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    followers: 89000,
    verified: true,
    specialty: 'Street Style'
  }
];

const mockPosts = [
  {
    id: 1,
    user: mockInfluencers[0],
    content: 'Loving this sustainable wool blend sweater! Perfect for fall weather ðŸ‚',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
    items: [], // Will be populated with real products
    likes: 2843,
    comments: 156,
    shares: 89,
    timestamp: '2 hours ago',
    tags: ['sustainable', 'fall', 'cozy']
  },
  {
    id: 2,
    user: mockInfluencers[1],
    content: 'Street style transformation using just 3 pieces! ðŸ”¥',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    items: [], // Will be populated with real products
    likes: 5621,
    comments: 298,
    shares: 187,
    timestamp: '5 hours ago',
    tags: ['streetstyle', 'transformation']
  }
];

function SocialPost({ post, onLike, onComment, onShare }) {
  const [liked, setLiked] = useState(false);
  const [showShoppable, setShowShoppable] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
    >
      {}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
            <img 
            src={post.user.avatar} 
            alt={post.user.name}
              className="w-12 h-12 rounded-full object-cover"
              loading="lazy"
              decoding="async"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{post.user.name}</h3>
              {post.user.verified && <FaCrown className="w-4 h-4 text-yellow-500" />}
            </div>
            <p className="text-sm text-gray-600">{post.user.username} • {post.timestamp}</p>
          </div>
        </div>
        <p className="mt-4 text-gray-900">{post.content}</p>
        
        {}
        <div className="flex flex-wrap gap-2 mt-3">
          {post.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {}
      <div className="relative">
        <img src={post.image} alt="Post content" className="w-full h-96 object-cover" loading="lazy" decoding="async" />
        <button
          onClick={() => setShowShoppable(!showShoppable)}
          className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-full flex items-center gap-2"
        >
          <FaTags className="w-4 h-4" />
          <span className="text-sm">Shop</span>
        </button>
      </div>

      {}
      <AnimatePresence>
        {showShoppable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 p-4"
          >
            <h4 className="font-medium text-gray-900 mb-3">Shop this look:</h4>
            <div className="grid grid-cols-2 gap-4">
              {post.items.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-24 object-cover rounded mb-2" />
                  <h5 className="font-medium text-sm">{item.name}</h5>
                  <p className="text-purple-600 font-bold">${item.price}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="p-6 pt-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-gray-600'}`}
          >
            <FaHeart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            <span className="font-medium">{post.likes + (liked ? 1 : 0)}</span>
          </button>
          
          <button className="flex items-center gap-2 text-gray-600">
            <FaComment className="w-5 h-5" />
            <span className="font-medium">{post.comments}</span>
          </button>
          
          <button className="flex items-center gap-2 text-gray-600">
            <FaShare className="w-5 h-5" />
            <span className="font-medium">{post.shares}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function InfluencerCard({ influencer, onFollow }) {
  const [following, setFollowing] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="relative h-32 bg-gradient-to-r from-purple-400 to-pink-400">
          <img 
          src={influencer.avatar} 
          alt={influencer.name}
           className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-20 h-20 rounded-full border-4 border-white object-cover"
           loading="lazy"
           decoding="async"
        />
      </div>
      
      <div className="pt-12 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900">{influencer.name}</h3>
          {influencer.verified && <FaCrown className="w-4 h-4 text-yellow-500" />}
        </div>
        
        <p className="text-gray-600 text-sm mb-1">{influencer.username}</p>
        <p className="text-purple-600 text-sm font-medium mb-3">{influencer.specialty}</p>
        
        <div className="text-center mb-4">
          <div className="font-bold text-gray-900">{(influencer.followers / 1000).toFixed(0)}K</div>
          <div className="text-xs text-gray-600">Followers</div>
        </div>
        
        <button
          onClick={() => setFollowing(!following)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            following 
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {following ? 'Following' : 'Follow'}
        </button>
      </div>
    </motion.div>
  );
}

function CreateLookModal({ isVisible, onClose, onCreateLook, clothingItems }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [lookTitle, setLookTitle] = useState('');
  const [lookDescription, setLookDescription] = useState('');

  const handleCreateLook = () => {
    if (lookTitle && selectedItems.length > 0) {
      onCreateLook({
        title: lookTitle,
        description: lookDescription,
        items: selectedItems
      });
      setLookTitle('');
      setLookDescription('');
      setSelectedItems([]);
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Look</h2>
            <button onClick={onClose} className="p-2 text-gray-500">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            <input
              type="text"
              value={lookTitle}
              onChange={(e) => setLookTitle(e.target.value)}
              placeholder="Look title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            
            <textarea
              value={lookDescription}
              onChange={(e) => setLookDescription(e.target.value)}
              placeholder="Describe your look..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Items ({selectedItems.length}/6)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {clothingItems.slice(0, 8).map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (selectedItems.find(i => i.id === item.id)) {
                        setSelectedItems(selectedItems.filter(i => i.id !== item.id));
                      } else if (selectedItems.length < 6) {
                        setSelectedItems([...selectedItems, item]);
                      }
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedItems.find(i => i.id === item.id)
                        ? 'border-purple-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    {selectedItems.find(i => i.id === item.id) && (
                      <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">✓</div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleCreateLook}
            disabled={!lookTitle || selectedItems.length === 0}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Create Look
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SocialFashionPlatform() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState(mockPosts);
  const [influencers, setInfluencers] = useState(mockInfluencers);
  const [showCreateLook, setShowCreateLook] = useState(false);
  const [clothingItems, setClothingItems] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setProductsLoading(true);
        const data = await productService.getAllProducts({ limit: 100 });
        const formattedProducts = (data.products || []).map(product => ({
          id: product.productId || product._id,
          name: product.name?.en || product.name,
          price: product.pricing?.selling || product.price,
          imageUrl: product.images?.main || product.imageUrl,
          category: product.category
        }));
        setClothingItems(formattedProducts);

        if (formattedProducts.length > 0) {
          const updatedPosts = mockPosts.map((post, index) => ({
            ...post,
            items: formattedProducts.slice(index * 2, index * 2 + 2)
          }));
          setPosts(updatedPosts);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setClothingItems([]);
      } finally {
        setProductsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleCreateLook = (lookData) => {
    console.log('Create look:', lookData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Social Fashion Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with fashion lovers, share your style, and discover trends
          </p>
        </div>

        {}
        <div className="flex justify-center gap-4 mb-8">
          {[
            { id: 'feed', name: 'Feed', icon: FaUsers },
            { id: 'influencers', name: 'Influencers', icon: FaCrown },
            { id: 'create', name: 'Create', icon: FaPlus }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {}
        {activeTab === 'feed' && (
          <div className="max-w-2xl mx-auto">
            {posts.map(post => (
              <SocialPost key={post.id} post={post} />
            ))}
          </div>
        )}

        {activeTab === 'influencers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {influencers.map(influencer => (
              <InfluencerCard key={influencer.id} influencer={influencer} />
            ))}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto text-center">
            <button
              onClick={() => setShowCreateLook(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              <FaPlus className="w-6 h-6" />
              Create New Look
            </button>
          </div>
        )}

        {}
        {showCreateLook && (
          <CreateLookModal
            isVisible={showCreateLook}
            onClose={() => setShowCreateLook(false)}
            onCreateLook={handleCreateLook}
            clothingItems={clothingItems}
          />
        )}
      </div>
    </div>
  );
}