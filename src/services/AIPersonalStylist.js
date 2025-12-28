import { NeuralOutfitEngine } from '../ai/outfitEngine';
import { calculateOutfitScore } from '../ai/outfitRecommendations';
import apiService from './apiService';
export class AIPersonalStylist {
  constructor() {
    this.neuralEngine = new NeuralOutfitEngine();
    this.personality = {
      name: 'Aria',
      style: 'trendy-professional',
      tone: 'friendly-expert',
      specialties: ['color-theory', 'body-types', 'occasion-styling', 'sustainable-fashion']
    };
    this.conversationHistory = [];
    this.userStyleDNA = null;
  }
  async analyzeUserStyleDNA(userId, pastOutfits = []) {
    try {
      const history = pastOutfits.length > 0 
        ? pastOutfits 
        : await this.fetchUserOutfitHistory(userId);
      const styleDNA = {
        dominantStyles: this.extractDominantStyles(history),
        favoriteColors: this.extractColorPreferences(history),
        preferredCategories: this.extractCategoryPreferences(history),
        styleEvolution: this.analyzeStyleEvolution(history),
        confidenceLevel: this.calculateConfidence(history),
        fashionPersonality: this.determineFashionPersonality(history),
        adventurousnessScore: this.calculateAdventurousness(history),
        sustainabilityIndex: this.calculateSustainabilityScore(history)
      };
      this.userStyleDNA = styleDNA;
      return styleDNA;
    } catch (error) {
      console.error('Error analyzing style DNA:', error);
      return null;
    }
  }
  async chat(userMessage, context = {}) {
    this.conversationHistory.push({
      role: 'user',
      message: userMessage,
      timestamp: Date.now()
    });
    const response = await this.generateResponse(userMessage, context);
    this.conversationHistory.push({
      role: 'assistant',
      message: response,
      timestamp: Date.now()
    });
    return response;
  }
  async generateResponse(userMessage, context) {
    const intent = this.detectIntent(userMessage);
    switch (intent) {
      case 'outfit_advice':
        return this.provideOutfitAdvice(context);
      case 'color_suggestion':
        return this.suggestColors(context);
      case 'occasion_help':
        return this.helpWithOccasion(userMessage, context);
      case 'style_critique':
        return this.critiqueCurrentOutfit(context);
      case 'trend_inquiry':
        return this.discussTrends(userMessage);
      case 'body_type_advice':
        return this.provideBodyTypeAdvice(context);
      case 'shopping_help':
        return this.helpWithShopping(context);
      default:
        return this.provideGeneralAdvice(userMessage, context);
    }
  }
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.match(/what (should|can) i wear|outfit (for|suggestion)/)) {
      return 'outfit_advice';
    }
    if (lowerMessage.match(/color|match|complement/)) {
      return 'color_suggestion';
    }
    if (lowerMessage.match(/occasion|event|meeting|party|date|wedding/)) {
      return 'occasion_help';
    }
    if (lowerMessage.match(/how (does|do) (this|it) look|rate|score|critique/)) {
      return 'style_critique';
    }
    if (lowerMessage.match(/trend|fashionable|in style|popular/)) {
      return 'trend_inquiry';
    }
    if (lowerMessage.match(/body type|shape|fit|flattering/)) {
      return 'body_type_advice';
    }
    if (lowerMessage.match(/buy|shop|where|find|purchase/)) {
      return 'shopping_help';
    }
    return 'general';
  }
  async provideOutfitAdvice(context) {
    const { currentOutfit, occasion, weather, bodyType } = context;
    let advice = `Hey! I'm Aria, your personal stylist. `;
    if (!currentOutfit || currentOutfit.length === 0) {
      advice += `Let's build an amazing outfit together! `;
      if (occasion) {
        advice += `For ${occasion}, I'd recommend starting with `;
        const starter = this.suggestStarterPiece(occasion);
        advice += `${starter.suggestion}. ${starter.reason}`;
      } else {
        advice += `What's the occasion? That'll help me give you perfect recommendations!`;
      }
    } else {
      const score = calculateOutfitScore(currentOutfit);
      advice += `Your current outfit scores ${score.score}/100! `;
      if (score.score >= 80) {
        advice += `Looking fabulous! 🔥 `;
      } else if (score.score >= 60) {
        advice += `Good start! Here's how to elevate it: `;
      } else {
        advice += `Let's make some improvements: `;
      }
      advice += score.suggestions.slice(0, 2).join(' ') + ' ';
    }
    return advice;
  }
  suggestColors(context) {
    const { currentOutfit } = context;
    if (!currentOutfit || currentOutfit.length === 0) {
      return `Start with a base color you love! Navy, black, and beige are timeless foundations. Or go bold with jewel tones like emerald or burgundy! What's your vibe today?`;
    }
    const dominantColors = this.extractDominantColors(currentOutfit);
    const suggestions = this.neuralEngine.analyzeColorHarmony(currentOutfit);
    let response = `Based on your ${dominantColors.join(' and ')} pieces, `;
    if (suggestions.colorRelationships.includes('complementary')) {
      response += `complementary colors would create stunning contrast! `;
    } else if (suggestions.colorRelationships.includes('analogous')) {
      response += `analogous colors would create a harmonious flow! `;
    }
    response += `Try adding ${suggestions.recommendedAdjustments.join(' or ')}. `;
    response += `This would give you a ${suggestions.psychologicalImpact.mood} vibe! 💫`;
    return response;
  }
  helpWithOccasion(message, context) {
    const occasion = this.extractOccasion(message);
    const occasionGuide = {
      'business meeting': {
        formality: 'high',
        mustHaves: ['blazer', 'dress shirt', 'tailored pants'],
        avoid: ['casual wear', 'bright colors', 'excessive accessories'],
        colorPalette: ['navy', 'charcoal', 'white', 'light blue'],
        tips: 'Confidence is key! Go for tailored fits and minimal jewelry.'
      },
      'date night': {
        formality: 'medium',
        mustHaves: ['statement piece', 'flattering fit'],
        avoid: ['overdressing', 'uncomfortable clothes'],
        colorPalette: ['romantic hues', 'jewel tones', 'classic black'],
        tips: 'Be yourself but elevated! Choose something that makes you feel confident and comfortable.'
      },
      'wedding': {
        formality: 'high',
        mustHaves: ['elegant dress or suit', 'formal shoes'],
        avoid: ['white (unless you\'re the bride!)', 'casual denim', 'flip flops'],
        colorPalette: ['pastels', 'jewel tones', 'metallics'],
        tips: 'Check the dress code! When in doubt, go slightly more formal.'
      },
      'casual hangout': {
        formality: 'low',
        mustHaves: ['comfortable basics', 'stylish sneakers'],
        avoid: ['formal wear', 'uncomfortable shoes'],
        colorPalette: ['relaxed neutrals', 'denim', 'fun prints'],
        tips: 'Comfort meets style! Jeans + nice top = perfect casual chic.'
      },
      'job interview': {
        formality: 'high',
        mustHaves: ['professional suit or blazer', 'polished shoes'],
        avoid: ['revealing clothes', 'loud patterns', 'casual wear'],
        colorPalette: ['navy', 'black', 'grey', 'white'],
        tips: 'Dress for the job you want! Conservative and professional wins.'
      }
    };
    const guide = occasionGuide[occasion] || occasionGuide['casual hangout'];
    return `Perfect! For ${occasion}, here's my expert advice:\n\n` +
           `✨ Must-haves: ${guide.mustHaves.join(', ')}\n` +
           `❌ Avoid: ${guide.avoid.join(', ')}\n` +
           `🎨 Color palette: ${guide.colorPalette.join(', ')}\n\n` +
           `💡 Pro tip: ${guide.tips}`;
  }
  critiqueCurrentOutfit(context) {
    const { currentOutfit, bodyType } = context;
    if (!currentOutfit || currentOutfit.length === 0) {
      return `I'd love to critique your outfit! Put something together and show me! 😊`;
    }
    const score = calculateOutfitScore(currentOutfit);
    const neuralAnalysis = this.neuralEngine.analyzeColorHarmony(currentOutfit);
    let critique = `Let me give you my honest professional opinion! ⭐\n\n`;
    critique += `Overall Score: ${score.score}/100\n\n`;
    critique += `What's Working:\n`;
    if (score.breakdown.colorHarmony > 70) {
      critique += `✅ Color harmony is on point! Your colors work beautifully together.\n`;
    }
    if (score.breakdown.styleCoherence > 70) {
      critique += `✅ Style coherence is great! Everything flows well.\n`;
    }
    critique += `\nWhat Could Be Better:\n`;
    score.suggestions.forEach(suggestion => {
      critique += `💡 ${suggestion}\n`;
    });
    if (bodyType) {
      critique += `\n👤 For your ${bodyType} body type, ${this.getBodyTypeSpecificAdvice(bodyType, currentOutfit)}`;
    }
    return critique;
  }
  discussTrends(message) {
    const currentTrends = {
      '2024': {
        colors: ['Peach Fuzz (Pantone)', 'Digital Lavender', 'Rich Burgundy'],
        styles: ['Quiet Luxury', 'Dopamine Dressing', 'Elevated Basics'],
        patterns: ['Micro-florals', 'Abstract prints', 'Tonal stripes'],
        sustainability: 'Vintage and upcycled fashion is bigger than ever!'
      }
    };
    const trends = currentTrends['2024'];
    return `Here's what's hot in fashion right now! 🔥\n\n` +
           `🎨 Trending Colors: ${trends.colors.join(', ')}\n` +
           `👗 Style Movements: ${trends.styles.join(', ')}\n` +
           `📐 Popular Patterns: ${trends.patterns.join(', ')}\n\n` +
           `🌱 Sustainability Note: ${trends.sustainability}\n\n` +
           `But remember - true style is timeless! Wear what makes YOU feel amazing! 💫`;
  }
  provideBodyTypeAdvice(context) {
    const { bodyType, currentOutfit } = context;
    if (!bodyType) {
      return `Let me analyze your body type first! Upload a photo and I'll give you personalized advice. Every body is beautiful, and I'm here to help you dress YOUR best! 💕`;
    }
    const bodyTypeGuides = {
      'hourglass': {
        strengths: 'Balanced proportions, defined waist',
        highlight: 'Embrace your curves! Fitted and wrap styles are your best friends.',
        recommendations: ['Wrap dresses', 'Belted outfits', 'V-necks', 'High-waisted bottoms']
      },
      'pear': {
        strengths: 'Lovely curves, defined waist',
        highlight: 'Balance your silhouette by highlighting your upper body.',
        recommendations: ['Boat necks', 'Statement tops', 'A-line skirts', 'Dark-colored bottoms']
      },
      'apple': {
        strengths: 'Great legs, beautiful shoulders',
        highlight: 'Show off those legs and elongate your torso!',
        recommendations: ['V-necks', 'Empire waist', 'Structured jackets', 'Bootcut pants']
      },
      'rectangle': {
        strengths: 'Athletic build, straight silhouette',
        highlight: 'Create curves and definition with strategic styling.',
        recommendations: ['Peplum tops', 'Ruffles', 'Layering', 'Colorblocking']
      },
      'inverted triangle': {
        strengths: 'Strong shoulders, slim hips',
        highlight: 'Balance your proportions by adding volume below.',
        recommendations: ['A-line skirts', 'Wide-leg pants', 'Delicate necklines', 'Detailed bottoms']
      }
    };
    const guide = bodyTypeGuides[bodyType.toLowerCase()] || bodyTypeGuides['rectangle'];
    return `You have a ${bodyType} body shape! Here's how to dress it beautifully:\n\n` +
           `✨ Your Strengths: ${guide.strengths}\n` +
           `🎯 Styling Focus: ${guide.highlight}\n\n` +
           `Perfect For You:\n${guide.recommendations.map(r => `• ${r}`).join('\n')}\n\n` +
           `Remember: These are guidelines, not rules! The best outfit is one that makes you feel confident! 💪`;
  }
  helpWithShopping(context) {
    const { currentOutfit, userStyleDNA } = context;
    let response = `Let's build your perfect wardrobe! 🛍️\n\n`;
    if (userStyleDNA) {
      response += `Based on your style DNA, you love ${userStyleDNA.dominantStyles.join(' and ')} looks. `;
    }
    response += `\nEssentials Every Wardrobe Needs:\n`;
    response += `• White button-down shirt (so versatile!)\n`;
    response += `• Well-fitted jeans in dark wash\n`;
    response += `• Black blazer (dress up or down)\n`;
    response += `• Little black dress\n`;
    response += `• Neutral ankle boots\n`;
    response += `• Quality white sneakers\n`;
    response += `• Statement accessory piece\n\n`;
    response += `💡 Shopping Tips:\n`;
    response += `• Invest in quality basics, have fun with trends\n`;
    response += `• Try before you buy - fit is everything!\n`;
    response += `• Build a cohesive color palette\n`;
    response += `• Consider cost-per-wear for big purchases\n\n`;
    response += `Want me to suggest specific items based on what you already have? Show me your current outfit! 👗`;
    return response;
  }
  provideGeneralAdvice(message, context) {
    const responses = [
      `Fashion is about expressing yourself! What's your mood today? Let's find the perfect outfit to match it! 😊`,
      `The best accessory you can wear is confidence! But I'm here to help with the outfit part 💫`,
      `Style tip: When in doubt, go with what makes YOU feel amazing. That's the real secret to looking good! ✨`,
      `Fashion rules are meant to be broken, but let me give you the rules first so you can break them intentionally! 😉`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  suggestStarterPiece(occasion) {
    const starters = {
      'business': {
        suggestion: 'a structured blazer in navy or charcoal',
        reason: 'It instantly elevates any look and screams professionalism!'
      },
      'casual': {
        suggestion: 'your favorite jeans and a stylish top',
        reason: 'Comfort meets chic - the perfect casual foundation!'
      },
      'party': {
        suggestion: 'a statement dress or bold top',
        reason: 'Make an entrance! Party outfits should be fun and eye-catching!'
      },
      'date': {
        suggestion: 'something that makes you feel confident and attractive',
        reason: 'Confidence is the sexiest thing you can wear!'
      }
    };
    return starters[occasion] || starters['casual'];
  }
  extractDominantColors(outfit) {
    const colors = outfit.map(item => 
      item.color || item.primaryColor || 'neutral'
    );
    return [...new Set(colors)];
  }
  extractOccasion(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('business') || lowerMessage.includes('meeting') || lowerMessage.includes('office')) {
      return 'business meeting';
    }
    if (lowerMessage.includes('date')) {
      return 'date night';
    }
    if (lowerMessage.includes('wedding')) {
      return 'wedding';
    }
    if (lowerMessage.includes('interview')) {
      return 'job interview';
    }
    return 'casual hangout';
  }
  extractDominantStyles(history) {
    const styles = history.flatMap(outfit => 
      outfit.items.map(item => item.style)
    );
    return this.findMostCommon(styles, 3);
  }
  extractColorPreferences(history) {
    const colors = history.flatMap(outfit =>
      outfit.items.map(item => item.color || item.primaryColor)
    );
    return this.findMostCommon(colors, 5);
  }
  extractCategoryPreferences(history) {
    const categories = history.flatMap(outfit =>
      outfit.items.map(item => item.category)
    );
    return this.findMostCommon(categories, 5);
  }
  analyzeStyleEvolution(history) {
    return {
      direction: 'increasingly bold',
      confidence: 0.75
    };
  }
  calculateConfidence(history) {
    return Math.min(history.length / 10, 1);
  }
  determineFashionPersonality(history) {
    return 'Creative Explorer';
  }
  calculateAdventurousness(history) {
    return 0.7;
  }
  calculateSustainabilityScore(history) {
    return 0.6;
  }
  getBodyTypeSpecificAdvice(bodyType, outfit) {
    return `this outfit ${outfit.length > 0 ? 'works well' : 'would be perfect'} for highlighting your best features!`;
  }
  findMostCommon(array, limit) {
    const counts = {};
    array.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item);
  }
  async fetchUserOutfitHistory(userId) {
    try {
      const response = await apiService.get(`/api/looks/user/${userId}`);
      return response.looks || [];
    } catch (error) {
      return [];
    }
  }
}
let stylistInstance = null;
export const getAIStylist = () => {
  if (!stylistInstance) {
    stylistInstance = new AIPersonalStylist();
  }
  return stylistInstance;
};
export default AIPersonalStylist;
