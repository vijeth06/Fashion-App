const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const { verifyFirebaseToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

// Rate limiting
const couponLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: 'Too many coupon requests'
});

/**
 * @route   POST /api/coupons/validate
 * @desc    Validate coupon code with backend verification
 * @access  Private
 */
router.post('/validate', 
  couponLimiter,
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { code, cartValue, userId } = req.body;

      if (!code || !cartValue) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code and cart value required'
        });
      }

      // Find coupon in database
      const coupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        isActive: true 
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon code'
        });
      }

      // Check expiry date
      if (new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Coupon has expired'
        });
      }

      // Check minimum purchase requirement
      if (cartValue < coupon.minimumPurchase) {
        return res.status(400).json({
          success: false,
          message: `Minimum purchase of ₹${coupon.minimumPurchase} required (Current: ₹${cartValue})`
        });
      }

      // Check maximum uses limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: 'Coupon usage limit has been reached'
        });
      }

      // Check user usage limit
      const userUsageCount = coupon.usedBy.filter(u => u.userId === userId).length;
      if (coupon.usagePerUser && userUsageCount >= coupon.usagePerUser) {
        return res.status(400).json({
          success: false,
          message: `You can only use this coupon ${coupon.usagePerUser} time(s)`
        });
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = (cartValue * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }

      // Apply maximum discount cap if set
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }

      // Return validated coupon details
      res.json({
        success: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: Math.round(discountAmount * 100) / 100,
          maxDiscount: coupon.maxDiscount,
          expiryDate: coupon.expiryDate,
          description: coupon.description
        }
      });

    } catch (error) {
      console.error('Coupon validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error validating coupon'
      });
    }
  }
);

/**
 * @route   POST /api/coupons/apply
 * @desc    Apply coupon to order (records usage)
 * @access  Private
 */
router.post('/apply',
  couponLimiter,
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { code, orderId, userId } = req.body;

      // Find coupon
      const coupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        isActive: true 
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coupon'
        });
      }

      // Record usage
      coupon.usedCount += 1;
      coupon.usedBy.push({
        userId: userId,
        orderId: orderId,
        usedAt: new Date(),
        appliedAmount: req.body.appliedAmount || 0
      });

      await coupon.save();

      res.json({
        success: true,
        message: 'Coupon applied successfully'
      });

    } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(500).json({
        success: false,
        message: 'Error applying coupon'
      });
    }
  }
);

/**
 * @route   GET /api/coupons/list
 * @desc    Get all active coupons for user
 * @access  Public
 */
router.get('/list', async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: new Date() }
    }).select('code discountType discountValue maxDiscount description minimumPurchase');

    res.json({
      success: true,
      coupons: coupons
    });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupons'
    });
  }
});

module.exports = router;
