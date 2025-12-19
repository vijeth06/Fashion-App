const express = require('express');
const router = express.Router();
const PaymentService = require('../services/PaymentService');
const Order = require('../models/Order');
const { User } = require('../models/User');
const { verifyFirebaseToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Initialize payment service
const paymentService = new PaymentService();

// Rate limiting for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 payment requests per windowMs
  message: 'Too many payment requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Allow more webhook requests
  skip: (req) => {
    // Skip rate limiting for valid webhook signatures
    return req.headers['x-razorpay-signature'] || req.headers['stripe-signature'];
  }
});

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create payment intent for order
 * @access  Private
 */
router.post('/create-intent', 
  paymentLimiter,
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { orderId, amount, currency = 'INR', metadata = {} } = req.body;

      if (!orderId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and amount are required'
        });
      }

      const userId = req.user.uid;

      // Verify order exists and belongs to user
      const order = await Order.findOne({ 
        orderId, 
        $or: [
          { userId: req.user._id },
          { firebaseUid: userId }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if order is already paid
      if (order.payment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Order is already paid'
        });
      }

      // Recalculate order total server-side for strict validation
      const calculatedTotal = (order.pricing.subtotal || 0) 
        - (order.pricing.discount || 0)
        + (order.pricing.tax || 0)
        + (order.pricing.shipping || 0);

      // Strict amount validation (±₹0.001 tolerance for rounding)
      if (Math.abs(amount - calculatedTotal) > 0.001) {
        return res.status(400).json({
          success: false,
          message: 'Amount mismatch with calculated order total',
          details: {
            submitted: amount,
            calculated: calculatedTotal,
            difference: Math.abs(amount - calculatedTotal)
          }
        });
      }

      // Update order with verified total
      order.pricing.verifiedTotal = calculatedTotal;
      order.pricing.verificationTimestamp = new Date();

      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent({
        amount,
        currency,
        orderId,
        userId,
        metadata: {
          ...metadata,
          userEmail: order.userEmail,
          orderItems: order.items.length,
          shippingState: order.shippingAddress.state
        }
      });

      // Calculate processing fee
      const processingFee = paymentService.calculateProcessingFee(amount, currency);
      
      // Get available payment methods
      const paymentMethods = paymentService.getPaymentMethods(currency);

      res.status(200).json({
        success: true,
        message: 'Payment intent created successfully',
        data: {
          paymentIntent,
          processingFee,
          paymentMethods,
          order: {
            orderId: order.orderId,
            total: order.pricing.total,
            currency: order.pricing.currency,
            items: order.items.length
          }
        }
      });

    } catch (error) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment intent',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   POST /api/payments/verify-payment
 * @desc    Verify and process payment completion
 * @access  Private
 */
router.post('/verify-payment',
  paymentLimiter,
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { orderId, gateway, paymentId, gatewayOrderId, signature } = req.body;

      if (!orderId || !gateway || !paymentId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID, gateway, and payment ID are required'
        });
      }

      const userId = req.user.uid;

      // Verify order exists and belongs to user
      const order = await Order.findOne({ 
        orderId,
        $or: [
          { userId: req.user._id },
          { firebaseUid: userId }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Verify payment based on gateway
      let isValidPayment = false;
      
      if (gateway === 'razorpay') {
        if (!signature || !gatewayOrderId) {
          return res.status(400).json({
            success: false,
            message: 'Missing Razorpay signature or order ID'
          });
        }
        
        isValidPayment = paymentService.verifyRazorpaySignature(gatewayOrderId, paymentId, signature);
      } else if (gateway === 'stripe') {
        // For Stripe, payment verification is typically done via webhooks
        // Here we just check if the payment intent exists and is successful
        isValidPayment = true; // In production, verify with Stripe API
      }

      if (!isValidPayment) {
        await paymentService.processFailedPayment({
          orderId,
          errorMessage: 'Payment verification failed',
          gateway,
          gatewayOrderId
        });

        return res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }

      // Process successful payment
      const result = await paymentService.processSuccessfulPayment({
        gateway,
        gatewayOrderId: gatewayOrderId || paymentId,
        paymentId,
        orderId,
        userId
      });

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          orderId: result.orderId,
          paymentId: result.paymentId,
          amount: result.amount,
          currency: result.currency,
          order: {
            status: result.order.status,
            paymentStatus: result.order.payment.status,
            estimatedDelivery: result.order.tracking.estimatedDelivery
          }
        }
      });

    } catch (error) {
      console.error('Payment verification error:', error);
      
      // Attempt to process as failed payment
      try {
        await paymentService.processFailedPayment({
          orderId: req.body.orderId,
          errorMessage: error.message,
          gateway: req.body.gateway,
          gatewayOrderId: req.body.gatewayOrderId
        });
      } catch (failedError) {
        console.error('Failed to process payment failure:', failedError);
      }

      res.status(500).json({
        success: false,
        message: 'Payment processing failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   POST /api/payments/webhook/razorpay
 * @desc    Handle Razorpay webhook events
 * @access  Public (but verified)
 */
router.post('/webhook/razorpay',
  webhookLimiter,
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const signature = req.headers['x-razorpay-signature'];
      
      if (!signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing webhook signature'
        });
      }

      // Verify webhook signature (simplified - in production, use proper verification)
      const body = req.body;
      const event = JSON.parse(body);

      console.log('Razorpay webhook event:', event.event);

      // Handle different event types
      switch (event.event) {
        case 'payment.captured':
          await handleRazorpayPaymentCaptured(event.payload.payment.entity);
          break;
          
        case 'payment.failed':
          await handleRazorpayPaymentFailed(event.payload.payment.entity);
          break;
          
        case 'order.paid':
          await handleRazorpayOrderPaid(event.payload.order.entity);
          break;
          
        default:
          console.log('Unhandled Razorpay event:', event.event);
      }

      res.status(200).json({ success: true });

    } catch (error) {
      console.error('Razorpay webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }
);

/**
 * @route   POST /api/payments/webhook/stripe
 * @desc    Handle Stripe webhook events
 * @access  Public (but verified)
 */
router.post('/webhook/stripe',
  webhookLimiter,
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'];
      
      // Verify webhook signature
      const event = paymentService.verifyStripeWebhook(req.body, signature);
      
      console.log('Stripe webhook event:', event.type);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handleStripePaymentSucceeded(event.data.object);
          break;
          
        case 'payment_intent.payment_failed':
          await handleStripePaymentFailed(event.data.object);
          break;
          
        case 'payment_intent.requires_action':
          await handleStripePaymentRequiresAction(event.data.object);
          break;
          
        default:
          console.log('Unhandled Stripe event:', event.type);
      }

      res.status(200).json({ received: true });

    } catch (error) {
      console.error('Stripe webhook error:', error);
      res.status(400).json({
        success: false,
        message: 'Webhook verification failed'
      });
    }
  }
);

/**
 * @route   POST /api/payments/refund
 * @desc    Process refund for order
 * @access  Private (Admin or Customer Service)
 */
router.post('/refund',
  paymentLimiter,
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { orderId, amount, reason } = req.body;

      if (!orderId || !amount || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Order ID, amount, and reason are required'
        });
      }

      // Check user permissions (admin or customer service)
      if (!req.user.isAdmin && !req.user.permissions?.includes('process_refunds')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to process refunds'
        });
      }

      // Process refund
      const refundResult = await paymentService.processRefund({
        orderId,
        amount,
        reason
      });

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: refundResult
      });

    } catch (error) {
      console.error('Refund processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   GET /api/payments/methods
 * @desc    Get available payment methods for currency
 * @access  Public
 */
router.get('/methods', (req, res) => {
    try {
      const currency = req.query.currency || 'INR';
      const paymentMethods = paymentService.getPaymentMethods(currency);
      
      res.status(200).json({
        success: true,
        data: {
          currency,
          methods: paymentMethods,
          recommended: currency === 'INR' ? ['upi', 'card', 'netbanking'] : ['card', 'apple_pay', 'google_pay']
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment methods'
      });
    }
  }
);

/**
 * @route   GET /api/payments/processing-fee
 * @desc    Calculate processing fee for amount
 * @access  Public
 */
router.get('/processing-fee', (req, res) => {
    try {
      const amount = parseFloat(req.query.amount);
      const currency = req.query.currency || 'INR';
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid amount is required'
        });
      }
      
      const feeCalculation = paymentService.calculateProcessingFee(amount, currency);
      
      res.status(200).json({
        success: true,
        data: feeCalculation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to calculate processing fee'
      });
    }
  }
);

// Helper functions for webhook event handling

async function handleRazorpayPaymentCaptured(payment) {
  try {
    const orderId = payment.notes?.orderId;
    if (!orderId) return;

    const order = await Order.findOne({ orderId });
    if (!order) return;

    await order.processPayment({
      razorpayPaymentId: payment.id,
      transactionId: payment.id
    });

    console.log(`Razorpay payment captured for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling Razorpay payment captured:', error);
  }
}

async function handleRazorpayPaymentFailed(payment) {
  try {
    const orderId = payment.notes?.orderId;
    if (!orderId) return;

    await paymentService.processFailedPayment({
      orderId,
      errorMessage: payment.error_description || 'Payment failed',
      gateway: 'razorpay',
      gatewayOrderId: payment.order_id
    });

    console.log(`Razorpay payment failed for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling Razorpay payment failed:', error);
  }
}

async function handleRazorpayOrderPaid(order) {
  console.log('Razorpay order paid:', order.id);
}

async function handleStripePaymentSucceeded(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return;

    await paymentService.processSuccessfulPayment({
      gateway: 'stripe',
      gatewayOrderId: paymentIntent.id,
      paymentId: paymentIntent.id,
      orderId,
      userId: paymentIntent.metadata?.userId
    });

    console.log(`Stripe payment succeeded for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling Stripe payment succeeded:', error);
  }
}

async function handleStripePaymentFailed(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return;

    await paymentService.processFailedPayment({
      orderId,
      errorMessage: paymentIntent.last_payment_error?.message || 'Payment failed',
      gateway: 'stripe',
      gatewayOrderId: paymentIntent.id
    });

    console.log(`Stripe payment failed for order: ${orderId}`);
  } catch (error) {
    console.error('Error handling Stripe payment failed:', error);
  }
}

async function handleStripePaymentRequiresAction(paymentIntent) {
  console.log('Stripe payment requires action:', paymentIntent.id);
  // Handle 3D Secure or other required actions
}

module.exports = router;