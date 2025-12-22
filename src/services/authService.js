import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  linkWithCredential,
  unlink,
  PhoneAuthProvider,
  EmailAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  OAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider,
  facebookProvider,
  twitterProvider,
  githubProvider,
  microsoftProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from '../firebase/firebaseConfig';

class AuthService {
  constructor() {
    this.auth = auth;
    this.db = db;
    this.currentUser = null;
    this.isLoading = true;

    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.isLoading = false;
    });
  }

  async signUpWithEmail(email, password, additionalData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      if (additionalData.displayName) {
        await updateProfile(user, {
          displayName: additionalData.displayName
        });
      }

      await this.createUserDocument(user, additionalData);

      await sendEmailVerification(user);
      
      return {
        success: true,
        user,
        message: 'Account created successfully! Please check your email for verification.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, googleProvider);
      await this.createUserDocument(result.user, {
        signInMethod: 'google',
        provider: 'google.com'
      });
      return {
        success: true,
        user: result.user
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async signInWithFacebook() {
    try {
      const result = await signInWithPopup(this.auth, facebookProvider);
      await this.createUserDocument(result.user, {
        signInMethod: 'facebook',
        provider: 'facebook.com'
      });
      return {
        success: true,
        user: result.user
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async signInWithTwitter() {
    try {
      const result = await signInWithPopup(this.auth, twitterProvider);
      await this.createUserDocument(result.user, {
        signInMethod: 'twitter',
        provider: 'twitter.com'
      });
      return {
        success: true,
        user: result.user
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async signInWithGithub() {
    try {
      const result = await signInWithPopup(this.auth, githubProvider);
      await this.createUserDocument(result.user, {
        signInMethod: 'github',
        provider: 'github.com'
      });
      return {
        success: true,
        user: result.user
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async signInWithMicrosoft() {
    try {
      const result = await signInWithPopup(this.auth, microsoftProvider);
      await this.createUserDocument(result.user, {
        signInMethod: 'microsoft',
        provider: 'microsoft.com'
      });
      return {
        success: true,
        user: result.user
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async setupRecaptcha(containerId) {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
        size: 'normal',
        callback: (response) => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
      
      return recaptchaVerifier;
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      throw error;
    }
  }

  async sendOTP(phoneNumber, recaptchaVerifier) {
    try {
      const confirmationResult = await signInWithPhoneNumber(this.auth, phoneNumber, recaptchaVerifier);
      return {
        success: true,
        confirmationResult
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async verifyOTP(confirmationResult, otpCode) {
    try {
      const result = await confirmationResult.confirm(otpCode);
      await this.createUserDocument(result.user, {
        signInMethod: 'phone',
        provider: 'phone'
      });
      return {
        success: true,
        user: result.user
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async createUserDocument(user, additionalData = {}) {
    if (!user) return;

    const userRef = doc(this.db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const {
        displayName,
        email,
        photoURL,
        phoneNumber,
        emailVerified
      } = user;

      const userData = {
        uid: user.uid,
        displayName: displayName || additionalData.displayName || '',
        email: email || '',
        photoURL: photoURL || '',
        phoneNumber: phoneNumber || '',
        emailVerified,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        profile: {
          gender: '',
          age: '',
          bodyType: '',
          skinTone: '',
          measurements: {
            height: '',
            weight: '',
            chest: '',
            waist: '',
            hips: '',
            shoulderWidth: '',
            armLength: '',
            legLength: ''
          },
          preferences: {
            style: [],
            colors: [],
            brands: [],
            priceRange: { min: 0, max: 1000 },
            notifications: {
              email: true,
              push: true,
              sms: false
            }
          }
        },
        addresses: [],
        settings: {
          language: 'en',
          currency: 'USD',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          privacy: {
            profileVisibility: 'public',
            shareAnalytics: true,
            marketingEmails: true
          }
        },
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          favoriteCategories: [],
          lastActivity: serverTimestamp()
        },
        ...additionalData
      };

      try {
        await setDoc(userRef, userData);
        console.log('User document created successfully');
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    } else {

      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        'stats.lastActivity': serverTimestamp()
      });
    }
  }

  async updateUserProfile(uid, updates) {
    try {
      const userRef = doc(this.db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserProfile(uid) {
    try {
      const userRef = doc(this.db, 'users', uid);
      const snapshot = await getDoc(userRef);
      
      if (snapshot.exists()) {
        return {
          success: true,
          data: snapshot.data()
        };
      } else {
        return {
          success: false,
          error: 'User profile not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateEmail(newEmail) {
    try {
      await this.currentUser.updateEmail(newEmail);
      await sendEmailVerification(this.currentUser);
      return {
        success: true,
        message: 'Email updated. Please verify your new email address.'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async updatePassword(currentPassword, newPassword) {
    try {

      const credential = EmailAuthProvider.credential(
        this.currentUser.email,
        currentPassword
      );
      await this.currentUser.reauthenticateWithCredential(credential);

      await updatePassword(this.currentUser, newPassword);
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async deleteAccount() {
    try {
      if (this.currentUser) {
        const uid = this.currentUser.uid;

        await deleteDoc(doc(this.db, 'users', uid));

        await deleteUser(this.currentUser);
        
        return {
          success: true,
          message: 'Account deleted successfully'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async signOut() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
      'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.',
      'auth/popup-blocked': 'Popup was blocked by the browser.',
      'auth/invalid-phone-number': 'Invalid phone number format.',
      'auth/invalid-verification-code': 'Invalid verification code.',
      'auth/code-expired': 'Verification code has expired.',
      'auth/missing-verification-code': 'Please enter the verification code.',
      'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/requires-recent-login': 'Please sign in again to perform this action.',
      'auth/invalid-credential': 'Invalid credentials provided.',
      'auth/account-exists-with-different-credential': 'Account exists with different sign-in method.',
      'auth/credential-already-in-use': 'This credential is already associated with a different account.'
    };
    
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async hasRole(role) {
    if (!this.currentUser) return false;
    
    try {
      const userProfile = await this.getUserProfile(this.currentUser.uid);
      if (userProfile.success) {
        return userProfile.data.roles?.includes(role) || false;
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
    
    return false;
  }
}

const authService = new AuthService();
export default authService;