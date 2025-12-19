const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * User Management Routes for Indian E-commerce
 * Handles profile, addresses, measurements, cart, wishlist
 */

// @route   GET /api/v1/users/:firebaseUid
// @desc    Get user profile
// @access  Private
router.get('/:firebaseUid', async (req, res) => {
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

// @route   POST /api/v1/users
// @desc    Create new user profile
// @access  Private
router.post('/', async (req, res) => {
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
router.put('/:firebaseUid/profile', async (req, res) => {
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
router.get('/:firebaseUid/addresses', async (req, res) => {
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
router.post('/:firebaseUid/addresses', async (req, res) => {
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
router.put('/:firebaseUid/addresses/:addressId', async (req, res) => {
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
router.delete('/:firebaseUid/addresses/:addressId', async (req, res) => {
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
router.get('/:firebaseUid/cart', async (req, res) => {
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
router.post('/:firebaseUid/cart', async (req, res) => {
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

// @route   DELETE /api/v1/users/:firebaseUid/cart
// @desc    Remove item from cart
// @access  Private
router.delete('/:firebaseUid/cart', async (req, res) => {
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
router.delete('/:firebaseUid/cart/clear', async (req, res) => {
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
router.get('/:firebaseUid/wishlist', async (req, res) => {
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
router.post('/:firebaseUid/wishlist', async (req, res) => {
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
router.delete('/:firebaseUid/wishlist/:productId', async (req, res) => {
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
router.put('/:firebaseUid/measurements', async (req, res) => {
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

// ===== LOYALTY & WALLET =====

// @route   POST /api/v1/users/:firebaseUid/loyalty
// @desc    Add loyalty points
// @access  Private
router.post('/:firebaseUid/loyalty', async (req, res) => {
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
