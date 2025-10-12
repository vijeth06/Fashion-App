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

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user profile data from Firestore
        const profileResult = await getUserProfile(firebaseUser.uid);
        
        const enrichedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          provider: firebaseUser.providerData[0]?.providerId || 'email',
          metadata: {
            creationTime: firebaseUser.metadata.creationTime,
            lastSignInTime: firebaseUser.metadata.lastSignInTime
          },
          // Add profile data if available
          ...(profileResult.success ? profileResult.data : {})
        };
        
        setUser(enrichedUser);
        setUserProfile(profileResult.success ? profileResult.data : null);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
      setError(null);
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
