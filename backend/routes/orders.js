const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { Product } = require('../models/Product');
const InventoryService = require('../services/InventoryService');
const { verifyFirebaseToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Initialize inventory service
const inventoryService = new InventoryService();

// Rate limiting for order endpoints
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 order requests per windowMs
  message: 'Too many order requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/orders/create
 * @desc    Create a new order
 * @access  Private
 */
router.post('/create',
  orderLimiter,
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { 
        items, 
        shippingAddress, 
        billingAddress, 
        paymentMethod = 'razorpay',
        deliveryInstructions,
        isGift = false,
        giftMessage,
        couponCode,
        idempotencyKey
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one item is required'
        });
      }

      if (!shippingAddress) {
        return res.status(400).json({
          success: false,
          message: 'Shipping address is required'
        });
      }

      const userId = req.user._id;
      const firebaseUid = req.user.uid;
      const userEmail = req.user.email;

      // Check for duplicate order using idempotency key
      if (idempotencyKey) {
        const existingOrder = await Order.findOne({
          userId: userId,
          idempotencyKey: idempotencyKey
        });

        if (existingOrder) {
          return res.status(409).json({
            success: false,
            message: 'Order already processed',
            orderId: existingOrder.orderId,
            exists: true
          });
        }
      }

      // Validate products and calculate pricing
      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        const product = await Product.findOne({ productId: item.productId });
        
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.productId} not found`
          });
        }

        // Check inventory availability
        const inventory = await inventoryService.getProductInventory(
          item.productId, 
          item.size, 
          item.color
        );

        if (inventory.available < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for ${product.name} (${item.size}, ${item.color}). Available: ${inventory.available}`,
            productId: item.productId,
            availableQuantity: inventory.available
          });
        }

        // Calculate item pricing
        const unitPrice = product.price.selling;
        const discount = product.price.discount || 0;
        const discountAmount = (unitPrice * discount) / 100;
        const finalUnitPrice = unitPrice - discountAmount;
        const itemTotal = finalUnitPrice * item.quantity;

        orderItems.push({
          productId: item.productId,
          name: product.name,
          brand: product.brand,
          image: product.images[0] || '',
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: finalUnitPrice,
          discount: discountAmount,
          subtotal: itemTotal,
          gst: {
            rate: 18,
            amount: (itemTotal * 18) / 100
          }
        });

        subtotal += itemTotal;
      }

      // Calculate shipping
      const shipping = calculateShippingCost(shippingAddress.state, subtotal);
      
      // Apply coupon if provided
      let couponDiscount = 0;
      let appliedCoupon = null;
      
      if (couponCode) {
        const couponResult = await applyCoupon(couponCode, subtotal, userEmail);
        if (couponResult.valid) {
          couponDiscount = couponResult.discount;
          appliedCoupon = couponResult.coupon;
        }
      }

      // Calculate GST
      const gstAmount = (subtotal * 18) / 100; // 18% GST
      
      // Calculate final total
      const total = subtotal + gstAmount + shipping - couponDiscount;

      // Generate order ID
      const orderId = Order.generateOrderId();

      // Create order object
      const orderData = {
        orderId,
        userId,
        firebaseUid,
        userEmail,
        idempotencyKey: idempotencyKey || require('uuid').v4(),
        items: orderItems,
        pricing: {
          subtotal,
          discount: 0,
          shipping,
          gst: {
            cgst: shippingAddress.state === 'Karnataka' ? gstAmount / 2 : 0,
            sgst: shippingAddress.state === 'Karnataka' ? gstAmount / 2 : 0,
            igst: shippingAddress.state !== 'Karnataka' ? gstAmount : 0,
            total: gstAmount
          },
          couponDiscount,
          total,
          currency: 'INR'
        },
        coupon: appliedCoupon,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        payment: {
          method: paymentMethod,
          status: 'pending'
        },
        status: 'pending',
        deliveryInstructions,
        isGift,
        giftMessage,
        expectedDeliveryDate: calculateExpectedDelivery(shippingAddress.state),
        source: 'web'
      };

      // Create order
      const order = new Order(orderData);
      await order.save();

      // Reserve inventory
      try {
        await inventoryService.reserveInventory(items, orderId, userId);
      } catch (inventoryError) {
        // If inventory reservation fails, delete the order
        await Order.findByIdAndDelete(order._id);
        
        return res.status(400).json({
          success: false,
          message: 'Failed to reserve inventory',
          error: inventoryError.message
        });
      }

      // Add initial tracking
      await order.updateStatus('pending', 'Order placed successfully');

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: order.orderId,
          total: order.pricing.total,
          currency: order.pricing.currency,
          status: order.status,
          paymentStatus: order.payment.status,
          estimatedDelivery: order.expectedDeliveryDate,
          items: order.items.length,
          trackingUrl: `/api/orders/${order.orderId}/track`
        }
      });

    } catch (error) {
      console.error('Order creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/',
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { status, limit = 10, page = 1 } = req.query;
      const userId = req.user._id;
      
      const query = { userId };
      if (status) query.status = status;

      const orders = await Order.find(query)
        .sort({ placedAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .select('orderId status payment.status pricing.total pricing.currency placedAt expectedDeliveryDate items tracking.estimatedDelivery');

      const totalOrders = await Order.countDocuments(query);
      const totalPages = Math.ceil(totalOrders / parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          orders: orders.map(order => ({
            orderId: order.orderId,
            status: order.status,
            paymentStatus: order.payment.status,
            total: order.pricing.total,
            currency: order.pricing.currency,
            itemCount: order.itemCount,
            placedAt: order.placedAt,
            expectedDelivery: order.expectedDeliveryDate || order.tracking.estimatedDelivery
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalOrders,
            hasMore: parseInt(page) < totalPages
          }
        }
      });

    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  }
);

/**
 * @route   GET /api/orders/:orderId
 * @desc    Get order details
 * @access  Private
 */
router.get('/:orderId',
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.user._id;

      const order = await Order.findOne({ 
        orderId, 
        $or: [
          { userId },
          { firebaseUid: req.user.uid }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          order: {
            orderId: order.orderId,
            status: order.status,
            paymentStatus: order.payment.status,
            items: order.items,
            pricing: order.pricing,
            shippingAddress: order.shippingAddress,
            tracking: order.tracking,
            placedAt: order.placedAt,
            expectedDelivery: order.expectedDeliveryDate,
            canBeCancelled: order.canBeCancelled,
            canBeReturned: order.canBeReturned,
            timeline: order.tracking.updates
          }
        }
      });

    } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order details'
      });
    }
  }
);

/**
 * @route   GET /api/orders/:orderId/track
 * @desc    Get order tracking information
 * @access  Private
 */
router.get('/:orderId/track',
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.user._id;

      const order = await Order.findOne({ 
        orderId, 
        $or: [
          { userId },
          { firebaseUid: req.user.uid }
        ]
      }).select('orderId status tracking shippingAddress expectedDeliveryDate');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          orderId: order.orderId,
          currentStatus: order.status,
          trackingNumber: order.tracking.trackingNumber,
          courier: order.tracking.courier,
          expectedDelivery: order.expectedDeliveryDate,
          shippingAddress: {
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            pincode: order.shippingAddress.pincode
          },
          timeline: order.tracking.updates.map(update => ({
            status: update.status,
            message: update.message,
            location: update.location,
            timestamp: update.timestamp
          }))
        }
      });

    } catch (error) {
      console.error('Error fetching order tracking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tracking information'
      });
    }
  }
);

/**
 * @route   POST /api/orders/:orderId/cancel
 * @desc    Cancel an order
 * @access  Private
 */
router.post('/:orderId/cancel',
  orderLimiter,
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { reason = 'Customer request' } = req.body;
      const userId = req.user._id;

      const order = await Order.findOne({ 
        orderId, 
        $or: [
          { userId },
          { firebaseUid: req.user.uid }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (!order.canBeCancelled) {
        return res.status(400).json({
          success: false,
          message: 'Order cannot be cancelled at this stage'
        });
      }

      // Cancel inventory reservation
      await inventoryService.cancelInventoryReservation(orderId);

      // Cancel order
      await order.cancelOrder(reason);

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: {
          orderId: order.orderId,
          status: order.status,
          cancelledAt: order.cancelledAt,
          refundStatus: order.payment.status === 'completed' ? 'pending' : 'not_applicable'
        }
      });

    } catch (error) {
      console.error('Order cancellation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   POST /api/orders/:orderId/return
 * @desc    Request order return
 * @access  Private
 */
router.post('/:orderId/return',
  orderLimiter,
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { reason, comments = '' } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Return reason is required'
        });
      }
      
      const userId = req.user._id;

      const order = await Order.findOne({ 
        orderId, 
        $or: [
          { userId },
          { firebaseUid: req.user.uid }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (!order.canBeReturned) {
        return res.status(400).json({
          success: false,
          message: 'Order cannot be returned. Return window may have expired or order status is not eligible.'
        });
      }

      if (order.return.requested) {
        return res.status(400).json({
          success: false,
          message: 'Return has already been requested for this order'
        });
      }

      // Request return
      await order.requestReturn(reason, comments);

      res.status(200).json({
        success: true,
        message: 'Return request submitted successfully',
        data: {
          orderId: order.orderId,
          returnStatus: order.return.status,
          requestedAt: order.return.requestedAt,
          reason,
          estimatedProcessingTime: '2-3 business days'
        }
      });

    } catch (error) {
      console.error('Return request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit return request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   POST /api/orders/:orderId/rating
 * @desc    Rate and review order
 * @access  Private
 */
router.post('/:orderId/rating',
  orderLimiter,
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { rating, review = '' } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
      
      const userId = req.user._id;

      const order = await Order.findOne({ 
        orderId, 
        $or: [
          { userId },
          { firebaseUid: req.user.uid }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.status !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Order must be delivered before rating'
        });
      }

      if (order.rated) {
        return res.status(400).json({
          success: false,
          message: 'Order has already been rated'
        });
      }

      // Update order with rating
      order.rated = true;
      order.rating = rating;
      order.review = review;
      order.reviewedAt = new Date();

      await order.save();

      res.status(200).json({
        success: true,
        message: 'Rating submitted successfully',
        data: {
          orderId: order.orderId,
          rating: order.rating,
          review: order.review,
          reviewedAt: order.reviewedAt
        }
      });

    } catch (error) {
      console.error('Rating submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit rating',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Helper functions

function calculateShippingCost(state, orderValue) {
  // Free shipping for orders above ₹999
  if (orderValue >= 999) {
    return 0;
  }

  // Different shipping costs based on state
  const shippingRates = {
    'Karnataka': 50,
    'Tamil Nadu': 60,
    'Kerala': 60,
    'Andhra Pradesh': 60,
    'Telangana': 60,
    'Maharashtra': 70,
    'Gujarat': 80,
    'Delhi': 80,
    'Uttar Pradesh': 80,
    'West Bengal': 90,
    'Rajasthan': 90,
    'Punjab': 90,
    'Haryana': 80,
    'Madhya Pradesh': 80,
    'Bihar': 100,
    'Odisha': 100,
    'Jharkhand': 100,
    'Chhattisgarh': 90,
    'Assam': 120,
    'Manipur': 150,
    'Meghalaya': 150,
    'Tripura': 150,
    'Nagaland': 150,
    'Mizoram': 150,
    'Arunachal Pradesh': 150,
    'Sikkim': 120,
    'Goa': 60,
    'Himachal Pradesh': 100,
    'Uttarakhand': 100,
    'Jammu and Kashmir': 120,
    'Ladakh': 150
  };

  return shippingRates[state] || 100; // Default shipping cost
}

function calculateExpectedDelivery(state) {
  const deliveryDays = {
    'Karnataka': 2,
    'Tamil Nadu': 3,
    'Kerala': 3,
    'Andhra Pradesh': 3,
    'Telangana': 3,
    'Maharashtra': 4,
    'Gujarat': 4,
    'Delhi': 4,
    'Uttar Pradesh': 5,
    'West Bengal': 5,
    'Rajasthan': 5,
    'Punjab': 5,
    'Haryana': 4,
    'Madhya Pradesh': 5,
    'Bihar': 6,
    'Odisha': 6,
    'Jharkhand': 6,
    'Chhattisgarh': 5,
    'Assam': 7,
    'Manipur': 10,
    'Meghalaya': 10,
    'Tripura': 10,
    'Nagaland': 10,
    'Mizoram': 10,
    'Arunachal Pradesh': 10,
    'Sikkim': 7,
    'Goa': 3,
    'Himachal Pradesh': 6,
    'Uttarakhand': 6,
    'Jammu and Kashmir': 8,
    'Ladakh': 10
  };

  const days = deliveryDays[state] || 7;
  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + days);
  
  return expectedDate;
}

async function applyCoupon(couponCode, orderValue, userEmail) {
  // Simple coupon logic - in production, this would check a coupons collection
  const coupons = {
    'WELCOME10': { discount: orderValue * 0.1, minOrder: 500, type: 'percentage', maxDiscount: 200 },
    'SAVE50': { discount: 50, minOrder: 300, type: 'fixed' },
    'FLAT100': { discount: 100, minOrder: 1000, type: 'fixed' },
    'NEWUSER': { discount: orderValue * 0.15, minOrder: 800, type: 'percentage', maxDiscount: 300 }
  };

  const coupon = coupons[couponCode.toUpperCase()];
  
  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' };
  }

  if (orderValue < coupon.minOrder) {
    return { valid: false, error: `Minimum order value ₹${coupon.minOrder} required` };
  }

  let discount = coupon.discount;
  if (coupon.type === 'percentage' && coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  return {
    valid: true,
    discount,
    coupon: {
      code: couponCode.toUpperCase(),
      discount,
      type: coupon.type
    }
  };
}

module.exports = router;
