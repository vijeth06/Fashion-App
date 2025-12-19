import { useEffect, useState } from 'react';
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithTwitter,
  signInWithGithub,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  resetPassword,
  onAuthStateChange,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture
} from '../firebase/firebaseConfig';

export function useAuthState() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cache TTL for profile in milliseconds
  const PROFILE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      // Do not block rendering while we fetch the full profile.
      // Set a minimal user object and show the app immediately,
      // then fetch the richer profile in the background and update state.
      (async () => {
        if (firebaseUser) {
          const minimalUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            provider: firebaseUser.providerData[0]?.providerId || 'email',
            metadata: {
              creationTime: firebaseUser.metadata?.creationTime,
              lastSignInTime: firebaseUser.metadata?.lastSignInTime
            }
          };

          // Try to read a cached profile to render instantly
          try {
            const key = `userProfile_${minimalUser.uid}`;
            const cached = localStorage.getItem(key);
            if (cached) {
              const parsed = JSON.parse(cached);
              // support old cache format where parsed is raw data
              const parsedData = parsed.data || parsed;
              const cachedAt = parsed.cachedAt || 0;
              const isStale = Date.now() - cachedAt > PROFILE_CACHE_TTL_MS;
              // Use cached data for instant render, even if stale.
              setUserProfile(parsedData);
              setUser({ ...minimalUser, ...parsedData });
              // If cache is stale, we'll trigger a background refresh below
            } else {
              setUser(minimalUser);
            }
          } catch (e) {
            setUser(minimalUser);
          }

          // Allow the app to render right away
          setLoading(false);

          // Fetch latest profile in background and update state & cache
          try {
            const profileResult = await getUserProfile(minimalUser.uid);
            if (profileResult.success) {
              setUserProfile(profileResult.data);
              setUser(prev => ({ ...(prev || minimalUser), ...profileResult.data }));
              try {
                const key = `userProfile_${minimalUser.uid}`;
                localStorage.setItem(key, JSON.stringify({ data: profileResult.data, cachedAt: Date.now() }));
              } catch (e) {
                // ignore storage errors
              }
            } else if (profileResult.offline) {
              // If offline, we already rendered cached profile (if any). Nothing more to do.
            } else {
              // profile fetch failed but not due to offline — clear profile state
              setUserProfile(null);
            }
          } catch (err) {
            // swallow background fetch errors to avoid blocking UI
            console.error('Background profile fetch failed', err);
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }

        setError(null);
      })();
    });

    return () => unsubscribe();
  }, []);

  // Enhanced Sign Up with display name
  const signUp = async (email, password, displayName) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signUpWithEmail(email, password, displayName);
      if (result.success) {
        return { success: true, user: result.user, emailVerificationSent: result.emailVerificationSent };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced Sign In
  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error, code: result.code };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  const signInWithGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Facebook Sign In
  const signInWithFacebookAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithFacebook();
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Twitter Sign In
  const signInWithTwitterAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithTwitter();
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // GitHub Sign In
  const signInWithGithubAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGithub();
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const requestPasswordReset = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    try {
      const result = await updateUserProfile(user.uid, updates);
      if (result.success) {
        // Refresh user profile
        const profileResult = await getUserProfile(user.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.data);
          setUser({ ...user, ...profileResult.data });
          try {
            const key = `userProfile_${user.uid}`;
            localStorage.setItem(key, JSON.stringify({ data: profileResult.data, cachedAt: Date.now() }));
          } catch (e) {
            // ignore storage errors
          }
        }
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Upload Profile Picture
  const uploadAvatar = async (file) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    try {
      const result = await uploadProfilePicture(user.uid, file);
      if (result.success) {
        setUser({ ...user, photoURL: result.photoURL });
        try {
          // update cached profile if present
          const key = `userProfile_${user.uid}`;
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed = JSON.parse(cached);
            // Support both {data, cachedAt} format and legacy raw profile
            const parsedData = parsed.data || parsed;
            parsedData.photoURL = result.photoURL;
            const newCache = { data: parsedData, cachedAt: Date.now() };
            localStorage.setItem(key, JSON.stringify(newCache));
          }
        } catch (e) {
          // ignore storage errors
        }
        return { success: true, photoURL: result.photoURL };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signOutUser();
      if (result.success) {
        try {
          // Remove cached profile on sign out
          if (user && user.uid) {
            const key = `userProfile_${user.uid}`;
            localStorage.removeItem(key);
          }
        } catch (e) {
          // ignore
        }
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle: signInWithGoogleAuth,
    signInWithFacebook: signInWithFacebookAuth,
    signInWithTwitter: signInWithTwitterAuth,
    signInWithGithub: signInWithGithubAuth,
    requestPasswordReset,
    updateProfile,
    uploadAvatar,
    signOut
  };
}
