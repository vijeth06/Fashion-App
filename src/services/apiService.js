
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`);
      return await response.json();
    } catch (error) {
      throw new Error('Backend server is not accessible');
    }
  }

  async testDatabase() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/api/test-db`);
      return await response.json();
    } catch (error) {
      throw new Error('Database connection test failed');
    }
  }

  async initializeDatabase() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/api/init-db`, {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      throw new Error('Database initialization failed');
    }
  }

  async getDatabaseStatus() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/api/db-status`);
      return await response.json();
    } catch (error) {
      throw new Error('Failed to get database status');
    }
  }

  async syncFirebaseUser(firebaseUser) {
    return this.post('/auth/sync-user', { firebaseUser });
  }

  async getUserProfile(firebaseUid) {
    return this.get(`/auth/profile/${firebaseUid}`);
  }

  async updateUserPreferences(firebaseUid, preferences) {
    return this.put(`/auth/preferences/${firebaseUid}`, { preferences });
  }

  async getUserWishlistFromAuth(firebaseUid) {
    return this.get(`/auth/wishlist/${firebaseUid}`);
  }

  async getUserLooksFromAuth(firebaseUid) {
    return this.get(`/auth/looks/${firebaseUid}`);
  }

  async saveTryOnSessionWithAuth(firebaseUid, sessionData) {
    return this.post('/auth/try-on-session', { firebaseUid, sessionData });
  }

  async deleteUserAccount(firebaseUid) {
    return this.delete(`/auth/account/${firebaseUid}`);
  }

  async getProducts(params = {}) {
    return this.get('/products', params);
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async getCategories() {
    return this.get('/products/meta/categories');
  }

  async searchProducts(query, limit = 10) {
    return this.get(`/products/search/${encodeURIComponent(query)}`, { limit });
  }

  async createProduct(productData) {
    return this.post('/products', productData);
  }

  async updateProduct(id, productData) {
    return this.put(`/products/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  async getWishlist(userId) {
    return this.get('/wishlist', { userId });
  }

  async addToWishlist(userId, productId) {
    return this.post('/wishlist', { userId, productId });
  }

  async removeFromWishlist(userId, productId) {
    return this.delete(`/wishlist/${userId}/${productId}`);
  }

  async getLooks(userId) {
    return this.get('/looks', { userId });
  }

  async saveLook(lookData) {
    return this.post('/looks', lookData);
  }

  async deleteLook(lookId) {
    return this.delete(`/looks/${lookId}`);
  }

  async saveTryOnSession(sessionData) {
    return this.post('/try-on/sessions', sessionData);
  }

  async getTryOnSessions(userId) {
    return this.get('/try-on/sessions', { userId });
  }

  async uploadImage(file, type = 'user-photo') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    try {
      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      throw new Error('Image upload failed');
    }
  }
}

const apiService = new ApiService();

export default apiService;

export const {
  healthCheck,
  testDatabase,
  getProducts,
  getProduct,
  getCategories,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getLooks,
  saveLook,
  deleteLook,
  saveTryOnSession,
  getTryOnSessions,
  uploadImage
} = apiService;