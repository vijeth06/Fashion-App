


export function calculateBodyMeasurements(poseData, imageInfo = {}) {
  if (!poseData || !poseData.keypoints) {
    return null;
  }

  const { keypoints } = poseData;
  const { width = 1, height = 1, pixelsPerCm = null } = imageInfo;

  const leftShoulder = keypoints.leftShoulder;
  const rightShoulder = keypoints.rightShoulder;
  const leftHip = keypoints.leftHip;
  const rightHip = keypoints.rightHip;
  const leftKnee = keypoints.leftKnee;
  const rightKnee = keypoints.rightKnee;
  const leftAnkle = keypoints.leftAnkle;
  const rightAnkle = keypoints.rightAnkle;

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return null;
  }

  const measurements = {

    shoulderWidthPx: calculateDistance(leftShoulder, rightShoulder),

    hipWidthPx: calculateDistance(leftHip, rightHip),

    torsoLengthPx: calculateDistance(
      { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 },
      { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 }
    ),

    leftLegLengthPx: leftKnee && leftAnkle ? 
      calculateDistance(leftHip, leftKnee) + calculateDistance(leftKnee, leftAnkle) : null,
    rightLegLengthPx: rightKnee && rightAnkle ?
      calculateDistance(rightHip, rightKnee) + calculateDistance(rightKnee, rightAnkle) : null,
  };

  const proportions = {
    shoulderToHipRatio: measurements.shoulderWidthPx / measurements.hipWidthPx,
    torsoToLegRatio: measurements.leftLegLengthPx ? 
      measurements.torsoLengthPx / measurements.leftLegLengthPx : null,
  };

  let realWorldMeasurements = null;
  if (pixelsPerCm) {
    realWorldMeasurements = {
      shoulderWidthCm: measurements.shoulderWidthPx / pixelsPerCm,
      hipWidthCm: measurements.hipWidthPx / pixelsPerCm,
      torsoLengthCm: measurements.torsoLengthPx / pixelsPerCm,
      leftLegLengthCm: measurements.leftLegLengthPx ? measurements.leftLegLengthPx / pixelsPerCm : null,
      rightLegLengthCm: measurements.rightLegLengthPx ? measurements.rightLegLengthPx / pixelsPerCm : null
    };
  }

  return {
    pixelMeasurements: measurements,
    proportions,
    realWorldMeasurements,
    confidence: poseData.confidence || 0,
    timestamp: Date.now()
  };
}


function calculateDistance(point1, point2) {
  if (!point1 || !point2) return 0;
  
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}


export function classifyBodyType(measurements) {
  if (!measurements || !measurements.proportions) {
    return null;
  }

  const { shoulderToHipRatio } = measurements.proportions;

  let bodyType = 'balanced';
  let description = '';

  if (shoulderToHipRatio > 1.08) {
    bodyType = 'inverted-triangle';
    description = 'Broader shoulders relative to hips';
  } else if (shoulderToHipRatio < 0.92) {
    bodyType = 'pear';
    description = 'Narrower shoulders relative to hips';
  } else if (shoulderToHipRatio >= 0.95 && shoulderToHipRatio <= 1.05) {
    bodyType = 'rectangle';
    description = 'Balanced shoulders and hips';
  } else {
    bodyType = 'hourglass';
    description = 'Proportional with defined waist';
  }

  return {
    type: bodyType,
    description,
    ratio: shoulderToHipRatio,
    confidence: measurements.confidence
  };
}


export function recommendSizes(measurements) {
  if (!measurements || !measurements.realWorldMeasurements) {
    return {
      available: false,
      message: 'Measurements not available. Please provide calibration data.',
      genericRecommendation: 'Try our standard size guide.'
    };
  }

  const { shoulderWidthCm, hipWidthCm } = measurements.realWorldMeasurements;

  const sizeMap = {
    tops: getSizeFromMeasurement(shoulderWidthCm, 'shoulders'),
    bottoms: getSizeFromMeasurement(hipWidthCm, 'hips')
  };

  return {
    available: true,
    sizes: sizeMap,
    confidence: measurements.confidence,
    note: 'Sizes are estimated. Please check individual product size charts.'
  };
}


function getSizeFromMeasurement(measurement, type) {
  if (!measurement) return 'M';

  if (type === 'shoulders') {
    if (measurement < 38) return 'XS';
    if (measurement < 42) return 'S';
    if (measurement < 46) return 'M';
    if (measurement < 50) return 'L';
    if (measurement < 54) return 'XL';
    return 'XXL';
  } else if (type === 'hips') {
    if (measurement < 85) return 'XS';
    if (measurement < 92) return 'S';
    if (measurement < 100) return 'M';
    if (measurement < 108) return 'L';
    if (measurement < 116) return 'XL';
    return 'XXL';
  }

  return 'M';
}


export function getFittingRecommendations(bodyType) {
  if (!bodyType || !bodyType.type) {
    return {
      available: false,
      message: 'Body type not determined'
    };
  }

  const recommendations = {
    'inverted-triangle': {
      tops: ['Avoid shoulder pads', 'V-neck styles work well', 'Darker colors on top'],
      bottoms: ['A-line skirts', 'Bootcut or flared pants', 'Lighter colors on bottom'],
      styles: ['Balance proportions with volume on bottom', 'Draw attention to legs']
    },
    'pear': {
      tops: ['Boat neck', 'Off-shoulder styles', 'Embellished or bright tops'],
      bottoms: ['Darker colors', 'Straight-leg or bootcut pants', 'A-line skirts'],
      styles: ['Draw attention to shoulders and upper body', 'Streamlined lower half']
    },
    'rectangle': {
      tops: ['Belted styles', 'Peplum tops', 'Ruffles and details'],
      bottoms: ['Any style works', 'Experiment with different fits'],
      styles: ['Create waist definition', 'Add curves with layering']
    },
    'hourglass': {
      tops: ['Fitted styles', 'Wrap tops', 'Define the waist'],
      bottoms: ['Pencil skirts', 'High-waisted pants', 'Fitted styles'],
      styles: ['Emphasize natural curves', 'Avoid overly loose fits']
    },
    'balanced': {
      tops: ['Most styles work well', 'Experiment with trends'],
      bottoms: ['Versatile - try different styles'],
      styles: ['Enjoy flexibility in choices', 'Focus on personal preference']
    }
  };

  return {
    available: true,
    bodyType: bodyType.type,
    description: bodyType.description,
    recommendations: recommendations[bodyType.type] || recommendations['balanced'],
    confidence: bodyType.confidence
  };
}


export function analyzeBody(poseData, imageInfo = {}) {
  try {
    const measurements = calculateBodyMeasurements(poseData, imageInfo);
    
    if (!measurements) {
      return {
        success: false,
        error: 'Could not extract measurements from pose data'
      };
    }

    const bodyType = classifyBodyType(measurements);
    const sizeRecommendations = recommendSizes(measurements);
    const fittingAdvice = getFittingRecommendations(bodyType);

    return {
      success: true,
      measurements,
      bodyType,
      sizeRecommendations,
      fittingAdvice,
      confidence: measurements.confidence,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error('Body analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  calculateBodyMeasurements,
  classifyBodyType,
  recommendSizes,
  getFittingRecommendations,
  analyzeBody
};
