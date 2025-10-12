// 🌈 QUANTUM COLOR PALETTE GENERATOR WITH PSYCHOLOGICAL COLOR THEORY
// Features: AI Color Harmonics, Emotion-Based Palettes, Quantum Color Entanglement

// 🎨 QUANTUM COLOR THEORY ENGINE
export class QuantumColorGenerator {
  constructor() {
    this.quantumColorSpace = this.initializeQuantumColorSpace();
    this.psychologicalMappings = this.initializePsychologicalMappings();
    this.colorHarmonics = this.initializeColorHarmonics();
  }

  // 🌌 Initialize Quantum Color Space with Multi-dimensional Properties
  initializeQuantumColorSpace() {
    return {
      // Primary quantum color dimensions
      dimensions: {
        hue: { min: 0, max: 360, quantum_states: 12 },
        saturation: { min: 0, max: 100, quantum_states: 10 },
        lightness: { min: 0, max: 100, quantum_states: 10 },
        temperature: { min: 1000, max: 10000, quantum_states: 8 }, // Color temperature in Kelvin
        vibration: { min: 0, max: 1, quantum_states: 5 } // Quantum vibrational frequency
      },

      // Quantum color entanglement matrix
      entanglements: {
        complementary: { angle: 180, harmony: 0.95, energy: 'high' },
        analogous: { angle: 30, harmony: 0.85, energy: 'calm' },
        triadic: { angle: 120, harmony: 0.80, energy: 'balanced' },
        split_complementary: { angle: 150, harmony: 0.78, energy: 'dynamic' },
        tetradic: { angle: 90, harmony: 0.75, energy: 'complex' }
      },

      // Quantum superposition states for colors
      superpositions: new Map(),
      
      // Color wave functions
      waveFunctions: {
        frequency: (hue) => Math.sin((hue * Math.PI) / 180),
        amplitude: (saturation) => saturation / 100,
        phase: (lightness) => (lightness * Math.PI) / 100
      }
    };
  }

  // 🧠 Psychological Color Theory Mappings
  initializePsychologicalMappings() {
    return {
      emotions: {
        confidence: {
          primary: ['#FF6B35', '#F7931E', '#C41E3A'], // Bold oranges and reds
          secondary: ['#2C3E50', '#34495E', '#000000'], // Deep grays and black
          accent: ['#FFD700', '#FFA500', '#DC143C'],
          energy: 'high',
          temperature: 'warm'
        },
        
        creativity: {
          primary: ['#9B59B6', '#E74C3C', '#F39C12'], // Purple, red, orange
          secondary: ['#1ABC9C', '#3498DB', '#E67E22'], // Teal, blue, orange
          accent: ['#FF69B4', '#00CED1', '#FFD700'],
          energy: 'dynamic',
          temperature: 'mixed'
        },
        
        sophistication: {
          primary: ['#2C3E50', '#34495E', '#95A5A6'], // Deep grays
          secondary: ['#ECF0F1', '#BDC3C7', '#FFFFFF'], // Light grays and white
          accent: ['#F1C40F', '#E74C3C', '#9B59B6'],
          energy: 'refined',
          temperature: 'neutral'
        },
        
        romance: {
          primary: ['#FF69B4', '#FFB6C1', '#FFC0CB'], // Pinks
          secondary: ['#DDA0DD', '#E6E6FA', '#F0E68C'], // Lavenders and soft yellow
          accent: ['#DC143C', '#FF1493', '#C71585'],
          energy: 'soft',
          temperature: 'warm'
        },
        
        adventure: {
          primary: ['#FF4500', '#FF6347', '#32CD32'], // Oranges and greens
          secondary: ['#00CED1', '#4169E1', '#FFD700'], // Cyans, blues, gold
          accent: ['#FF0000', '#00FF00', '#0000FF'],
          energy: 'intense',
          temperature: 'vibrant'
        },
        
        tranquility: {
          primary: ['#87CEEB', '#B0E0E6', '#E0FFFF'], // Light blues
          secondary: ['#F0F8FF', '#F5FFFA', '#FFFAFA'], // Very light tones
          accent: ['#98FB98', '#AFEEEE', '#E6E6FA'],
          energy: 'calm',
          temperature: 'cool'
        }
      },

      // Chakra-based color psychology
      chakras: {
        root: { color: '#FF0000', emotion: 'grounding', energy: 'stability' },
        sacral: { color: '#FF7F00', emotion: 'creativity', energy: 'passion' },
        solar: { color: '#FFFF00', emotion: 'confidence', energy: 'power' },
        heart: { color: '#00FF00', emotion: 'love', energy: 'compassion' },
        throat: { color: '#0080FF', emotion: 'communication', energy: 'expression' },
        third_eye: { color: '#4B0082', emotion: 'intuition', energy: 'wisdom' },
        crown: { color: '#8B00FF', emotion: 'spirituality', energy: 'transcendence' }
      },

      // Brand personality color associations
      brandPersonalities: {
        luxury: {
          colors: ['#000000', '#FFFFFF', '#FFD700', '#C0C0C0'],
          psychology: 'exclusivity, premium, sophistication'
        },
        innovative: {
          colors: ['#00FFFF', '#FF00FF', '#00FF00', '#FFFF00'],
          psychology: 'cutting-edge, futuristic, dynamic'
        },
        trustworthy: {
          colors: ['#0066CC', '#003366', '#336699', '#6699CC'],
          psychology: 'reliability, stability, professionalism'
        },
        eco_friendly: {
          colors: ['#228B22', '#32CD32', '#90EE90', '#8FBC8F'],
          psychology: 'natural, sustainable, healthy'
        }
      }
    };
  }

  // 🎼 Color Harmonics and Resonance Patterns
  initializeColorHarmonics() {
    return {
      // Musical harmony applied to colors
      harmonicSeries: {
        fundamental: 1.0,     // Base frequency
        octave: 2.0,         // Double frequency
        fifth: 1.5,          // Perfect fifth
        fourth: 1.333,       // Perfect fourth
        major_third: 1.25,   // Major third
        minor_third: 1.2     // Minor third
      },

      // Fibonacci-based color progressions
      fibonacciRatios: [1, 1, 2, 3, 5, 8, 13, 21],
      
      // Golden ratio color relationships
      goldenRatio: 1.618,
      
      // Quantum interference patterns
      interferencePatterns: {
        constructive: 'harmony_amplification',
        destructive: 'color_cancellation',
        partial: 'subtle_modulation'
      }
    };
  }

  // 🌟 Generate Emotion-Based Color Palette
  generateEmotionPalette(emotion, intensity = 0.8, userPreferences = {}) {
    const emotionData = this.psychologicalMappings.emotions[emotion];
    if (!emotionData) {
      throw new Error(`Unknown emotion: ${emotion}`);
    }

    // Apply quantum color transformations
    const quantumPalette = this.applyQuantumTransformations(emotionData, intensity);
    
    // Personalize based on user preferences
    const personalizedPalette = this.personalizeColorPalette(quantumPalette, userPreferences);
    
    // Generate harmonic variations
    const harmonicVariations = this.generateHarmonicVariations(personalizedPalette);

    return {
      primary: personalizedPalette.primary,
      secondary: personalizedPalette.secondary,
      accent: personalizedPalette.accent,
      
      variations: harmonicVariations,
      
      metadata: {
        emotion,
        intensity,
        energy: emotionData.energy,
        temperature: emotionData.temperature,
        quantumSignature: this.calculateQuantumSignature(personalizedPalette)
      },
      
      applications: this.generateColorApplications(personalizedPalette, emotion)
    };
  }

  // 🔮 Apply Quantum Color Transformations
  applyQuantumTransformations(emotionData, intensity) {
    return {
      primary: emotionData.primary.map(color => 
        this.quantumColorShift(color, intensity, 'enhancement')
      ),
      secondary: emotionData.secondary.map(color => 
        this.quantumColorShift(color, intensity * 0.7, 'support')
      ),
      accent: emotionData.accent.map(color => 
        this.quantumColorShift(color, intensity * 1.2, 'highlight')
      )
    };
  }

  // ⚛️ Quantum Color Shift Algorithm
  quantumColorShift(hexColor, intensity, purpose) {
    const rgb = this.hexToRgb(hexColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Apply quantum transformations based on purpose
    let transformedHsl = { ...hsl };
    
    switch (purpose) {
      case 'enhancement':
        transformedHsl.s = Math.min(100, hsl.s + (intensity * 20));
        transformedHsl.l = Math.max(10, Math.min(90, hsl.l + (intensity * 10 - 5)));
        break;
        
      case 'support':
        transformedHsl.s = Math.max(10, hsl.s - (intensity * 15));
        transformedHsl.l = Math.min(95, hsl.l + (intensity * 15));
        break;
        
      case 'highlight':
        transformedHsl.s = Math.min(100, hsl.s + (intensity * 30));
        transformedHsl.l = Math.max(5, Math.min(95, hsl.l - (intensity * 5)));
        break;
    }
    
    // Apply quantum vibrational frequency
    const quantumFreq = Math.sin(intensity * Math.PI);
    transformedHsl.h = (transformedHsl.h + (quantumFreq * 5)) % 360;
    
    const transformedRgb = this.hslToRgb(transformedHsl.h, transformedHsl.s, transformedHsl.l);
    return this.rgbToHex(transformedRgb.r, transformedRgb.g, transformedRgb.b);
  }

  // 👤 Personalize Color Palette Based on User Preferences
  personalizeColorPalette(palette, userPreferences) {
    const personalizedPalette = JSON.parse(JSON.stringify(palette));
    
    // Apply user color DNA
    if (userPreferences.colorDNA) {
      const dna = userPreferences.colorDNA;
      
      // Shift towards warm or cool based on preferences
      if (dna.warmTones > dna.coolTones) {
        personalizedPalette.primary = personalizedPalette.primary.map(color => 
          this.shiftColorTemperature(color, 'warm', dna.warmTones - dna.coolTones)
        );
      } else if (dna.coolTones > dna.warmTones) {
        personalizedPalette.primary = personalizedPalette.primary.map(color => 
          this.shiftColorTemperature(color, 'cool', dna.coolTones - dna.warmTones)
        );
      }
      
      // Apply brightness preferences
      if (dna.brights > 0.7) {
        personalizedPalette.accent = personalizedPalette.accent.map(color => 
          this.adjustBrightness(color, 1.2)
        );
      }
      
      // Apply neutral preferences
      if (dna.neutrals > 0.7) {
        personalizedPalette.secondary = personalizedPalette.secondary.map(color => 
          this.neutralizeColor(color, dna.neutrals)
        );
      }
    }
    
    return personalizedPalette;
  }

  // 🎵 Generate Harmonic Color Variations
  generateHarmonicVariations(palette) {
    const variations = {};
    
    // Generate monochromatic variations
    variations.monochromatic = palette.primary.map(color => 
      this.generateMonochromaticSet(color, 5)
    );
    
    // Generate analogous variations
    variations.analogous = palette.primary.map(color => 
      this.generateAnalogousSet(color, 3)
    );
    
    // Generate complementary variations
    variations.complementary = palette.primary.map(color => ({
      base: color,
      complement: this.findComplementaryColor(color)
    }));
    
    // Generate triadic variations
    variations.triadic = palette.primary.map(color => 
      this.generateTriadicSet(color)
    );
    
    return variations;
  }

  // 🎨 Generate Color Applications for UI Components
  generateColorApplications(palette, emotion) {
    return {
      backgrounds: {
        primary: palette.primary[0],
        secondary: palette.secondary[0],
        accent: this.addOpacity(palette.accent[0], 0.1)
      },
      
      text: {
        primary: this.getOptimalTextColor(palette.primary[0]),
        secondary: this.getOptimalTextColor(palette.secondary[0]),
        accent: palette.accent[0]
      },
      
      buttons: {
        primary: {
          background: palette.primary[0],
          text: this.getOptimalTextColor(palette.primary[0]),
          hover: this.adjustBrightness(palette.primary[0], 1.1),
          focus: palette.accent[0]
        },
        secondary: {
          background: palette.secondary[0],
          text: this.getOptimalTextColor(palette.secondary[0]),
          hover: this.adjustBrightness(palette.secondary[0], 1.1),
          focus: palette.accent[1] || palette.accent[0]
        }
      },
      
      gradients: {
        hero: `linear-gradient(135deg, ${palette.primary[0]}, ${palette.accent[0]})`,
        card: `linear-gradient(145deg, ${palette.secondary[0]}, ${this.addOpacity(palette.primary[0], 0.1)})`,
        button: `linear-gradient(90deg, ${palette.primary[0]}, ${palette.primary[1] || palette.accent[0]})`
      },
      
      shadows: {
        soft: `0 4px 20px ${this.addOpacity(palette.primary[0], 0.15)}`,
        medium: `0 8px 30px ${this.addOpacity(palette.primary[0], 0.25)}`,
        strong: `0 12px 40px ${this.addOpacity(palette.primary[0], 0.35)}`
      },
      
      borders: {
        subtle: this.addOpacity(palette.secondary[0], 0.2),
        medium: this.addOpacity(palette.primary[0], 0.3),
        accent: palette.accent[0]
      }
    };
  }

  // 🧮 Calculate Quantum Color Signature
  calculateQuantumSignature(palette) {
    const allColors = [...palette.primary, ...palette.secondary, ...palette.accent];
    
    let signature = 0;
    allColors.forEach(color => {
      const rgb = this.hexToRgb(color);
      const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      
      // Calculate quantum values
      signature += Math.sin(hsl.h * Math.PI / 180) * hsl.s * hsl.l;
    });
    
    return Math.abs(signature) % 1000;
  }

  // 🌡️ Color Utility Methods
  shiftColorTemperature(hexColor, direction, intensity) {
    const rgb = this.hexToRgb(hexColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    if (direction === 'warm') {
      hsl.h = (hsl.h + (intensity * 15)) % 360;
    } else {
      hsl.h = (hsl.h - (intensity * 15) + 360) % 360;
    }
    
    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  adjustBrightness(hexColor, factor) {
    const rgb = this.hexToRgb(hexColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    hsl.l = Math.max(0, Math.min(100, hsl.l * factor));
    
    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  neutralizeColor(hexColor, intensity) {
    const rgb = this.hexToRgb(hexColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    hsl.s = Math.max(0, hsl.s * (1 - intensity * 0.5));
    
    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  addOpacity(hexColor, opacity) {
    const rgb = this.hexToRgb(hexColor);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }

  getOptimalTextColor(backgroundColor) {
    const rgb = this.hexToRgb(backgroundColor);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }

  // Color space conversion utilities
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }

  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
  }

  // Color harmony generation methods
  generateMonochromaticSet(baseColor, count) {
    const rgb = this.hexToRgb(baseColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const variations = [];
    for (let i = 0; i < count; i++) {
      const newL = Math.max(10, Math.min(90, hsl.l + (i - count/2) * 15));
      const newRgb = this.hslToRgb(hsl.h, hsl.s, newL);
      variations.push(this.rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }
    
    return variations;
  }

  generateAnalogousSet(baseColor, count) {
    const rgb = this.hexToRgb(baseColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const variations = [];
    for (let i = 0; i < count; i++) {
      const newH = (hsl.h + (i - count/2) * 30 + 360) % 360;
      const newRgb = this.hslToRgb(newH, hsl.s, hsl.l);
      variations.push(this.rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }
    
    return variations;
  }

  generateTriadicSet(baseColor) {
    const rgb = this.hexToRgb(baseColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const triadic = [];
    for (let i = 0; i < 3; i++) {
      const newH = (hsl.h + i * 120) % 360;
      const newRgb = this.hslToRgb(newH, hsl.s, hsl.l);
      triadic.push(this.rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }
    
    return triadic;
  }

  findComplementaryColor(baseColor) {
    const rgb = this.hexToRgb(baseColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const complementaryH = (hsl.h + 180) % 360;
    const complementaryRgb = this.hslToRgb(complementaryH, hsl.s, hsl.l);
    
    return this.rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
  }
}

// 🌈 Pre-defined Quantum Color Palettes for Different Moods and Occasions
export const QuantumPalettes = {
  cyberpunk: {
    primary: ['#FF006E', '#8338EC', '#3A86FF'],
    secondary: ['#000000', '#1A1A1A', '#333333'],
    accent: ['#00F5FF', '#FF073A', '#FFBE0B']
  },
  
  neon_future: {
    primary: ['#39FF14', '#FF073A', '#00BFFF'],
    secondary: ['#0A0A0A', '#1E1E1E', '#2A2A2A'],
    accent: ['#FFFF00', '#FF1493', '#00FFFF']
  },
  
  holographic: {
    primary: ['#FF69B4', '#9370DB', '#00CED1'],
    secondary: ['#F0F8FF', '#E6E6FA', '#F5F5DC'],
    accent: ['#FFD700', '#FF4500', '#32CD32']
  },
  
  quantum_minimal: {
    primary: ['#FFFFFF', '#F8F9FA', '#E9ECEF'],
    secondary: ['#6C757D', '#495057', '#343A40'],
    accent: ['#007BFF', '#28A745', '#FFC107']
  }
};

// Export the generator
export const quantumColorGenerator = new QuantumColorGenerator();