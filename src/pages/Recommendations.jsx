import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getPersonalizedRecommendations, 
  getOccasionRecommendations,
  getTrendingItems,
  getCompleteOutfits
} from '../utils/recommendations';

export default function Recommendations() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personalized');
  const [selectedOccasion, setSelectedOccasion] = useState('casual');
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState({
    personalized: [],
    occasions: [],
    trending: [],
    outfits: []
  });

  // Real user profile from database
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile and preferences
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/users/${user.uid}`);
        const data = await response.json();
        
        if (data.success && data.user) {
          setUserProfile({
            preferredCategories: data.user.preferences?.categories || ['shirts', 'pants', 'accessories'],
            priceRange: data.user.preferences?.priceRange || { min: 20, max: 100 },
            sizes: data.user.measurements?.preferredSizes || ['M', 'L'],
            style: data.user.preferences?.style || 'casual',
            colors: data.user.preferences?.colors || ['blue', 'white', 'black']
          });
        } else {
          // Use default profile if user preferences not found
          setUserProfile({
            preferredCategories: ['shirts', 'pants', 'accessories'],
            priceRange: { min: 20, max: 100 },
            sizes: ['M', 'L'],
            style: 'casual',
            colors: ['blue', 'white', 'black']
          });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Use default profile on error
        setUserProfile({
          preferredCategories: ['shirts', 'pants', 'accessories'],
          priceRange: { min: 20, max: 100 },
          sizes: ['M', 'L'],
          style: 'casual',
          colors: ['blue', 'white', 'black']
        });
      }
    };
    
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!userProfile) return;
      
      setLoading(true);
      
      try {
        // Get real recommendations based on user profile
        const personalized = getPersonalizedRecommendations(userProfile, [], []);
        const occasions = getOccasionRecommendations(selectedOccasion, userProfile);
        const trending = getTrendingItems();
        const outfits = getCompleteOutfits(userProfile);
        
        setRecommendations({
          personalized,
          occasions,
          trending,
          outfits
        });
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [selectedOccasion, userProfile]);

  const tabs = [
    { id: 'personalized', name: 'For You', icon: '🎯', description: 'Personalized just for you' },
    { id: 'occasions', name: 'Occasions', icon: '📅', description: 'Perfect for any event' },
    { id: 'trending', name: 'Trending', icon: '🔥', description: 'What\'s hot right now' },
    { id: 'outfits', name: 'Complete Outfits', icon: '👔', description: 'Ready-to-wear looks' }
  ];

  const occasions = [
    { id: 'casual', name: 'Casual', emoji: '👕' },
    { id: 'formal', name: 'Formal', emoji: '👔' },
    { id: 'business', name: 'Business', emoji: '💼' },
    { id: 'party', name: 'Party', emoji: '🎉' },
    { id: 'workout', name: 'Workout', emoji: '💪' },
    { id: 'beach', name: 'Beach', emoji: '🏖️' },
    { id: 'date', name: 'Date', emoji: '❤️' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in for Personalized Recommendations</h2>
          <p className="text-gray-600 mb-6">Get AI-powered fashion suggestions tailored just for you.</p>
          <Link to="/login" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Recommendations</h1>
          <p className="text-gray-600">Discover your perfect style with AI-powered suggestions</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-xl text-center transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">{tab.icon}</div>
                <div className="font-medium">{tab.name}</div>
                <div className="text-xs opacity-75">{tab.description}</div>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Personalized Recommendations */}
            {activeTab === 'personalized' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Just For You</h2>
                  <p className="text-gray-600">Based on your style preferences and shopping history</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.personalized.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                      <div className="aspect-square overflow-hidden relative">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {Math.round(item.recommendationScore)}% match
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                        <p className="text-sm text-gray-500 capitalize mb-2">{item.category}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-purple-600">${item.price}</span>
                          <div className="flex gap-2">
                            <Link 
                              to={`/catalog/${item.id}`}
                              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            >
                              View
                            </Link>
                            <Link 
                              to="/try-on"
                              className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                            >
                              Try On
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Occasion-based Recommendations */}
            {activeTab === 'occasions' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfect for Every Occasion</h2>
                  
                  {/* Occasion Selector */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {occasions.map((occasion) => (
                      <button
                        key={occasion.id}
                        onClick={() => setSelectedOccasion(occasion.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                          selectedOccasion === occasion.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{occasion.emoji}</span>
                        <span className="font-medium">{occasion.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.occasions.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                      <div className="aspect-square overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 capitalize mb-2">{item.category}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-purple-600">${item.price}</span>
                          <Link 
                            to={`/catalog/${item.id}`}
                            className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Items */}
            {activeTab === 'trending' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Trending Now</h2>
                  <p className="text-gray-600">What everyone's talking about</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {recommendations.trending.map((item, index) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group">
                      <div className="aspect-square overflow-hidden relative">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          #{index + 1} Trending
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                        <p className="text-sm text-gray-500 capitalize mb-2">{item.category}</p>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600 mb-2">${item.price}</div>
                          <Link 
                            to={`/catalog/${item.id}`}
                            className="block bg-purple-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                          >
                            Shop Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Outfits */}
            {activeTab === 'outfits' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Outfits</h2>
                  <p className="text-gray-600">Perfectly curated looks ready to wear</p>
                </div>
                
                <div className="space-y-8">
                  {recommendations.outfits.map((outfit) => (
                    <div key={outfit.id} className="bg-white rounded-2xl shadow-sm p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{outfit.name}</h3>
                          <p className="text-gray-600 capitalize">Perfect for {outfit.occasion}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">${outfit.totalPrice.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">Complete outfit</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {outfit.items.map((item) => (
                          <div key={item.id} className="text-center">
                            <div className="aspect-square overflow-hidden rounded-lg mb-2">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">{item.name}</h4>
                            <p className="text-sm text-purple-600">${item.price}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-4">
                        <button className="flex-1 bg-purple-100 text-purple-600 py-3 px-6 rounded-lg font-medium hover:bg-purple-200 transition-colors">
                          ✨ Try Complete Outfit
                        </button>
                        <button className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                          Add All to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Can't Find What You're Looking For?</h2>
          <p className="mb-6">Get personalized styling advice from our AI fashion assistant</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/catalog"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Browse Full Catalog
            </Link>
            <Link 
              to="/try-on"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-colors"
            >
              Virtual Styling Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}