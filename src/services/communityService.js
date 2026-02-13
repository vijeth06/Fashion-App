

import apiService from './apiService';

class CommunityService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  
  async getAllUsers(page = 1, limit = 20) {
    try {
      const cacheKey = `users_${page}_${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await apiService.get(`/api/v1/users?page=${page}&limit=${limit}`);
      
      if (response.success && response.users) {
        this.setCache(cacheKey, response.users);
        return response.users;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }

  
  async searchUsers(query, filters = {}) {
    if (!query || query.trim().length === 0) {
      return this.getAllUsers();
    }

    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });
      
      const response = await apiService.get(`/api/v1/users/search?${params}`);
      
      if (response.success && response.users) {
        return response.users;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  
  async getUserProfile(userId) {
    try {
      const cacheKey = `user_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await apiService.get(`/api/v1/users/${userId}`);
      
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }

  
  async followUser(userId, targetUserId) {
    try {
      const response = await apiService.post('/api/v1/users/follow', {
        userId,
        targetUserId
      });

      this.invalidateUserCache(userId);
      this.invalidateUserCache(targetUserId);
      
      return response.success;
    } catch (error) {
      console.error('Failed to follow user:', error);
      return false;
    }
  }

  
  async unfollowUser(userId, targetUserId) {
    try {
      const response = await apiService.post('/api/v1/users/unfollow', {
        userId,
        targetUserId
      });

      this.invalidateUserCache(userId);
      this.invalidateUserCache(targetUserId);
      
      return response.success;
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      return false;
    }
  }

  
  async getUserFollowers(userId) {
    try {
      const response = await apiService.get(`/api/v1/users/${userId}/followers`);
      
      if (response.success && response.followers) {
        return response.followers;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch followers:', error);
      return [];
    }
  }

  
  async getUserFollowing(userId) {
    try {
      const response = await apiService.get(`/api/v1/users/${userId}/following`);
      
      if (response.success && response.following) {
        return response.following;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch following:', error);
      return [];
    }
  }

  
  async getUserWishlist(userId) {
    try {
      const response = await apiService.get(`/api/wishlist/${userId}`);
      
      if (response.success && response.wishlist) {
        return response.wishlist.items || [];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      return [];
    }
  }

  
  async getUserLooks(userId) {
    try {
      const response = await apiService.get(`/api/looks/user/${userId}`);
      
      if (response.success && response.looks) {
        return response.looks;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch looks:', error);
      return [];
    }
  }

  
  async getTrendingUsers(limit = 10) {
    try {
      const cacheKey = `trending_users_${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await apiService.get(`/api/v1/users/trending?limit=${limit}`);
      
      if (response.success && response.users) {
        this.setCache(cacheKey, response.users);
        return response.users;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch trending users:', error);
      return [];
    }
  }

  
  async updateUserProfile(userId, updates) {
    try {
      const response = await apiService.put(`/api/v1/users/${userId}/profile`, updates);

      this.invalidateUserCache(userId);
      
      return response.success;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return false;
    }
  }

  
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  invalidateUserCache(userId) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(userId) || key.includes('users_')) {
        this.cache.delete(key);
      }
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

const communityService = new CommunityService();
export default communityService;
