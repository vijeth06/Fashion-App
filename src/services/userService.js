

import { auth } from '../firebase/firebaseConfig';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

class UserService {
  async buildAuthHeaders() {
    const user = auth?.currentUser;
    if (!user) return {};

    try {
      const token = await user.getIdToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (error) {
      console.warn('Failed to fetch auth token:', error);
      return {};
    }
  }
  
  async getUserProfile(firebaseUid) {
    try {
      const headers = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}`, {
        headers
      });
      
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

  
  async createUserProfile(userData) {
    try {
      const authHeaders = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
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

  
  async updateUserProfile(firebaseUid, updates) {
    try {
      const authHeaders = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
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


  
  async getCart(firebaseUid) {
    try {
      const headers = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/cart`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: data?.success ?? true,
        cart: data?.data || [],
        total: data?.total || 0,
        itemCount: data?.itemCount || 0
      };
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  
  async addToCart(firebaseUid, item) {
    try {
      const authHeaders = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
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

  
  async removeFromCart(firebaseUid, productId, size, color) {
    try {
      const authHeaders = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
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

  async updateCartItem(firebaseUid, productId, updates) {
    try {
      const authHeaders = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/cart`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          productId,
          ...updates
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  
  async clearCart(firebaseUid) {
    try {
      const headers = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/cart/clear`, {
        method: 'DELETE',
        headers
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


  
  async getWishlist(firebaseUid) {
    try {
      const headers = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/wishlist`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: data?.success ?? true,
        wishlist: data?.data || []
      };
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  }

  
  async addToWishlist(firebaseUid, productId) {
    try {
      const authHeaders = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
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

  
  async removeFromWishlist(firebaseUid, productId) {
    try {
      const headers = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/wishlist/${productId}`, {
        method: 'DELETE',
        headers
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


  
  async getAddresses(firebaseUid) {
    try {
      const headers = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/addresses`, {
        headers
      });
      
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

  
  async addAddress(firebaseUid, address) {
    try {
      const authHeaders = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
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

  
  async updateAddress(firebaseUid, addressId, updates) {
    try {
      const authHeaders = await this.buildAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
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

const userService = new UserService();
export default userService;

export { UserService };
