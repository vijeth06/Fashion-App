// Debug utilities for authentication testing
import { auth, db } from '../firebase/firebaseConfig';

export const testFirebaseConnection = () => {
  console.log('🔥 Firebase Connection Test:');
  console.log('Auth instance:', auth ? '✅ Connected' : '❌ Not connected');
  console.log('Firestore instance:', db ? '✅ Connected' : '❌ Not connected');
  console.log('Current user:', auth?.currentUser ? auth.currentUser.email : 'No user signed in');
  console.log('Auth state ready:', auth ? '✅ Ready' : '❌ Not ready');
};

export const testEmailLogin = async (email = 'test@example.com', password = 'testpass123') => {
  try {
    console.log('🧪 Testing email login with:', email);
    const { signInWithEmail } = await import('../firebase/firebaseConfig');
    const result = await signInWithEmail(email, password);
    console.log('Login result:', result);
    return result;
  } catch (error) {
    console.error('Login test failed:', error);
    return { success: false, error: error.message };
  }
};

export const testGoogleLogin = async () => {
  try {
    console.log('🧪 Testing Google login...');
    const { signInWithGoogle } = await import('../firebase/firebaseConfig');
    const result = await signInWithGoogle();
    console.log('Google login result:', result);
    return result;
  } catch (error) {
    console.error('Google login test failed:', error);
    return { success: false, error: error.message };
  }
};

export const logAuthState = () => {
  if (auth) {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('👤 User signed in:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          provider: user.providerData[0]?.providerId
        });
      } else {
        console.log('👤 No user signed in');
      }
    });
  }
};

// Auto-run basic connection test
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    testFirebaseConnection();
    logAuthState();
  }, 1000);
}