// 💳 ADVANCED PAYMENT SERVICE
// Features: Multi-gateway integration, Smart routing, Fraud detection, Analytics

import { doc, setDoc, updateDoc, getDoc, serverTimestamp, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

class AdvancedPaymentService {
  constructor() {
    this.db = db;
    this.loadedSDKs = new Set();
    this.paymentInstances = new Map();
    
    // Advanced payment configuration
    this.config = {
      razorpay: {
        keyId: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_demo',
        currency: 'INR',
        companyName: 'Virtual Fashion',
        description: 'Virtual Try-On Fashion Purchase',
        image: '/logo.png',
        theme: { color: '#8B5CF6' },
        features: ['upi', 'card', 'netbanking', 'wallet', 'paylater']
      },
      stripe: {
        publicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_demo',
        currency: 'usd',
        companyName: 'Virtual Fashion',
        features: ['card', 'google_pay', 'apple_pay', 'link']
      },
      paypal: {
        clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'demo_client_id',
        currency: 'USD',
        intent: 'capture'
      },
      applePay: {
        merchantId: process.env.REACT_APP_APPLE_PAY_MERCHANT_ID || 'merchant.virtualfashion.demo',
        countryCode: 'US',
        currency: 'USD'
      },
      googlePay: {
        merchantId: process.env.REACT_APP_GOOGLE_PAY_MERCHANT_ID || 'demo-merchant-id',
        environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST'
      }
    };

    // Payment method configurations
    this.paymentMethods = {
      india: [
        { 
          id: 'razorpay_upi', 
          name: 'UPI', 
          icon: '💰', 
          provider: 'razorpay',
          fee: 0,
          processingTime: 'Instant',
          supported: true,
          popularity: 0.9
        },
        { 
          id: 'razorpay_card', 
          name: 'Credit/Debit Card', 
          icon: '💳', 
          provider: 'razorpay',
          fee: 0.02,
          processingTime: 'Instant',
          supported: true,
          popularity: 0.8
        },
        { 
          id: 'razorpay_netbanking', 
          name: 'Net Banking', 
          icon: '🏦', 
          provider: 'razorpay',
          fee: 0.015,
          processingTime: 'Instant',
          supported: true,
          popularity: 0.6
        },
        { 
          id: 'razorpay_wallet', 
          name: 'Wallet', 
          icon: '📱', 
          provider: 'razorpay',
          fee: 0.01,
          processingTime: 'Instant',
          supported: true,
          popularity: 0.7
        },
        { 
          id: 'cod', 
          name: 'Cash on Delivery', 
          icon: '💵', 
          provider: 'manual',
          fee: 50,
          processingTime: 'On Delivery',
          supported: true,
          popularity: 0.5
        }
      ],
      international: [
        { 
          id: 'stripe_card', 
          name: 'Credit/Debit Card', 
          icon: '💳', 
          provider: 'stripe',
          fee: 0.029,
          processingTime: 'Instant',
          supported: true,
          popularity: 0.9
        },
        { 
          id: 'paypal', 
          name: 'PayPal', 
          icon: '🅿️', 
          provider: 'paypal',
          fee: 0.034,
          processingTime: 'Instant',
          supported: true,
          popularity: 0.8
        },
        { 
          id: 'apple_pay', 
          name: 'Apple Pay', 
          icon: '🍎', 
          provider: 'stripe',
          fee: 0.029,
          processingTime: 'Instant',
          supported: this.isApplePaySupported(),
          popularity: 0.7
        },
        { 
          id: 'google_pay', 
          name: 'Google Pay', 
          icon: '📱', 
          provider: 'stripe',
          fee: 0.029,
          processingTime: 'Instant',
          supported: this.isGooglePaySupported(),
          popularity: 0.7
        }
      ]
    };

    // Initialize fraud detection
    this.fraudDetection = new FraudDetectionSystem();
    
    // Initialize payment analytics
    this.analytics = new PaymentAnalytics();
  }

  // 🚀 SMART PAYMENT GATEWAY ROUTER
  async smartRoutePayment(orderData, preferences = {}) {
    const userLocation = await this.detectUserLocation();
    const recommendedMethods = this.getRecommendedPaymentMethods(userLocation, orderData, preferences);
    
    return {
      primaryMethods: recommendedMethods.slice(0, 3),
      alternativeMethods: recommendedMethods.slice(3, 6),
      region: userLocation.region,
      currency: this.getCurrencyForRegion(userLocation.region),
      estimatedFees: this.calculateEstimatedFees(orderData.totalAmount, recommendedMethods[0])
    };
  }

  // 🔍 FRAUD DETECTION & RISK ASSESSMENT
  async assessPaymentRisk(orderData, userProfile) {
    const riskFactors = await this.fraudDetection.analyzeTransaction({
      amount: orderData.totalAmount,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      userProfile,
      deviceFingerprint: await this.getDeviceFingerprint(),
      timestamp: Date.now()
    });

    return {
      riskScore: riskFactors.score, // 0-1 scale
      riskLevel: this.getRiskLevel(riskFactors.score),
      flaggedFactors: riskFactors.flags,
      recommendations: this.getSecurityRecommendations(riskFactors),
      requiresVerification: riskFactors.score > 0.7
    };
  }

  // 💰 PROCESS PAYMENT WITH SMART ROUTING
  async processPayment(paymentMethod, orderData, options = {}) {
    try {
      // Risk assessment
      const riskAssessment = await this.assessPaymentRisk(orderData, options.userProfile);
      
      if (riskAssessment.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          riskAssessment
        };
      }

      // Create order record
      const orderResult = await this.createAdvancedOrder({
        ...orderData,
        riskAssessment,
        paymentMethod
      });

      if (!orderResult.success) {
        return orderResult;
      }

      // Route to appropriate payment processor
      let paymentResult;
      
      switch (paymentMethod.provider) {
        case 'razorpay':
          paymentResult = await this.processRazorpayPayment(orderData, paymentMethod, orderResult.orderId);
          break;
        case 'stripe':
          paymentResult = await this.processStripePayment(orderData, paymentMethod, orderResult.orderId);
          break;
        case 'paypal':
          paymentResult = await this.processPayPalPayment(orderData, paymentMethod, orderResult.orderId);
          break;
        case 'manual':
          paymentResult = await this.processManualPayment(orderData, paymentMethod, orderResult.orderId);
          break;
        default:
          throw new Error(`Unsupported payment provider: ${paymentMethod.provider}`);
      }

      // Log analytics
      await this.analytics.trackPaymentAttempt({
        orderId: orderResult.orderId,
        method: paymentMethod,
        result: paymentResult,
        riskScore: riskAssessment.riskScore
      });

      return paymentResult;
      
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🏦 ENHANCED RAZORPAY INTEGRATION
  async processRazorpayPayment(orderData, paymentMethod, orderId) {
    await this.loadSDK('razorpay');
    
    return new Promise((resolve) => {
      const options = {
        key: this.config.razorpay.keyId,
        amount: Math.round(orderData.totalAmount * 100),
        currency: this.config.razorpay.currency,
        name: this.config.razorpay.companyName,
        description: this.config.razorpay.description,
        image: this.config.razorpay.image,
        order_id: orderId,
        
        // Enhanced configuration
        method: {
          upi: paymentMethod.id.includes('upi'),
          card: paymentMethod.id.includes('card'),
          netbanking: paymentMethod.id.includes('netbanking'),
          wallet: paymentMethod.id.includes('wallet')
        },
        
        prefill: {
          name: orderData.customerInfo?.name || '',
          email: orderData.customerInfo?.email || '',
          contact: orderData.customerInfo?.phone || ''
        },
        
        notes: {
          orderId,
          userId: orderData.userId || 'guest',
          items: JSON.stringify(orderData.items?.map(item => ({ id: item.id, name: item.name, quantity: item.quantity })))
        },
        
        theme: this.config.razorpay.theme,
        
        handler: async (response) => {
          const verificationResult = await this.verifyPayment({
            ...response,
            orderId,
            provider: 'razorpay'
          });
          resolve(verificationResult);
        },
        
        modal: {
          confirm_close: true,
          ondismiss: () => {
            resolve({
              success: false,
              error: 'Payment cancelled by user',
              cancelled: true
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  }

  // 💳 ENHANCED STRIPE INTEGRATION
  async processStripePayment(orderData, paymentMethod, orderId) {
    await this.loadSDK('stripe');
    
    const stripe = this.paymentInstances.get('stripe');
    
    if (paymentMethod.id === 'apple_pay' || paymentMethod.id === 'google_pay') {
      return this.processDigitalWalletPayment(stripe, orderData, paymentMethod, orderId);
    }
    
    // Create payment intent on backend (mock for demo)
    const paymentIntent = await this.createStripePaymentIntent(orderData, orderId);
    
    if (!paymentIntent.success) {
      return paymentIntent;
    }
    
    const { error, paymentMethod: stripePaymentMethod } = await stripe.confirmCardPayment(
      paymentIntent.clientSecret,
      {
        payment_method: {
          card: {
            // Card details would be collected via Stripe Elements
          },
          billing_details: {
            name: orderData.customerInfo?.name,
            email: orderData.customerInfo?.email,
            address: orderData.billingAddress
          }
        }
      }
    );
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      paymentMethodId: stripePaymentMethod.id,
      orderId
    };
  }

  // 🍎 DIGITAL WALLET PROCESSING
  async processDigitalWalletPayment(stripe, orderData, paymentMethod, orderId) {
    const paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: this.config.stripe.currency,
      total: {
        label: 'Virtual Fashion',
        amount: Math.round(orderData.totalAmount * 100)
      },
      requestPayerName: true,
      requestPayerEmail: true
    });

    // Check if digital wallet is available
    const canMakePayment = await paymentRequest.canMakePayment();
    
    if (!canMakePayment) {
      return {
        success: false,
        error: `${paymentMethod.name} is not available on this device`
      };
    }

    return new Promise((resolve) => {
      paymentRequest.on('paymentmethod', async (ev) => {
        const { paymentMethod, complete } = ev;
        
        try {
          const paymentIntent = await this.createStripePaymentIntent(orderData, orderId);
          
          const { error } = await stripe.confirmCardPayment(
            paymentIntent.clientSecret,
            { payment_method: paymentMethod.id }
          );

          if (error) {
            complete('fail');
            resolve({ success: false, error: error.message });
          } else {
            complete('success');
            resolve({ success: true, paymentMethodId: paymentMethod.id, orderId });
          }
        } catch (err) {
          complete('fail');
          resolve({ success: false, error: err.message });
        }
      });

      paymentRequest.show();
    });
  }

  // 🌍 PAYPAL INTEGRATION
  async processPayPalPayment(orderData, paymentMethod, orderId) {
    await this.loadSDK('paypal');
    
    return new Promise((resolve) => {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: orderData.totalAmount.toFixed(2),
                currency_code: this.config.paypal.currency
              },
              description: `Virtual Fashion Order ${orderId}`,
              custom_id: orderId
            }]
          });
        },
        
        onApprove: async (data, actions) => {
          try {
            const order = await actions.order.capture();
            
            const verificationResult = await this.verifyPayment({
              paypal_order_id: order.id,
              orderId,
              provider: 'paypal'
            });
            
            resolve(verificationResult);
          } catch (err) {
            resolve({ success: false, error: err.message });
          }
        },
        
        onError: (err) => {
          resolve({ success: false, error: err.message });
        },
        
        onCancel: () => {
          resolve({ success: false, cancelled: true });
        }
      }).render('#paypal-button-container');
    });
  }

  // 💵 MANUAL PAYMENT PROCESSING (COD)
  async processManualPayment(orderData, paymentMethod, orderId) {
    if (paymentMethod.id === 'cod') {
      // Update order status to pending with COD
      await this.updateOrderStatus(orderId, {
        status: 'confirmed',
        paymentStatus: 'pending_cod',
        paymentMethod: paymentMethod,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        orderId,
        paymentMethod: 'cod',
        message: 'Order confirmed! Pay on delivery.'
      };
    }
    
    return {
      success: false,
      error: 'Unsupported manual payment method'
    };
  }

  // 🔒 ENHANCED ORDER CREATION
  async createAdvancedOrder(orderData) {
    try {
      const orderId = `VFO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const orderRef = doc(this.db, 'orders', orderId);
      
      const order = {
        orderId,
        ...orderData,
        status: 'pending',
        paymentStatus: 'pending',
        
        // Enhanced tracking
        trackingInfo: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ipAddress: await this.getUserIP(),
          userAgent: navigator.userAgent,
          sessionId: this.getSessionId()
        },
        
        // Analytics data
        analytics: {
          source: document.referrer,
          campaign: this.getUtmParameters(),
          deviceType: this.getDeviceType(),
          timeOnSite: this.getTimeOnSite()
        },
        
        // Security data
        security: {
          riskScore: orderData.riskAssessment?.riskScore || 0,
          verificationStatus: 'pending',
          fraudChecks: orderData.riskAssessment?.flaggedFactors || []
        }
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

  // ✅ ENHANCED PAYMENT VERIFICATION
  async verifyPayment(paymentData) {
    try {
      const orderRef = doc(this.db, 'orders', paymentData.orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        return {
          success: false,
          error: 'Order not found'
        };
      }

      // In production, verify payment signature with backend
      const isVerified = await this.verifyPaymentSignature(paymentData);
      
      if (!isVerified) {
        return {
          success: false,
          error: 'Payment verification failed'
        };
      }

      // Update order with payment details
      const updateData = {
        paymentStatus: 'completed',
        status: 'confirmed',
        paymentData: {
          ...paymentData,
          verifiedAt: serverTimestamp(),
          provider: paymentData.provider
        },
        updatedAt: serverTimestamp()
      };

      await updateDoc(orderRef, updateData);

      // Trigger post-payment processes
      await this.triggerPostPaymentProcesses(paymentData.orderId);

      return {
        success: true,
        message: 'Payment verified successfully',
        orderId: paymentData.orderId,
        paymentId: paymentData.razorpay_payment_id || paymentData.stripe_payment_id || paymentData.paypal_order_id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🔧 UTILITY METHODS
  
  async loadSDK(provider) {
    if (this.loadedSDKs.has(provider)) return;

    const sdkConfigs = {
      razorpay: {
        url: 'https://checkout.razorpay.com/v1/checkout.js',
        globalVar: 'Razorpay'
      },
      stripe: {
        url: 'https://js.stripe.com/v3/',
        globalVar: 'Stripe',
        init: () => window.Stripe(this.config.stripe.publicKey)
      },
      paypal: {
        url: `https://www.paypal.com/sdk/js?client-id=${this.config.paypal.clientId}&currency=${this.config.paypal.currency}`,
        globalVar: 'paypal'
      }
    };

    const config = sdkConfigs[provider];
    if (!config) throw new Error(`Unknown payment provider: ${provider}`);

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = config.url;
      script.onload = () => {
        if (config.init) {
          this.paymentInstances.set(provider, config.init());
        }
        this.loadedSDKs.add(provider);
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${provider} SDK`));
      document.head.appendChild(script);
    });
  }

  getRecommendedPaymentMethods(location, orderData, preferences) {
    const methods = location.region === 'India' ? this.paymentMethods.india : this.paymentMethods.international;
    
    return methods
      .filter(method => method.supported)
      .sort((a, b) => {
        // Sort by popularity and fees
        const scoreA = a.popularity - (a.fee * orderData.totalAmount);
        const scoreB = b.popularity - (b.fee * orderData.totalAmount);
        return scoreB - scoreA;
      });
  }

  async detectUserLocation() {
    // Mock implementation - in production, use IP geolocation
    return {
      country: 'India',
      region: 'India',
      currency: 'INR'
    };
  }

  getCurrencyForRegion(region) {
    const currencyMap = {
      'India': 'INR',
      'US': 'USD',
      'Europe': 'EUR',
      'UK': 'GBP'
    };
    return currencyMap[region] || 'USD';
  }

  isApplePaySupported() {
    return window.ApplePaySession && ApplePaySession.canMakePayments();
  }

  isGooglePaySupported() {
    return window.google && window.google.payments;
  }

  calculateEstimatedFees(amount, paymentMethod) {
    if (paymentMethod.fee < 1) {
      return amount * paymentMethod.fee; // Percentage fee
    }
    return paymentMethod.fee; // Fixed fee
  }

  getRiskLevel(score) {
    if (score < 0.3) return 'low';
    if (score < 0.7) return 'medium';
    return 'high';
  }

  // Mock implementations for demo
  async getDeviceFingerprint() { return 'device_' + Math.random().toString(36); }
  async getUserIP() { return '127.0.0.1'; }
  getSessionId() { return 'session_' + Date.now(); }
  getUtmParameters() { return {}; }
  getDeviceType() { return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'; }
  getTimeOnSite() { return Math.floor(Date.now() / 1000); }
  async verifyPaymentSignature(paymentData) { return true; } // Always true for demo
  async triggerPostPaymentProcesses(orderId) { console.log('Post-payment processes triggered for:', orderId); }
  async updateOrderStatus(orderId, updates) {
    const orderRef = doc(this.db, 'orders', orderId);
    await updateDoc(orderRef, updates);
  }
  async createStripePaymentIntent(orderData, orderId) {
    // Mock PaymentIntent creation
    return {
      success: true,
      clientSecret: 'pi_demo_client_secret'
    };
  }
  getSecurityRecommendations(riskFactors) {
    return [
      'Verify billing address',
      'Request additional authentication',
      'Monitor for suspicious activity'
    ];
  }
}

// 🔍 FRAUD DETECTION SYSTEM
class FraudDetectionSystem {
  async analyzeTransaction(transactionData) {
    // Mock fraud detection - in production, use ML models
    const riskFactors = [];
    let score = 0;

    // Amount-based risk
    if (transactionData.amount > 10000) {
      riskFactors.push('high_amount');
      score += 0.3;
    }

    // Velocity checks
    const recentOrders = await this.getRecentOrders(transactionData.userProfile?.uid);
    if (recentOrders.length > 5) {
      riskFactors.push('high_velocity');
      score += 0.4;
    }

    // Geographic risk
    if (this.isHighRiskLocation(transactionData.shippingAddress)) {
      riskFactors.push('high_risk_location');
      score += 0.2;
    }

    return {
      score: Math.min(score, 1),
      flags: riskFactors
    };
  }

  async getRecentOrders(userId) {
    if (!userId) return [];
    
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        where('createdAt', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  }

  isHighRiskLocation(address) {
    // Mock implementation
    return false;
  }
}

// 📊 PAYMENT ANALYTICS
class PaymentAnalytics {
  async trackPaymentAttempt(data) {
    try {
      const analyticsRef = collection(db, 'payment_analytics');
      await addDoc(analyticsRef, {
        ...data,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }
}

// Export singleton instance
const advancedPaymentService = new AdvancedPaymentService();
export default advancedPaymentService;