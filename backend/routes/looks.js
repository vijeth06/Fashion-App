const express = require('express');
const router = express.Router();
const Look = require('../models/Look');
const { verifyFirebaseToken, requireOwnership } = require('../middleware/auth');

// @route   GET /api/looks
// @desc    Get public looks or user looks
router.get('/', async (req, res) => {
  try {
    const { userId, limit = 20, page = 1 } = req.query;
    const query = userId ? { userId } : { isPublic: true };
    const looks = await Look.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));

    res.json({
      success: true,
      looks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   GET /api/looks/user/:userId
// @desc    Get looks for user
router.get('/user/:userId', verifyFirebaseToken, requireOwnership('userId'), async (req, res) => {
  try {
    const looks = await Look.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      looks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   POST /api/looks/create
// @desc    Create new look
router.post('/create', verifyFirebaseToken, async (req, res) => {
  try {
    const payload = req.body || {};
    const look = await Look.create({
      userId: payload.userId || req.user.uid,
      userName: payload.userName || req.user.name || 'User',
      userAvatar: payload.userAvatar || req.user.picture,
      title: payload.name || payload.title,
      caption: payload.caption || '',
      outfit: payload.items || payload.outfit || [],
      items: payload.items || [],
      imageUrl: payload.imageUrl || payload.dataUrl,
      tags: payload.tags || [],
      occasion: payload.occasion,
      season: payload.season,
      isPublic: payload.visibility ? payload.visibility === 'public' : true,
      allowComments: payload.allowComments !== false
    });

    res.status(201).json({
      success: true,
      look
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @route   DELETE /api/looks/:lookId
// @desc    Delete look
router.delete('/:lookId', verifyFirebaseToken, async (req, res) => {
  try {
    const look = await Look.findById(req.params.lookId);
    if (!look) {
      return res.status(404).json({
        success: false,
        error: 'Look not found'
      });
    }

    if (look.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this look'
      });
    }

    await Look.findByIdAndDelete(req.params.lookId);
    res.json({
      success: true,
      message: 'Look deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Looks routes working' });
});

module.exports = router;