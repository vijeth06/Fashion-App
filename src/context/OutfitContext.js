import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';

const OutfitContext = createContext(null);

export const useOutfit = () => useContext(OutfitContext);

// Local storage keys for offline fallback
const FAVORITES_KEY = 'vf_favorites_v1';
const SAVED_OUTFITS_KEY = 'vf_saved_outfits_v1';
const LOOKS_KEY = 'vf_looks_v1';

export function OutfitProvider({ children }) {
  const { user } = useAuth();
  
  // User's uploaded photo
  const [uploadedImage, setUploadedImage] = useState(null);
  
  // Currently selected clothing item
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  
  // Liked/favorited items - fetch from database
  const [favorites, setFavorites] = useState([]);
  
  // Saved outfits - fetch from database
  const [savedOutfits, setSavedOutfits] = useState([]);

  // Saved composite images (Looks) - fetch from database
  const [looks, setLooks] = useState([]);

  // Fetch user's favorites from database on mount or user change
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.uid) {
        // Load from localStorage as fallback when not logged in
        try {
          const raw = localStorage.getItem(FAVORITES_KEY);
          setFavorites(raw ? JSON.parse(raw) : []);
        } catch {
          setFavorites([]);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.get(`/api/wishlist/${user.uid}`);
        if (response.success && response.wishlist) {
          setFavorites(response.wishlist.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        // Fallback to localStorage
        const raw = localStorage.getItem(FAVORITES_KEY);
        setFavorites(raw ? JSON.parse(raw) : []);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Fetch user's saved outfits (looks) from database
  useEffect(() => {
    const fetchLooks = async () => {
      if (!user?.uid) {
        // Load from localStorage as fallback
        try {
          const raw = localStorage.getItem(LOOKS_KEY);
          setLooks(raw ? JSON.parse(raw) : []);
          const outfitsRaw = localStorage.getItem(SAVED_OUTFITS_KEY);
          setSavedOutfits(outfitsRaw ? JSON.parse(outfitsRaw) : []);
        } catch {
          setLooks([]);
          setSavedOutfits([]);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.get(`/api/looks/user/${user.uid}`);
        if (response.success && response.looks) {
          setLooks(response.looks);
          setSavedOutfits(response.looks); // Looks serve as saved outfits
        }
      } catch (error) {
        console.error('Failed to fetch looks:', error);
        // Fallback to localStorage
        const raw = localStorage.getItem(LOOKS_KEY);
        setLooks(raw ? JSON.parse(raw) : []);
      } finally {
        setLoading(false);
      }
    };

    fetchLooks();
  }, [user]);

  // Persist to localStorage as backup (offline support)
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error);
    }
  }, [favorites]);
  
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(savedOutfits));
      localStorage.setItem(LOOKS_KEY, JSON.stringify(looks));
    } catch (error) {
      console.error('Failed to save outfits to localStorage:', error);
    }
  }, [savedOutfits, looks]);

  // Add an item to favorites - sync with database
  const addFavorite = async (item) => {
    if (!user?.uid) {
      // Offline mode - save to localStorage
      setFavorites((prev) => 
        prev.some((f) => f.id === item.id) ? prev : [...prev, item]
      );
      return;
    }

    try {
      const response = await apiService.post('/api/wishlist/add', {
        userId: user.uid,
        productId: item.id,
        product: item
      });
      
      if (response.success) {
        setFavorites((prev) => 
          prev.some((f) => f.id === item.id) ? prev : [...prev, item]
        );
      }
    } catch (error) {
      console.error('Failed to add favorite:', error);
      // Still add to local state as fallback
      setFavorites((prev) => 
        prev.some((f) => f.id === item.id) ? prev : [...prev, item]
      );
    }
  };
  
  // Remove an item from favorites - sync with database
  const removeFavorite = async (id) => {
    if (!user?.uid) {
      // Offline mode
      setFavorites((prev) => prev.filter((f) => f.id !== id));
      return;
    }

    try {
      await apiService.post('/api/wishlist/remove', {
        userId: user.uid,
        productId: id
      });
      
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      // Still remove from local state
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    }
  };
  
  // Save a new outfit - sync with database
  const saveOutfit = async (outfit) => {
    const newOutfit = {
      ...outfit,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    
    if (!user?.uid) {
      // Offline mode
      setSavedOutfits(prev => [newOutfit, ...prev]);
      return newOutfit;
    }

    try {
      const response = await apiService.post('/api/looks/create', {
        userId: user.uid,
        name: outfit.name,
        items: outfit.items || [],
        imageUrl: outfit.imageUrl || outfit.dataUrl,
        tags: outfit.tags || [],
        visibility: outfit.visibility || 'private'
      });
      
      if (response.success && response.look) {
        setSavedOutfits(prev => [response.look, ...prev]);
        setLooks(prev => [response.look, ...prev]);
        return response.look;
      }
    } catch (error) {
      console.error('Failed to save outfit:', error);
    }
    
    // Fallback to local save
    setSavedOutfits(prev => [newOutfit, ...prev]);
    return newOutfit;
  };
  
  // Remove a saved outfit - sync with database
  const removeOutfit = async (id) => {
    if (!user?.uid) {
      // Offline mode
      setSavedOutfits(prev => prev.filter(outfit => outfit.id !== id));
      return;
    }

    try {
      await apiService.delete(`/api/looks/${id}`);
      setSavedOutfits(prev => prev.filter(outfit => outfit.id !== id));
      setLooks(prev => prev.filter(look => look.id !== id));
    } catch (error) {
      console.error('Failed to remove outfit:', error);
      // Still remove from local state
      setSavedOutfits(prev => prev.filter(outfit => outfit.id !== id));
    }
  };

  // Add a composite image look - sync with database
  const addLook = async (dataUrl) => {
    const look = { 
      id: Date.now(), 
      dataUrl,
      date: new Date().toISOString()
    };
    
    if (!user?.uid) {
      // Offline mode
      setLooks((prev) => [look, ...prev]);
      return look;
    }

    try {
      const response = await apiService.post('/api/looks/create', {
        userId: user.uid,
        imageUrl: dataUrl,
        name: `Look ${new Date().toLocaleDateString()}`,
        visibility: 'private'
      });
      
      if (response.success && response.look) {
        setLooks((prev) => [response.look, ...prev]);
        return response.look;
      }
    } catch (error) {
      console.error('Failed to save look:', error);
    }
    
    // Fallback
    setLooks((prev) => [look, ...prev]);
    return look;
  };

  // Remove a composite image look - sync with database
  const removeLook = async (id) => {
    if (!user?.uid) {
      // Offline mode
      setLooks((prev) => prev.filter((l) => l.id !== id));
      return;
    }

    try {
      await apiService.delete(`/api/looks/${id}`);
      setLooks((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      console.error('Failed to remove look:', error);
      // Still remove from local state
      setLooks((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const value = useMemo(
    () => ({
      // Image handling
      uploadedImage,
      setUploadedImage,
      
      // Selected item
      selectedItem,
      setSelectedItem,
      
      // Loading state
      loading,
      
      // Favorites (real database sync)
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite: (id) => favorites.some(item => item.id === id || item.productId === id),
      
      // Outfits (real database sync)
      savedOutfits,
      saveOutfit,
      removeOutfit,

      // Looks (real database sync)
      looks,
      addLook,
      removeLook,
    }),
    [uploadedImage, selectedItem, favorites, savedOutfits, looks, loading]
  );

  return <OutfitContext.Provider value={value}>{children}</OutfitContext.Provider>;
}
