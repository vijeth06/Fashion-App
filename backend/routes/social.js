const express = require('express');
const router = express.Router();
const { verifyFirebaseToken: authenticateUser } = require('../middleware/auth');
const Look = require('../models/Look');
const {
  LiveSession,
  HelpRequest,
  Challenge,
  Squad,
  CollaborativeSession,
  Gift,
  Notification
} = require('../models/Social');

router.post('/looks/share', authenticateUser, async (req, res) => {
  try {
    const payload = req.body || {};
    const look = await Look.create({
      userId: payload.userId || req.user.uid,
      userName: payload.userName || req.user.name || 'User',
      userAvatar: payload.userAvatar || req.user.picture,
      caption: payload.caption || '',
      outfit: payload.outfit || payload.items || [],
      items: payload.outfit || payload.items || [],
      tags: payload.tags || [],
      occasion: payload.occasion,
      season: payload.season,
      isPublic: payload.isPublic !== false,
      allowComments: payload.allowComments !== false,
      imageUrl: payload.imageUrl
    });

    res.json({
      success: true,
      lookId: look._id,
      message: 'Look shared successfully',
      look
    });
  } catch (error) {
    console.error('Share look error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/looks/:lookId/like', authenticateUser, async (req, res) => {
  try {
    const { lookId } = req.params;
    const userId = req.body.userId || req.user.uid;
    const look = await Look.findById(lookId);

    if (!look) {
      return res.status(404).json({
        success: false,
        error: 'Look not found'
      });
    }

    if (!look.likedBy.includes(userId)) {
      look.likedBy.push(userId);
      look.likes += 1;
      await look.save();
    }

    res.json({
      success: true,
      message: 'Look liked',
      lookId,
      likes: look.likes
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/looks/:lookId/comment', authenticateUser, async (req, res) => {
  try {
    const { lookId } = req.params;
    const { userId, userName, comment } = req.body;
    const look = await Look.findById(lookId);

    if (!look) {
      return res.status(404).json({
        success: false,
        error: 'Look not found'
      });
    }

    const commentData = {
      userId: userId || req.user.uid,
      userName: userName || req.user.name || 'User',
      comment
    };

    look.comments.push(commentData);
    await look.save();

    res.json({
      success: true,
      message: 'Comment added',
      comment: commentData
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/live/start', authenticateUser, async (req, res) => {
  try {
    const session = await LiveSession.create({
      ...req.body,
      hostId: req.body.hostId || req.user.uid,
      hostName: req.body.hostName || req.user.name
    });

    res.json({
      success: true,
      sessionId: session._id,
      message: 'Live session started',
      streamUrl: `wss://stream.example.com/${session._id}`
    });
  } catch (error) {
    console.error('Live session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/live/:sessionId/join', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, userName } = req.body;

    const session = await LiveSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    session.viewers.push({
      userId: userId || req.user.uid,
      userName: userName || req.user.name
    });
    await session.save();

    res.json({
      success: true,
      message: 'Joined live session',
      sessionId
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/live/:sessionId/chat', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await LiveSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    session.chatMessages.push({
      userId: req.body.userId || req.user.uid,
      userName: req.body.userName || req.user.name,
      message: req.body.message,
      timestamp: new Date(req.body.timestamp || Date.now())
    });
    await session.save();

    res.json({
      success: true,
      message: 'Message sent'
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/help-requests/create', authenticateUser, async (req, res) => {
  try {
    const request = await HelpRequest.create({
      ...req.body,
      userId: req.body.userId || req.user.uid,
      userName: req.body.userName || req.user.name
    });

    res.json({
      success: true,
      requestId: request._id,
      message: 'Help request created',
      request
    });
  } catch (error) {
    console.error('Help request error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/help-requests/:requestId/suggestions', authenticateUser, async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await HelpRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Help request not found'
      });
    }

    const suggestion = {
      ...req.body,
      userId: req.body.userId || req.user.uid,
      userName: req.body.userName || req.user.name
    };

    request.suggestions.push(suggestion);
    await request.save();

    res.json({
      success: true,
      message: 'Suggestion added',
      suggestion
    });
  } catch (error) {
    console.error('Suggestion error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/challenges/create', authenticateUser, async (req, res) => {
  try {
    const challenge = await Challenge.create({
      ...req.body,
      creatorId: req.body.creatorId || req.user.uid,
      creatorName: req.body.creatorName || req.user.name
    });

    res.json({
      success: true,
      challengeId: challenge._id,
      message: 'Challenge created',
      challenge
    });
  } catch (error) {
    console.error('Challenge creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/challenges/:challengeId/submit', authenticateUser, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    const entry = {
      ...req.body,
      userId: req.body.userId || req.user.uid,
      userName: req.body.userName || req.user.name,
      submittedAt: new Date()
    };

    challenge.entries.push(entry);
    await challenge.save();

    res.json({
      success: true,
      entryId: challenge.entries[challenge.entries.length - 1]._id,
      message: 'Entry submitted',
      entry
    });
  } catch (error) {
    console.error('Challenge entry error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/challenges/:challengeId/validate', async (req, res) => {
  try {
    const { outfit } = req.body;
    const valid = Array.isArray(outfit) && outfit.length > 0;
    res.json({
      success: true,
      valid,
      message: valid ? 'Entry meets criteria' : 'Entry does not meet criteria'
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/squads/create', authenticateUser, async (req, res) => {
  try {
    const squad = await Squad.create({
      ...req.body,
      creatorId: req.body.creatorId || req.user.uid,
      members: [req.user.uid]
    });

    res.json({
      success: true,
      squadId: squad._id,
      message: 'Squad created',
      squad
    });
  } catch (error) {
    console.error('Squad creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/collaborative/start', authenticateUser, async (req, res) => {
  try {
    const session = await CollaborativeSession.create({
      ...req.body,
      initiatorId: req.body.initiatorId || req.user.uid
    });

    res.json({
      success: true,
      sessionId: session._id,
      message: 'Collaborative session started'
    });
  } catch (error) {
    console.error('Collaborative session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/collaborative/:sessionId/propose', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await CollaborativeSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const proposalId = `proposal-${Date.now()}`;
    const proposal = {
      proposalId,
      userId: req.body.userId || req.user.uid,
      item: req.body.item || {},
      reason: req.body.reason
    };

    session.proposals.push(proposal);
    await session.save();

    res.json({
      success: true,
      proposalId,
      proposal
    });
  } catch (error) {
    console.error('Proposal error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/collaborative/:sessionId/vote', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { proposalId, vote } = req.body;
    const session = await CollaborativeSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const proposal = session.proposals.find(p => p.proposalId === proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }

    const voter = req.body.userId || req.user.uid;
    const voteBucket = vote === 'approve' ? 'approve' : vote === 'reject' ? 'reject' : 'suggest';
    if (!proposal.votes[voteBucket].includes(voter)) {
      proposal.votes[voteBucket].push(voter);
    }

    await session.save();

    res.json({
      success: true,
      message: 'Vote recorded'
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/match/style-twins', authenticateUser, async (req, res) => {
  res.json({
    success: true,
    matches: []
  });
});

router.post('/gifts/send', authenticateUser, async (req, res) => {
  try {
    const gift = await Gift.create({
      ...req.body,
      senderId: req.body.senderId || req.user.uid,
      senderName: req.body.senderName || req.user.name
    });

    res.json({
      success: true,
      giftId: gift._id,
      message: 'Gift sent'
    });
  } catch (error) {
    console.error('Gift error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/notifications/send', authenticateUser, async (req, res) => {
  try {
    const notification = await Notification.create({
      ...req.body,
      userId: req.body.userId || req.user.uid
    });

    res.json({
      success: true,
      notificationId: notification._id
    });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const looks = await Look.find({ isPublic: true })
      .sort({ likes: -1, createdAt: -1 })
      .limit(10);

    const challenges = await Challenge.find({ status: 'active' })
      .sort({ 'entries.length': -1 })
      .limit(5);

    res.json({
      success: true,
      looks,
      challenges,
      styles: [],
      influencers: []
    });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/feed/inspiration', async (req, res) => {
  try {
    const { style, occasion, season, page = 1, limit = 10 } = req.query;
    const query = { isPublic: true };
    if (occasion) query.occasion = occasion;
    if (season) query.season = season;
    if (style) query.tags = style;

    const feed = await Look.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));

    res.json({
      success: true,
      feed
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/collaborative/start', authenticateUser, async (req, res) => {
  try {
    const session = {
      id: `collab-${Date.now()}`,
      ...req.body,
      createdAt: Date.now()
    };
    res.json({
      success: true,
      sessionId: session.id,
      message: 'Collaborative session started',
      session
    });
  } catch (error) {
    console.error('Collaborative session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/collaborative/:sessionId/propose', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const proposal = {
      id: `proposal-${Date.now()}`,
      ...req.body,
      votes: { approve: 0, reject: 0 }
    };
    res.json({
      success: true,
      proposalId: proposal.id,
      message: 'Item proposed',
      proposal
    });
  } catch (error) {
    console.error('Proposal error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/collaborative/:sessionId/vote', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { proposalId, vote } = req.body;
    res.json({
      success: true,
      message: 'Vote recorded'
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.get('/match/style-twins', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.query;
    const matches = []; // Mock data
    res.json({
      success: true,
      matches,
      count: matches.length
    });
  } catch (error) {
    console.error('Style match error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/gifts/send', authenticateUser, async (req, res) => {
  try {
    const gift = {
      id: `gift-${Date.now()}`,
      ...req.body,
      status: 'sent',
      viewedAt: null,
      createdAt: Date.now()
    };
    res.json({
      success: true,
      giftId: gift.id,
      message: 'Gift sent successfully',
      gift
    });
  } catch (error) {
    console.error('Gift error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.post('/notifications/send', authenticateUser, async (req, res) => {
  try {
    const { userId, eventType, data } = req.body;
    res.json({
      success: true,
      message: 'Notifications sent'
    });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.get('/trending', async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    const trending = {
      looks: [],
      styles: ['minimalist', 'bohemian', 'streetwear'],
      challenges: [],
      influencers: []
    };
    res.json({
      success: true,
      ...trending
    });
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.get('/feed/inspiration', async (req, res) => {
  try {
    const { userId, style, occasion, season, page = 1 } = req.query;
    const feed = []; // Mock data
    res.json({
      success: true,
      feed,
      page: parseInt(page),
      hasMore: false
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
module.exports = router;
