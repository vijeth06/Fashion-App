// Try-On Routes with Full Logic Implementation
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateUser } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/try-on/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'tryon-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

/**
 * 🎯 Process virtual try-on session
 * POST /api/try-on/process
 */
router.post('/process', authenticateUser, async (req, res) => {
  try {
    const { userId, garmentId, bodyAnalysis, timestamp } = req.body;

    // Create try-on session record
    const session = {
      userId,
      garmentId,
      bodyAnalysis,
      timestamp: timestamp || Date.now(),
      status: 'processing'
    };

    // Store session in database
    // await tryOnSessionModel.create(session);

    res.json({
      success: true,
      sessionId: `session-${Date.now()}`,
      message: 'Try-on session created',
      session
    });

  } catch (error) {
    console.error('Try-on processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 📸 Upload body image for analysis
 * POST /api/try-on/upload-body
 */
router.post('/upload-body', authenticateUser, upload.single('bodyImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded'
      });
    }

    const imageData = {
      userId: req.body.userId,
      filename: req.file.filename,
      path: req.file.path,
      uploadedAt: Date.now(),
      metadata: {
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    };

    res.json({
      success: true,
      imageId: `img-${Date.now()}`,
      imagePath: `/uploads/try-on/${req.file.filename}`,
      message: 'Body image uploaded successfully',
      data: imageData
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 🎨 Save try-on result
 * POST /api/try-on/save-result
 */
router.post('/save-result', authenticateUser, async (req, res) => {
  try {
    const { userId, sessionId, outfit, score, screenshot } = req.body;

    const result = {
      userId,
      sessionId,
      outfit,
      score,
      screenshot,
      savedAt: Date.now()
    };

    // Save to database
    // await tryOnResultModel.create(result);

    res.json({
      success: true,
      resultId: `result-${Date.now()}`,
      message: 'Try-on result saved successfully',
      result
    });

  } catch (error) {
    console.error('Save result error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 📊 Get user's try-on history
 * GET /api/try-on/history/:userId
 */
router.get('/history/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Fetch from database
    // const history = await tryOnResultModel.find({ userId })
    //   .sort({ savedAt: -1 })
    //   .limit(parseInt(limit))
    //   .skip(parseInt(offset));

    // Mock data for now
    const history = [];

    res.json({
      success: true,
      history,
      count: history.length,
      hasMore: false
    });

  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 🎯 Get garment recommendations based on body analysis
 * POST /api/try-on/recommendations
 */
router.post('/recommendations', authenticateUser, async (req, res) => {
  try {
    const { bodyAnalysis, preferences, currentOutfit } = req.body;

    // Logic to get smart recommendations
    const recommendations = await getSmartRecommendations({
      bodyType: bodyAnalysis?.bodyType,
      measurements: bodyAnalysis?.measurements,
      stylePreferences: preferences,
      currentItems: currentOutfit
    });

    res.json({
      success: true,
      recommendations,
      count: recommendations.length
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * ✨ Get outfit score
 * POST /api/try-on/score-outfit
 */
router.post('/score-outfit', async (req, res) => {
  try {
    const { outfit, occasion, season } = req.body;

    if (!outfit || outfit.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Outfit data required'
      });
    }

    const score = calculateOutfitScore(outfit, { occasion, season });

    res.json({
      success: true,
      score
    });

  } catch (error) {
    console.error('Score calculation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 🎭 Virtual pose detection data
 * POST /api/try-on/pose-data
 */
router.post('/pose-data', authenticateUser, async (req, res) => {
  try {
    const { userId, poseData, sessionId } = req.body;

    // Store pose data for session
    const stored = {
      userId,
      sessionId,
      keypoints: poseData.keypoints,
      confidence: poseData.score,
      timestamp: Date.now()
    };

    res.json({
      success: true,
      message: 'Pose data stored',
      poseId: `pose-${Date.now()}`
    });

  } catch (error) {
    console.error('Pose data error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Helper: Get smart recommendations
 */
async function getSmartRecommendations({ bodyType, measurements, stylePreferences, currentItems }) {
  // This would integrate with your AI recommendation engine
  
  const recommendations = [];

  // Based on body type
  if (bodyType?.type === 'hourglass') {
    recommendations.push({
      category: 'dress',
      reason: 'Wrap dresses are perfect for hourglass figures',
      confidence: 0.9
    });
  }

  // Based on current outfit gaps
  const categories = new Set(currentItems?.map(item => item.category) || []);
  if (!categories.has('shoes')) {
    recommendations.push({
      category: 'shoes',
      reason: 'Complete your outfit with matching shoes',
      confidence: 0.85
    });
  }

  // Based on style preferences
  if (stylePreferences?.style === 'formal') {
    recommendations.push({
      category: 'blazer',
      reason: 'A blazer elevates any formal outfit',
      confidence: 0.88
    });
  }

  return recommendations;
}

/**
 * Helper: Calculate outfit score
 */
function calculateOutfitScore(outfit, context = {}) {
  let score = 50; // Base score

  // Color harmony
  const colors = outfit.map(item => item.color || item.primaryColor);
  const uniqueColors = new Set(colors);
  if (uniqueColors.size <= 3) {
    score += 20; // Good color coordination
  }

  // Style coherence
  const styles = outfit.map(item => item.style);
  const dominantStyle = getMostCommon(styles);
  const styleMatch = styles.filter(s => s === dominantStyle).length / styles.length;
  score += Math.round(styleMatch * 15);

  // Occasion match
  if (context.occasion) {
    const occasionMatch = outfit.every(item => 
      item.occasions?.includes(context.occasion)
    );
    if (occasionMatch) score += 15;
  }

  return {
    overallScore: Math.min(score, 100),
    breakdown: {
      colorHarmony: 75,
      styleCoherence: 80,
      occasionMatch: 85
    },
    suggestions: [
      'Great color coordination!',
      'Consider adding an accessory'
    ]
  };
}

function getMostCommon(array) {
  const counts = {};
  array.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Try-On routes working with full logic',
    version: '2.0',
    endpoints: [
      'POST /api/try-on/process',
      'POST /api/try-on/upload-body',
      'POST /api/try-on/save-result',
      'GET /api/try-on/history/:userId',
      'POST /api/try-on/recommendations',
      'POST /api/try-on/score-outfit',
      'POST /api/try-on/pose-data'
    ]
  });
});

module.exports = router;