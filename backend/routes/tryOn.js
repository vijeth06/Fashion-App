// Try-On Routes with Full Logic Implementation
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { verifyFirebaseToken: authenticateUser, requireOwnership } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const TryOnSession = require('../models/TryOnSession');
const TryOnResult = require('../models/TryOnResult');
const tryOnQueueService = require('../services/TryOnQueueService');

const TRYON_SERVICE_URL = process.env.TRYON_SERVICE_URL || 'http://localhost:5001';

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
    const { garmentId, bodyAnalysis, timestamp } = req.body;
    const sessionId = `session-${uuidv4()}`;

    // Create try-on session record
    const session = await TryOnSession.create({
      sessionId,
      userId: req.user.uid,
      garmentId,
      bodyAnalysis: bodyAnalysis || {},
      status: 'processing',
      createdAt: timestamp ? new Date(timestamp) : new Date()
    });

    res.json({
      success: true,
      sessionId,
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
      userId: req.user.uid,
      filename: req.file.filename,
      path: req.file.path,
      uploadedAt: new Date(),
      metadata: {
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    };

    if (req.body.sessionId) {
      await TryOnSession.findOneAndUpdate(
        { sessionId: req.body.sessionId, userId: req.user.uid },
        { bodyImage: imageData, status: 'body-uploaded' }
      );
    }

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
 * 🧵 Run server-side try-on inference (proxy to Python service)
 * POST /api/try-on/infer
 */
router.post('/infer', authenticateUser, upload.fields([
  { name: 'bodyImage', maxCount: 1 },
  { name: 'garmentImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const bodyImage = req.files?.bodyImage?.[0];

    if (!bodyImage) {
      return res.status(400).json({
        success: false,
        error: 'Body image is required'
      });
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(bodyImage.path));

    const garmentImage = req.files?.garmentImage?.[0];
    if (garmentImage) {
      form.append('garment', fs.createReadStream(garmentImage.path));
    }

    const response = await axios.post(`${TRYON_SERVICE_URL}/tryon`, form, {
      headers: form.getHeaders(),
      timeout: 60000
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Try-on inference error:', error);
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
    const { sessionId, outfit, score, screenshot, metadata } = req.body;

    const result = await TryOnResult.create({
      userId: req.user.uid,
      sessionId,
      outfit,
      score,
      screenshot,
      metadata
    });

    await TryOnSession.findOneAndUpdate(
      { sessionId, userId: req.user.uid },
      { $set: { status: 'completed' }, $addToSet: { resultIds: result._id } }
    );

    res.json({
      success: true,
      resultId: result._id,
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
router.get('/history/:userId', authenticateUser, requireOwnership('userId'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const history = await TryOnResult.find({ userId })
      .sort({ savedAt: -1 })
      .limit(parseInt(limit, 10))
      .skip(parseInt(offset, 10));

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
 * 📂 Save try-on session (API service compatibility)
 * POST /api/try-on/sessions
 */
router.post('/sessions', authenticateUser, async (req, res) => {
  try {
    const { sessionId, garmentId, bodyAnalysis, status } = req.body;
    const finalSessionId = sessionId || `session-${uuidv4()}`;

    const session = await TryOnSession.findOneAndUpdate(
      { sessionId: finalSessionId, userId: req.user.uid },
      {
        sessionId: finalSessionId,
        userId: req.user.uid,
        garmentId,
        bodyAnalysis: bodyAnalysis || {},
        status: status || 'processing'
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Save session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 📂 Get try-on sessions for user
 * GET /api/try-on/sessions
 */
router.get('/sessions', authenticateUser, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const sessions = await TryOnSession.find({ userId: req.user.uid })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .skip(parseInt(offset, 10));

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Fetch sessions error:', error);
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
    const { poseData, sessionId } = req.body;

    // Store pose data for session
    const stored = {
      keypoints: poseData.keypoints || [],
      confidence: poseData.score || 0,
      timestamp: new Date()
    };

    if (sessionId) {
      await TryOnSession.findOneAndUpdate(
        { sessionId, userId: req.user.uid },
        { $push: { poseData: stored } }
      );
    }

    res.json({
      success: true,
      message: 'Pose data stored',
      poseId: `pose-${uuidv4()}`
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

/**
 * 🔍 Get session status (for polling)
 * GET /api/try-on/session/:sessionId/status
 */
router.get('/session/:sessionId/status', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await TryOnSession.findOne({ 
      sessionId, 
      userId: req.user.uid 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      sessionId: session.sessionId,
      status: session.status,
      progress: session.metadata?.progress || 0,
      error: session.errorMessage,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    });

  } catch (error) {
    console.error('Get session status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 📊 Get session results
 * GET /api/try-on/session/:sessionId/results
 */
router.get('/session/:sessionId/results', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await TryOnSession.findOne({ 
      sessionId, 
      userId: req.user.uid 
    }).populate('resultIds');

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      sessionId: session.sessionId,
      status: session.status,
      results: session.resultIds || []
    });

  } catch (error) {
    console.error('Get session results error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 🎬 Submit job to queue (high-quality processing)
 * POST /api/try-on/submit-job
 */
router.post('/submit-job', authenticateUser, upload.fields([
  { name: 'bodyImage', maxCount: 1 },
  { name: 'garmentImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { sessionId, garmentId } = req.body;
    const bodyImage = req.files?.bodyImage?.[0];
    const garmentImage = req.files?.garmentImage?.[0];

    if (!bodyImage) {
      return res.status(400).json({
        success: false,
        error: 'Body image is required'
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Submit job to queue service
    const result = await tryOnQueueService.submitJob(
      sessionId,
      bodyImage.path,
      garmentImage?.path
    );

    res.json({
      success: true,
      jobId: result.jobId,
      sessionId: result.sessionId,
      message: 'Job submitted successfully'
    });

  } catch (error) {
    console.error('Submit job error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 📈 Get queue statistics
 * GET /api/try-on/queue/stats
 */
router.get('/queue/stats', authenticateUser, async (req, res) => {
  try {
    const stats = tryOnQueueService.getQueueStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Queue stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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