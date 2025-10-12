import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc,
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  addDoc 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

class OrderTrackingService {
  constructor() {
    this.db = db;
    this.trackingCache = new Map();
    this.listeners = new Map();
  }

  // Order status flow
  getOrderStatuses() {
    return {
      'pending': {
        label: 'Order Placed',
        description: 'Your order has been received and is being processed',
        icon: '📋',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        progress: 10
      },
      'confirmed': {
        label: 'Order Confirmed',
        description: 'Your order has been confirmed and payment received',
        icon: '✅',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        progress: 25
      },
      'processing': {
        label: 'Processing',
        description: 'Your order is being prepared for shipment',
        icon: '⚙️',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        progress: 40
      },
      'packed': {
        label: 'Packed',
        description: 'Your order has been packed and ready for dispatch',
        icon: '📦',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        progress: 60
      },
      'shipped': {
        label: 'Shipped',
        description: 'Your order is on its way to you',
        icon: '🚚',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        progress: 80
      },
      'out_for_delivery': {
        label: 'Out for Delivery',
        description: 'Your order is out for delivery and will arrive soon',
        icon: '🏃‍♂️',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        progress: 90
      },
      'delivered': {
        label: 'Delivered',
        description: 'Your order has been delivered successfully',
        icon: '🎉',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        progress: 100
      },
      'cancelled': {
        label: 'Cancelled',
        description: 'Your order has been cancelled',
        icon: '❌',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        progress: 0
      },
      'returned': {
        label: 'Returned',
        description: 'Your order has been returned',
        icon: '↩️',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        progress: 0
      },
      'refunded': {
        label: 'Refunded',
        description: 'Your order has been refunded',
        icon: '💰',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        progress: 0
      }
    };
  }

  // Update order status
  async updateOrderStatus(orderId, newStatus, updateData = {}) {
    try {
      const orderRef = doc(this.db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        return {
          success: false,
          error: 'Order not found'
        };
      }

      const currentOrder = orderSnap.data();
      const statusInfo = this.getOrderStatuses()[newStatus];
      
      if (!statusInfo) {
        return {
          success: false,
          error: 'Invalid status'
        };
      }

      // Create tracking entry
      const trackingEntry = {
        status: newStatus,
        timestamp: serverTimestamp(),
        location: updateData.location || '',
        notes: updateData.notes || '',
        estimatedDelivery: updateData.estimatedDelivery || null,
        trackingNumber: updateData.trackingNumber || currentOrder.trackingNumber || '',
        carrier: updateData.carrier || currentOrder.carrier || ''
      };

      // Update order
      await updateDoc(orderRef, {
        status: newStatus,
        ...updateData,
        updatedAt: serverTimestamp(),
        trackingHistory: [...(currentOrder.trackingHistory || []), trackingEntry]
      });

      // Add tracking update
      await this.addTrackingUpdate(orderId, trackingEntry);

      return {
        success: true,
        message: 'Order status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add tracking update
  async addTrackingUpdate(orderId, trackingData) {
    try {
      const trackingRef = collection(this.db, 'tracking');
      await addDoc(trackingRef, {
        orderId,
        ...trackingData,
        createdAt: serverTimestamp()
      });

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get order tracking history
  async getTrackingHistory(orderId) {
    try {
      const orderRef = doc(this.db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        return {
          success: false,
          error: 'Order not found'
        };
      }

      const orderData = orderSnap.data();
      const trackingHistory = orderData.trackingHistory || [];
      
      // Sort by timestamp
      trackingHistory.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return a.timestamp.toDate() - b.timestamp.toDate();
        }
        return 0;
      });

      return {
        success: true,
        data: {
          orderId,
          currentStatus: orderData.status,
          trackingNumber: orderData.trackingNumber,
          carrier: orderData.carrier,
          estimatedDelivery: orderData.estimatedDelivery,
          trackingHistory
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get real-time tracking updates
  subscribeToTracking(orderId, callback) {
    try {
      const orderRef = doc(this.db, 'orders', orderId);
      
      const unsubscribe = onSnapshot(orderRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback({
            success: true,
            data: {
              orderId,
              status: data.status,
              trackingHistory: data.trackingHistory || [],
              estimatedDelivery: data.estimatedDelivery,
              trackingNumber: data.trackingNumber,
              carrier: data.carrier
            }
          });
        } else {
          callback({
            success: false,
            error: 'Order not found'
          });
        }
      });

      // Store the listener
      this.listeners.set(orderId, unsubscribe);
      
      return unsubscribe;
    } catch (error) {
      callback({
        success: false,
        error: error.message
      });
      return null;
    }
  }

  // Unsubscribe from tracking updates
  unsubscribeFromTracking(orderId) {
    const unsubscribe = this.listeners.get(orderId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(orderId);
    }
  }

  // Get user's orders
  async getUserOrders(userId, limit = 20) {
    try {
      const ordersRef = collection(this.db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const ordersSnap = await getDocs(q);
      const orders = [];
      
      ordersSnap.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        data: orders
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate estimated delivery date
  calculateEstimatedDelivery(shippingMethod, location) {
    const baseDays = {
      'standard': 5,
      'express': 3,
      'same_day': 1,
      'next_day': 2
    };

    const locationMultiplier = {
      'metro': 1,
      'tier1': 1.2,
      'tier2': 1.5,
      'tier3': 2
    };

    const days = Math.ceil(
      (baseDays[shippingMethod] || 5) * (locationMultiplier[location] || 1)
    );

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + days);
    
    return estimatedDate;
  }

  // Generate tracking number
  generateTrackingNumber(orderId) {
    const prefix = 'VFT'; // Virtual Fashion Tracking
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  // Get shipping carriers
  getShippingCarriers() {
    return [
      {
        id: 'fedex',
        name: 'FedEx',
        trackingUrl: 'https://www.fedex.com/en-us/tracking.html?trknbr=',
        logo: '📦',
        estimatedDays: '3-5'
      },
      {
        id: 'dhl',
        name: 'DHL',
        trackingUrl: 'https://www.dhl.com/en/express/tracking.html?AWB=',
        logo: '🚚',
        estimatedDays: '2-4'
      },
      {
        id: 'bluedart',
        name: 'Blue Dart',
        trackingUrl: 'https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo=',
        logo: '💙',
        estimatedDays: '2-3'
      },
      {
        id: 'dtdc',
        name: 'DTDC',
        trackingUrl: 'https://www.dtdc.in/tracking/tracking_results.asp?Strno=',
        logo: '📮',
        estimatedDays: '3-5'
      },
      {
        id: 'indiapost',
        name: 'India Post',
        trackingUrl: 'https://www.indiapost.gov.in/VAS/Pages/IndiaPostHome.aspx?trackid=',
        logo: '📫',
        estimatedDays: '5-7'
      },
      {
        id: 'ecom',
        name: 'Ecom Express',
        trackingUrl: 'https://ecomexpress.in/tracking/?awb_field=',
        logo: '📦',
        estimatedDays: '3-4'
      }
    ];
  }

  // Track order via carrier
  async trackViaCarrier(trackingNumber, carrier) {
    try {
      const carriers = this.getShippingCarriers();
      const carrierInfo = carriers.find(c => c.id === carrier);
      
      if (!carrierInfo) {
        return {
          success: false,
          error: 'Invalid carrier'
        };
      }

      // In a real implementation, you would call the carrier's API
      // For demo purposes, we'll return mock data
      return {
        success: true,
        data: {
          trackingNumber,
          carrier: carrierInfo.name,
          trackingUrl: carrierInfo.trackingUrl + trackingNumber,
          status: 'In Transit',
          lastUpdate: new Date(),
          estimatedDelivery: this.calculateEstimatedDelivery('standard', 'metro')
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cancel order
  async cancelOrder(orderId, reason) {
    try {
      const orderRef = doc(this.db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        return {
          success: false,
          error: 'Order not found'
        };
      }

      const orderData = orderSnap.data();
      
      // Check if order can be cancelled
      const cancellableStatuses = ['pending', 'confirmed', 'processing'];
      if (!cancellableStatuses.includes(orderData.status)) {
        return {
          success: false,
          error: 'Order cannot be cancelled at this stage'
        };
      }

      // Update order status
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Add tracking update
      await this.addTrackingUpdate(orderId, {
        status: 'cancelled',
        timestamp: serverTimestamp(),
        notes: `Order cancelled: ${reason}`
      });

      return {
        success: true,
        message: 'Order cancelled successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Return order
  async initiateReturn(orderId, items, reason) {
    try {
      const orderRef = doc(this.db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        return {
          success: false,
          error: 'Order not found'
        };
      }

      const orderData = orderSnap.data();
      
      // Check if order can be returned
      if (orderData.status !== 'delivered') {
        return {
          success: false,
          error: 'Order must be delivered to initiate return'
        };
      }

      const returnId = `return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create return request
      const returnRef = doc(this.db, 'returns', returnId);
      await setDoc(returnRef, {
        returnId,
        orderId,
        userId: orderData.userId,
        items,
        reason,
        status: 'requested',
        requestedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Return request initiated successfully',
        returnId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clear all listeners
  clearAllListeners() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }
}

// Export singleton instance
const orderTrackingService = new OrderTrackingService();
export default orderTrackingService;