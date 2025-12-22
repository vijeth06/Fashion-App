

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

class UserService {
  
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
