import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartLine, 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaDownload,
  FaSearch,
  FaFilter,
  FaBell,
  FaCog,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaGlobe,
  FaComments,
  FaFlag,
  FaHeart,
  FaShare,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import productService from '../services/productService';
import orderTrackingService from '../services/orderTrackingService';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [products, setProducts] = useState([]);
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notifications, setNotifications] = useState([]); 
  const [contentReports, setContentReports] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    conversionRate: 0,
    bounceRate: 0,
    avgSessionDuration: '0m 0s',
    newUsersToday: 0,
    activeUsers: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    contentReports: 0,
    popularCategories: [],
    topProducts: []
  });
  
  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await productService.getAllProducts({ limit: 100 });
        const formattedProducts = (data.products || []).map(product => ({
          id: product.productId || product._id,
          name: product.name?.en || product.name,
          price: product.pricing?.selling || product.price,
          category: product.category,
          brand: product.brand,
          imageUrl: product.images?.main || product.imageUrl,
          stock: product.inventory?.totalStock || 0,
          sales: product.sales || 0
        }));
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Fetch real analytics from MongoDB
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/analytics/dashboard?range=${dateRange}`);
        const data = await response.json();
        
        if (data.success && data.analytics) {
          setAnalytics({
            totalUsers: data.analytics.totalUsers || 0,
            totalOrders: data.analytics.totalOrders || 0,
            totalRevenue: data.analytics.totalRevenue || 0,
            totalProducts: products.length,
            conversionRate: data.analytics.conversionRate || 0,
            bounceRate: data.analytics.bounceRate || 0,
            avgSessionDuration: data.analytics.avgSessionDuration || '0m 0s',
            newUsersToday: data.analytics.newUsersToday || 0,
            activeUsers: data.analytics.activeUsers || 0,
            pendingOrders: data.analytics.pendingOrders || 0,
            lowStockItems: data.analytics.lowStockItems || 0,
            contentReports: data.analytics.contentReports || 0,
            popularCategories: data.analytics.popularCategories || [],
            topProducts: data.analytics.topProducts || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    }
    
    fetchAnalytics();
    
    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [dateRange, products.length]);

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: 89.99, status: 'Shipped', date: '2024-01-15', items: 2 },
    { id: 'ORD-002', customer: 'Jane Smith', amount: 129.99, status: 'Processing', date: '2024-01-14', items: 3 },
    { id: 'ORD-003', customer: 'Mike Johnson', amount: 59.99, status: 'Delivered', date: '2024-01-13', items: 1 },
    { id: 'ORD-004', customer: 'Sarah Wilson', amount: 199.99, status: 'Pending', date: '2024-01-12', items: 4 },
    { id: 'ORD-005', customer: 'Tom Brown', amount: 79.99, status: 'Cancelled', date: '2024-01-11', items: 2 }
  ];

  const inventoryAlerts = [
    { id: 1, product: 'Summer Dress', stock: 3, type: 'low_stock', severity: 'warning' },
    { id: 2, product: 'Leather Jacket', stock: 0, type: 'out_of_stock', severity: 'critical' },
    { id: 3, product: 'Casual Sneakers', stock: 2, type: 'low_stock', severity: 'warning' },
    { id: 4, product: 'Denim Jeans', stock: 1, type: 'critical_stock', severity: 'error' }
  ];

  const mockContentReports = [
    { id: 1, type: 'inappropriate_content', content: 'User post containing inappropriate language', reporter: 'user123', status: 'pending', date: '2024-01-15' },
    { id: 2, type: 'spam', content: 'Repeated promotional posts', reporter: 'user456', status: 'reviewed', date: '2024-01-14' },
    { id: 3, type: 'fake_review', content: 'Suspicious product review', reporter: 'user789', status: 'resolved', date: '2024-01-13' }
  ];

  const sections = [
    { id: 'overview', name: 'Overview', icon: FaChartLine },
    { id: 'analytics', name: 'Analytics', icon: FaChartLine },
    { id: 'products', name: 'Products', icon: FaBox },
    { id: 'inventory', name: 'Inventory', icon: FaBox },
    { id: 'orders', name: 'Orders', icon: FaShoppingCart },
    { id: 'customers', name: 'Customers', icon: FaUsers },
    { id: 'content', name: 'Content Moderation', icon: FaFlag },
    { id: 'reports', name: 'Reports', icon: FaDownload },
    { id: 'settings', name: 'Settings', icon: FaCog }
  ];

  useEffect(() => {
    // Simulate loading notifications
    setNotifications([
      { id: 1, type: 'warning', message: '8 products are low in stock', time: '2 min ago' },
      { id: 2, type: 'info', message: 'New order received #ORD-006', time: '5 min ago' },
      { id: 3, type: 'success', message: 'Monthly revenue target achieved', time: '1 hour ago' }
    ]);
    setContentReports(mockContentReports);
  }, []);

  const handleDeleteProduct = (productId) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  const handleResolveContentReport = (reportId) => {
    setContentReports(prev => 
      prev.map(report => 
        report.id === reportId ? { ...report, status: 'resolved' } : report
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend.startsWith('+')) return <FaArrowUp className="w-3 h-3 text-green-600" />;
    if (trend.startsWith('-')) return <FaArrowDown className="w-3 h-3 text-red-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="flex">
        {/* Enhanced Sidebar */}
        <div className="w-64 bg-white shadow-xl border-r border-gray-200">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600">
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <p className="text-purple-100 text-sm">Management Dashboard</p>
          </div>
          <nav className="mt-6 space-y-1">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-200 hover:bg-gray-50 ${
                    activeSection === section.id
                      ? 'bg-purple-50 text-purple-600 border-r-3 border-purple-600 font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {section.name}
                </button>
              );
            })}
          </nav>

          {/* Notifications Panel */}
          <div className="p-6 mt-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaBell className="w-4 h-4" />
              Recent Alerts
            </h3>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg text-xs ${
                    notification.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                    notification.type === 'info' ? 'bg-blue-50 text-blue-800' :
                    'bg-green-50 text-green-800'
                  }`}
                >
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-xs opacity-75 mt-1">{notification.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="flex-1 p-8">
          {/* Header with Quick Stats */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {sections.find(s => s.id === activeSection)?.name || 'Dashboard'}
                </h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2">
                  <FaDownload className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          {activeSection === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">${analytics.totalRevenue.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <FaArrowUp className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 text-xs font-medium">+12.5% from last month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-400 to-green-600 rounded-xl">
                      <FaChartLine className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.totalOrders}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <FaArrowUp className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 text-xs font-medium">+8.2% from last month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl">
                      <FaShoppingCart className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <FaArrowUp className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 text-xs font-medium">+15.3% from last month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl">
                      <FaUsers className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Active Products</p>
                      <p className="text-3xl font-bold text-gray-900">{analytics.totalProducts}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <FaArrowUp className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 text-xs font-medium">+5.1% from last month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl">
                      <FaBox className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FaClock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Pending Orders</p>
                      <p className="text-xl font-bold text-gray-900">{analytics.pendingOrders}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FaExclamationTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Low Stock</p>
                      <p className="text-xl font-bold text-gray-900">{analytics.lowStockItems}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaUsers className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Active Users</p>
                      <p className="text-xl font-bold text-gray-900">{analytics.activeUsers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaFlag className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Content Reports</p>
                      <p className="text-xl font-bold text-gray-900">{analytics.contentReports}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders and Inventory Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <FaShoppingCart className="w-5 h-5 text-blue-600" />
                      Recent Orders
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{order.id.slice(-1)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{order.customer}</p>
                              <p className="text-sm text-gray-500">{order.items} items • ${order.amount}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{order.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inventory Alerts */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <FaExclamationTriangle className="w-5 h-5 text-orange-600" />
                      Inventory Alerts
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {inventoryAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              alert.severity === 'critical' ? 'bg-red-500' :
                              alert.severity === 'error' ? 'bg-orange-500' : 'bg-yellow-500'
                            }`}></div>
                            <div>
                              <p className="font-medium text-gray-900">{alert.product}</p>
                              <p className="text-sm text-gray-500">{alert.stock} units remaining</p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Restock
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Products */}
          {activeSection === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Add New Product
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Search products..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>All Categories</option>
                      <option>Shirts</option>
                      <option>Pants</option>
                      <option>Dresses</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.slice(0, 10).map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img className="h-10 w-10 rounded-lg object-cover" src={product.imageUrl} alt={product.name} />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{product.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">In Stock</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-purple-600 hover:text-purple-900 mr-4">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Content Moderation */}
          {activeSection === 'content' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
                <div className="flex gap-3">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>All Reports</option>
                    <option>Pending</option>
                    <option>Reviewed</option>
                    <option>Resolved</option>
                  </select>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                    <FaFilter className="w-4 h-4" />
                    Filter
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FaFlag className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Total Reports</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{contentReports.length}</p>
                  <p className="text-sm text-gray-600 mt-2">3 pending review</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FaClock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">2.4h</p>
                  <p className="text-sm text-gray-600 mt-2">Average response time</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaCheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Resolution Rate</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">94%</p>
                  <p className="text-sm text-gray-600 mt-2">Reports resolved</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FaComments className="w-5 h-5 text-purple-600" />
                    Content Reports
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {contentReports.map((report) => (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                report.type === 'inappropriate_content' ? 'bg-red-100 text-red-800' :
                                report.type === 'spam' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {report.type.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                report.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {report.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-900 font-medium mb-1">{report.content}</p>
                            <p className="text-sm text-gray-600">Reported by {report.reporter} on {report.date}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button 
                              onClick={() => handleResolveContentReport(report.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                              <FaCheck className="w-3 h-3" />
                              Resolve
                            </button>
                            <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1">
                              <FaTimes className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Inventory Management */}
          {activeSection === 'inventory' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                <div className="flex gap-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <FaPlus className="w-4 h-4" />
                    Bulk Import
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                    <FaDownload className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaBox className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Total Items</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalProducts}</p>
                  <p className="text-sm text-gray-600 mt-2">Active products</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Low Stock</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.lowStockItems}</p>
                  <p className="text-sm text-gray-600 mt-2">Items need restock</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FaTimes className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Out of Stock</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">2</p>
                  <p className="text-sm text-gray-600 mt-2">Items unavailable</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaChartLine className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Inventory Value</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">$125K</p>
                  <p className="text-sm text-gray-600 mt-2">Total inventory worth</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Stock Alerts</h2>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        <option value="clothing">Clothing</option>
                        <option value="accessories">Accessories</option>
                        <option value="shoes">Shoes</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {inventoryAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'error' ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{alert.product}</p>
                            <p className="text-sm text-gray-600">
                              Stock: {alert.stock} units • 
                              Status: <span className={`font-medium ${
                                alert.type === 'out_of_stock' ? 'text-red-600' :
                                alert.type === 'critical_stock' ? 'text-orange-600' : 'text-yellow-600'
                              }`}>
                                {alert.type.replace('_', ' ').toUpperCase()}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Update Stock
                          </button>
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                            Reorder
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Analytics */}
          {activeSection === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <FaChartLine className="w-5 h-5 text-purple-600" />
                    Popular Categories
                  </h2>
                  <div className="space-y-4">
                    {analytics.popularCategories.map((category) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-900 font-medium">{category.name}</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(category.trend)}
                            <span className={`text-xs font-medium ${
                              category.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {category.trend}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                              style={{ width: `${(category.count / 50) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 font-medium min-w-[3ch]">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <FaUsers className="w-5 h-5 text-blue-600" />
                    Top Products
                  </h2>
                  <div className="space-y-4">
                    {analytics.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.sales} sales</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{analytics.conversionRate}%</div>
                    <div className="text-gray-600">Conversion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{analytics.bounceRate}%</div>
                    <div className="text-gray-600">Bounce Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{analytics.avgSessionDuration}</div>
                    <div className="text-gray-600">Avg Session</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">4.8/5</div>
                    <div className="text-gray-600">Customer Rating</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Orders Management */}
          {activeSection === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <div className="flex gap-3">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>All Orders</option>
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                    <FaDownload className="w-4 h-4" />
                    Export Orders
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalOrders}</p>
                  <p className="text-sm text-gray-600 mt-2">This month</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FaClock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.pendingOrders}</p>
                  <p className="text-sm text-gray-600 mt-2">Need attention</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaCheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalOrders - analytics.pendingOrders}</p>
                  <p className="text-sm text-gray-600 mt-2">Successfully delivered</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaChartLine className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">${analytics.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-2">Total sales</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Search orders..."
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <FaFilter className="w-4 h-4" />
                        Filter
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.items}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                                <FaEye className="w-3 h-3" />
                                View
                              </button>
                              <button className="text-purple-600 hover:text-purple-900 flex items-center gap-1">
                                <FaEdit className="w-3 h-3" />
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Customer Management */}
          {activeSection === 'customers' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
                <div className="flex gap-3">
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option>All Customers</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>VIP</option>
                  </select>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                    <FaDownload className="w-4 h-4" />
                    Export Data
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaUsers className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Total Customers</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</p>
                  <p className="text-sm text-gray-600 mt-2">Registered users</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaCheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Active Today</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.activeUsers}</p>
                  <p className="text-sm text-gray-600 mt-2">Online users</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaPlus className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">New Today</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.newUsersToday}</p>
                  <p className="text-sm text-gray-600 mt-2">New registrations</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FaHeart className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Retention Rate</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">87%</p>
                  <p className="text-sm text-gray-600 mt-2">Customer retention</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Customer List</h2>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Search customers..."
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                        <FaFilter className="w-4 h-4" />
                        Filter
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((_, index) => {
                      const customer = {
                        id: index + 1,
                        name: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown'][index],
                        email: ['john@example.com', 'jane@example.com', 'mike@example.com', 'sarah@example.com', 'tom@example.com'][index],
                        registeredDate: ['2024-01-10', '2024-01-08', '2024-01-05', '2023-12-20', '2023-12-15'][index],
                        totalOrders: [5, 8, 2, 12, 3][index],
                        totalSpent: [450, 720, 180, 980, 230][index],
                        status: ['active', 'active', 'inactive', 'active', 'active'][index]
                      };
                      return (
                        <div key={customer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">{customer.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{customer.name}</p>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                              <p className="text-xs text-gray-500">Joined {customer.registeredDate}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-gray-900">{customer.totalOrders}</p>
                            <p className="text-sm text-gray-600">Orders</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-gray-900">${customer.totalSpent}</p>
                            <p className="text-sm text-gray-600">Spent</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {customer.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                              <FaEye className="w-3 h-3" />
                              View
                            </button>
                            <button className="text-purple-600 hover:text-purple-900 flex items-center gap-1">
                              <FaEdit className="w-3 h-3" />
                              Edit
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}