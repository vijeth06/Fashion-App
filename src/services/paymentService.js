import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

class PaymentService {
  constructor() {
    this.db = db;
    this.razorpayLoaded = false;
    this.stripeLoaded = false;
  }

  // Load Razorpay SDK
  async loadRazorpay() {
    if (this.razorpayLoaded) return true;

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.razorpayLoaded = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Load Stripe SDK
  async loadStripe() {
    if (this.stripeLoaded) return true;

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        this.stripeLoaded = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Create order in Firebase
  async createOrder(orderData) {
    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const orderRef = doc(this.db, 'orders', orderId);
      
      const order = {
        orderId,
        ...orderData,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(orderRef, order);
      
      return {
        success: true,
        orderId,
        order
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process Razorpay payment
  async processRazorpayPayment(orderData) {
    try {
      const isLoaded = await this.loadRazorpay();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      return new Promise(async (resolve) => {
        // Create order in backend first
        const orderResult = await this.createOrder(orderData);
        if (!orderResult.success) {
          resolve(orderResult);
          return;
        }

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_demo', // Demo key
          amount: Math.round(orderData.totalAmount * 100), // Convert to paise
          currency: orderData.currency || 'INR',
          name: 'Virtual Fashion',
          description: 'Virtual Try-On Fashion Purchase',
          image: '/logo.png',
          order_id: orderResult.orderId,
          handler: async (response) => {
            // Payment successful
            const paymentResult = await this.verifyPayment({
              ...response,
              orderId: orderResult.orderId
            });
            resolve(paymentResult);
          },
          prefill: {
            name: orderData.customerInfo?.name || '',
            email: orderData.customerInfo?.email || '',
            contact: orderData.customerInfo?.phone || ''
          },
          notes: {
            orderId: orderResult.orderId,
            userId: orderData.userId || 'guest'
          },
          theme: {
            color: '#8B5CF6'
          },
          modal: {
            ondismiss: () => {
              resolve({
                success: false,
                error: 'Payment cancelled by user',
                cancelled: true
              });
            }
          },
          retry: {
            enabled: true,
            max_count: 3
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      });
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process Stripe payment
  async processStripePayment(orderData) {
    try {
      const isLoaded = await this.loadStripe();
      if (!isLoaded) {
        throw new Error('Stripe SDK failed to load');
      }

      const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_demo');

      // Create order in backend first
      const orderResult = await this.createOrder(orderData);
      if (!orderResult.success) {
        return orderResult;
      }

      // In a real implementation, you would call your backend to create a PaymentIntent
      // For demo purposes, we'll simulate the payment
      const { error } = await stripe.redirectToCheckout({
        mode: 'payment',
        lineItems: orderData.items.map(item => ({
          price_data: {
            currency: orderData.currency || 'usd',
            product_data: {
              name: item.name,
              images: [item.image]
            },
            unit_amount: Math.round(item.price * 100)
          },
          quantity: item.quantity
        })),
        successUrl: `${window.location.origin}/order-success?orderId=${orderResult.orderId}`,
        cancelUrl: `${window.location.origin}/cart`,
        metadata: {
          orderId: orderResult.orderId,
          userId: orderData.userId || 'guest'
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        orderId: orderResult.orderId,
        redirected: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process UPI payment (via Razorpay)
  async processUPIPayment(orderData, upiId) {
    try {
      const paymentData = {
        ...orderData,
        paymentMethod: 'upi',
        upiId
      };

      return await this.processRazorpayPayment(paymentData);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process wallet payment
  async processWalletPayment(orderData, walletType) {
    try {
      const paymentData = {
        ...orderData,
        paymentMethod: 'wallet',
        walletType
      };

      return await this.processRazorpayPayment(paymentData);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify payment after successful transaction
  async verifyPayment(paymentData) {
    try {
      // In a real implementation, you would verify the payment signature on your backend
      // For demo purposes, we'll assume the payment is successful
      
      const orderRef = doc(this.db, 'orders', paymentData.orderId);
      await updateDoc(orderRef, {
        paymentStatus: 'completed',
        status: 'confirmed',
        paymentData: {
          paymentId: paymentData.razorpay_payment_id || paymentData.stripe_payment_id,
          method: paymentData.paymentMethod || 'card',
          completedAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Payment verified successfully',
        orderId: paymentData.orderId,
        paymentId: paymentData.razorpay_payment_id || paymentData.stripe_payment_id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get supported payment methods
  getSupportedMethods() {
    return {
      india: [
        { id: 'upi', name: 'UPI', icon: '💳', supported: true },
        { id: 'card', name: 'Credit/Debit Card', icon: '💳', supported: true },
        { id: 'netbanking', name: 'Net Banking', icon: '🏦', supported: true },
        { id: 'paytm', name: 'Paytm Wallet', icon: '📱', supported: true },
        { id: 'phonepe', name: 'PhonePe', icon: '📱', supported: true },
        { id: 'googlepay', name: 'Google Pay', icon: '📱', supported: true },
        { id: 'cod', name: 'Cash on Delivery', icon: '💵', supported: true }
      ],
      international: [
        { id: 'stripe_card', name: 'Credit/Debit Card', icon: '💳', supported: true },
        { id: 'paypal', name: 'PayPal', icon: '🅿️', supported: true },
        { id: 'apple_pay', name: 'Apple Pay', icon: '🍎', supported: true },
        { id: 'google_pay', name: 'Google Pay', icon: '📱', supported: true }
      ]
    };
  }

  // Calculate payment processing fee
  calculateProcessingFee(amount, method) {
    const fees = {
      upi: 0, // Free for UPI
      card: amount * 0.02, // 2% for cards
      netbanking: amount * 0.015, // 1.5% for net banking
      wallet: amount * 0.01, // 1% for wallets
      cod: 50, // Fixed fee for COD
      stripe_card: amount * 0.029 + 0.30, // Stripe fees
      paypal: amount * 0.034 + 0.30 // PayPal fees
    };

    return Math.round((fees[method] || 0) * 100) / 100;
  }

  // Process refund
  async processRefund(orderId, amount, reason) {
    try {
      // In a real implementation, you would call the payment gateway's refund API
      // For demo purposes, we'll update the order status
      
      const orderRef = doc(this.db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'refunded',
        refundData: {
          amount,
          reason,
          processedAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Refund processed successfully',
        refundId: `refund_${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get order status
  async getOrderStatus(orderId) {
    try {
      const orderRef = doc(this.db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        return {
          success: true,
          data: orderSnap.data()
        };
      } else {
        return {
          success: false,
          error: 'Order not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const paymentService = new PaymentService();
export default paymentService;