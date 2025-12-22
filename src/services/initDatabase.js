


const apiService = require('./api');

class DatabaseInitializer {
  constructor() {
    this.api = apiService;
  }

  async initializeWithSampleData() {
    try {
      console.log('ðŸš€ Initializing database with sample data...');
      
      await this.createSampleProducts();
      await this.createSampleUsers();
      
      console.log('âœ… Database initialization completed successfully');
      return { success: true, message: 'Sample data created' };
      
    } catch (error) {
      console.error('âŒ Database initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  async createSampleProducts() {
    const quantumProducts = [
      {
        name: 'Quantum Holographic Dress',
        description: 'Revolutionary dress with color-shifting quantum fibers that adapt to lighting conditions',
        category: 'dresses',
        subcategory: 'quantum-wear',
        brand: 'Quantum Couture',
        price: 599,
        originalPrice: 799,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Holographic Blue', 'Quantum Silver', 'Prismatic Gold'],
        images: [{
          url: 'https://via.placeholder.com/400x600/8B5CF6/FFFFFF?text=Quantum+Dress',
          alt: 'Quantum Holographic Dress',
          type: 'main'
        }],
        aiMetadata: {
          styleVector: [0.9, 0.7, 0.8, 0.6],
          colorPalette: ['#8B5CF6', '#06B6D4', '#F59E0B'],
          occasionTags: ['party', 'formal'],
          seasonality: ['spring', 'summer', 'fall', 'winter'],
          trendScore: 0.95
        },
        fabricPhysics: {
          material: 'quantum-fiber',
          weight: 150,
          stretch: 0.8,
          drape: 0.9,
          breathability: 0.7,
          quantumProperties: {
            colorShifting: true,
            temperatureAdaptive: true,
            selfCleaning: false
          }
        },
        sustainability: {
          ecoRating: 85,
          carbonFootprint: 5.2,
          waterUsage: 150,
          materials: [{
            type: 'Quantum Fiber',
            percentage: 70,
            sustainable: true,
            recycled: false
          }, {
            type: 'Organic Cotton',
            percentage: 30,
            sustainable: true,
            recycled: true
          }]
        },
        isQuantumWear: true,
        isFeatured: true
      },
      {
        name: 'Neural-Adaptive Smart Jacket',
        description: 'AI-powered jacket that learns your style preferences and adapts its appearance',
        category: 'outerwear',
        subcategory: 'smart-wear',
        brand: 'Neural Fashion',
        price: 899,
        originalPrice: 1199,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Adaptive Black', 'Smart Grey', 'Neural Blue'],
        images: [{
          url: 'https://via.placeholder.com/400x600/1F2937/FFFFFF?text=Neural+Jacket',
          alt: 'Neural-Adaptive Smart Jacket',
          type: 'main'
        }],
        aiMetadata: {
          styleVector: [0.8, 0.9, 0.7, 0.8],
          colorPalette: ['#1F2937', '#6B7280', '#3B82F6'],
          occasionTags: ['casual', 'work', 'outdoor'],
          seasonality: ['fall', 'winter'],
          trendScore: 0.88
        },
        fabricPhysics: {
          material: 'smart-textile',
          weight: 450,
          stretch: 0.6,
          drape: 0.7,
          breathability: 0.8,
          quantumProperties: {
            colorShifting: false,
            temperatureAdaptive: true,
            selfCleaning: true
          }
        },
        sustainability: {
          ecoRating: 92,
          carbonFootprint: 8.1,
          waterUsage: 200,
          materials: [{
            type: 'Recycled Polyester',
            percentage: 60,
            sustainable: true,
            recycled: true
          }, {
            type: 'Organic Hemp',
            percentage: 40,
            sustainable: true,
            recycled: false
          }]
        },
        isQuantumWear: true,
        isFeatured: true
      }
    ];

    for (const product of quantumProducts) {
      try {
        await this.api.createProduct(product);
        console.log(`âœ… Created product: ${product.name}`);
      } catch (error) {
        console.error(`âŒ Failed to create product ${product.name}:`, error);
      }
    }
  }

  async createSampleUsers() {
    const sampleUsers = [
      {
        uid: 'demo_user_001',
        email: 'aria@quantumfashion.com',
        displayName: 'Aria Quantum',
        biometrics: {
          height: 170,
          weight: 60,
          measurements: {
            chest: 86,
            waist: 66,
            hips: 92,
            shoulders: 38,
            inseam: 76
          },
          bodyType: 'hourglass',
          skinTone: 'medium',
          preferredSizes: {
            top: 'M',
            bottom: 'S',
            shoes: '7'
          }
        },
        styleDNA: {
          minimalist: 0.3,
          edgy: 0.8,
          classic: 0.4,
          bohemian: 0.2,
          sporty: 0.6,
          romantic: 0.5
        },
        preferences: {
          favoriteColors: ['purple', 'blue', 'silver'],
          dislikedColors: ['brown', 'beige'],
          preferredBrands: ['Quantum Couture', 'Neural Fashion'],
          budgetRange: {
            min: 200,
            max: 1000
          },
          sustainabilityImportant: true
        },
        premiumTier: 'Digital Royalty'
      }
    ];

    for (const user of sampleUsers) {
      try {
        await this.api.createUser(user);
        console.log(`âœ… Created user: ${user.displayName}`);
      } catch (error) {
        console.error(`âŒ Failed to create user ${user.displayName}:`, error);
      }
    }
  }

  async testConnection() {
    try {
      const result = await this.api.testConnection();
      console.log('ðŸ” Database connection test result:', result);
      return result;
    } catch (error) {
      console.error('âŒ Database connection test failed:', error);
      return { connected: false, error: error.message };
    }
  }
}

module.exports = new DatabaseInitializer();
