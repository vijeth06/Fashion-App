// 🔧 ADVANCED ADMIN DASHBOARD
// Features: Analytics, inventory management, user insights, trend tracking, sales reporting

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaChartLine, FaUsers, FaShoppingBag, FaDollarSign, FaArrowUp as FaTrendingUp,
  FaEye, FaHeart, FaShare, FaBox, FaWarehouse,
  FaDownload, FaStar, FaArrowUp,
  FaArrowDown, FaEquals, FaExclamationTriangle
} from 'react-icons/fa';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Mock data for dashboard
const mockAnalytics = {
  overview: {
    totalUsers: 25847,
    activeUsers: 18923,
    totalSales: 2456789,
    totalOrders: 15632,
    conversionRate: 12.4,
    avgOrderValue: 157.23
  },
  trends: {
    userGrowth: [12, 19, 15, 25, 22, 30, 35],
    salesGrowth: [65000, 85000, 92000, 105000, 120000, 135000, 145000],
    orderVolume: [520, 680, 750, 890, 920, 1050, 1150]
  },
  demographics: {
    ageGroups: {
      '18-24': 28,
      '25-34': 35,
      '35-44': 22,
      '45-54': 10,
      '55+': 5
    },
    locations: {
      'North America': 45,
      'Europe': 30,
      'Asia': 20,
      'Other': 5
    },
    devices: {
      'Mobile': 65,
      'Desktop': 25,
      'Tablet': 10
    }
  },
  products: {
    topSelling: [
      { id: 1, name: 'Smart Casual Jacket', sales: 1250, revenue: 125000 },
      { id: 2, name: 'Eco Cotton Dress', sales: 980, revenue: 98000 },
      { id: 3, name: 'Tech Denim Jeans', sales: 756, revenue: 85000 }
    ],
    inventory: {
      totalProducts: 2847,
      lowStock: 23,
      outOfStock: 7,
      overstocked: 45
    }
  }
};

// Stat Card Component
function StatCard({ title, value, change, icon: Icon, color = 'blue' }) {
  const isPositive = change > 0;
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
          isPositive 
            ? 'bg-green-100 text-green-700' 
            : change < 0
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {isPositive ? <FaArrowUp className="w-3 h-3" /> : 
           change < 0 ? <FaArrowDown className="w-3 h-3" /> : 
           <FaEquals className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-gray-600 text-sm">{title}</p>
      </div>
    </motion.div>
  );
}

// Chart configurations
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

// Analytics Overview
function AnalyticsOverview({ data }) {
  const salesData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
    datasets: [
      {
        label: 'Sales Revenue',
        data: data.trends.salesGrowth,
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
      },
    ],
  };

  const userGrowthData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
    datasets: [
      {
        label: 'New Users',
        data: data.trends.userGrowth,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Sales Trend</h3>
        <div className="h-64">
          <Line data={salesData} options={chartOptions} />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth</h3>
        <div className="h-64">
          <Bar data={userGrowthData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

// Demographics Panel
function DemographicsPanel({ data }) {
  const ageData = {
    labels: Object.keys(data.ageGroups),
    datasets: [
      {
        data: Object.values(data.ageGroups),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
      },
    ],
  };

  const deviceData = {
    labels: Object.keys(data.devices),
    datasets: [
      {
        data: Object.values(data.devices),
        backgroundColor: [
          '#FF9F40',
          '#FF6384',
          '#4BC0C0'
        ],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Age Demographics</h3>
        <div className="h-48">
          <Doughnut data={ageData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Device Usage</h3>
        <div className="h-48">
          <Pie data={deviceData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Geographic Distribution</h3>
        <div className="space-y-3">
          {Object.entries(data.locations).map(([location, percentage]) => (
            <div key={location} className="flex items-center justify-between">
              <span className="text-gray-700">{location}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Inventory Management
function InventoryManagement({ data }) {
  const inventoryStats = [
    { label: 'Total Products', value: data.totalProducts, color: 'blue', icon: FaBox },
    { label: 'Low Stock', value: data.lowStock, color: 'orange', icon: FaExclamationTriangle },
    { label: 'Out of Stock', value: data.outOfStock, color: 'red', icon: FaExclamationTriangle },
    { label: 'Overstocked', value: data.overstocked, color: 'yellow', icon: FaWarehouse }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Inventory Overview</h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <FaDownload className="w-4 h-4 inline mr-2" />
          Export Report
        </button>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {inventoryStats.map((stat, index) => (
          <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
            <stat.icon className={`w-8 h-8 mx-auto mb-2 ${
              stat.color === 'blue' ? 'text-blue-600' :
              stat.color === 'orange' ? 'text-orange-600' :
              stat.color === 'red' ? 'text-red-600' :
              'text-yellow-600'
            }`} />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Top Selling Products */}
      <div>
        <h4 className="font-bold text-gray-900 mb-4">Top Selling Products</h4>
        <div className="space-y-3">
          {data.parent?.topSelling?.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.sales} units sold</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">${product.revenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Revenue</div>
              </div>
            </div>
          )) || []}
        </div>
      </div>
    </div>
  );
}

// User Insights Panel
function UserInsights({ data }) {
  const engagementMetrics = [
    { label: 'Avg. Session Duration', value: '8m 32s', change: 15.2, icon: FaEye },
    { label: 'Page Views per Session', value: '4.7', change: 8.1, icon: FaEye },
    { label: 'Try-On Rate', value: '34%', change: 22.5, icon: FaHeart },
    { label: 'Social Shares', value: '1.2k', change: 45.8, icon: FaShare }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">User Engagement Insights</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {engagementMetrics.map((metric, index) => (
          <div key={index} className="text-center p-4 border border-gray-200 rounded-xl">
            <metric.icon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-gray-900">{metric.value}</div>
            <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
            <div className="flex items-center justify-center gap-1 text-xs text-green-600">
              <FaArrowUp className="w-3 h-3" />
              {metric.change}%
            </div>
          </div>
        ))}
      </div>

      {/* User Activity Timeline */}
      <div>
        <h4 className="font-bold text-gray-900 mb-4">Recent User Activity</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {[
            { user: 'Sophie Chen', action: 'Completed AR try-on session', time: '2 min ago', type: 'tryon' },
            { user: 'Marcus Rivera', action: 'Shared outfit on social feed', time: '5 min ago', type: 'social' },
            { user: 'Elena Volkov', action: 'Made purchase - $156.78', time: '8 min ago', type: 'purchase' },
            { user: 'James Wilson', action: 'Started collaborative styling', time: '12 min ago', type: 'collaboration' },
            { user: 'Maria Garcia', action: 'Used AI style assistant', time: '15 min ago', type: 'ai' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                activity.type === 'purchase' ? 'bg-green-500' :
                activity.type === 'tryon' ? 'bg-purple-500' :
                activity.type === 'social' ? 'bg-blue-500' :
                activity.type === 'collaboration' ? 'bg-orange-500' :
                'bg-pink-500'
              }`} />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{activity.user}</div>
                <div className="text-sm text-gray-600">{activity.action}</div>
              </div>
              <div className="text-xs text-gray-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Admin Dashboard Component
export default function AdvancedAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7days');
  const [data] = useState(mockAnalytics);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FaChartLine },
    { id: 'analytics', name: 'Analytics', icon: FaTrendingUp },
    { id: 'users', name: 'Users', icon: FaUsers },
    { id: 'inventory', name: 'Inventory', icon: FaBox },
    { id: 'insights', name: 'Insights', icon: FaEye }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Comprehensive analytics and management platform</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
            
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <FaDownload className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Dashboard Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
                <StatCard 
                  title="Total Users" 
                  value={data.overview.totalUsers.toLocaleString()} 
                  change={15.2} 
                  icon={FaUsers} 
                  color="blue" 
                />
                <StatCard 
                  title="Active Users" 
                  value={data.overview.activeUsers.toLocaleString()} 
                  change={8.7} 
                  icon={FaEye} 
                  color="green" 
                />
                <StatCard 
                  title="Total Sales" 
                  value={`$${(data.overview.totalSales / 1000000).toFixed(1)}M`} 
                  change={23.4} 
                  icon={FaDollarSign} 
                  color="purple" 
                />
                <StatCard 
                  title="Total Orders" 
                  value={data.overview.totalOrders.toLocaleString()} 
                  change={12.8} 
                  icon={FaShoppingBag} 
                  color="orange" 
                />
                <StatCard 
                  title="Conversion Rate" 
                  value={`${data.overview.conversionRate}%`} 
                  change={3.2} 
                  icon={FaTrendingUp} 
                  color="indigo" 
                />
                <StatCard 
                  title="Avg. Order Value" 
                  value={`$${data.overview.avgOrderValue}`} 
                  change={-2.1} 
                  icon={FaStar} 
                  color="red" 
                />
              </div>

              <AnalyticsOverview data={data} />
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <AnalyticsOverview data={data} />
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <>
              <DemographicsPanel data={data.demographics} />
              <UserInsights data={data} />
            </>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <InventoryManagement data={{ ...data.products.inventory, parent: data.products }} />
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <UserInsights data={data} />
          )}
        </div>
      </div>
    </div>
  );
}