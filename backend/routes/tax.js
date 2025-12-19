const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

/**
 * GST Tax Calculator for Indian E-commerce
 * Handles SGST, CGST, IGST calculations based on seller/buyer states
 */

// State code mapping
const SELLER_STATE = 'MAHARASHTRA'; // Configure from env

// GST rates by product category (India)
const GST_RATES = {
  'electronics': 0.18,
  'clothing': 0.05,
  'footwear': 0.12,
  'accessories': 0.12,
  'cosmetics': 0.18,
  'food': 0.05,
  'jewellery': 0.03,
  'books': 0.00,
  'default': 0.18
};

/**
 * @route   POST /api/tax/calculate
 * @desc    Calculate GST with SGST/CGST/IGST breakdown
 * @access  Private
 */
router.post('/calculate', async (req, res) => {
  try {
    const { items, shippingState } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    if (!shippingState) {
      return res.status(400).json({
        success: false,
        message: 'Shipping state is required'
      });
    }

    let subtotal = 0;
    const gstDetails = {};
    let totalGST = 0;

    // Process each cart item
    for (const item of items) {
      const product = await Product.findOne({ productId: item.productId });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
          productId: item.productId
        });
      }

      // Get base price
      const basePrice = product.price?.selling || product.price;
      const itemPrice = basePrice * item.quantity;

      // Get GST rate for this product category
      const category = (product.category || 'default').toLowerCase();
      const gstRate = GST_RATES[category] || GST_RATES.default;

      // Calculate GST amount
      const itemGST = itemPrice * gstRate;

      subtotal += itemPrice;
      totalGST += itemGST;

      gstDetails[item.productId] = {
        basePrice: itemPrice,
        category: category,
        gstRate: gstRate,
        gstAmount: Math.round(itemGST * 100) / 100
      };
    }

    // Determine SGST/CGST or IGST based on seller and buyer state
    const sellerState = SELLER_STATE.toUpperCase();
    const buyerState = shippingState.toUpperCase();

    let sgst = 0;
    let cgst = 0;
    let igst = 0;

    if (sellerState === buyerState) {
      // Same state: Split GST into SGST (50%) and CGST (50%)
      sgst = Math.round((totalGST / 2) * 100) / 100;
      cgst = Math.round((totalGST / 2) * 100) / 100;
    } else {
      // Different state: Apply IGST (full GST)
      igst = Math.round(totalGST * 100) / 100;
    }

    res.json({
      success: true,
      tax: {
        subtotal: Math.round(subtotal * 100) / 100,
        sgst: sgst,
        cgst: cgst,
        igst: igst,
        totalGST: Math.round(totalGST * 100) / 100,
        total: Math.round((subtotal + totalGST) * 100) / 100
      },
      breakdown: gstDetails,
      sellerState: sellerState,
      buyerState: buyerState,
      isInterState: sellerState !== buyerState
    });

  } catch (error) {
    console.error('Tax calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating tax'
    });
  }
});

/**
 * @route   GET /api/tax/rates
 * @desc    Get all GST rates by category
 * @access  Public
 */
router.get('/rates', (req, res) => {
  res.json({
    success: true,
    rates: GST_RATES
  });
});

module.exports = router;
