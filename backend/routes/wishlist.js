// Wishlist Routes - Full CRUD Implementation
const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const databaseService = require('../services/DatabaseService');

/**
 * Get user's wishlist
 * GET /api/wishlist
 */
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    // Get user's wishlist from database
    const db = databaseService.getDb();
    const user = await db.collection('users').findOne({ firebaseUid: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get full product details for wishlist items
    const wishlistProductIds = user.wishlist || [];
    
    if (wishlistProductIds.length === 0) {
      return res.json({
        success: true,
        wishlist: [],
        count: 0
      });
    }

    // Fetch products from wishlist
    const products = await db.collection('products')
      .find({ productId: { $in: wishlistProductIds } })
      .toArray();

    res.json({
      success: true,
      wishlist: products,
      count: products.length
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist',
      message: error.message
    });
  }
});

/**
 * Add product to wishlist
 * POST /api/wishlist
 * Body: { productId: string }
 */
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    const db = databaseService.getDb();

    // Verify product exists
    const product = await db.collection('products').findOne({ productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Add to user's wishlist (using $addToSet to avoid duplicates)
    const result = await db.collection('users').updateOne(
      { firebaseUid: userId },
      {
        $addToSet: { wishlist: productId },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Product added to wishlist',
      productId,
      modified: result.modifiedCount > 0
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to wishlist',
      message: error.message
    });
  }
});

/**
 * Remove product from wishlist
 * DELETE /api/wishlist/:productId
 */
router.delete('/:productId', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    const db = databaseService.getDb();

    // Remove from user's wishlist
    const result = await db.collection('users').updateOne(
      { firebaseUid: userId },
      {
        $pull: { wishlist: productId },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      productId,
      removed: result.modifiedCount > 0
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from wishlist',
      message: error.message
    });
  }
});

/**
 * Check if product is in wishlist
 * GET /api/wishlist/check/:productId
 */
router.get('/check/:productId', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { productId } = req.params;

    const db = databaseService.getDb();
    const user = await db.collection('users').findOne({ 
      firebaseUid: userId,
      wishlist: productId
    });

    res.json({
      success: true,
      inWishlist: !!user,
      productId
    });

  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check wishlist',
      message: error.message
    });
  }
});

/**
 * Clear entire wishlist
 * DELETE /api/wishlist
 */
router.delete('/', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const db = databaseService.getDb();
    const result = await db.collection('users').updateOne(
      { firebaseUid: userId },
      {
        $set: { 
          wishlist: [],
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Wishlist cleared',
      cleared: result.modifiedCount > 0
    });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear wishlist',
      message: error.message
    });
  }
});

// Test endpoint (can be removed in production)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Wishlist routes working',
    endpoints: {
      'GET /api/wishlist': 'Get user wishlist',
      'POST /api/wishlist': 'Add product to wishlist',
      'DELETE /api/wishlist/:productId': 'Remove product from wishlist',
      'GET /api/wishlist/check/:productId': 'Check if product in wishlist',
      'DELETE /api/wishlist': 'Clear entire wishlist'
    }
  });
});

module.exports = router;