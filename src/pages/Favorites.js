import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [likedItems, setLikedItems] = useState([]);
  
  // In a real app, this would be fetched from an API or context
  useEffect(() => {
    // Mock data for demonstration
    const mockSavedOutfits = [
      { id: 1, name: 'Summer Look', imageUrl: 'https://images.unsplash.com/photo-1485965373059-f07aacff3b26?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', date: '2023-06-15' },
      { id: 2, name: 'Casual Friday', imageUrl: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', date: '2023-06-10' },
    ];
    
    const mockLikedItems = [
      { id: 1, name: 'Classic White T-Shirt', price: 24.99, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
      { id: 3, name: 'Floral Summer Dress', price: 49.99, imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    ];
    
    setSavedOutfits(mockSavedOutfits);
    setLikedItems(mockLikedItems);
  }, []);
  
  const removeOutfit = (id) => {
    setSavedOutfits(prev => prev.filter(outfit => outfit.id !== id));
  };
  
  const removeLikedItem = (id) => {
    setLikedItems(prev => prev.filter(item => item.id !== id));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
      
      {/* Saved Outfits */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Saved Outfits</h2>
          <Link to="/try" className="text-primary hover:underline">
            Create New Outfit →
          </Link>
        </div>
        
        {savedOutfits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOutfits.map(outfit => (
              <div key={outfit.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative" style={{ paddingBottom: '125%' }}>
                  <img 
                    src={outfit.imageUrl} 
                    alt={outfit.name}
                    className="absolute h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{outfit.name}</h3>
                      <p className="text-sm text-gray-500">Saved on {new Date(outfit.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="text-gray-400 hover:text-primary"
                        onClick={() => removeOutfit(outfit.id)}
                        aria-label="Remove outfit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Link 
                      to={`/try?outfit=${outfit.id}`}
                      className="btn btn-outline text-sm"
                    >
                      View Outfit
                    </Link>
                    <button className="btn btn-primary text-sm">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">👕</div>
            <h3 className="text-xl font-medium mb-2">No saved outfits yet</h3>
            <p className="text-gray-600 mb-4">Try on some clothes and save your favorite looks!</p>
            <Link to="/try" className="btn btn-primary">
              Start Trying On
            </Link>
          </div>
        )}
      </section>
      
      {/* Liked Items */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Liked Items</h2>
        
        {likedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {likedItems.map(item => (
              <div key={item.id} className="group relative">
                <div className="relative overflow-hidden rounded-lg" style={{ paddingBottom: '125%' }}>
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="absolute h-full w-full object-cover group-hover:opacity-75 transition-opacity"
                  />
                  <button 
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50"
                    onClick={() => removeLikedItem(item.id)}
                    aria-label="Remove from liked items"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm font-medium text-primary">${item.price}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="text-xl font-medium mb-2">No liked items yet</h3>
            <p className="text-gray-600 mb-4">Browse our catalog and like items to save them here</p>
            <Link to="/catalog" className="btn btn-primary">
              Browse Catalog
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Favorites;
