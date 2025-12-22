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

  const PROFILE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    const unsubscribe = onAuthStateChange((firebaseUser) => {

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

          try {
            const key = `userProfile_${minimalUser.uid}`;
            const cached = localStorage.getItem(key);
            if (cached) {
              const parsed = JSON.parse(cached);

              const parsedData = parsed.data || parsed;
              const cachedAt = parsed.cachedAt || 0;
              const isStale = Date.now() - cachedAt > PROFILE_CACHE_TTL_MS;

              setUserProfile(parsedData);
              setUser({ ...minimalUser, ...parsedData });

            } else {
              setUser(minimalUser);
            }
          } catch (e) {
            setUser(minimalUser);
          }

          setLoading(false);

          try {
            const profileResult = await getUserProfile(minimalUser.uid);
            if (profileResult.success) {
              setUserProfile(profileResult.data);
              setUser(prev => ({ ...(prev || minimalUser), ...profileResult.data }));
              try {
                const key = `userProfile_${minimalUser.uid}`;
                localStorage.setItem(key, JSON.stringify({ data: profileResult.data, cachedAt: Date.now() }));
              } catch (e) {

              }
            } else if (profileResult.offline) {

            } else {

              setUserProfile(null);
            }
          } catch (err) {

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

  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    try {
      const result = await updateUserProfile(user.uid, updates);
      if (result.success) {

        const profileResult = await getUserProfile(user.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.data);
          setUser({ ...user, ...profileResult.data });
          try {
            const key = `userProfile_${user.uid}`;
            localStorage.setItem(key, JSON.stringify({ data: profileResult.data, cachedAt: Date.now() }));
          } catch (e) {

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

  const uploadAvatar = async (file) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    try {
      const result = await uploadProfilePicture(user.uid, file);
      if (result.success) {
        setUser({ ...user, photoURL: result.photoURL });
        try {

          const key = `userProfile_${user.uid}`;
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed = JSON.parse(cached);

            const parsedData = parsed.data || parsed;
            parsedData.photoURL = result.photoURL;
            const newCache = { data: parsedData, cachedAt: Date.now() };
            localStorage.setItem(key, JSON.stringify(newCache));
          }
        } catch (e) {

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

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signOutUser();
      if (result.success) {
        try {

          if (user && user.uid) {
            const key = `userProfile_${user.uid}`;
            localStorage.removeItem(key);
          }
        } catch (e) {

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
