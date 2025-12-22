
import { clothingItems } from '../data/clothingItems';

const styleCompatibility = {
  'shirts': ['pants', 'jackets', 'accessories'],
  'pants': ['shirts', 'jackets', 'footwear', 'accessories'],
  'dresses': ['jackets', 'accessories', 'footwear'],
  'jackets': ['shirts', 'pants', 'dresses', 'footwear'],
  'accessories': ['shirts', 'pants', 'dresses', 'jackets'],
  'footwear': ['pants', 'dresses', 'jackets'],
  'activewear': ['footwear', 'accessories'],
  'swimwear': ['accessories']
};

const colorCompatibility = {
  'white': ['black', 'blue', 'red', 'green', 'purple', 'yellow', 'brown'],
  'black': ['white', 'red', 'blue', 'yellow', 'pink'],
  'blue': ['white', 'yellow', 'orange', 'pink', 'beige'],
  'red': ['white', 'black', 'blue', 'yellow'],
  'green': ['white', 'brown', 'beige', 'yellow'],
  'brown': ['white', 'beige', 'green', 'orange'],
  'beige': ['brown', 'blue', 'green', 'white'],
  'yellow': ['blue', 'purple', 'black', 'white'],
  'purple': ['white', 'yellow', 'pink'],
  'pink': ['white', 'blue', 'purple', 'black'],
  'orange': ['blue', 'brown', 'white']
};

const occasionStyles = {
  'casual': ['shirts', 'pants', 'footwear', 'accessories'],
  'formal': ['shirts', 'pants', 'jackets', 'footwear'],
  'business': ['shirts', 'pants', 'jackets', 'accessories'],
  'party': ['dresses', 'jackets', 'accessories', 'footwear'],
  'workout': ['activewear', 'footwear'],
  'beach': ['swimwear', 'accessories'],
  'date': ['dresses', 'shirts', 'pants', 'accessories']
};

function extractColor(itemName) {
  const colorKeywords = {
    'white': ['white', 'cream', 'ivory'],
    'black': ['black', 'dark'],
    'blue': ['blue', 'navy', 'denim'],
    'red': ['red', 'crimson'],
    'green': ['green', 'olive'],
    'brown': ['brown', 'tan', 'khaki'],
    'beige': ['beige', 'nude', 'sand'],
    'yellow': ['yellow', 'gold'],
    'purple': ['purple', 'violet'],
    'pink': ['pink', 'rose'],
    'orange': ['orange', 'coral']
  };

  const lowerName = itemName.toLowerCase();
  for (const [color, keywords] of Object.entries(colorKeywords)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return color;
    }
  }
  return 'neutral';
}

function calculateCompatibilityScore(item1, item2) {
  let score = 0;

  const compatibleCategories = styleCompatibility[item1.category] || [];
  if (compatibleCategories.includes(item2.category)) {
    score += 40;
  }

  const color1 = extractColor(item1.name);
  const color2 = extractColor(item2.name);
  const compatibleColors = colorCompatibility[color1] || [];
  if (color1 === color2 || compatibleColors.includes(color2)) {
    score += 30;
  }

  const priceDiff = Math.abs(item1.price - item2.price);
  if (priceDiff < 20) score += 20;
  else if (priceDiff < 40) score += 15;
  else if (priceDiff < 60) score += 10;

  if (item1.category !== item2.category) {
    score += 10;
  }
  
  return score;
}

export function getPersonalizedRecommendations(userProfile, viewedItems = [], purchaseHistory = []) {

  const preferredCategories = userProfile.preferredCategories || [];
  const preferredPriceRange = userProfile.priceRange || { min: 0, max: 1000 };
  const preferredSizes = userProfile.sizes || [];
  
  let recommendations = clothingItems.filter(item => {

    if (item.price < preferredPriceRange.min || item.price > preferredPriceRange.max) {
      return false;
    }

    if (viewedItems.includes(item.id) || purchaseHistory.includes(item.id)) {
      return false;
    }
    
    return true;
  });

  recommendations = recommendations.map(item => {
    let score = 0;

    if (preferredCategories.includes(item.category)) {
      score += 30;
    }

    const priceScore = Math.max(0, 20 - Math.abs(item.price - (preferredPriceRange.min + preferredPriceRange.max) / 2) / 5);
    score += priceScore;

    score += Math.max(0, 20 - item.id);
    
    return { ...item, recommendationScore: score };
  });
  
  return recommendations
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 12);
}

export function getOutfitSuggestions(baseItem, maxItems = 3) {
  const compatibleCategories = styleCompatibility[baseItem.category] || [];
  
  let suggestions = clothingItems.filter(item => 
    item.id !== baseItem.id && 
    compatibleCategories.includes(item.category)
  );

  suggestions = suggestions.map(item => ({
    ...item,
    compatibilityScore: calculateCompatibilityScore(baseItem, item)
  }));

  const byCategory = {};
  suggestions.forEach(item => {
    if (!byCategory[item.category] || 
        byCategory[item.category].compatibilityScore < item.compatibilityScore) {
      byCategory[item.category] = item;
    }
  });
  
  return Object.values(byCategory)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, maxItems);
}

export function getOccasionRecommendations(occasion, userProfile = {}) {
  const relevantCategories = occasionStyles[occasion] || [];
  
  let recommendations = clothingItems.filter(item => 
    relevantCategories.includes(item.category)
  );

  recommendations = recommendations.map(item => {
    let score = 50; // Base score

    switch (occasion) {
      case 'formal':
      case 'business':
        if (item.name.toLowerCase().includes('classic') || 
            item.name.toLowerCase().includes('formal')) {
          score += 20;
        }
        break;
      case 'casual':
        if (item.name.toLowerCase().includes('casual') || 
            item.name.toLowerCase().includes('comfortable')) {
          score += 20;
        }
        break;
      case 'party':
        if (item.name.toLowerCase().includes('elegant') || 
            item.name.toLowerCase().includes('dress')) {
          score += 20;
        }
        break;
    }

    if (occasion === 'formal' && item.price > 50) score += 10;
    if (occasion === 'casual' && item.price < 50) score += 10;
    
    return { ...item, occasionScore: score };
  });
  
  return recommendations
    .sort((a, b) => b.occasionScore - a.occasionScore)
    .slice(0, 8);
}

export function getTrendingItems() {
  return clothingItems
    .map(item => {
      let trendScore = Math.random() * 50; // Random base trend

      if (['dresses', 'jackets', 'accessories'].includes(item.category)) {
        trendScore += 20;
      }

      if (item.price >= 30 && item.price <= 80) {
        trendScore += 15;
      }
      
      return { ...item, trendScore };
    })
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 10);
}

export function getSimilarItems(targetItem, count = 6) {
  return clothingItems
    .filter(item => item.id !== targetItem.id)
    .map(item => {
      let similarityScore = 0;

      if (item.category === targetItem.category) {
        similarityScore += 40;
      }

      const priceDiff = Math.abs(item.price - targetItem.price);
      if (priceDiff < 10) similarityScore += 30;
      else if (priceDiff < 20) similarityScore += 20;
      else if (priceDiff < 30) similarityScore += 10;

      const targetColor = extractColor(targetItem.name);
      const itemColor = extractColor(item.name);
      if (targetColor === itemColor) {
        similarityScore += 20;
      }

      const targetWords = targetItem.name.toLowerCase().split(' ');
      const itemWords = item.name.toLowerCase().split(' ');
      const commonWords = targetWords.filter(word => itemWords.includes(word));
      similarityScore += commonWords.length * 5;
      
      return { ...item, similarityScore };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, count);
}

export function getCompleteOutfits(userProfile = {}, count = 3) {
  const outfits = [];

  const baseItems = clothingItems.filter(item => 
    ['shirts', 'dresses'].includes(item.category)
  ).slice(0, count);
  
  baseItems.forEach(baseItem => {
    const outfitItems = [baseItem];
    const suggestions = getOutfitSuggestions(baseItem, 3);
    outfitItems.push(...suggestions);

    let outfitScore = 0;
    for (let i = 0; i < outfitItems.length; i++) {
      for (let j = i + 1; j < outfitItems.length; j++) {
        outfitScore += calculateCompatibilityScore(outfitItems[i], outfitItems[j]);
      }
    }
    
    outfits.push({
      id: `outfit-${baseItem.id}`,
      name: `${baseItem.name} Outfit`,
      items: outfitItems,
      totalPrice: outfitItems.reduce((sum, item) => sum + item.price, 0),
      score: outfitScore,
      occasion: baseItem.category === 'dresses' ? 'party' : 'casual'
    });
  });
  
  return outfits.sort((a, b) => b.score - a.score);
}

export function getRecommendationAnalytics() {
  return {
    clickThroughRate: 0.15,
    conversionRate: 0.08,
    averageOrderValue: 85.50,
    topRecommendedCategories: ['shirts', 'pants', 'accessories'],
    userEngagement: 0.72
  };
}