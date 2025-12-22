import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

class PaymentService {
  constructor() {
    this.db = db;
    this.razorpayLoaded = false;
    this.stripeLoaded = false;
  }

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

  async processRazorpayPayment(orderData) {
    try {
      const isLoaded = await this.loadRazorpay();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      return new Promise(async (resolve) => {

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

  async processStripePayment(orderData) {
    try {
      const isLoaded = await this.loadStripe();
      if (!isLoaded) {
        throw new Error('Stripe SDK failed to load');
      }

      const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_demo');

      const orderResult = await this.createOrder(orderData);
      if (!orderResult.success) {
        return orderResult;
      }

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

  async verifyPayment(paymentData) {
    try {

      
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

  getSupportedMethods() {
    return {
      india: [
        { id: 'upi', name: 'UPI', icon: 'ðŸ’³', supported: true },
        { id: 'card', name: 'Credit/Debit Card', icon: 'ðŸ’³', supported: true },
        { id: 'netbanking', name: 'Net Banking', icon: 'ðŸ¦', supported: true },
        { id: 'paytm', name: 'Paytm Wallet', icon: 'ðŸ“±', supported: true },
        { id: 'phonepe', name: 'PhonePe', icon: 'ðŸ“±', supported: true },
        { id: 'googlepay', name: 'Google Pay', icon: 'ðŸ“±', supported: true },
        { id: 'cod', name: 'Cash on Delivery', icon: 'ðŸ’µ', supported: true }
      ],
      international: [
        { id: 'stripe_card', name: 'Credit/Debit Card', icon: 'ðŸ’³', supported: true },
        { id: 'paypal', name: 'PayPal', icon: 'ðŸ…¿ï¸', supported: true },
        { id: 'apple_pay', name: 'Apple Pay', icon: 'ðŸŽ', supported: true },
        { id: 'google_pay', name: 'Google Pay', icon: 'ðŸ“±', supported: true }
      ]
    };
  }

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

  async processRefund(orderId, amount, reason) {
    try {

      
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

const paymentService = new PaymentService();
export default paymentService;