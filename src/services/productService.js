/**
 * Product Service
 * Handles all product-related API calls to the backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

class ProductService {
  /**
   * Get all products with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} - Products data with pagination
   */
  async getAllProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get featured products
   * @returns {Promise<Array>} - Featured products
   */
  async getFeaturedProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/featured`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  /**
   * Get bestselling products
   * @returns {Promise<Array>} - Bestselling products
   */
  async getBestsellers() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/bestsellers`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
      throw error;
    }
  }

  /**
   * Get new arrivals
   * @returns {Promise<Array>} - New arrival products
   */
  async getNewArrivals() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/new-arrivals`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} - Product details
   */
  async getProductById(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Search products
   * @param {string} searchTerm - Search query
   * @returns {Promise<Array>} - Matching products
   */
  async searchProducts(searchTerm) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   * @param {string} category - Category name
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} - Products in category
   */
  async getProductsByCategory(category, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('category', category);
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} - Available categories
   */
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get similar products
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} - Similar products
   */
  async getSimilarProducts(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/similar`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching similar products:', error);
      throw error;
    }
  }

  /**
   * Add review to product
   * @param {string} productId - Product ID
   * @param {Object} reviewData - Review details
   * @returns {Promise<Object>} - Updated product
   */
  async addReview(productId, reviewData) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  /**
   * Format product data for try-on compatibility
   * @param {Object} product - Backend product object
   * @returns {Object} - Formatted product for try-on
   */
  formatForTryOn(product) {
    return {
      id: product.productId,
      name: product.name.en || product.name,
      type: product.tryOnData?.type || 'shirt',
      category: product.category,
      imageUrl: product.images?.overlay || product.images?.main || '',
      overlayUrl: product.images?.overlay || product.images?.main || '',
      color: product.colors?.[0]?.hex || '#000000',
      price: product.pricing?.selling || 0,
      description: product.description?.en || product.description || '',
      sizes: product.sizes?.map(s => s.size) || [],
      material: product.material || '',
      brand: product.brand || '',
      tryOnData: product.tryOnData || {}
    };
  }

  /**
   * Format multiple products for try-on
   * @param {Array} products - Array of backend products
   * @returns {Array} - Formatted products
   */
  formatManyForTryOn(products) {
    return products.map(product => this.formatForTryOn(product));
  }
}

// Export singleton instance
const productService = new ProductService();
export default productService;

// Named exports
export { ProductService };
