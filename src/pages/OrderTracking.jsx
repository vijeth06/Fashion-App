import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { 
  FaBox, 
  FaTruck, 
  FaCheckCircle, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaCopy,
  FaExternalLinkAlt,
  FaArrowLeft,
  FaClock,
  FaUser,
  FaHome,
  FaShoppingBag
} from 'react-icons/fa';
import orderTrackingService from '../services/orderTrackingService';

const OrderTracking = () => {
  const { orderId } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (orderId) {
      loadTrackingData();

      const unsubscribe = orderTrackingService.subscribeToTracking(orderId, (data) => {
        if (data.success) {
          setTrackingData(data.data);
        } else {
          setError(data.error);
        }
      });

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [orderId]);

  const loadTrackingData = async () => {
    setLoading(true);
    try {
      const result = await orderTrackingService.getTrackingHistory(orderId);
      if (result.success) {
        setTrackingData(result.data);

        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => o.orderId === orderId);
        setOrderDetails(order);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingNumber = () => {
    if (trackingData?.trackingNumber) {
      navigator.clipboard.writeText(trackingData.trackingNumber);

    }
  };

  const openCarrierTracking = () => {
    if (trackingData?.trackingNumber && trackingData?.carrier) {
      const carriers = orderTrackingService.getShippingCarriers();
      const carrier = carriers.find(c => c.id === trackingData.carrier);
      if (carrier) {
        window.open(carrier.trackingUrl + trackingData.trackingNumber, '_blank');
      }
    }
  };

  const getStatusInfo = (status) => {
    const statuses = orderTrackingService.getOrderStatuses();
    return statuses[status] || statuses['pending'];
  };

  const getProgressPercentage = () => {
    if (!trackingData?.currentStatus) return 0;
    const statusInfo = getStatusInfo(trackingData.currentStatus);
    return statusInfo.progress;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md mx-4">
          <FaBox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusInfo = getStatusInfo(trackingData?.currentStatus || 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
                <p className="text-gray-600">Order #{orderId}</p>
              </div>
            </div>
            
            {trackingData?.trackingNumber && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="font-mono font-medium text-gray-900">{trackingData.trackingNumber}</p>
                </div>
                <button
                  onClick={copyTrackingNumber}
                  className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <FaCopy className="w-4 h-4" />
                </button>
                <button
                  onClick={openCarrierTracking}
                  className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <FaExternalLinkAlt className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-2 space-y-6">
            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${currentStatusInfo.bgColor}`}>
                    <span className="text-2xl">{currentStatusInfo.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{currentStatusInfo.label}</h2>
                    <p className="text-gray-600">{currentStatusInfo.description}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatusInfo.bgColor} ${currentStatusInfo.color}`}>
                  {getProgressPercentage()}% Complete
                </div>
              </div>

              {}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {}
              {trackingData?.estimatedDelivery && (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <FaClock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Estimated Delivery</p>
                    <p className="text-green-700">
                      {new Date(trackingData.estimatedDelivery.toDate()).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">Tracking History</h3>
              
              <div className="space-y-4">
                {trackingData?.trackingHistory?.map((entry, index) => {
                  const statusInfo = getStatusInfo(entry.status);
                  const isLatest = index === trackingData.trackingHistory.length - 1;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-full ${isLatest ? statusInfo.bgColor : 'bg-gray-100'}`}>
                          <span className="text-lg">{statusInfo.icon}</span>
                        </div>
                        {index < trackingData.trackingHistory.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                        )}
                      </div>
                      
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium ${isLatest ? statusInfo.color : 'text-gray-900'}`}>
                            {statusInfo.label}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {entry.timestamp && new Date(entry.timestamp.toDate()).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{statusInfo.description}</p>
                        {entry.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <FaMapMarkerAlt className="w-3 h-3" />
                            {entry.location}
                          </div>
                        )}
                        {entry.notes && (
                          <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {}
          <div className="space-y-6">
            {}
            {orderDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaShoppingBag className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Order Value</p>
                      <p className="text-gray-600">â‚¹{orderDetails.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FaUser className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Customer</p>
                      <p className="text-gray-600">{orderDetails.customerInfo?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <FaHome className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Delivery Address</p>
                      <div className="text-gray-600 text-sm">
                        <p>{orderDetails.shippingAddress?.street}</p>
                        <p>{orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.state}</p>
                        <p>{orderDetails.shippingAddress?.zipCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {}
            {trackingData?.carrier && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Carrier</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaTruck className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {orderTrackingService.getShippingCarriers().find(c => c.id === trackingData.carrier)?.name}
                      </p>
                      <p className="text-gray-600 text-sm">Shipping Partner</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={openCarrierTracking}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  >
                    <FaExternalLinkAlt className="w-4 h-4" />
                    Track on Carrier Website
                  </button>
                </div>
              </motion.div>
            )}

            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
              
              <div className="space-y-3">
                <a
                  href="tel:+911234567890"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaPhone className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Call Support</p>
                    <p className="text-gray-600 text-sm">+91 12345 67890</p>
                  </div>
                </a>
                
                <a
                  href="mailto:support@virtualfashion.com"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaEnvelope className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-gray-600 text-sm">support@virtualfashion.com</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;