
const indianFashionProducts = [

  {
    productId: 'PROD-KUR-001',
    name: 'Classic Cotton Kurta',
    brand: 'Manyavar',
    category: 'mens-kurtas',
    subCategory: 'men',
    type: 'kurta',
    price: {
      mrp: 2499,
      selling: 1899,
      currency: 'INR'
    },
    image: '/assets/tee_white.svg', // Fallback to existing asset
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Cream', hex: '#FFFDD0' },
      { name: 'Navy Blue', hex: '#000080' }
    ],
    material: 'Cotton',
    occasion: ['Festive', 'Traditional', 'Wedding'],
    region: 'Pan-India',
    tryOnData: {
      type: 'kurta',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.0
    },
    featured: true,
    bestseller: true
  },
  {
    productId: 'PROD-SHE-001',
    name: 'Silk Sherwani',
    brand: 'Manyavar',
    category: 'mens-ethnic',
    subCategory: 'men',
    type: 'jacket',
    price: {
      mrp: 8999,
      selling: 6499,
      currency: 'INR'
    },
    image: '/assets/jacket_denim.svg', // Using existing jacket asset
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Gold', hex: '#FFD700' },
      { name: 'Maroon', hex: '#800000' },
      { name: 'Royal Blue', hex: '#4169E1' }
    ],
    material: 'Silk',
    occasion: ['Wedding', 'Party', 'Festive'],
    region: 'North Indian',
    tryOnData: {
      type: 'jacket',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.1
    },
    featured: true
  },
  {
    productId: 'PROD-SHI-001',
    name: 'Formal White Shirt',
    nameHindi: 'à¤«à¥‰à¤°à¥à¤®à¤² à¤µà¥à¤¹à¤¾à¤‡à¤Ÿ à¤¶à¤°à¥à¤Ÿ',
    brand: 'Peter England',
    category: 'mens-shirts',
    subCategory: 'men',
    type: 'shirt',
    price: {
      mrp: 1799,
      selling: 1299,
      currency: 'INR'
    },
    image: '/assets/tee_white.svg', // Using existing shirt asset
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Light Blue', hex: '#ADD8E6' },
      { name: 'Pink', hex: '#FFC0CB' }
    ],
    material: 'Poly-Cotton',
    occasion: ['Formal', 'Office', 'Business'],
    region: 'Pan-India',
    tryOnData: {
      type: 'shirt',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.0
    },
    bestseller: true
  },
  {
    productId: 'PROD-JEA-001',
    name: 'Slim Fit Blue Jeans',
    brand: 'Levi\'s',
    category: 'mens-jeans',
    subCategory: 'men',
    type: 'jeans',
    price: {
      mrp: 3499,
      selling: 2799,
      currency: 'INR'
    },
    image: '/assets/jeans_blue.svg',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: [
      { name: 'Blue Denim', hex: '#1560BD' },
      { name: 'Dark Blue', hex: '#000080' },
      { name: 'Light Blue', hex: '#ADD8E6' }
    ],
    material: 'Denim',
    occasion: ['Casual', 'Daily Wear', 'College'],
    region: 'Pan-India',
    tryOnData: {
      type: 'jeans',
      anchorPoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'],
      defaultScale: 1.0
    },
    bestseller: true
  },
  {
    productId: 'PROD-TSH-001',
    name: 'Cotton Round Neck T-Shirt',
    nameHindi: 'à¤•à¥‰à¤Ÿà¤¨ à¤°à¤¾à¤‰à¤‚à¤¡ à¤¨à¥‡à¤• à¤Ÿà¥€-à¤¶à¤°à¥à¤Ÿ',
    brand: 'Allen Solly',
    category: 'mens-tshirts',
    subCategory: 'men',
    type: 'tshirt',
    price: {
      mrp: 999,
      selling: 699,
      currency: 'INR'
    },
    image: '/assets/tee_white.svg',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Navy Blue', hex: '#000080' }
    ],
    material: 'Cotton',
    occasion: ['Casual', 'Daily Wear', 'Sports'],
    region: 'Pan-India',
    tryOnData: {
      type: 'tshirt',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.0
    },
    bestseller: true
  },

  {
    productId: 'PROD-KUR-W001',
    name: 'Designer Cotton Kurti',
    brand: 'Biba',
    category: 'womens-kurtis',
    subCategory: 'women',
    type: 'kurta',
    price: {
      mrp: 2199,
      selling: 1599,
      currency: 'INR'
    },
    image: '/assets/dress_red.svg', // Using existing dress asset
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Pink', hex: '#FFC0CB' },
      { name: 'Blue', hex: '#0000FF' },
      { name: 'Green', hex: '#008000' }
    ],
    material: 'Cotton',
    occasion: ['Casual', 'Daily Wear', 'Office', 'College'],
    region: 'Pan-India',
    tryOnData: {
      type: 'kurta',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.0
    },
    featured: true,
    bestseller: true
  },
  {
    productId: 'PROD-SAR-001',
    name: 'Silk Saree with Blouse',
    brand: 'Kanjivaram Silk',
    category: 'womens-sarees',
    subCategory: 'women',
    type: 'saree',
    price: {
      mrp: 12999,
      selling: 9999,
      currency: 'INR'
    },
    image: '/assets/dress_red.svg', // Using existing dress asset for saree
    sizes: ['Free Size'],
    colors: [
      { name: 'Red', hex: '#FF0000' },
      { name: 'Blue', hex: '#0000FF' },
      { name: 'Green', hex: '#008000' },
      { name: 'Orange', hex: '#FFA500' }
    ],
    material: 'Silk',
    occasion: ['Wedding', 'Festive', 'Traditional', 'Party'],
    region: 'South Indian',
    tryOnData: {
      type: 'saree',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.2
    },
    featured: true,
    trending: true
  },
  {
    productId: 'PROD-SAL-001',
    name: 'Anarkali Salwar Suit',
    brand: 'W for Woman',
    category: 'womens-salwar',
    subCategory: 'women',
    type: 'dress',
    price: {
      mrp: 4999,
      selling: 3499,
      currency: 'INR'
    },
    image: '/assets/dress_red.svg', // Using existing dress asset
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Purple', hex: '#800080' },
      { name: 'Pink', hex: '#FFC0CB' },
      { name: 'Blue', hex: '#0000FF' }
    ],
    material: 'Georgette',
    occasion: ['Festive', 'Wedding', 'Party'],
    region: 'North Indian',
    tryOnData: {
      type: 'dress',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.1
    },
    featured: true
  },
  {
    productId: 'PROD-TOP-W001',
    name: 'Casual Cotton Top',
    brand: 'Zara',
    category: 'womens-tops',
    subCategory: 'women',
    type: 'top',
    price: {
      mrp: 1499,
      selling: 1099,
      currency: 'INR'
    },
    image: '/assets/tee_white.svg', // Using existing top asset
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Black', hex: '#000000' },
      { name: 'Pink', hex: '#FFC0CB' }
    ],
    material: 'Cotton',
    occasion: ['Casual', 'Daily Wear', 'College'],
    region: 'Pan-India',
    tryOnData: {
      type: 'top',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.0
    },
    trending: true
  },
  {
    productId: 'PROD-DRE-W001',
    name: 'Western Midi Dress',
    nameHindi: 'à¤µà¥‡à¤¸à¥à¤Ÿà¤°à¥à¤¨ à¤®à¤¿à¤¡à¥€ à¤¡à¥à¤°à¥‡à¤¸',
    brand: 'H&M',
    category: 'womens-dresses',
    subCategory: 'women',
    type: 'dress',
    price: {
      mrp: 2999,
      selling: 2199,
      currency: 'INR'
    },
    image: '/assets/dress_red.svg',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Floral Print', hex: '#FFB6C1' },
      { name: 'Solid Black', hex: '#000000' },
      { name: 'Navy Blue', hex: '#000080' }
    ],
    material: 'Polyester',
    occasion: ['Party', 'Casual', 'Dating'],
    region: 'Western',
    tryOnData: {
      type: 'dress',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
      defaultScale: 1.0
    },
    trending: true
  },

  {
    productId: 'PROD-HOO-U001',
    name: 'Cotton Hoodie',
    nameHindi: 'à¤•à¥‰à¤Ÿà¤¨ à¤¹à¥à¤¡à¥€',
    brand: 'H&M',
    category: 'unisex-hoodies',
    subCategory: 'unisex',
    type: 'hoodie',
    price: {
      mrp: 2499,
      selling: 1899,
      currency: 'INR'
    },
    image: '/assets/hoodie_black.svg',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Navy Blue', hex: '#000080' },
      { name: 'Grey', hex: '#808080' }
    ],
    material: 'Cotton Blend',
    occasion: ['Casual', 'Sports', 'Winter Wear'],
    region: 'Pan-India',
    tryOnData: {
      type: 'hoodie',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.2
    },
    newArrival: true,
    trending: true
  },
  {
    productId: 'PROD-JAC-U001',
    name: 'Denim Jacket',
    nameHindi: 'à¤¡à¥‡à¤¨à¤¿à¤® à¤œà¥ˆà¤•à¥‡à¤Ÿ',
    brand: 'Levi\'s',
    category: 'unisex-jackets',
    subCategory: 'unisex',
    type: 'jacket',
    price: {
      mrp: 4999,
      selling: 3999,
      currency: 'INR'
    },
    image: '/assets/jacket_denim.svg',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Blue Denim', hex: '#1560BD' },
      { name: 'Light Blue', hex: '#87CEEB' },
      { name: 'Dark Blue', hex: '#191970' }
    ],
    material: 'Denim',
    occasion: ['Casual', 'Daily Wear', 'College'],
    region: 'Pan-India',
    tryOnData: {
      type: 'jacket',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.1
    },
    trending: true
  }
];


class IndianProductService {
  constructor() {
    this.products = indianFashionProducts;
  }

  async getAllProducts() {
    try {
      return {
        success: true,
        products: this.products,
        total: this.products.length
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        products: [],
        error: error.message
      };
    }
  }

  async getProductsByCategory(category) {
    try {
      const filtered = this.products.filter(product => 
        product.category === category || product.subCategory === category
      );
      return {
        success: true,
        products: filtered,
        total: filtered.length
      };
    } catch (error) {
      return {
        success: false,
        products: [],
        error: error.message
      };
    }
  }

  async getFeaturedProducts() {
    try {
      const featured = this.products.filter(product => product.featured);
      return {
        success: true,
        products: featured,
        total: featured.length
      };
    } catch (error) {
      return {
        success: false,
        products: [],
        error: error.message
      };
    }
  }

  async getProductsByGender(gender) {
    try {
      let filtered;
      if (gender === 'men') {
        filtered = this.products.filter(product => product.subCategory === 'men');
      } else if (gender === 'women') {
        filtered = this.products.filter(product => product.subCategory === 'women');
      } else {
        filtered = this.products.filter(product => product.subCategory === 'unisex');
      }
      
      return {
        success: true,
        products: filtered,
        total: filtered.length
      };
    } catch (error) {
      return {
        success: false,
        products: [],
        error: error.message
      };
    }
  }

  async getTrendingProducts() {
    try {
      const trending = this.products.filter(product => product.trending);
      return {
        success: true,
        products: trending,
        total: trending.length
      };
    } catch (error) {
      return {
        success: false,
        products: [],
        error: error.message
      };
    }
  }

  async getProductById(id) {
    try {
      const product = this.products.find(product => product.productId === id);
      if (product) {
        return {
          success: true,
          product: product
        };
      } else {
        return {
          success: false,
          error: 'Product not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  formatPrice(price) {
    if (price.currency === 'INR') {
      return `â‚¹${price.selling.toLocaleString('en-IN')}`;
    }
    return `${price.currency} ${price.selling}`;
  }

  getDiscountPercentage(price) {
    if (price.mrp && price.selling) {
      return Math.round(((price.mrp - price.selling) / price.mrp) * 100);
    }
    return 0;
  }

  async searchProducts(query) {
    try {
      const lowercaseQuery = query.toLowerCase();
      const filtered = this.products.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.nameHindi?.includes(query) ||
        product.category.toLowerCase().includes(lowercaseQuery) ||
        product.brand.toLowerCase().includes(lowercaseQuery) ||
        product.material.toLowerCase().includes(lowercaseQuery) ||
        product.occasion?.some(occ => occ.toLowerCase().includes(lowercaseQuery))
      );
      
      return {
        success: true,
        products: filtered,
        total: filtered.length
      };
    } catch (error) {
      return {
        success: false,
        products: [],
        error: error.message
      };
    }
  }
}

const indianProductService = new IndianProductService();
export default indianProductService;

export {
  indianFashionProducts,
  IndianProductService
};