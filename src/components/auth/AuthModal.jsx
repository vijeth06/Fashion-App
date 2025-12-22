import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaFacebook, FaTwitter, FaGithub, FaMicrosoft, FaPhone, FaEye, FaEyeSlash, FaTimes, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialTab = 'signin' }) => {
  const { signUp, signIn, signInWithGoogle, signInWithFacebook, signInWithTwitter, signInWithGithub, requestPasswordReset } = useAuth();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: '',
    agreeToTerms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (activeTab === 'signin') {
        const result = await signIn(formData.email, formData.password);
        if (result.success) {
          setSuccess('Successfully signed in!');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setError(result.error || 'Failed to sign in');
        }
      } else {

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        if (!formData.agreeToTerms) {
          setError('Please agree to the terms and conditions');
          setIsLoading(false);
          return;
        }
        
        const result = await signUp(formData.email, formData.password, formData.displayName);
        if (result.success) {
          if (result.emailVerificationSent) {
            setSuccess('Account created! Please check your email for verification.');
          } else {
            setSuccess('Account created successfully!');
          }
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setError(result.error || 'Failed to create account');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await requestPasswordReset(formData.email);
      if (result.success) {
        setSuccess('Password reset email sent! Check your inbox.');
        setShowForgotPassword(false);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      let result;
      
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
        case 'twitter':
          result = await signInWithTwitter();
          break;
        case 'github':
          result = await signInWithGithub();
          break;
        default:
          setError('Provider not supported yet');
          setIsLoading(false);
          return;
      }
      
      if (result.success) {
        setSuccess(`Successfully signed in with ${provider}!`);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || `Failed to sign in with ${provider}`);
      }
    } catch (err) {
      setError('Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const socialProviders = [
    { id: 'google', name: 'Google', icon: FaGoogle, color: 'bg-red-500 hover:bg-red-600' },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'twitter', name: 'Twitter', icon: FaTwitter, color: 'bg-sky-500 hover:bg-sky-600' },
    { id: 'github', name: 'GitHub', icon: FaGithub, color: 'bg-gray-800 hover:bg-gray-900' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {}
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-6 text-white">
              <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Welcome to Virtual Fashion</h2>
                <p className="text-white text-opacity-90 text-sm">Your virtual try-on experience awaits</p>
              </div>
              
              {}
              <div className="flex bg-white bg-opacity-20 rounded-lg p-1 mt-4">
                {['signin', 'signup', 'phone'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab ? 'bg-white text-purple-600' : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    {tab === 'signin' ? 'Sign In' : tab === 'signup' ? 'Sign Up' : 'Phone'}
                  </button>
                ))}
              </div>
            </div>

            {}
            <div className="p-6">
              {}
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {success || error}
                </motion.div>
              )}

              {}
              {(activeTab === 'signin' || activeTab === 'signup') && (
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {activeTab === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                        placeholder="Enter your password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {activeTab === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  )}

                  {activeTab === 'signup' && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        required
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        I agree to the <a href="#" className="text-purple-600 hover:text-purple-500">Terms of Service</a> and <a href="#" className="text-purple-600 hover:text-purple-500">Privacy Policy</a>
                      </label>
                    </div>
                  )}

                  {activeTab === 'signin' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">Remember me</label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-purple-600 hover:text-purple-500"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading && <FaSpinner className="animate-spin" />}
                    {isLoading ? 'Processing...' : (activeTab === 'signin' ? 'Sign In' : 'Create Account')}
                  </button>
                </form>
              )}

              {}
              {activeTab === 'phone' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <FaPhone className="w-4 h-4" />
                    Send OTP
                  </button>
                </div>
              )}

              {}
              {activeTab !== 'phone' && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {socialProviders.map((provider) => {
                      const IconComponent = provider.icon;
                      return (
                        <button
                          key={provider.id}
                          onClick={() => handleSocialSignIn(provider.id)}
                          disabled={isLoading}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 ${provider.color}`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="text-sm">{provider.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              
              {}
              {showForgotPassword && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white rounded-2xl p-6 z-10"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h3>
                    <p className="text-gray-600">Enter your email to receive a password reset link</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(false)}
                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={isLoading}
                        className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoading && <FaSpinner className="animate-spin" />}
                        Send Reset Link
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;