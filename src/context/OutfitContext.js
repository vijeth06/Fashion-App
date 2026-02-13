import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';
import wishlistService from '../services/wishlistService';

const OutfitContext = createContext(null);

export const useOutfit = () => useContext(OutfitContext);

const FAVORITES_KEY = 'vf_favorites_v1';
const SAVED_OUTFITS_KEY = 'vf_saved_outfits_v1';
const LOOKS_KEY = 'vf_looks_v1';

export function OutfitProvider({ children }) {
  const { user } = useAuth();

  const [uploadedImage, setUploadedImage] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);

  const [loading, setLoading] = useState(false);

  const [favorites, setFavorites] = useState([]);

  const [savedOutfits, setSavedOutfits] = useState([]);

  const [looks, setLooks] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.uid) {

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
        const response = await wishlistService.getWishlist(user.uid);
        if (response.success) {
          setFavorites(response.data?.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);

        const raw = localStorage.getItem(FAVORITES_KEY);
        setFavorites(raw ? JSON.parse(raw) : []);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  useEffect(() => {
    const fetchLooks = async () => {
      if (!user?.uid) {

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
        const response = await apiService.get(`/looks/user/${user.uid}`);
        if (response.success && response.looks) {
          setLooks(response.looks);
          setSavedOutfits(response.looks); // Looks serve as saved outfits
        }
      } catch (error) {
        console.error('Failed to fetch looks:', error);

        const raw = localStorage.getItem(LOOKS_KEY);
        setLooks(raw ? JSON.parse(raw) : []);
      } finally {
        setLoading(false);
      }
    };

    fetchLooks();
  }, [user]);

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

  const addFavorite = async (item) => {
    if (!user?.uid) {

      setFavorites((prev) => 
        prev.some((f) => f.id === item.id) ? prev : [...prev, item]
      );
      return;
    }

    try {
      const response = await wishlistService.addToWishlist(user.uid, item.id, item);
      if (response.success) {
        setFavorites((prev) =>
          prev.some((f) => f.id === item.id) ? prev : [...prev, item]
        );
      }
    } catch (error) {
      console.error('Failed to add favorite:', error);

      setFavorites((prev) => 
        prev.some((f) => f.id === item.id) ? prev : [...prev, item]
      );
    }
  };

  const removeFavorite = async (id) => {
    if (!user?.uid) {

      setFavorites((prev) => prev.filter((f) => f.id !== id));
      return;
    }

    try {
      await wishlistService.removeFromWishlist(user.uid, id);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error('Failed to remove favorite:', error);

      setFavorites((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const saveOutfit = async (outfit) => {
    const newOutfit = {
      ...outfit,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    
    if (!user?.uid) {

      setSavedOutfits(prev => [newOutfit, ...prev]);
      return newOutfit;
    }

    try {
      const response = await apiService.post('/looks/create', {
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

    setSavedOutfits(prev => [newOutfit, ...prev]);
    return newOutfit;
  };

  const removeOutfit = async (id) => {
    if (!user?.uid) {

      setSavedOutfits(prev => prev.filter(outfit => outfit.id !== id));
      return;
    }

    try {
      await apiService.delete(`/looks/${id}`);
      setSavedOutfits(prev => prev.filter(outfit => outfit.id !== id));
      setLooks(prev => prev.filter(look => look.id !== id));
    } catch (error) {
      console.error('Failed to remove outfit:', error);

      setSavedOutfits(prev => prev.filter(outfit => outfit.id !== id));
    }
  };

  const addLook = async (dataUrl) => {
    const look = { 
      id: Date.now(), 
      dataUrl,
      date: new Date().toISOString()
    };
    
    if (!user?.uid) {

      setLooks((prev) => [look, ...prev]);
      return look;
    }

    try {
      const response = await apiService.post('/looks/create', {
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

    setLooks((prev) => [look, ...prev]);
    return look;
  };

  const removeLook = async (id) => {
    if (!user?.uid) {

      setLooks((prev) => prev.filter((l) => l.id !== id));
      return;
    }

    try {
      await apiService.delete(`/looks/${id}`);
      setLooks((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      console.error('Failed to remove look:', error);

      setLooks((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const value = useMemo(
    () => ({

      uploadedImage,
      setUploadedImage,

      selectedItem,
      setSelectedItem,

      loading,

      favorites,
      addFavorite,
      removeFavorite,
      isFavorite: (id) => favorites.some(item => item.id === id || item.productId === id),

      savedOutfits,
      saveOutfit,
      removeOutfit,

      looks,
      addLook,
      removeLook,
    }),
    [uploadedImage, selectedItem, favorites, savedOutfits, looks, loading]
  );

  return <OutfitContext.Provider value={value}>{children}</OutfitContext.Provider>;
}
