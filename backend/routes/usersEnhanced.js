const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyFirebaseToken, requireOwnership } = require('../middleware/auth');

const formatCommunityUser = (user) => {
  const displayName = [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || user.profile?.email || 'User';
  const emailPrefix = user.profile?.email ? user.profile.email.split('@')[0] : user.firebaseUid;
  const username = user.profile?.username || `@${String(emailPrefix || 'user').toLowerCase()}`;
  const location = user.addresses?.[0]?.city || '';

  return {
    id: user.firebaseUid,
    displayName,
    username,
    photoURL: user.profile?.photoURL,
    verified: Boolean(user.verified?.email || user.verified?.phone),
    bio: user.profile?.bio || '',
    location,
    stats: {
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      looks: user.savedLooks?.length || 0
    }
  };
};

// @route   GET /api/v1/users
// @desc    Get users list with optional search
// @access  Private
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const searchQuery = (req.query.q || '').trim();
    const query = {};

    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i');
      query.$or = [
        { 'profile.firstName': regex },
        { 'profile.lastName': regex },
        { 'profile.email': regex }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      users: users.map(formatCommunityUser)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// @route   GET /api/v1/users/search
// @desc    Search users by query
// @access  Private
router.get('/search', verifyFirebaseToken, async (req, res) => {
  try {
    const searchQuery = (req.query.q || '').trim();
    if (!searchQuery) {
      return res.json({ success: true, users: [] });
    }

    const regex = new RegExp(searchQuery, 'i');
    const users = await User.find({
      $or: [
        { 'profile.firstName': regex },
        { 'profile.lastName': regex },
        { 'profile.email': regex }
      ]
    }).limit(50);

    res.json({
      success: true,
      users: users.map(formatCommunityUser)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search users',
      message: error.message
    });
  }
});

// @route   GET /api/v1/users/trending
// @desc    Get trending users by follower count
// @access  Private
router.get('/trending', verifyFirebaseToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const users = await User.find({}).limit(Math.max(limit * 3, limit));
    const sorted = users
      .sort((a, b) => (b.followers?.length || 0) - (a.followers?.length || 0))
      .slice(0, limit);

    res.json({
      success: true,
      users: sorted.map(formatCommunityUser)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending users',
      message: error.message
    });
  }
});

// @route   POST /api/v1/users/follow
// @desc    Follow user
// @access  Private
router.post('/follow', verifyFirebaseToken, async (req, res) => {
  try {
    const targetUserId = req.body.targetUserId;
    const currentUserId = req.user.uid;

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: 'targetUserId is required' });
    }
    if (targetUserId === currentUserId) {
      return res.status(400).json({ success: false, error: 'Cannot follow yourself' });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findOne({ firebaseUid: currentUserId }),
      User.findOne({ firebaseUid: targetUserId })
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!currentUser.following.includes(targetUserId)) {
      currentUser.following.push(targetUserId);
    }
    if (!targetUser.followers.includes(currentUserId)) {
      targetUser.followers.push(currentUserId);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to follow user',
      message: error.message
    });
  }
});

// @route   POST /api/v1/users/unfollow
// @desc    Unfollow user
// @access  Private
router.post('/unfollow', verifyFirebaseToken, async (req, res) => {
  try {
    const targetUserId = req.body.targetUserId;
    const currentUserId = req.user.uid;

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: 'targetUserId is required' });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findOne({ firebaseUid: currentUserId }),
      User.findOne({ firebaseUid: targetUserId })
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    currentUser.following = currentUser.following.filter(id => id !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to unfollow user',
      message: error.message
    });
  }
});

/**
 * User Management Routes for Indian E-commerce
 * Handles profile, addresses, measurements, cart, wishlist
 */

// @route   GET /api/v1/users/:firebaseUid
// @desc    Get user profile
// @access  Private
router.get('/:firebaseUid', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

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
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
      message: error.message
    });
  }
});

// @route   GET /api/v1/users/:firebaseUid/followers
// @desc    Get user followers
// @access  Private
router.get('/:firebaseUid/followers', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      followers: user.followers || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch followers',
      message: error.message
    });
  }
});

// @route   GET /api/v1/users/:firebaseUid/following
// @desc    Get user following
// @access  Private
router.get('/:firebaseUid/following', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      following: user.following || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch following',
      message: error.message
    });
  }
});

// @route   POST /api/v1/users
// @desc    Create new user profile
// @access  Private
router.post('/', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const { firebaseUid, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      return res.json({
        success: true,
        data: existingUser,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = new User({
      firebaseUid,
      profile,
      createdAt: new Date()
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// @route   PUT /api/v1/users/:firebaseUid/profile
// @desc    Update user profile
// @access  Private
router.put('/:firebaseUid/profile', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update profile fields
    Object.assign(user.profile, req.body);
    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// ===== ADDRESS MANAGEMENT =====

// @route   GET /api/v1/users/:firebaseUid/addresses
// @desc    Get all user addresses
// @access  Private
router.get('/:firebaseUid/addresses', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.addresses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch addresses',
      message: error.message
    });
  }
});

// @route   POST /api/v1/users/:firebaseUid/addresses
// @desc    Add new address
// @access  Private
router.post('/:firebaseUid/addresses', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.addAddress(req.body);

    res.json({
      success: true,
      data: user.addresses,
      message: 'Address added successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add address',
      message: error.message
    });
  }
});

// @route   PUT /api/v1/users/:firebaseUid/addresses/:addressId
// @desc    Update address
// @access  Private
router.put('/:firebaseUid/addresses/:addressId', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.updateAddress(req.params.addressId, req.body);

    res.json({
      success: true,
      data: user.addresses,
      message: 'Address updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update address',
      message: error.message
    });
  }
});

// @route   DELETE /api/v1/users/:firebaseUid/addresses/:addressId
// @desc    Delete address
// @access  Private
router.delete('/:firebaseUid/addresses/:addressId', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.deleteAddress(req.params.addressId);

    res.json({
      success: true,
      data: user.addresses,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete address',
      message: error.message
    });
  }
});

// ===== CART MANAGEMENT =====

// @route   GET /api/v1/users/:firebaseUid/cart
// @desc    Get user cart
// @access  Private
router.get('/:firebaseUid/cart', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.cart,
      total: user.cartTotal,
      itemCount: user.cartItemCount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart',
      message: error.message
    });
  }
});

// @route   POST /api/v1/users/:firebaseUid/cart
// @desc    Add item to cart
// @access  Private
router.post('/:firebaseUid/cart', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { productId, size, color, price, quantity } = req.body;

    if (!productId || !size || !price) {
      return res.status(400).json({
        success: false,
        error: 'Product ID, size, and price are required'
      });
    }

    await user.addToCart(productId, size, color, price, quantity || 1);

    res.json({
      success: true,
      data: user.cart,
      message: 'Item added to cart',
      total: user.cartTotal,
      itemCount: user.cartItemCount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add to cart',
      message: error.message
    });
  }
});

// @route   PUT /api/v1/users/:firebaseUid/cart
// @desc    Update cart item quantity
// @access  Private
router.put('/:firebaseUid/cart', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { productId, size, color, quantity, price } = req.body;

    if (!productId || !size || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Product ID, size, and quantity are required'
      });
    }

    await user.updateCartItem(productId, size, color, { quantity, price });

    res.json({
      success: true,
      data: user.cart,
      message: 'Cart item updated',
      total: user.cartTotal,
      itemCount: user.cartItemCount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update cart item',
      message: error.message
    });
  }
});

// @route   DELETE /api/v1/users/:firebaseUid/cart
// @desc    Remove item from cart
// @access  Private
router.delete('/:firebaseUid/cart', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { productId, size, color } = req.body;
    await user.removeFromCart(productId, size, color);

    res.json({
      success: true,
      data: user.cart,
      message: 'Item removed from cart',
      total: user.cartTotal,
      itemCount: user.cartItemCount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove from cart',
      message: error.message
    });
  }
});

// @route   DELETE /api/v1/users/:firebaseUid/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/:firebaseUid/cart/clear', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart',
      message: error.message
    });
  }
});

// ===== WISHLIST MANAGEMENT =====

// @route   GET /api/v1/users/:firebaseUid/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/:firebaseUid/wishlist', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.wishlist
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wishlist',
      message: error.message
    });
  }
});

// @route   POST /api/v1/users/:firebaseUid/wishlist
// @desc    Add item to wishlist
// @access  Private
router.post('/:firebaseUid/wishlist', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    await user.addToWishlist(productId);

    res.json({
      success: true,
      data: user.wishlist,
      message: 'Item added to wishlist'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add to wishlist',
      message: error.message
    });
  }
});

// @route   DELETE /api/v1/users/:firebaseUid/wishlist/:productId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/:firebaseUid/wishlist/:productId', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.removeFromWishlist(req.params.productId);

    res.json({
      success: true,
      data: user.wishlist,
      message: 'Item removed from wishlist'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove from wishlist',
      message: error.message
    });
  }
});

// ===== MEASUREMENTS =====

// @route   PUT /api/v1/users/:firebaseUid/measurements
// @desc    Update body measurements
// @access  Private
router.put('/:firebaseUid/measurements', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    Object.assign(user.measurements, req.body);
    await user.save();

    res.json({
      success: true,
      data: user.measurements,
      message: 'Measurements updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update measurements',
      message: error.message
    });
  }
});

// ===== PREFERENCES =====

// @route   GET /api/v1/users/:firebaseUid/preferences
// @desc    Get user preferences
// @access  Private
router.get('/:firebaseUid/preferences', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      preferences: user.preferences || {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch preferences',
      message: error.message
    });
  }
});

// @route   PUT /api/v1/users/:firebaseUid/preferences
// @desc    Update user preferences
// @access  Private
router.put('/:firebaseUid/preferences', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.preferences = { ...user.preferences, ...req.body };
    await user.save();

    res.json({
      success: true,
      preferences: user.preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
      message: error.message
    });
  }
});

// ===== BODY PROFILE =====

// @route   PUT /api/v1/users/:firebaseUid/body-profile
// @desc    Update body profile
// @access  Private
router.put('/:firebaseUid/body-profile', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { bodyType, measurements, confidence } = req.body;
    if (bodyType !== undefined) {
      user.measurements.bodyType = bodyType;
    }
    if (confidence !== undefined) {
      user.measurements.measurementConfidence = confidence;
    }
    if (measurements && typeof measurements === 'object') {
      Object.assign(user.measurements, measurements);
    }

    await user.save();

    res.json({
      success: true,
      measurements: user.measurements,
      message: 'Body profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update body profile',
      message: error.message
    });
  }
});

// ===== LOYALTY & WALLET =====

// @route   POST /api/v1/users/:firebaseUid/loyalty
// @desc    Add loyalty points
// @access  Private
router.post('/:firebaseUid/loyalty', verifyFirebaseToken, requireOwnership('firebaseUid'), async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { points, reason } = req.body;
    await user.addLoyaltyPoints(points, reason);

    res.json({
      success: true,
      data: user.loyalty,
      message: `${points} loyalty points added`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add loyalty points',
      message: error.message
    });
  }
});

// @route   POST /api/v1/users/:firebaseUid/wallet/credit
// @desc    Add money to wallet
// @access  Private
router.post('/:firebaseUid/wallet/credit', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { amount, description, transactionId } = req.body;
    await user.addWalletCredit(amount, description, transactionId);

    res.json({
      success: true,
      data: {
        balance: user.walletBalance,
        transaction: user.walletTransactions[user.walletTransactions.length - 1]
      },
      message: `₹${amount} added to wallet`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to credit wallet',
      message: error.message
    });
  }
});

module.exports = router;
