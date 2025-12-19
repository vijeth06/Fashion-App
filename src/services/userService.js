/**
 * User Service
 * Handles all user-related API calls (cart, wishlist, addresses, profile)
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

class UserService {
  /**
   * Get user profile
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<Object>} - User profile
   */
  async getUserProfile(firebaseUid) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // User not found
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Create user profile
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  async createUserProfile(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} firebaseUid - Firebase UID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} - Updated user
   */
  async updateUserProfile(firebaseUid, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // ==================== CART METHODS ====================

  /**
   * Get user cart
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<Object>} - Cart data
   */
  async getCart(firebaseUid) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/cart`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  /**
   * Add item to cart
   * @param {string} firebaseUid - Firebase UID
   * @param {Object} item - Cart item
   * @returns {Promise<Object>} - Updated cart
   */
  async addToCart(firebaseUid, item) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @param {string} firebaseUid - Firebase UID
   * @param {string} productId - Product ID
   * @param {string} size - Size
   * @param {string} color - Color
   * @returns {Promise<Object>} - Updated cart
   */
  async removeFromCart(firebaseUid, productId, size, color) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, size, color }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  /**
   * Clear entire cart
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<Object>} - Empty cart
   */
  async clearCart(firebaseUid) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/cart/clear`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // ==================== WISHLIST METHODS ====================

  /**
   * Get user wishlist
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<Array>} - Wishlist items
   */
  async getWishlist(firebaseUid) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/wishlist`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  }

  /**
   * Add item to wishlist
   * @param {string} firebaseUid - Firebase UID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} - Updated wishlist
   */
  async addToWishlist(firebaseUid, productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  /**
   * Remove item from wishlist
   * @param {string} firebaseUid - Firebase UID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} - Updated wishlist
   */
  async removeFromWishlist(firebaseUid, productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/wishlist/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  // ==================== ADDRESS METHODS ====================

  /**
   * Get all user addresses
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<Array>} - User addresses
   */
  async getAddresses(firebaseUid) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/addresses`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  }

  /**
   * Add new address
   * @param {string} firebaseUid - Firebase UID
   * @param {Object} address - Address data
   * @returns {Promise<Object>} - Updated user with new address
   */
  async addAddress(firebaseUid, address) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  }

  /**
   * Update existing address
   * @param {string} firebaseUid - Firebase UID
   * @param {string} addressId - Address ID
   * @param {Object} updates - Address updates
   * @returns {Promise<Object>} - Updated user
   */
  async updateAddress(firebaseUid, addressId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  /**
   * Delete address
   * @param {string} firebaseUid - Firebase UID
   * @param {string} addressId - Address ID
   * @returns {Promise<Object>} - Updated user
   */
  async deleteAddress(firebaseUid, addressId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/addresses/${addressId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  // ==================== MEASUREMENTS ====================

  /**
   * Update user measurements
   * @param {string} firebaseUid - Firebase UID
   * @param {Object} measurements - Body measurements
   * @returns {Promise<Object>} - Updated user
   */
  async updateMeasurements(firebaseUid, measurements) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/measurements`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(measurements),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating measurements:', error);
      throw error;
    }
  }
}

// Export singleton instance
const userService = new UserService();
export default userService;

// Named exports
export { UserService };
