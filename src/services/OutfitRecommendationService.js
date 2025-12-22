

export class OutfitRecommendationService {
  constructor() {
    this.userPreferences = null;
    this.styleRules = this.initializeStyleRules();
  }

  
  initializeStyleRules() {
    return {

      colorHarmony: {
        complementary: ['red-green', 'blue-orange', 'yellow-purple'],
        analogous: ['red-orange', 'blue-green', 'yellow-green'],
        monochromatic: ['same-hue'],
        neutral: ['black', 'white', 'gray', 'beige', 'navy']
      },

      styleCompatibility: {
        casual: ['jeans', 't-shirt', 'sneakers', 'hoodie'],
        formal: ['suit', 'dress-shirt', 'blazer', 'dress-shoes'],
        business: ['blazer', 'trousers', 'button-up', 'loafers'],
        sporty: ['athletic-wear', 'sneakers', 'joggers', 'sports-top'],
        elegant: ['dress', 'heels', 'blouse', 'skirt']
      },

      occasions: {
        work: ['business', 'formal'],
        casual: ['casual', 'sporty'],
        party: ['elegant', 'formal'],
        workout: ['sporty'],
        date: ['elegant', 'casual']
      },

      seasonRules: {
        summer: ['light-colors', 'breathable', 'short-sleeve'],
        winter: ['dark-colors', 'warm', 'long-sleeve', 'layers'],
        spring: ['pastel', 'light-layers'],
        fall: ['earth-tones', 'medium-weight']
      }
    };
  }

  
  setUserPreferences(preferences) {
    this.userPreferences = {
      style: preferences.style || 'casual',
      favoriteColors: preferences.favoriteColors || [],
      bodyType: preferences.bodyType || 'unknown',
      occasion: preferences.occasion || 'casual',
      season: preferences.season || this.getCurrentSeason()
    };
  }

  
  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  
  scoreOutfit(items) {
    if (!items || items.length === 0) {
      return {
        overallScore: 0,
        breakdown: {},
        suggestions: ['Add items to your outfit to get recommendations']
      };
    }

    const scores = {
      colorHarmony: this.scoreColorHarmony(items),
      styleCoherence: this.scoreStyleCoherence(items),
      occasionMatch: this.scoreOccasionMatch(items),
      seasonalFit: this.scoreSeasonalFit(items),
      personalFit: this.scorePersonalFit(items)
    };

    const weights = {
      colorHarmony: 0.25,
      styleCoherence: 0.30,
      occasionMatch: 0.20,
      seasonalFit: 0.15,
      personalFit: 0.10
    };

    const overallScore = Object.entries(scores).reduce((sum, [key, value]) => {
      return sum + (value * weights[key]);
    }, 0);

    const suggestions = this.generateSuggestions(items, scores);
    const recommendations = this.generateRecommendations(items, scores);

    return {
      overallScore: Math.round(overallScore),
      breakdown: scores,
      suggestions,
      recommendations,
      strengths: this.identifyStrengths(scores),
      improvements: this.identifyImprovements(scores)
    };
  }

  
  scoreColorHarmony(items) {
    const colors = items.map(item => this.extractColor(item));
    
    if (colors.length < 2) return 80;

    const neutralCount = colors.filter(c => 
      this.styleRules.colorHarmony.neutral.includes(c)
    ).length;

    if (neutralCount >= colors.length - 1) return 90; // Neutrals always work

    let harmonyScore = 70;
    
    for (let i = 0; i < colors.length - 1; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        if (this.colorsMatch(colors[i], colors[j])) {
          harmonyScore += 10;
        }
      }
    }

    return Math.min(harmonyScore, 100);
  }

  
  extractColor(item) {
    if (item.color) return item.color.toLowerCase();
    if (item.name) {
      const colorWords = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'gray', 'beige', 'navy'];
      for (const color of colorWords) {
        if (item.name.toLowerCase().includes(color)) {
          return color;
        }
      }
    }
    return 'unknown';
  }

  
  colorsMatch(color1, color2) {
    if (color1 === color2) return true;
    if (this.styleRules.colorHarmony.neutral.includes(color1) ||
        this.styleRules.colorHarmony.neutral.includes(color2)) {
      return true;
    }
    
    const complementaryPairs = [
      ['red', 'green'], ['blue', 'orange'], ['yellow', 'purple']
    ];
    
    return complementaryPairs.some(([c1, c2]) =>
      (color1 === c1 && color2 === c2) || (color1 === c2 && color2 === c1)
    );
  }

  
  scoreStyleCoherence(items) {
    const categories = items.map(item => item.category || item.type || 'unknown');

    const styleScores = {};
    
    Object.entries(this.styleRules.styleCompatibility).forEach(([style, keywords]) => {
      styleScores[style] = categories.filter(cat =>
        keywords.some(kw => cat.toLowerCase().includes(kw.toLowerCase()))
      ).length;
    });

    const maxScore = Math.max(...Object.values(styleScores));
    const coherenceRatio = items.length > 0 ? (maxScore / items.length) : 0;

    return Math.round(coherenceRatio * 100);
  }

  
  scoreOccasionMatch(items) {
    if (!this.userPreferences || !this.userPreferences.occasion) {
      return 75; // Neutral score if no preference
    }

    const occasion = this.userPreferences.occasion;
    const matchingStyles = this.styleRules.occasions[occasion] || [];
    
    const categories = items.map(item => item.category || item.type || '');
    const matches = categories.filter(cat =>
      matchingStyles.some(style =>
        cat.toLowerCase().includes(style.toLowerCase())
      )
    ).length;

    return Math.round((matches / items.length) * 100);
  }

  
  scoreSeasonalFit(items) {
    const season = this.userPreferences?.season || this.getCurrentSeason();
    const seasonalKeywords = this.styleRules.seasonRules[season] || [];
    
    let score = 70; // Base score

    items.forEach(item => {
      const itemText = `${item.name} ${item.description || ''}`.toLowerCase();
      if (seasonalKeywords.some(kw => itemText.includes(kw))) {
        score += 10;
      }
    });

    return Math.min(score, 100);
  }

  
  scorePersonalFit(items) {
    if (!this.userPreferences) return 75;

    let score = 60;

    if (this.userPreferences.favoriteColors) {
      items.forEach(item => {
        const color = this.extractColor(item);
        if (this.userPreferences.favoriteColors.includes(color)) {
          score += 15;
        }
      });
    }

    const categories = items.map(item => item.category || '');
    const preferredStyle = this.userPreferences.style || 'casual';
    const matchingKeywords = this.styleRules.styleCompatibility[preferredStyle] || [];
    
    categories.forEach(cat => {
      if (matchingKeywords.some(kw => cat.toLowerCase().includes(kw))) {
        score += 10;
      }
    });

    return Math.min(score, 100);
  }

  
  generateSuggestions(items, scores) {
    const suggestions = [];

    if (scores.colorHarmony < 70) {
      suggestions.push('Try adding neutral colors like black, white, or navy to balance your outfit');
    }

    if (scores.styleCoherence < 70) {
      suggestions.push('Mix pieces from the same style category for better coherence');
    }

    if (scores.occasionMatch < 70) {
      suggestions.push(`Consider more ${this.userPreferences?.occasion || 'appropriate'} pieces for this occasion`);
    }

    if (scores.seasonalFit < 70) {
      suggestions.push(`Choose items more suitable for ${this.userPreferences?.season || 'current'} season`);
    }

    if (suggestions.length === 0) {
      suggestions.push('Great outfit! Your pieces work well together.');
    }

    return suggestions;
  }

  
  generateRecommendations(items, scores) {
    const recommendations = [];

    const hasTop = items.some(item => 
      (item.category || '').toLowerCase().includes('top') ||
      (item.category || '').toLowerCase().includes('shirt')
    );

    const hasBottom = items.some(item =>
      (item.category || '').toLowerCase().includes('bottom') ||
      (item.category || '').toLowerCase().includes('pants') ||
      (item.category || '').toLowerCase().includes('skirt')
    );

    if (!hasTop) {
      recommendations.push({
        type: 'missing-piece',
        category: 'top',
        suggestion: 'Add a top to complete your outfit'
      });
    }

    if (!hasBottom) {
      recommendations.push({
        type: 'missing-piece',
        category: 'bottom',
        suggestion: 'Add bottoms to complete your outfit'
      });
    }

    if (scores.colorHarmony > 80) {
      recommendations.push({
        type: 'strength',
        message: 'Excellent color coordination!'
      });
    }

    return recommendations;
  }

  
  identifyStrengths(scores) {
    return Object.entries(scores)
      .filter(([_, score]) => score >= 80)
      .map(([category, _]) => category);
  }

  
  identifyImprovements(scores) {
    return Object.entries(scores)
      .filter(([_, score]) => score < 70)
      .map(([category, _]) => category);
  }
}

export default OutfitRecommendationService;
