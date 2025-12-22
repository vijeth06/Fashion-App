


const COLOR_HARMONY = {
  complementary: {
    red: ['green', 'teal'],
    blue: ['orange', 'yellow'],
    yellow: ['purple', 'violet'],
    green: ['red', 'pink'],
    purple: ['yellow', 'gold'],
    orange: ['blue', 'navy']
  },
  analogous: {
    red: ['orange', 'pink'],
    blue: ['purple', 'teal'],
    yellow: ['orange', 'green'],
    green: ['yellow', 'teal'],
    purple: ['blue', 'pink'],
    orange: ['red', 'yellow']
  },
  neutral: ['white', 'black', 'gray', 'beige', 'cream', 'brown']
};


const STYLE_COMPATIBILITY = {
  casual: ['sporty', 'streetwear', 'relaxed'],
  formal: ['business', 'elegant', 'classic'],
  sporty: ['casual', 'athletic', 'active'],
  elegant: ['formal', 'sophisticated', 'chic'],
  bohemian: ['eclectic', 'artistic', 'relaxed'],
  minimalist: ['modern', 'clean', 'simple']
};


const OCCASION_RULES = {
  work: {
    required: ['professional', 'polished'],
    avoid: ['casual', 'sporty', 'beachwear'],
    colors: ['navy', 'black', 'gray', 'white', 'beige']
  },
  casual: {
    required: ['comfortable', 'relaxed'],
    avoid: ['formal', 'business'],
    colors: 'any'
  },
  formal: {
    required: ['elegant', 'sophisticated'],
    avoid: ['casual', 'sporty'],
    colors: ['black', 'navy', 'burgundy', 'emerald']
  },
  party: {
    required: ['stylish', 'eye-catching'],
    avoid: ['plain', 'basic'],
    colors: ['bold', 'metallic', 'bright']
  },
  date: {
    required: ['flattering', 'confident'],
    avoid: ['overly casual', 'sloppy'],
    colors: ['romantic', 'sophisticated']
  }
};


function extractDominantColor(item) {
  if (!item) return 'neutral';
  
  const color = item.color || item.primaryColor || 'neutral';
  return color.toLowerCase();
}


function extractStyle(item) {
  if (!item) return 'casual';
  
  const style = item.style || item.category || 'casual';
  return style.toLowerCase();
}


function colorsHarmonize(color1, color2) {

  if (COLOR_HARMONY.neutral.includes(color1) || COLOR_HARMONY.neutral.includes(color2)) {
    return true;
  }

  if (color1 === color2) {
    return true;
  }

  if (COLOR_HARMONY.complementary[color1]?.includes(color2)) {
    return true;
  }

  if (COLOR_HARMONY.analogous[color1]?.includes(color2)) {
    return true;
  }

  return false;
}


function stylesCompatible(style1, style2) {
  if (style1 === style2) {
    return true;
  }

  if (STYLE_COMPATIBILITY[style1]?.includes(style2)) {
    return true;
  }

  return false;
}


export function calculateOutfitScore(items) {
  if (!items || items.length < 2) {
    return {
      score: 0,
      breakdown: {},
      suggestions: []
    };
  }

  let colorScore = 0;
  let styleScore = 0;
  let varietyScore = 0;
  
  const colors = items.map(extractDominantColor);
  const styles = items.map(extractStyle);

  let colorComparisons = 0;
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      if (colorsHarmonize(colors[i], colors[j])) {
        colorScore++;
      }
      colorComparisons++;
    }
  }
  colorScore = colorComparisons > 0 ? (colorScore / colorComparisons) * 100 : 0;

  let styleComparisons = 0;
  for (let i = 0; i < styles.length; i++) {
    for (let j = i + 1; j < styles.length; j++) {
      if (stylesCompatible(styles[i], styles[j])) {
        styleScore++;
      }
      styleComparisons++;
    }
  }
  styleScore = styleComparisons > 0 ? (styleScore / styleComparisons) * 100 : 0;

  const types = items.map(item => item.type);
  const uniqueTypes = new Set(types);
  varietyScore = (uniqueTypes.size / types.length) * 100;

  const overallScore = (colorScore * 0.4 + styleScore * 0.4 + varietyScore * 0.2);

  return {
    score: Math.round(overallScore),
    breakdown: {
      colorHarmony: Math.round(colorScore),
      styleCompatibility: Math.round(styleScore),
      variety: Math.round(varietyScore)
    },
    level: overallScore >= 80 ? 'excellent' : 
           overallScore >= 60 ? 'good' : 
           overallScore >= 40 ? 'fair' : 'needs improvement',
    suggestions: generateSuggestions(items, colorScore, styleScore, varietyScore)
  };
}


function generateSuggestions(items, colorScore, styleScore, varietyScore) {
  const suggestions = [];

  if (colorScore < 60) {
    suggestions.push('Try items with more harmonious colors');
    suggestions.push('Consider adding neutral pieces to balance the palette');
  }

  if (styleScore < 60) {
    suggestions.push('Mix styles that complement each other');
    suggestions.push('Avoid combining too many contrasting styles');
  }

  if (varietyScore < 50) {
    suggestions.push('Add variety in garment types');
    suggestions.push('Balance tops, bottoms, and accessories');
  }

  if (suggestions.length === 0) {
    suggestions.push('Great outfit combination!');
  }

  return suggestions;
}


export function recommendComplementaryItems(currentItems, availableItems, occasion = 'casual') {
  if (!currentItems || currentItems.length === 0) {
    return [];
  }

  const currentColors = currentItems.map(extractDominantColor);
  const currentStyles = currentItems.map(extractStyle);
  const currentTypes = currentItems.map(item => item.type);

  const occasionRules = OCCASION_RULES[occasion] || OCCASION_RULES.casual;

  const scoredItems = availableItems
    .filter(item => !currentTypes.includes(item.type)) // Don't suggest same type
    .map(item => {
      const itemColor = extractDominantColor(item);
      const itemStyle = extractStyle(item);

      let score = 0;

      const colorMatches = currentColors.filter(c => colorsHarmonize(c, itemColor)).length;
      score += (colorMatches / currentColors.length) * 40;

      const styleMatches = currentStyles.filter(s => stylesCompatible(s, itemStyle)).length;
      score += (styleMatches / currentStyles.length) * 40;

      if (occasionRules.colors === 'any' || occasionRules.colors.includes(itemColor)) {
        score += 20;
      }

      return {
        item,
        score,
        reason: generateRecommendationReason(item, currentItems, colorMatches > 0, styleMatches > 0)
      };
    })
    .filter(scored => scored.score >= 50) // Minimum threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 recommendations

  return scoredItems;
}


function generateRecommendationReason(item, currentItems, colorMatch, styleMatch) {
  const reasons = [];

  if (colorMatch) {
    reasons.push('complements your color scheme');
  }

  if (styleMatch) {
    reasons.push('matches the style');
  }

  if (reasons.length === 0) {
    reasons.push('adds variety to your outfit');
  }

  return reasons.join(' and ');
}


export function getOccasionOutfits(items, occasion) {
  const rules = OCCASION_RULES[occasion];
  
  if (!rules) {
    return {
      occasion,
      suggestions: [],
      tips: ['Choose items that suit the event']
    };
  }

  const appropriateItems = items.filter(item => {
    const style = extractStyle(item);
    const color = extractDominantColor(item);

    const styleOk = !rules.avoid.some(avoidStyle => style.includes(avoidStyle));

    const colorOk = rules.colors === 'any' || rules.colors.includes(color);

    return styleOk && colorOk;
  });

  const outfits = generateOutfitCombinations(appropriateItems, 3);

  return {
    occasion,
    suggestions: outfits.slice(0, 3), // Top 3 combinations
    tips: [
      `For ${occasion}, focus on ${rules.required.join(' and ')} pieces`,
      `Avoid ${rules.avoid.join(' and ')} styles`,
      rules.colors !== 'any' ? `Best colors: ${rules.colors.join(', ')}` : 'Any colors work well'
    ]
  };
}


function generateOutfitCombinations(items, maxItems = 3) {
  const combinations = [];
  const types = [...new Set(items.map(item => item.type))];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (items[i].type !== items[j].type) {
        const combo = [items[i], items[j]];

        for (let k = j + 1; k < items.length; k++) {
          if (items[k].type !== items[i].type && items[k].type !== items[j].type) {
            const fullCombo = [...combo, items[k]];
            const score = calculateOutfitScore(fullCombo);
            
            if (score.score >= 60) {
              combinations.push({
                items: fullCombo,
                score: score.score,
                breakdown: score.breakdown
              });
            }
          }
        }

        const score = calculateOutfitScore(combo);
        if (score.score >= 70) {
          combinations.push({
            items: combo,
            score: score.score,
            breakdown: score.breakdown
          });
        }
      }
    }
  }

  return combinations.sort((a, b) => b.score - a.score);
}

export default {
  calculateOutfitScore,
  recommendComplementaryItems,
  getOccasionOutfits
};
