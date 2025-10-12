import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clothingItems, categories } from '../data/clothingItems';
import { FiSearch, FiFilter, FiX, FiArrowRight } from 'react-icons/fi';

const Catalog = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Get category from URL if provided
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category && categories.includes(category)) {
      setSelectedCategory(category);
    }
  }, [location]);
  
  const categoryDisplayNames = {
    'all': 'All Items',
    'shirts': 'Tops & Shirts',
    'pants': 'Bottoms',
    'dresses': 'Dresses',
    'jackets': 'Outerwear',
    'accessories': 'Accessories',
    'footwear': 'Shoes',
    'activewear': 'Activewear',
    'swimwear': 'Swimwear'
  };

  const filteredItems = clothingItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
                         item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    return matchesCategory && matchesSearch && matchesPrice;
  });
  
  const handlePriceChange = (e, index) => {
    const newValue = parseInt(e.target.value);
    const newRange = [...priceRange];
    newRange[index] = newValue;
    setPriceRange(newRange);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Shop Our Collection</h1>
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for items..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <FiFilter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Filters */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                {['all', ...categories].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{categoryDisplayNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}</span>
                      <span className="text-sm text-gray-500">
                        {category === 'all' 
                          ? clothingItems.length 
                          : clothingItems.filter(item => item.category === category).length}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange(e, 0)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 1)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {(selectedCategory !== 'all' || searchQuery || priceRange[0] > 0 || priceRange[1] < 200) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setPriceRange([0, 200]);
                  }}
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <FiX className="mr-1" /> Clear all filters
                </button>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {categoryDisplayNames[selectedCategory]}
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 text-primary-600 hover:text-primary-900"
                  >
                    <FiX size={16} />
                  </button>
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 200) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  ${priceRange[0]} - ${priceRange[1]}
                  <button 
                    onClick={() => setPriceRange([0, 200])}
                    className="ml-2 text-blue-600 hover:text-blue-900"
                  >
                    <FiX size={16} />
                  </button>
                </span>
              )}
            </div>
            
            {/* Clothing Items Grid */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <ClothingItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setPriceRange([0, 200]);
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Filter Sidebar */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setIsMobileFilterOpen(false)}
              ></div>
              <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
                <div className="w-screen max-w-md">
                  <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                    <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                        <button
                          type="button"
                          className="-mr-2 p-2 rounded-md text-gray-400 hover:text-gray-500"
                          onClick={() => setIsMobileFilterOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <FiX className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="font-medium text-gray-900">Categories</h3>
                        <div className="mt-4 space-y-2">
                          {['all', ...categories].map((category) => (
                            <button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                selectedCategory === category
                                  ? 'bg-primary-50 text-primary-700 font-medium'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{categoryDisplayNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                <span className="text-sm text-gray-500">
                                  {category === 'all' 
                                    ? clothingItems.length 
                                    : clothingItems.filter(item => item.category === category).length}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                        
                        <div className="mt-8">
                          <h3 className="font-medium text-gray-900">Price Range</h3>
                          <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>${priceRange[0]}</span>
                              <span>${priceRange[1]}</span>
                            </div>
                            <div className="px-2">
                              <input
                                type="range"
                                min="0"
                                max="200"
                                value={priceRange[0]}
                                onChange={(e) => handlePriceChange(e, 0)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <input
                                type="range"
                                min="0"
                                max="200"
                                value={priceRange[1]}
                                onChange={(e) => handlePriceChange(e, 1)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-4"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <button
                        type="button"
                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={() => setIsMobileFilterOpen(false)}
                      >
                        Apply filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ClothingItemCard = ({ item }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  
  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    // Here you would typically update the user's saved items in your state/backend
  };
  
  return (
    <div className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200">
      <Link 
        to={`/try?item=${item.id}`}
        className="block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden" style={{ paddingBottom: '125%' }}>
          <img
            src={item.imageUrl}
            alt={item.name}
            className="absolute h-full w-full object-cover transition-transform duration-500"
            style={{ 
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
          <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="w-full py-2 px-4 bg-white text-gray-900 rounded-md font-medium text-sm flex items-center justify-center gap-2">
              Try it on
              <FiArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-1">{item.name}</h3>
            <p className="text-sm text-gray-500 capitalize mt-0.5">
              {item.category.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">${item.price.toFixed(2)}</span>
            <button
              onClick={toggleSave}
              className={`p-1 rounded-full transition-colors ${
                isSaved ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={isSaved ? 'Remove from saved' : 'Save for later'}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path 
                  fillRule="evenodd" 
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-gray-500 ml-1">(24)</span>
          </div>
          
          <Link 
            to={`/try?item=${item.id}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-800"
          >
            Try it on
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
