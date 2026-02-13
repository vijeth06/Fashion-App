

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const normalizeProduct = (product) => {
  if (!product) return product;

  const pricing = product.pricing || {
    selling: product.price?.selling ?? product.price ?? 0,
    mrp: product.price?.mrp,
    discount: product.price?.discount
  };

  return {
    ...product,
    pricing
  };
};

const normalizeProductList = (payload) => {
  const products = Array.isArray(payload?.data) ? payload.data : (payload?.products || []);
  const pagination = payload?.pagination || payload?.pageInfo || null;

  return {
    success: payload?.success ?? true,
    products: products.map(normalizeProduct),
    pagination
  };
};

const normalizeProductResponse = (payload) => {
  if (payload?.product) {
    return {
      success: payload?.success ?? true,
      product: normalizeProduct(payload.product)
    };
  }

  return {
    success: payload?.success ?? true,
    product: normalizeProduct(payload?.data)
  };
};

class ProductService {
  
  async getAllProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

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
      return normalizeProductList(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  
  async getFeaturedProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/featured`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return normalizeProductList(data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  
  async getBestsellers() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/bestsellers`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return normalizeProductList(data);
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
      throw error;
    }
  }

  
  async getNewArrivals() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/new-arrivals`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return normalizeProductList(data);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      throw error;
    }
  }

  
  async getProductById(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return normalizeProductResponse(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  
  async searchProducts(searchTerm) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return normalizeProductList(data);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  
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
      return normalizeProductList(data);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: data?.success ?? true,
        categories: data?.data || data?.categories || []
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  
  async getSimilarProducts(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/similar`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return normalizeProductList(data);
    } catch (error) {
      console.error('Error fetching similar products:', error);
      throw error;
    }
  }

  
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

  
  formatForTryOn(product) {
    return {
      id: product.productId,
      name: product.name.en || product.name,
      type: product.tryOnData?.type || 'shirt',
      category: product.category,
      imageUrl: product.images?.overlay || product.images?.main || '',
      overlayUrl: product.images?.overlay || product.images?.main || '',
      color: product.colors?.[0]?.hex || '#000000',
      price: product.pricing?.selling || product.price?.selling || product.price || 0,
      description: product.description?.en || product.description || '',
      sizes: product.sizes?.map(s => s.size) || [],
      material: product.material || '',
      brand: product.brand || '',
      tryOnData: product.tryOnData || {}
    };
  }

  
  formatManyForTryOn(products) {
    return products.map(product => this.formatForTryOn(product));
  }
}

const productService = new ProductService();
export default productService;

export { ProductService };
