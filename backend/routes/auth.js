// Auth Routes with Firebase Integration
const express = require('express');
const firebaseIntegrationService = require('../services/FirebaseIntegrationService');
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working', timestamp: new Date().toISOString() });
});

// Sync Firebase user to MongoDB
router.post('/sync-user', async (req, res) => {
  try {
    const { firebaseUser } = req.body;
    
    if (!firebaseUser || !firebaseUser.uid) {
      return res.status(400).json({
        success: false,
        error: 'Firebase user data is required'
      });
    }

    const user = await firebaseIntegrationService.syncFirebaseUser(firebaseUser);
    
    res.json({
      success: true,
      data: user,
      message: 'User synced successfully'
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync user'
    });
  }
});

// Get user profile
router.get('/profile/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    
    const user = await firebaseIntegrationService.getUserByFirebaseUid(firebaseUid);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

// Update user preferences
router.put('/preferences/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { preferences } = req.body;
    
    const user = await firebaseIntegrationService.updateUserPreferences(firebaseUid, preferences);
    
    res.json({
      success: true,
      data: user,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

// Get user's wishlist
router.get('/wishlist/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    
    const wishlist = await firebaseIntegrationService.getUserWishlist(firebaseUid);
    
    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wishlist'
    });
  }
});

// Get user's looks
router.get('/looks/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    
    const looks = await firebaseIntegrationService.getUserLooks(firebaseUid);
    
    res.json({
      success: true,
      data: looks
    });
  } catch (error) {
    console.error('Error getting looks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get looks'
    });
  }
});

// Save try-on session
router.post('/try-on-session', async (req, res) => {
  try {
    const { firebaseUid, sessionData } = req.body;
    
    if (!firebaseUid || !sessionData) {
      return res.status(400).json({
        success: false,
        error: 'Firebase UID and session data are required'
      });
    }

    const session = await firebaseIntegrationService.saveTryOnSession(firebaseUid, sessionData);
    
    res.json({
      success: true,
      data: session,
      message: 'Try-on session saved successfully'
    });
  } catch (error) {
    console.error('Error saving try-on session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save try-on session'
    });
  }
});

// Delete user account
router.delete('/account/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    
    const result = await firebaseIntegrationService.deleteUserAccount(firebaseUid);
    
    res.json({
      success: true,
      data: result,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
});

module.exports = router;