import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

class WishlistService {
  constructor() {
    this.db = db;
    this.cache = new Map();
  }

  // Get user's wishlist
  async getWishlist(userId) {
    if (!userId) {
      return this.getLocalWishlist();
    }

    try {
      if (this.cache.has(userId)) {
        return this.cache.get(userId);
      }

      const wishlistRef = doc(this.db, 'wishlists', userId);
      const wishlistSnap = await getDoc(wishlistRef);
      
      if (wishlistSnap.exists()) {
        const wishlist = wishlistSnap.data();
        this.cache.set(userId, wishlist);
        return {
          success: true,
          data: wishlist
        };
      } else {
        // Create empty wishlist
        const emptyWishlist = {
          userId,
          items: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(wishlistRef, emptyWishlist);
        return {
          success: true,
          data: emptyWishlist
        };
      }
    } catch (error) {
      console.error('Error getting wishlist:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add item to wishlist
  async addToWishlist(userId, productId, productData) {
    if (!userId) {
      return this.addToLocalWishlist(productId, productData);
    }

    try {
      const wishlistRef = doc(this.db, 'wishlists', userId);
      const wishlistItem = {
        productId,
        ...productData,
        addedAt: serverTimestamp()
      };

      await updateDoc(wishlistRef, {
        items: arrayUnion(wishlistItem),
        updatedAt: serverTimestamp()
      });

      // Update cache
      this.invalidateCache(userId);

      return {
        success: true,
        message: 'Item added to wishlist'
      };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Remove item from wishlist
  async removeFromWishlist(userId, productId) {
    if (!userId) {
      return this.removeFromLocalWishlist(productId);
    }

    try {
      const wishlistRef = doc(this.db, 'wishlists', userId);
      const wishlistData = await this.getWishlist(userId);
      
      if (wishlistData.success) {
        const itemToRemove = wishlistData.data.items.find(item => item.productId === productId);
        if (itemToRemove) {
          await updateDoc(wishlistRef, {
            items: arrayRemove(itemToRemove),
            updatedAt: serverTimestamp()
          });

          // Update cache
          this.invalidateCache(userId);

          return {
            success: true,
            message: 'Item removed from wishlist'
          };
        }
      }

      return {
        success: false,
        error: 'Item not found in wishlist'
      };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if item is in wishlist
  async isInWishlist(userId, productId) {
    if (!userId) {
      return this.isInLocalWishlist(productId);
    }

    try {
      const wishlistData = await this.getWishlist(userId);
      if (wishlistData.success) {
        return wishlistData.data.items.some(item => item.productId === productId);
      }
      return false;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  }

  // Toggle item in wishlist
  async toggleWishlist(userId, productId, productData) {
    const isInWishlist = await this.isInWishlist(userId, productId);
    
    if (isInWishlist) {
      return await this.removeFromWishlist(userId, productId);
    } else {
      return await this.addToWishlist(userId, productId, productData);
    }
  }

  // Get wishlist count
  async getWishlistCount(userId) {
    if (!userId) {
      return this.getLocalWishlistCount();
    }

    try {
      const wishlistData = await this.getWishlist(userId);
      if (wishlistData.success) {
        return wishlistData.data.items.length;
      }
      return 0;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  }

  // Clear wishlist
  async clearWishlist(userId) {
    if (!userId) {
      return this.clearLocalWishlist();
    }

    try {
      const wishlistRef = doc(this.db, 'wishlists', userId);
      await updateDoc(wishlistRef, {
        items: [],
        updatedAt: serverTimestamp()
      });

      this.invalidateCache(userId);

      return {
        success: true,
        message: 'Wishlist cleared'
      };
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sync local wishlist to user account
  async syncLocalWishlist(userId) {
    try {
      const localWishlist = this.getLocalWishlist();
      if (localWishlist.length > 0) {
        const wishlistRef = doc(this.db, 'wishlists', userId);
        
        for (const item of localWishlist) {
          await updateDoc(wishlistRef, {
            items: arrayUnion({
              ...item,
              addedAt: serverTimestamp()
            }),
            updatedAt: serverTimestamp()
          });
        }

        // Clear local wishlist after sync
        this.clearLocalWishlist();
        this.invalidateCache(userId);

        return {
          success: true,
          message: 'Local wishlist synced successfully'
        };
      }

      return {
        success: true,
        message: 'No local items to sync'
      };
    } catch (error) {
      console.error('Error syncing local wishlist:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Local storage methods for guests
  getLocalWishlist() {
    try {
      const localWishlist = localStorage.getItem('guest_wishlist');
      return localWishlist ? JSON.parse(localWishlist) : [];
    } catch (error) {
      console.error('Error getting local wishlist:', error);
      return [];
    }
  }

  addToLocalWishlist(productId, productData) {
    try {
      const wishlist = this.getLocalWishlist();
      const existingItem = wishlist.find(item => item.productId === productId);
      
      if (!existingItem) {
        wishlist.push({
          productId,
          ...productData,
          addedAt: new Date().toISOString()
        });
        localStorage.setItem('guest_wishlist', JSON.stringify(wishlist));
      }

      return {
        success: true,
        message: 'Item added to wishlist'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  removeFromLocalWishlist(productId) {
    try {
      const wishlist = this.getLocalWishlist();
      const updatedWishlist = wishlist.filter(item => item.productId !== productId);
      localStorage.setItem('guest_wishlist', JSON.stringify(updatedWishlist));

      return {
        success: true,
        message: 'Item removed from wishlist'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  isInLocalWishlist(productId) {
    const wishlist = this.getLocalWishlist();
    return wishlist.some(item => item.productId === productId);
  }

  getLocalWishlistCount() {
    return this.getLocalWishlist().length;
  }

  clearLocalWishlist() {
    try {
      localStorage.removeItem('guest_wishlist');
      return {
        success: true,
        message: 'Local wishlist cleared'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cache management
  invalidateCache(userId) {
    this.cache.delete(userId);
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
const wishlistService = new WishlistService();
export default wishlistService;