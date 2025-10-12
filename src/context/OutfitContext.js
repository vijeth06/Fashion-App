import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const OutfitContext = createContext(null);

export const useOutfit = () => useContext(OutfitContext);

// Local storage keys
const FAVORITES_KEY = 'vf_favorites_v1';
const SAVED_OUTFITS_KEY = 'vf_saved_outfits_v1';
const LOOKS_KEY = 'vf_looks_v1';

// Sample data for demonstration
const SAMPLE_OUTFITS = [
  { 
    id: 1, 
    name: 'Summer Look', 
    imageUrl: 'https://images.unsplash.com/photo-1485965373059-f07aacff3b26?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', 
    date: '2023-06-15',
    items: [1, 3] // IDs of clothing items in this outfit
  },
  { 
    id: 2, 
    name: 'Casual Friday', 
    imageUrl: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', 
    date: '2023-06-10',
    items: [2, 5]
  },
];

export function OutfitProvider({ children }) {
  // User's uploaded photo
  const [uploadedImage, setUploadedImage] = useState(null);
  
  // Currently selected clothing item
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Liked/favorited items
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  
  // Saved outfits (collections of items)
  const [savedOutfits, setSavedOutfits] = useState(() => {
    try {
      const raw = localStorage.getItem(SAVED_OUTFITS_KEY);
      return raw ? JSON.parse(raw) : SAMPLE_OUTFITS;
    } catch {
      return SAMPLE_OUTFITS;
    }
  });

  // Saved composite images (Looks)
  const [looks, setLooks] = useState(() => {
    try {
      const raw = localStorage.getItem(LOOKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Persist favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, [favorites]);
  
  // Persist savedOutfits to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(savedOutfits));
    } catch (error) {
      console.error('Failed to save outfits:', error);
    }
  }, [savedOutfits]);

  // Persist looks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOOKS_KEY, JSON.stringify(looks));
    } catch (error) {
      console.error('Failed to save looks:', error);
    }
  }, [looks]);

  // Add an item to favorites
  const addFavorite = (item) => {
    setFavorites((prev) => 
      prev.some((f) => f.id === item.id) ? prev : [...prev, item]
    );
  };
  
  // Remove an item from favorites
  const removeFavorite = (id) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };
  
  // Save a new outfit (metadata-driven collections)
  const saveOutfit = (outfit) => {
    const newOutfit = {
      ...outfit,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setSavedOutfits(prev => [newOutfit, ...prev]);
    return newOutfit;
  };
  
  // Remove a saved outfit
  const removeOutfit = (id) => {
    setSavedOutfits(prev => prev.filter(outfit => outfit.id !== id));
  };

  // Add a composite image look
  const addLook = (dataUrl) => {
    const look = { id: Date.now(), dataUrl };
    setLooks((prev) => [look, ...prev]);
    return look;
  };

  // Remove a composite image look
  const removeLook = (id) => {
    setLooks((prev) => prev.filter((l) => l.id !== id));
  };

  const value = useMemo(
    () => ({
      // Image handling
      uploadedImage,
      setUploadedImage,
      
      // Selected item
      selectedItem,
      setSelectedItem,
      
      // Favorites
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite: (id) => favorites.some(item => item.id === id),
      
      // Outfits (metadata)
      savedOutfits,
      saveOutfit,
      removeOutfit,

      // Looks (composite images)
      looks,
      addLook,
      removeLook,
    }),
    [uploadedImage, selectedItem, favorites, savedOutfits, looks]
  );

  return <OutfitContext.Provider value={value}>{children}</OutfitContext.Provider>;
}
