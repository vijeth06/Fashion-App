const Razorpay = require('razorpay');
const Stripe = require('stripe');
const crypto = require('crypto');
const { Order } = require('../models/Order');
const { User } = require('../models/User');

class PaymentService {
  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    // Initialize Razorpay (for Indian market)
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'test_key_id';
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'test_key_secret';

    if (isProduction && (razorpayKeyId.startsWith('test') || razorpayKeySecret.startsWith('test'))) {
      throw new Error('Razorpay keys are not configured for production');
    }

    this.razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Initialize Stripe (for global market)
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_key';
    if (isProduction && stripeKey.startsWith('sk_test')) {
      throw new Error('Stripe secret key is not configured for production');
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    this.supportedCurrencies = {
      'INR': 'razorpay',
      'USD': 'stripe',
      'EUR': 'stripe',
      'GBP': 'stripe',
      'CAD': 'stripe',
      'AUD': 'stripe'
    };
  }

  /**
   * Create payment intent/order based on currency
   */
  async createPaymentIntent({ amount, currency, orderId, userId, metadata = {} }) {
    try {
      const gateway = this.supportedCurrencies[currency] || 'stripe';
      
      if (gateway === 'razorpay') {
        return await this.createRazorpayOrder({ amount, currency, orderId, userId, metadata });
      } else {
        return await this.createStripePaymentIntent({ amount, currency, orderId, userId, metadata });
      }
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
  }

  /**
   * Create Razorpay order (primarily for INR transactions)
   */
  async createRazorpayOrder({ amount, currency, orderId, userId, metadata }) {
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `order_${orderId}`,
      payment_capture: 1,
      notes: {
        orderId,
        userId,
        platform: 'vf-tryon',
        ...metadata
      }
    };

    const razorpayOrder = await this.razorpay.orders.create(options);

    // Store payment intent in database
    await this.storePaymentIntent({
      orderId,
      userId,
      gateway: 'razorpay',
      gatewayOrderId: razorpayOrder.id,
      amount,
      currency,
      status: 'created',
      metadata: {
        ...metadata,
        razorpayOrderId: razorpayOrder.id
      }
    });

    return {
      gateway: 'razorpay',
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      clientSecret: null,
      metadata: {
        orderId,
        userId,
        ...metadata
      }
    };
  }

  /**
   * Create Stripe payment intent (for international transactions)
   */
  async createStripePaymentIntent({ amount, currency, orderId, userId, metadata }) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId,
        userId,
        platform: 'vf-tryon',
        ...metadata
      },
      description: `VF-TryOn Order #${orderId}`,
    });

    // Store payment intent in database
    await this.storePaymentIntent({
      orderId,
      userId,
      gateway: 'stripe',
      gatewayOrderId: paymentIntent.id,
      amount,
      currency,
      status: 'created',
      metadata: {
        ...metadata,
        stripePaymentIntentId: paymentIntent.id
      }
    });

    return {
      gateway: 'stripe',
      orderId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      key: null,
      clientSecret: paymentIntent.client_secret,
      metadata: {
        orderId,
        userId,
        ...metadata
      }
    };
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyRazorpaySignature(orderId, paymentId, signature) {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_key_secret')
      .update(body.toString())
      .digest('hex');
    
    return expectedSignature === signature;
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyStripeWebhook(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
      );
      return event;
    } catch (error) {
      console.error('Stripe webhook signature verification failed:', error);
      throw new Error('Invalid signature');
    }
  }

  /**
   * Process successful payment
   */
  async processSuccessfulPayment({ gateway, gatewayOrderId, paymentId, orderId, userId }) {
    try {
      // Update payment record
      const paymentRecord = await this.updatePaymentStatus({
        orderId,
        status: 'completed',
        paymentId,
        completedAt: new Date()
      });

      // Update order status
      const order = await Order.findOneAndUpdate(
        { orderId },
        { 
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          paidAt: new Date(),
          paymentDetails: {
            gateway,
            gatewayOrderId,
            paymentId,
            paidAmount: paymentRecord.amount,
            paidCurrency: paymentRecord.currency
          }
        },
        { new: true }
      );

      // Update user's purchase history
      await User.findByIdAndUpdate(userId, {
        $push: {
          'purchaseHistory': {
            orderId,
            amount: paymentRecord.amount,
            currency: paymentRecord.currency,
            date: new Date(),
            status: 'completed'
          }
        },
        $inc: {
          'analytics.totalSpent': paymentRecord.amount,
          'analytics.totalOrders': 1
        }
      });

      // Trigger post-payment processes
      await this.triggerPostPaymentProcesses({
        orderId,
        userId,
        amount: paymentRecord.amount,
        currency: paymentRecord.currency
      });

      return {
        success: true,
        orderId,
        paymentId,
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        order
      };

    } catch (error) {
      console.error('Payment processing failed:', error);
      
      // Mark payment as failed
      await this.updatePaymentStatus({
        orderId,
        status: 'failed',
        errorMessage: error.message,
        failedAt: new Date()
      });

      throw error;
    }
  }

  /**
   * Process failed payment
   */
  async processFailedPayment({ orderId, errorMessage, gateway, gatewayOrderId }) {
    try {
      // Update payment record
      await this.updatePaymentStatus({
        orderId,
        status: 'failed',
        errorMessage,
        failedAt: new Date()
      });

      // Update order status
      await Order.findOneAndUpdate(
        { orderId },
        { 
          paymentStatus: 'failed',
          orderStatus: 'payment_failed',
          paymentFailureReason: errorMessage
        }
      );

      // Restore inventory if items were reserved
      await this.restoreInventory(orderId);

      return {
        success: false,
        orderId,
        errorMessage,
        gateway,
        gatewayOrderId
      };

    } catch (error) {
      console.error('Failed payment processing error:', error);
      throw error;
    }
  }

  /**
   * Store payment intent in database
   */
  async storePaymentIntent(paymentData) {
    // In a real implementation, this would store in a payments collection
    console.log('Storing payment intent:', paymentData);
    // For now, we'll add this to the order document
    await Order.findOneAndUpdate(
      { orderId: paymentData.orderId },
      { 
        paymentIntent: paymentData,
        paymentStatus: 'pending'
      }
    );
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(updateData) {
    const { orderId, ...updates } = updateData;
    
    const order = await Order.findOneAndUpdate(
      { orderId },
      { 
        $set: {
          'paymentIntent.status': updates.status,
          'paymentIntent.paymentId': updates.paymentId,
          'paymentIntent.completedAt': updates.completedAt,
          'paymentIntent.failedAt': updates.failedAt,
          'paymentIntent.errorMessage': updates.errorMessage
        }
      },
      { new: true }
    );

    return order?.paymentIntent;
  }

  /**
   * Trigger post-payment processes
   */
  async triggerPostPaymentProcesses({ orderId, userId, amount, currency }) {
    try {
      // Get order details for email
      const order = await this.getOrderById(orderId);
      
      // Send real confirmation email
      const emailService = require('./EmailService');
      await emailService.sendOrderConfirmation(order);
      console.log(`✅ Confirmation email sent for order ${orderId}`);
      
      // Update inventory
      await this.updateInventoryAfterPurchase(orderId);
      
      // Generate invoice
      await this.generateInvoice(orderId);
      
      // Trigger shipping process
      await this.initiateShipping(orderId);
      
      // Update analytics
      await this.updateSalesAnalytics({ orderId, userId, amount, currency });
      
    } catch (error) {
      console.error('Post-payment process error:', error);
      // Don't throw error as payment was successful
    }
  }

  /**
   * Restore inventory for failed payments
   */
  async restoreInventory(orderId) {
    // Implementation would restore reserved inventory
    console.log(`Restoring inventory for failed order ${orderId}`);
  }

  /**
   * Update inventory after successful purchase
   */
  async updateInventoryAfterPurchase(orderId) {
    // Implementation would reduce inventory quantities
    console.log(`Updating inventory for completed order ${orderId}`);
  }

  /**
   * Generate invoice for completed order
   */
  async generateInvoice(orderId) {
    // Implementation would generate PDF invoice
    console.log(`Generating invoice for order ${orderId}`);
  }

  /**
   * Initiate shipping process
   */
  async initiateShipping(orderId) {
    // Implementation would integrate with shipping partners
    console.log(`Initiating shipping for order ${orderId}`);
  }

  /**
   * Update sales analytics
   */
  async updateSalesAnalytics({ orderId, userId, amount, currency }) {
    // Implementation would update business analytics
    console.log(`Updating analytics for order ${orderId}: ${amount} ${currency}`);
  }

  /**
   * Refund payment
   */
  async processRefund({ orderId, amount, reason = 'Customer request' }) {
    try {
      const order = await Order.findOne({ orderId });
      if (!order || !order.paymentIntent) {
        throw new Error('Order or payment record not found');
      }

      const gateway = order.paymentIntent.gateway;
      let refund;

      if (gateway === 'razorpay') {
        refund = await this.razorpay.payments.refund(order.paymentIntent.paymentId, {
          amount: Math.round(amount * 100),
          notes: { orderId, reason }
        });
      } else if (gateway === 'stripe') {
        refund = await this.stripe.refunds.create({
          payment_intent: order.paymentIntent.gatewayOrderId,
          amount: Math.round(amount * 100),
          metadata: { orderId, reason }
        });
      }

      // Update order with refund information
      await Order.findOneAndUpdate(
        { orderId },
        { 
          $push: {
            refunds: {
              refundId: refund.id,
              amount,
              reason,
              status: refund.status,
              processedAt: new Date()
            }
          },
          refundStatus: 'processed'
        }
      );

      return {
        success: true,
        refundId: refund.id,
        amount,
        status: refund.status
      };

    } catch (error) {
      console.error('Refund processing failed:', error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  /**
   * Get payment methods for currency
   */
  getPaymentMethods(currency = 'INR') {
    const gateway = this.supportedCurrencies[currency];
    
    const methods = {
      razorpay: [
        'card',
        'netbanking',
        'wallet', 
        'upi',
        'emi',
        'paylater'
      ],
      stripe: [
        'card',
        'apple_pay',
        'google_pay',
        'link',
        'klarna'
      ]
    };

    return methods[gateway] || methods.stripe;
  }

  /**
   * Calculate processing fee
   */
  calculateProcessingFee(amount, currency = 'INR') {
    const gateway = this.supportedCurrencies[currency];
    
    // Standard processing fees (configurable)
    const fees = {
      razorpay: {
        percentage: 2.0, // 2%
        fixed: 0
      },
      stripe: {
        percentage: 2.9, // 2.9%
        fixed: 0.30 // $0.30
      }
    };

    const feeConfig = fees[gateway] || fees.stripe;
    const percentageFee = (amount * feeConfig.percentage) / 100;
    const totalFee = percentageFee + feeConfig.fixed;

    return {
      gateway,
      amount,
      currency,
      percentageFee: Number(percentageFee.toFixed(2)),
      fixedFee: feeConfig.fixed,
      totalFee: Number(totalFee.toFixed(2)),
      netAmount: Number((amount - totalFee).toFixed(2))
    };
  }
}

module.exports = PaymentService;