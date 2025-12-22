import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCxxARYzK6iHujKnh6aHhlGrvE4EYQPugM",
  authDomain: "virtual-fashion-tryon.firebaseapp.com",
  projectId: "virtual-fashion-tryon",
  storageBucket: "virtual-fashion-tryon.appspot.com",  // Fixed storage bucket URL
  messagingSenderId: "137777083432",
  appId: "1:137777083432:web:f5f1dd51f3bbe859f2b11d"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

const twitterProvider = new TwitterAuthProvider();

const githubProvider = new OAuthProvider('github.com');
githubProvider.addScope('user:email');

const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.addScope('mail.read');
microsoftProvider.addScope('calendars.read');

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    return { user: result.user, success: true };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    await createUserProfile(result.user);
    return { user: result.user, success: true };
  } catch (error) {
    console.error('Facebook sign in error:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

export const signInWithTwitter = async () => {
  try {
    const result = await signInWithPopup(auth, twitterProvider);
    await createUserProfile(result.user);
    return { user: result.user, success: true };
  } catch (error) {
    console.error('Twitter sign in error:', error);
    return { error: error.message };
  }
};

export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    await createUserProfile(result.user);
    return { user: result.user, success: true };
  } catch (error) {
    console.error('GitHub sign in error:', error);
    return { error: error.message };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, success: true };
  } catch (error) {
    console.error('Email sign in error:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    await sendEmailVerification(userCredential.user);

    await createUserProfile(userCredential.user, { displayName });
    
    return { user: userCredential.user, success: true, emailVerificationSent: true };
  } catch (error) {
    console.error('Email sign up error:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: error.message, code: error.code };
  }
};

const createUserProfile = async (user, additionalData = {}) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.displayName || '',
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified,
      createdAt: userSnap.exists() ? userSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      provider: user.providerData[0]?.providerId || 'email',

      fashionProfile: {
        preferredStyle: 'modern',
        sizeProfile: {
          tops: null,
          bottoms: null,
          shoes: null
        },
        colorPreferences: [],
        brandPreferences: [],
        priceRange: { min: 0, max: 1000 }
      },

      biometricProfile: {
        bodyMeasurements: {},
        bodyType: null,
        skinTone: null,
        measurementMethod: 'manual'
      },

      shoppingBehavior: {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        favoriteCategories: [],
        loyaltyTier: 'bronze'
      },
      
      ...additionalData
    };
    
    if (userSnap.exists()) {
      await updateDoc(userRef, userData);
    } else {
      await setDoc(userRef, userData);
    }
    
    return userData;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {

    if (error.code === 'unavailable' || error.message?.includes('offline')) {

      return { 
        success: false, 
        error: 'offline',
        offline: true
      };
    }
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (uid, updates) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

export const uploadProfilePicture = async (uid, file) => {
  try {
    const storageRef = ref(storage, `profile-pictures/${uid}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
    }

    await updateUserProfile(uid, { photoURL: downloadURL });
    
    return { success: true, photoURL: downloadURL };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { success: false, error: error.message };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error.message };
  }
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { 
  auth, 
  db, 
  storage, 
  googleProvider,
  facebookProvider,
  twitterProvider,
  githubProvider,
  microsoftProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserProfile
};
