
export const sampleClothingItems = [

  {
    id: 'shirt-001',
    name: 'White T-Shirt',
    type: 'shirt',
    category: 'tops',
    imageUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="200" height="240" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="180" x="0" y="30" fill="#ffffff" stroke="#e0e0e0" stroke-width="2" rx="20"/>
        <ellipse cx="100" cy="40" rx="30" ry="15" fill="none" stroke="#e0e0e0" stroke-width="2"/>
        <rect width="40" height="60" x="0" y="30" fill="#ffffff" stroke="#e0e0e0" stroke-width="2" rx="10"/>
        <rect width="40" height="60" x="160" y="30" fill="#ffffff" stroke="#e0e0e0" stroke-width="2" rx="10"/>
      </svg>
    `),
    color: '#ffffff',
    price: 29.99,
    description: 'Classic white cotton t-shirt',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    material: 'Cotton',
    brand: 'BasicWear'
  },
  {
    id: 'shirt-002',
    name: 'Black Hoodie',
    type: 'hoodie',
    category: 'tops',
    imageUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="220" height="280" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="220" x="0" y="30" fill="#1a1a1a" stroke="#333" stroke-width="2" rx="25"/>
        <ellipse cx="110" cy="45" rx="35" ry="20" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
        <rect width="45" height="80" x="0" y="30" fill="#1a1a1a" stroke="#333" stroke-width="2" rx="15"/>
        <rect width="45" height="80" x="175" y="30" fill="#1a1a1a" stroke="#333" stroke-width="2" rx="15"/>
        <rect width="80" height="25" x="70" y="60" fill="#333" rx="12"/>
      </svg>
    `),
    color: '#1a1a1a',
    price: 59.99,
    description: 'Comfortable black cotton hoodie',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    material: 'Cotton Blend',
    brand: 'StreetStyle'
  },
  {
    id: 'jacket-001',
    name: 'Denim Jacket',
    type: 'jacket',
    category: 'tops',
    imageUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="230" height="260" xmlns="http://www.w3.org/2000/svg">
        <rect width="230" height="200" x="0" y="30" fill="#4169E1" stroke="#2c4aa6" stroke-width="2" rx="20"/>
        <ellipse cx="115" cy="40" rx="30" ry="15" fill="none" stroke="#2c4aa6" stroke-width="2"/>
        <rect width="50" height="70" x="0" y="30" fill="#4169E1" stroke="#2c4aa6" stroke-width="2" rx="15"/>
        <rect width="50" height="70" x="180" y="30" fill="#4169E1" stroke="#2c4aa6" stroke-width="2" rx="15"/>
        <circle cx="60" cy="100" r="8" fill="#2c4aa6"/>
        <circle cx="170" cy="100" r="8" fill="#2c4aa6"/>
        <rect width="120" height="4" x="55" y="120" fill="#2c4aa6"/>
        <rect width="120" height="4" x="55" y="140" fill="#2c4aa6"/>
      </svg>
    `),
    color: '#4169E1',
    price: 89.99,
    description: 'Classic blue denim jacket',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    material: 'Denim',
    brand: 'ClassicJeans'
  },

  {
    id: 'dress-001',
    name: 'Red Evening Dress',
    type: 'dress',
    category: 'dresses',
    imageUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="180" height="350" xmlns="http://www.w3.org/2000/svg">
        <rect width="180" height="120" x="0" y="30" fill="#DC143C" stroke="#b91c3c" stroke-width="2" rx="20"/>
        <ellipse cx="90" cy="40" rx="25" ry="12" fill="none" stroke="#b91c3c" stroke-width="2"/>
        <rect width="35" height="40" x="0" y="30" fill="#DC143C" stroke="#b91c3c" stroke-width="2" rx="10"/>
        <rect width="35" height="40" x="145" y="30" fill="#DC143C" stroke="#b91c3c" stroke-width="2" rx="10"/>
        <polygon points="20,150 160,150 180,320 0,320" fill="#DC143C" stroke="#b91c3c" stroke-width="2"/>
      </svg>
    `),
    color: '#DC143C',
    price: 129.99,
    description: 'Elegant red evening dress',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    material: 'Silk Blend',
    brand: 'Elegance'
  },

  {
    id: 'pants-001',
    name: 'Blue Jeans',
    type: 'jeans',
    category: 'bottoms',
    imageUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="160" height="280" xmlns="http://www.w3.org/2000/svg">
        <rect width="160" height="280" x="0" y="0" fill="#4169E1" stroke="#2c4aa6" stroke-width="2" rx="10"/>
        <rect width="75" height="280" x="5" y="0" fill="#4169E1" stroke="#2c4aa6" stroke-width="1"/>
        <rect width="75" height="280" x="80" y="0" fill="#4169E1" stroke="#2c4aa6" stroke-width="1"/>
        <rect width="120" height="3" x="20" y="40" fill="#2c4aa6"/>
        <rect width="120" height="3" x="20" y="60" fill="#2c4aa6"/>
        <circle cx="40" cy="30" r="6" fill="#2c4aa6"/>
        <circle cx="120" cy="30" r="6" fill="#2c4aa6"/>
      </svg>
    `),
    color: '#4169E1',
    price: 79.99,
    description: 'Classic blue denim jeans',
    sizes: ['26', '28', '30', '32', '34', '36'],
    material: 'Denim',
    brand: 'ClassicJeans'
  },
  {
    id: 'skirt-001',
    name: 'Black Mini Skirt',
    type: 'skirt',
    category: 'bottoms',
    imageUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="140" height="120" xmlns="http://www.w3.org/2000/svg">
        <polygon points="10,0 130,0 140,100 0,100" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
        <rect width="120" height="8" x="10" y="0" fill="#333"/>
      </svg>
    `),
    color: '#1a1a1a',
    price: 45.99,
    description: 'Stylish black mini skirt',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    material: 'Polyester',
    brand: 'ModernStyle'
  },

  {
    id: 'hat-001',
    name: 'Black Beanie',
    type: 'hat',
    category: 'accessories',
    imageUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="40" rx="50" ry="35" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
        <rect width="100" height="15" x="10" y="55" fill="#1a1a1a" stroke="#333" stroke-width="2" rx="7"/>
      </svg>
    `),
    color: '#1a1a1a',
    price: 24.99,
    description: 'Warm winter beanie',
    sizes: ['One Size'],
    material: 'Wool Blend',
    brand: 'WinterWear'
  },
  {
    id: 'glasses-001',
    name: 'Aviator Sunglasses',
    type: 'glasses',
    category: 'accessories',
    imageUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="20" r="18" fill="#333" stroke="#000" stroke-width="2"/>
        <circle cx="90" cy="20" r="18" fill="#333" stroke="#000" stroke-width="2"/>
        <rect width="20" height="3" x="50" y="18" fill="#000" rx="1"/>
        <rect width="15" height="2" x="5" y="19" fill="#000" rx="1"/>
        <rect width="15" height="2" x="100" y="19" fill="#000" rx="1"/>
      </svg>
    `),
    color: '#333333',
    price: 149.99,
    description: 'Classic aviator sunglasses',
    sizes: ['One Size'],
    material: 'Metal Frame',
    brand: 'SunStyle'
  },
  {
    id: 'shoes-001',
    name: 'White Sneakers',
    type: 'shoes',
    category: 'accessories',
    imageUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg width="120" height="60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="40" rx="55" ry="18" fill="#ffffff" stroke="#e0e0e0" stroke-width="2"/>
        <ellipse cx="60" cy="30" rx="50" ry="15" fill="#ffffff" stroke="#e0e0e0" stroke-width="2"/>
        <rect width="80" height="5" x="20" y="27" fill="#e0e0e0" rx="2"/>
        <circle cx="25" cy="35" r="3" fill="#e0e0e0"/>
        <circle cx="35" cy="35" r="3" fill="#e0e0e0"/>
        <circle cx="45" cy="35" r="3" fill="#e0e0e0"/>
      </svg>
    `),
    color: '#ffffff',
    price: 99.99,
    description: 'Comfortable white athletic sneakers',
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    material: 'Synthetic',
    brand: 'SportWear'
  }
];

export const clothingConfigurations = {
  shirt: {
    anchorPoints: ['leftShoulder', 'rightShoulder', 'waist'],
    defaultScale: 1.0,
    positioning: {
      necklineOffset: -15,
      shoulderPadding: 1.1,
      lengthRatio: 0.6
    }
  },
  hoodie: {
    anchorPoints: ['leftShoulder', 'rightShoulder', 'waist'],
    defaultScale: 1.1,
    positioning: {
      necklineOffset: -10,
      shoulderPadding: 1.2,
      lengthRatio: 0.65
    }
  },
  jacket: {
    anchorPoints: ['leftShoulder', 'rightShoulder', 'waist'],
    defaultScale: 1.15,
    positioning: {
      necklineOffset: -5,
      shoulderPadding: 1.25,
      lengthRatio: 0.7
    }
  },
  dress: {
    anchorPoints: ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'],
    defaultScale: 1.0,
    positioning: {
      necklineOffset: -20,
      shoulderPadding: 1.1,
      lengthRatio: 1.2
    }
  },
  jeans: {
    anchorPoints: ['leftHip', 'rightHip', 'leftKnee', 'rightKnee'],
    defaultScale: 1.0,
    positioning: {
      waistOffset: 10,
      hipPadding: 1.1,
      lengthRatio: 1.5
    }
  },
  skirt: {
    anchorPoints: ['leftHip', 'rightHip'],
    defaultScale: 1.0,
    positioning: {
      waistOffset: 0,
      hipPadding: 1.15,
      lengthRatio: 0.4
    }
  },
  hat: {
    anchorPoints: ['nose', 'leftEar', 'rightEar'],
    defaultScale: 1.0,
    positioning: {
      headOffset: -20,
      sizeRatio: 1.2
    }
  },
  glasses: {
    anchorPoints: ['nose', 'leftEar', 'rightEar'],
    defaultScale: 1.0,
    positioning: {
      noseOffset: 0,
      templeSpacing: 1.0
    }
  },
  shoes: {
    anchorPoints: ['leftAnkle', 'rightAnkle'],
    defaultScale: 1.0,
    positioning: {
      ankleOffset: 10,
      footSpacing: 1.1
    }
  }
};

export const bodyMeasurements = {
  shoulder: {
    small: { min: 35, max: 40 },
    medium: { min: 40, max: 45 },
    large: { min: 45, max: 50 },
    xlarge: { min: 50, max: 55 }
  },
  chest: {
    small: { min: 80, max: 90 },
    medium: { min: 90, max: 100 },
    large: { min: 100, max: 110 },
    xlarge: { min: 110, max: 120 }
  },
  waist: {
    small: { min: 60, max: 70 },
    medium: { min: 70, max: 80 },
    large: { min: 80, max: 90 },
    xlarge: { min: 90, max: 100 }
  },
  hip: {
    small: { min: 85, max: 95 },
    medium: { min: 95, max: 105 },
    large: { min: 105, max: 115 },
    xlarge: { min: 115, max: 125 }
  }
};

export const poseLandmarkIndices = {

  nose: 0,
  leftEyeInner: 1,
  leftEye: 2,
  leftEyeOuter: 3,
  rightEyeInner: 4,
  rightEye: 5,
  rightEyeOuter: 6,
  leftEar: 7,
  rightEar: 8,
  mouthLeft: 9,
  mouthRight: 10,

  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftPinky: 17,
  rightPinky: 18,
  leftIndex: 19,
  rightIndex: 20,
  leftThumb: 21,
  rightThumb: 22,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftHeel: 29,
  rightHeel: 30,
  leftFootIndex: 31,
  rightFootIndex: 32
};

export const getClothingById = (id) => {
  return sampleClothingItems.find(item => item.id === id);
};

export const getClothingByCategory = (category) => {
  return sampleClothingItems.filter(item => item.category === category);
};

export const getClothingByType = (type) => {
  return sampleClothingItems.filter(item => item.type === type);
};

export const getClothingConfiguration = (type) => {
  return clothingConfigurations[type] || clothingConfigurations.shirt;
};

export const estimateSize = (measurements) => {
  const { shoulder, chest, waist, hip } = measurements;

  if (chest < 90) return 'small';
  if (chest < 100) return 'medium';
  if (chest < 110) return 'large';
  return 'xlarge';
};

export default {
  sampleClothingItems,
  clothingConfigurations,
  bodyMeasurements,
  poseLandmarkIndices,
  getClothingByCategory,
  getClothingByType,
  getClothingById,
  getClothingConfiguration,
  estimateSize
};