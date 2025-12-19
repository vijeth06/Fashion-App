/**
 * Indian Fashion Products Seed Data
 * Real products with Indian sizing, INR pricing, and try-on data
 */

const indianFashionProducts = [
  // ===== MEN'S TRADITIONAL WEAR =====
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
    sizes: [
      { size: 'S', stock: 25, measurements: { chest: 38, waist: 32, length: 42, shoulder: 16 } },
      { size: 'M', stock: 40, measurements: { chest: 40, waist: 34, length: 43, shoulder: 17 } },
      { size: 'L', stock: 35, measurements: { chest: 42, waist: 36, length: 44, shoulder: 18 } },
      { size: 'XL', stock: 30, measurements: { chest: 44, waist: 38, length: 45, shoulder: 19 } },
      { size: 'XXL', stock: 20, measurements: { chest: 46, waist: 40, length: 46, shoulder: 20 } }
    ],
    colors: [
      { name: 'White', hex: '#FFFFFF', stock: 50 },
      { name: 'Cream', hex: '#FFFDD0', stock: 45 },
      { name: 'Navy Blue', hex: '#000080', stock: 55 }
    ],
    images: {
      main: '/products/kurta-white-main.jpg',
      overlay: '/products/kurta-white-overlay.png',
      gallery: ['/products/kurta-1.jpg', '/products/kurta-2.jpg'],
      thumbnail: '/products/kurta-thumb.jpg'
    },
    description: 'Premium cotton kurta perfect for festivals and occasions. Comfortable all-day wear with elegant design.',
    material: 'Cotton',
    occasion: ['Festive', 'Traditional', 'Wedding'],
    region: 'Pan-India',
    careInstructions: 'Hand wash or gentle machine wash. Iron on medium heat.',
    tryOnData: {
      type: 'kurta',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.0
    },
    tags: ['kurta', 'traditional', 'festive', 'cotton', 'indian wear'],
    featured: true,
    bestseller: true,
    active: true,
    gst: { rate: 5 }  // Lower GST for cotton
  },

  {
    productId: 'PROD-SHE-001',
    name: 'Silk Sherwani',
    brand: 'Manyavar',
    category: 'mens-ethnic',
    subCategory: 'men',
    type: 'jacket',  // For try-on
    price: {
      mrp: 8999,
      selling: 6499,
      currency: 'INR'
    },
    sizes: [
      { size: 'S', stock: 10, measurements: { chest: 38, waist: 32, length: 44, shoulder: 17 } },
      { size: 'M', stock: 15, measurements: { chest: 40, waist: 34, length: 45, shoulder: 18 } },
      { size: 'L', stock: 12, measurements: { chest: 42, waist: 36, length: 46, shoulder: 19 } },
      { size: 'XL', stock: 10, measurements: { chest: 44, waist: 38, length: 47, shoulder: 20 } }
    ],
    colors: [
      { name: 'Royal Blue', hex: '#002366', stock: 20 },
      { name: 'Maroon', hex: '#800000', stock: 15 },
      { name: 'Gold', hex: '#FFD700', stock: 12 }
    ],
    images: {
      main: '/products/sherwani-blue-main.jpg',
      overlay: '/products/sherwani-blue-overlay.png',
      gallery: [],
      thumbnail: '/products/sherwani-thumb.jpg'
    },
    description: 'Luxurious silk sherwani for weddings and grand celebrations. Intricate embroidery and premium finish.',
    material: 'Silk',
    occasion: ['Wedding', 'Party', 'Festive'],
    region: 'North Indian',
    careInstructions: 'Dry clean only. Store in garment bag.',
    tryOnData: {
      type: 'jacket',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.1
    },
    tags: ['sherwani', 'wedding', 'ethnic', 'silk', 'groom wear'],
    featured: true,
    active: true,
    gst: { rate: 12 }
  },

  // ===== MEN'S WESTERN WEAR =====
  {
    productId: 'PROD-SHI-001',
    name: 'Formal White Shirt',
    nameHindi: 'फॉर्मल व्हाइट शर्ट',
    brand: 'Peter England',
    category: 'mens-shirts',
    subCategory: 'men',
    type: 'shirt',
    price: {
      mrp: 1799,
      selling: 1299,
      currency: 'INR'
    },
    sizes: [
      { size: 'S', stock: 30, measurements: { chest: 38, waist: 32, length: 29, shoulder: 16, sleeve: 33 } },
      { size: 'M', stock: 50, measurements: { chest: 40, waist: 34, length: 30, shoulder: 17, sleeve: 34 } },
      { size: 'L', stock: 45, measurements: { chest: 42, waist: 36, length: 31, shoulder: 18, sleeve: 35 } },
      { size: 'XL', stock: 35, measurements: { chest: 44, waist: 38, length: 32, shoulder: 19, sleeve: 36 } },
      { size: 'XXL', stock: 25, measurements: { chest: 46, waist: 40, length: 33, shoulder: 20, sleeve: 37 } }
    ],
    colors: [
      { name: 'White', hex: '#FFFFFF', stock: 85 },
      { name: 'Light Blue', hex: '#ADD8E6', stock: 75 },
      { name: 'Pink', hex: '#FFC0CB', stock: 65 }
    ],
    images: {
      main: '/products/formal-shirt-white.jpg',
      overlay: '/products/formal-shirt-overlay.png',
      gallery: [],
      thumbnail: '/products/formal-shirt-thumb.jpg'
    },
    description: 'Classic formal shirt perfect for office and business meetings. Easy care fabric with non-iron finish.',
    material: 'Poly-Cotton',
    occasion: ['Formal', 'Office', 'Business'],
    region: 'Pan-India',
    careInstructions: 'Machine wash cold. Iron if needed.',
    tryOnData: {
      type: 'shirt',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.0
    },
    tags: ['formal', 'shirt', 'office wear', 'business'],
    bestseller: true,
    active: true,
    gst: { rate: 12 }
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
    sizes: [
      { size: 'S', stock: 25, measurements: { waist: 28, hip: 36, length: 40 } },
      { size: 'M', stock: 40, measurements: { waist: 30, hip: 38, length: 41 } },
      { size: 'L', stock: 35, measurements: { waist: 32, hip: 40, length: 42 } },
      { size: 'XL', stock: 30, measurements: { waist: 34, hip: 42, length: 43 } },
      { size: 'XXL', stock: 20, measurements: { waist: 36, hip: 44, length: 44 } }
    ],
    colors: [
      { name: 'Dark Blue', hex: '#00008B', stock: 75 },
      { name: 'Light Blue', hex: '#87CEEB', stock: 55 },
      { name: 'Black', hex: '#000000', stock: 70 }
    ],
    images: {
      main: '/products/jeans-blue.jpg',
      overlay: '/products/jeans-overlay.png',
      gallery: [],
      thumbnail: '/products/jeans-thumb.jpg'
    },
    description: 'Premium quality denim jeans with slim fit. Comfortable stretch fabric for all-day wear.',
    material: 'Denim',
    occasion: ['Casual', 'Daily Wear', 'College'],
    region: 'Pan-India',
    careInstructions: 'Machine wash cold. Tumble dry low.',
    tryOnData: {
      type: 'jeans',
      anchorPoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'],
      defaultScale: 1.0
    },
    tags: ['jeans', 'denim', 'casual', 'slim fit'],
    bestseller: true,
    active: true,
    gst: { rate: 12 }
  },

  {
    productId: 'PROD-TSH-001',
    name: 'Cotton Round Neck T-Shirt',
    nameHindi: 'कॉटन राउंड नेक टी-शर्ट',
    brand: 'Allen Solly',
    category: 'mens-tshirts',
    subCategory: 'men',
    type: 'tshirt',
    price: {
      mrp: 999,
      selling: 699,
      currency: 'INR'
    },
    sizes: [
      { size: 'S', stock: 40, measurements: { chest: 36, waist: 30, length: 26 } },
      { size: 'M', stock: 60, measurements: { chest: 38, waist: 32, length: 27 } },
      { size: 'L', stock: 50, measurements: { chest: 40, waist: 34, length: 28 } },
      { size: 'XL', stock: 40, measurements: { chest: 42, waist: 36, length: 29 } },
      { size: 'XXL', stock: 30, measurements: { chest: 44, waist: 38, length: 30 } }
    ],
    colors: [
      { name: 'Black', hex: '#000000', stock: 70 },
      { name: 'White', hex: '#FFFFFF', stock: 65 },
      { name: 'Navy', hex: '#000080', stock: 60 },
      { name: 'Grey', hex: '#808080', stock: 55 }
    ],
    images: {
      main: '/products/tshirt-black.jpg',
      overlay: '/products/tshirt-overlay.png',
      gallery: [],
      thumbnail: '/products/tshirt-thumb.jpg'
    },
    description: '100% cotton t-shirt for everyday comfort. Breathable fabric and classic fit.',
    material: 'Cotton',
    occasion: ['Casual', 'Daily Wear', 'Sports'],
    region: 'Pan-India',
    careInstructions: 'Machine wash. Do not bleach.',
    tryOnData: {
      type: 'tshirt',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.0
    },
    tags: ['tshirt', 'casual', 'cotton', 'round neck'],
    bestseller: true,
    newArrival: true,
    active: true,
    gst: { rate: 5 }
  },

  // ===== WOMEN'S TRADITIONAL WEAR =====
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
    sizes: [
      { size: 'XS', stock: 20, measurements: { chest: 32, waist: 28, length: 42, shoulder: 14 } },
      { size: 'S', stock: 35, measurements: { chest: 34, waist: 30, length: 43, shoulder: 15 } },
      { size: 'M', stock: 40, measurements: { chest: 36, waist: 32, length: 44, shoulder: 16 } },
      { size: 'L', stock: 30, measurements: { chest: 38, waist: 34, length: 45, shoulder: 17 } },
      { size: 'XL', stock: 25, measurements: { chest: 40, waist: 36, length: 46, shoulder: 18 } },
      { size: 'XXL', stock: 20, measurements: { chest: 42, waist: 38, length: 47, shoulder: 19 } }
    ],
    colors: [
      { name: 'Pink', hex: '#FFC0CB', stock: 60 },
      { name: 'Yellow', hex: '#FFFF00', stock: 50 },
      { name: 'Green', hex: '#008000', stock: 55 },
      { name: 'Blue', hex: '#0000FF', stock: 45 }
    ],
    images: {
      main: '/products/kurti-pink.jpg',
      overlay: '/products/kurti-overlay.png',
      gallery: [],
      thumbnail: '/products/kurti-thumb.jpg'
    },
    description: 'Stylish cotton kurti with beautiful prints. Perfect for daily wear and casual occasions.',
    material: 'Cotton',
    occasion: ['Casual', 'Daily Wear', 'Office', 'College'],
    region: 'Pan-India',
    careInstructions: 'Machine wash cold. Iron if needed.',
    tryOnData: {
      type: 'kurta',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.0
    },
    tags: ['kurti', 'women', 'ethnic', 'cotton', 'printed'],
    featured: true,
    bestseller: true,
    active: true,
    gst: { rate: 5 }
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
    sizes: [
      { size: 'Free Size', stock: 30, measurements: { length: 550 } }
    ],
    colors: [
      { name: 'Red', hex: '#FF0000', stock: 15 },
      { name: 'Blue', hex: '#0000FF', stock: 10 },
      { name: 'Green', hex: '#008000', stock: 12 },
      { name: 'Orange', hex: '#FFA500', stock: 8 }
    ],
    images: {
      main: '/products/saree-red.jpg',
      overlay: '/products/saree-overlay.png',
      gallery: [],
      thumbnail: '/products/saree-thumb.jpg'
    },
    description: 'Pure silk Kanjivaram saree with traditional weaving. Comes with matching blouse piece.',
    material: 'Silk',
    occasion: ['Wedding', 'Festive', 'Traditional', 'Party'],
    region: 'South Indian',
    careInstructions: 'Dry clean only.',
    tryOnData: {
      type: 'saree',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.2
    },
    tags: ['saree', 'silk', 'traditional', 'wedding', 'kanjivaram'],
    featured: true,
    trending: true,
    active: true,
    gst: { rate: 5 }
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
    sizes: [
      { size: 'S', stock: 25, measurements: { chest: 34, waist: 30, length: 48 } },
      { size: 'M', stock: 35, measurements: { chest: 36, waist: 32, length: 49 } },
      { size: 'L', stock: 30, measurements: { chest: 38, waist: 34, length: 50 } },
      { size: 'XL', stock: 25, measurements: { chest: 40, waist: 36, length: 51 } },
      { size: 'XXL', stock: 20, measurements: { chest: 42, waist: 38, length: 52 } }
    ],
    colors: [
      { name: 'Purple', hex: '#800080', stock: 45 },
      { name: 'Pink', hex: '#FFC0CB', stock: 40 },
      { name: 'Blue', hex: '#0000FF', stock: 35 }
    ],
    images: {
      main: '/products/anarkali-purple.jpg',
      overlay: '/products/anarkali-overlay.png',
      gallery: [],
      thumbnail: '/products/anarkali-thumb.jpg'
    },
    description: 'Elegant Anarkali suit with embroidered work. Complete set with dupatta.',
    material: 'Georgette',
    occasion: ['Festive', 'Wedding', 'Party'],
    region: 'North Indian',
    careInstructions: 'Dry clean recommended.',
    tryOnData: {
      type: 'dress',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.1
    },
    tags: ['salwar', 'anarkali', 'ethnic', 'festive'],
    featured: true,
    active: true,
    gst: { rate: 12 }
  },

  // ===== WOMEN'S WESTERN WEAR =====
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
    sizes: [
      { size: 'XS', stock: 30, measurements: { chest: 32, waist: 28, length: 24 } },
      { size: 'S', stock: 40, measurements: { chest: 34, waist: 30, length: 25 } },
      { size: 'M', stock: 45, measurements: { chest: 36, waist: 32, length: 26 } },
      { size: 'L', stock: 35, measurements: { chest: 38, waist: 34, length: 27 } },
      { size: 'XL', stock: 25, measurements: { chest: 40, waist: 36, length: 28 } }
    ],
    colors: [
      { name: 'White', hex: '#FFFFFF', stock: 55 },
      { name: 'Black', hex: '#000000', stock: 50 },
      { name: 'Beige', hex: '#F5F5DC', stock: 45 },
      { name: 'Navy', hex: '#000080', stock: 40 }
    ],
    images: {
      main: '/products/top-white.jpg',
      overlay: '/products/top-overlay.png',
      gallery: [],
      thumbnail: '/products/top-thumb.jpg'
    },
    description: 'Comfortable cotton top for everyday wear. Versatile style that goes with everything.',
    material: 'Cotton',
    occasion: ['Casual', 'Daily Wear', 'Office'],
    region: 'Pan-India',
    careInstructions: 'Machine wash cold.',
    tryOnData: {
      type: 'top',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.0
    },
    tags: ['top', 'casual', 'cotton', 'women'],
    newArrival: true,
    active: true,
    gst: { rate: 5 }
  },

  {
    productId: 'PROD-DRE-W001',
    name: 'Western Midi Dress',
    nameHindi: 'वेस्टर्न मिडी ड्रेस',
    brand: 'H&M',
    category: 'womens-dresses',
    subCategory: 'women',
    type: 'dress',
    price: {
      mrp: 2999,
      selling: 2199,
      currency: 'INR'
    },
    sizes: [
      { size: 'XS', stock: 20, measurements: { chest: 32, waist: 28, length: 44 } },
      { size: 'S', stock: 30, measurements: { chest: 34, waist: 30, length: 45 } },
      { size: 'M', stock: 35, measurements: { chest: 36, waist: 32, length: 46 } },
      { size: 'L', stock: 25, measurements: { chest: 38, waist: 34, length: 47 } },
      { size: 'XL', stock: 20, measurements: { chest: 40, waist: 36, length: 48 } }
    ],
    colors: [
      { name: 'Floral Print', hex: '#FFB6C1', stock: 50 },
      { name: 'Solid Black', hex: '#000000', stock: 45 },
      { name: 'Navy Blue', hex: '#000080', stock: 40 }
    ],
    images: {
      main: '/products/dress-floral.jpg',
      overlay: '/products/dress-overlay.png',
      gallery: [],
      thumbnail: '/products/dress-thumb.jpg'
    },
    description: 'Trendy midi dress perfect for parties and casual outings. Comfortable and stylish.',
    material: 'Polyester',
    occasion: ['Party', 'Casual', 'Dating'],
    region: 'Western',
    careInstructions: 'Hand wash cold. Hang dry.',
    tryOnData: {
      type: 'dress',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
      defaultScale: 1.0
    },
    tags: ['dress', 'western', 'party', 'midi'],
    trending: true,
    active: true,
    gst: { rate: 12 }
  },

  {
    productId: 'PROD-JEA-W001',
    name: 'Women\'s Skinny Jeans',
    nameHindi: 'महिलाओं की स्कीनी जींस',
    brand: 'Levi\'s',
    category: 'womens-jeans',
    subCategory: 'women',
    type: 'jeans',
    price: {
      mrp: 3299,
      selling: 2499,
      currency: 'INR'
    },
    sizes: [
      { size: 'XS', stock: 25, measurements: { waist: 26, hip: 34, length: 38 } },
      { size: 'S', stock: 35, measurements: { waist: 28, hip: 36, length: 39 } },
      { size: 'M', stock: 40, measurements: { waist: 30, hip: 38, length: 40 } },
      { size: 'L', stock: 30, measurements: { waist: 32, hip: 40, length: 41 } },
      { size: 'XL', stock: 25, measurements: { waist: 34, hip: 42, length: 42 } }
    ],
    colors: [
      { name: 'Dark Blue', hex: '#00008B', stock: 70 },
      { name: 'Black', hex: '#000000', stock: 55 },
      { name: 'Light Blue', hex: '#ADD8E6', stock: 45 }
    ],
    images: {
      main: '/products/jeans-women-blue.jpg',
      overlay: '/products/jeans-women-overlay.png',
      gallery: [],
      thumbnail: '/products/jeans-women-thumb.jpg'
    },
    description: 'High-rise skinny jeans with stretch comfort. Perfect fit for all body types.',
    material: 'Denim',
    occasion: ['Casual', 'Daily Wear', 'College'],
    region: 'Pan-India',
    careInstructions: 'Machine wash cold. Tumble dry low.',
    tryOnData: {
      type: 'jeans',
      anchorPoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'],
      defaultScale: 1.0
    },
    tags: ['jeans', 'skinny', 'denim', 'women'],
    bestseller: true,
    active: true,
    gst: { rate: 12 }
  },

  // ===== UNISEX ITEMS =====
  {
    productId: 'PROD-HOO-U001',
    name: 'Cotton Hoodie',
    nameHindi: 'कॉटन हुडी',
    brand: 'H&M',
    category: 'unisex-hoodies',
    subCategory: 'unisex',
    type: 'hoodie',
    price: {
      mrp: 2499,
      selling: 1899,
      currency: 'INR'
    },
    sizes: [
      { size: 'S', stock: 30, measurements: { chest: 38, length: 26 } },
      { size: 'M', stock: 45, measurements: { chest: 40, length: 27 } },
      { size: 'L', stock: 40, measurements: { chest: 42, length: 28 } },
      { size: 'XL', stock: 35, measurements: { chest: 44, length: 29 } },
      { size: 'XXL', stock: 25, measurements: { chest: 46, length: 30 } }
    ],
    colors: [
      { name: 'Black', hex: '#000000', stock: 75 },
      { name: 'Grey', hex: '#808080', stock: 60 },
      { name: 'Navy', hex: '#000080', stock: 50 }
    ],
    images: {
      main: '/products/hoodie-black.jpg',
      overlay: '/products/hoodie-overlay.png',
      gallery: [],
      thumbnail: '/products/hoodie-thumb.jpg'
    },
    description: 'Comfortable cotton hoodie for winter. Unisex design suitable for everyone.',
    material: 'Cotton Blend',
    occasion: ['Casual', 'Sports', 'Winter Wear'],
    region: 'Pan-India',
    careInstructions: 'Machine wash cold. Do not bleach.',
    tryOnData: {
      type: 'hoodie',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.2
    },
    tags: ['hoodie', 'unisex', 'winter', 'casual'],
    newArrival: true,
    trending: true,
    active: true,
    gst: { rate: 12 }
  },

  {
    productId: 'PROD-JAC-U001',
    name: 'Denim Jacket',
    nameHindi: 'डेनिम जैकेट',
    brand: 'Levi\'s',
    category: 'unisex-jackets',
    subCategory: 'unisex',
    type: 'jacket',
    price: {
      mrp: 4999,
      selling: 3999,
      currency: 'INR'
    },
    sizes: [
      { size: 'S', stock: 25, measurements: { chest: 38, length: 25, shoulder: 17 } },
      { size: 'M', stock: 35, measurements: { chest: 40, length: 26, shoulder: 18 } },
      { size: 'L', stock: 30, measurements: { chest: 42, length: 27, shoulder: 19 } },
      { size: 'XL', stock: 25, measurements: { chest: 44, length: 28, shoulder: 20 } },
      { size: 'XXL', stock: 20, measurements: { chest: 46, length: 29, shoulder: 21 } }
    ],
    colors: [
      { name: 'Blue Denim', hex: '#1560BD', stock: 60 },
      { name: 'Black Denim', hex: '#000000', stock: 55 },
      { name: 'Light Wash', hex: '#96CDCD', stock: 45 }
    ],
    images: {
      main: '/products/denim-jacket.jpg',
      overlay: '/products/denim-jacket-overlay.png',
      gallery: [],
      thumbnail: '/products/denim-jacket-thumb.jpg'
    },
    description: 'Classic denim jacket for all seasons. Versatile style for men and women.',
    material: 'Denim',
    occasion: ['Casual', 'Daily Wear', 'College'],
    region: 'Pan-India',
    careInstructions: 'Machine wash cold. Hang dry.',
    tryOnData: {
      type: 'jacket',
      anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
      defaultScale: 1.1
    },
    tags: ['jacket', 'denim', 'unisex', 'casual'],
    featured: true,
    bestseller: true,
    active: true,
    gst: { rate: 12 }
  }
];

module.exports = {
  indianFashionProducts
};
