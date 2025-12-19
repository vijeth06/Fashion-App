import React, { useState, useEffect, useCallback } from 'react';
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
  FaUserPlus,
  FaUserCheck,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaShoppingBag,
  FaTshirt,
  FaEye
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import communityService from '../services/communityService';
import productService from '../services/productService';

// Memoized UserCard to avoid re-rendering individual cards too often
const UserCard = React.memo(function UserCard({ user, index, isFollowing, onToggleFollow, onShowDetails }) {
  return (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      {/* User Header */}
      <div className="relative h-32 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              loading="lazy"
              decoding="async"
            />
            {user.verified && (
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                <FaCheckCircle className="text-white w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="pt-16 px-6 pb-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 truncate">{user.displayName}</h3>
            <p className="text-purple-600 text-sm">{user.username}</p>
          </div>
          <button
            onClick={() => onToggleFollow(user.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isFollowing
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
            }`}
          >
            {isFollowing ? (
              <>
                <FaUserCheck />
                Following
              </>
            ) : (
              <>
                <FaUserPlus />
                Follow
              </>
            )}
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{user.bio}</p>

        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <FaMapMarkerAlt className="text-purple-500" />
          {user.location}
        </div>

        {/* Stats & Actions */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{user.stats.followers}</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{user.stats.following}</div>
            <div className="text-xs text-gray-500">Following</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{user.stats.looks}</div>
            <div className="text-xs text-gray-500">Looks</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onShowDetails(user)}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all"
          >
            <FaEye />
            View Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
});

const CommunityFeed = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingSet, setFollowingSet] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all'); // all, following
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [clothingItems, setClothingItems] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  // Fetch users from database
  useEffect(() => {
    async function fetchUsers() {
      try {
        setUsersLoading(true);
        const fetchedUsers = await communityService.getAllUsers(1, 50);
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setUsersLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setProductsLoading(true);
        const data = await productService.getAllProducts({ limit: 100 });
        const formattedProducts = (data.products || []).map(product => ({
          id: product.productId || product._id,
          name: product.name?.en || product.name,
          price: product.pricing?.selling || product.price,
          imageUrl: product.images?.main || product.imageUrl
        }));
        setClothingItems(formattedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setClothingItems([]);
      } finally {
        setProductsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Load following list from localStorage
  useEffect(() => {
    const savedFollowing = JSON.parse(localStorage.getItem('userFollowing') || '[]');
    setFollowingSet(new Set(savedFollowing));
  }, []);

  // Handle search with real API
  useEffect(() => {
    async function performSearch() {
      if (searchQuery.trim()) {
        setUsersLoading(true);
        try {
          const results = await communityService.searchUsers(searchQuery);
          setFilteredUsers(results);
        } catch (error) {
          console.error('Search failed:', error);
          setFilteredUsers([]);
        } finally {
          setUsersLoading(false);
        }
      } else {
        setFilteredUsers(users);
      }
    }
    
    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, users]);

  // Filter by following
  const displayUsers = activeTab === 'following' 
    ? filteredUsers.filter(u => followingSet.has(u.id))
    : filteredUsers;

  // Handle follow/unfollow with real API
  async function toggleFollow(userId) {
    if (!currentUser?.uid) {
      alert('Please log in to follow users');
      return;
    }

    const wasFollowing = followingSet.has(userId);
    const newFollowing = new Set(followingSet);
    
    try {
      if (wasFollowing) {
        await communityService.unfollowUser(currentUser.uid, userId);
        newFollowing.delete(userId);
      } else {
        await communityService.followUser(currentUser.uid, userId);
        newFollowing.add(userId);
      }
      
      setFollowingSet(newFollowing);
      localStorage.setItem('userFollowing', JSON.stringify([...newFollowing]));

      // Update user stats in UI
      setUsers(users.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            stats: {
              ...u.stats,
              followers: (u.stats?.followers || 0) + (wasFollowing ? -1 : 1)
            }
          };
        }
        return u;
      }));
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      alert('Failed to update follow status. Please try again.');
    }
  }

  // Show user details
  function showUserDetails(user) {
    setSelectedUser(user);
    setShowUserModal(true);
  }

  

  // Get items from wishlist/favorites
  const getUserItems = (itemIds) => {
    return itemIds.map(id => clothingItems.find(item => item.id === id)).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Fashion Community
              </h1>
              <p className="text-gray-600 mt-2">Connect with fashion enthusiasts worldwide</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                <div className="text-sm text-gray-500">Members</div>
              </div>
              <div className="text-right ml-6">
                <div className="text-2xl font-bold text-purple-600">{followingSet.size}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, username, location, or interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaFire className="inline mr-2" />
                All Users
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'following'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaUserCheck className="inline mr-2" />
                Following ({followingSet.size})
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {usersLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
            <span className="ml-4 text-gray-600">Loading community...</span>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="text-center py-20">
            <FaUser className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">{searchQuery ? 'Try a different search term' : 'Be the first to join!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayUsers.map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  index={index}
                  isFollowing={followingSet.has(user.id)}
                  onToggleFollow={toggleFollow}
                  onShowDetails={showUserDetails}
                >
                {/* User Header */}
                <div className="relative h-32 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
                  <div className="absolute -bottom-12 left-6">
                    <div className="relative">
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                        loading="lazy"
                        decoding="async"
                      />
                      {user.verified && (
                        <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                          <FaCheckCircle className="text-white w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="pt-16 px-6 pb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {user.displayName}
                      </h3>
                      <p className="text-purple-600 text-sm">{user.username}</p>
                    </div>
                    <button
                      onClick={() => toggleFollow(user.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        followingSet.has(user.id)
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                      }`}
                    >
                      {followingSet.has(user.id) ? (
                        <>
                          <FaUserCheck />
                          Following
                        </>
                      ) : (
                        <>
                          <FaUserPlus />
                          Follow
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{user.bio}</p>

                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <FaMapMarkerAlt className="text-purple-500" />
                    {user.location}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{user.stats.followers}</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{user.stats.following}</div>
                      <div className="text-xs text-gray-500">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{user.stats.looks}</div>
                      <div className="text-xs text-gray-500">Looks</div>
                    </div>
                  </div>

                  {/* Style Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.style.slice(0, 3).map((style, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        {style}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => showUserDetails(user)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all"
                    >
                      <FaEye />
                      View Profile
                    </button>
                  </div>
                </div>
              </UserCard>
            ))}
            </AnimatePresence>
          </div>
        )}

        {/* User Detail Modal */}
        <AnimatePresence>
          {showUserModal && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowUserModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedUser.photoURL}
                      alt={selectedUser.displayName}
                      className="w-16 h-16 rounded-full"
                      loading="lazy"
                      decoding="async"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {selectedUser.displayName}
                        {selectedUser.verified && <FaCheckCircle className="text-blue-500" />}
                      </h2>
                      <p className="text-purple-600">{selectedUser.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <p className="text-gray-700 mb-6">{selectedUser.bio}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">{selectedUser.stats.followers}</div>
                      <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-xl">
                      <div className="text-2xl font-bold text-pink-600">{selectedUser.stats.following}</div>
                      <div className="text-sm text-gray-600">Following</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{selectedUser.stats.posts}</div>
                      <div className="text-sm text-gray-600">Posts</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{selectedUser.stats.looks}</div>
                      <div className="text-sm text-gray-600">Looks</div>
                    </div>
                  </div>

                  {/* Wishlist */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      Wishlist ({selectedUser.wishlist.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {getUserItems(selectedUser.wishlist).map((item, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-3">
                          <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-purple-600">${item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Favorites */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FaHeart className="text-red-500" />
                      Favorites ({selectedUser.favorites.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {getUserItems(selectedUser.favorites).map((item, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-3">
                          <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-purple-600">${item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Follow Button */}
                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={() => toggleFollow(selectedUser.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
                        followingSet.has(selectedUser.id)
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl'
                      }`}
                    >
                      {followingSet.has(selectedUser.id) ? (
                        <>
                          <FaUserCheck />
                          Following
                        </>
                      ) : (
                        <>
                          <FaUserPlus />
                          Follow
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityFeed;
