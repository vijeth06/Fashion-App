// Enhanced Error Boundary Components
import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaRedo, FaHome, FaBug } from 'react-icons/fa';

// Base Error Boundary Class
class BaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log error to monitoring service
    this.logError(error, errorInfo, errorId);
  }

  logError = (error, errorInfo, errorId) => {
    const errorData = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId || 'anonymous',
      feature: this.props.feature || 'unknown'
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary Caught:', errorData);
    }

    // Send to monitoring service (implement your monitoring solution)
    this.sendErrorToMonitoring(errorData);
  };

  sendErrorToMonitoring = async (errorData) => {
    try {
      // Replace with your error monitoring service (Sentry, LogRocket, etc.)
      await fetch('/api/v1/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });
    } catch (err) {
      console.error('Failed to log error to monitoring service:', err);
    }
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4"
        >
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {this.props.title || 'Something went wrong'}
              </h1>
              <p className="text-gray-600 mb-4">
                {this.props.message || 'An unexpected error occurred in the application.'}
              </p>
              {this.state.errorId && (
                <p className="text-sm text-gray-500 mb-4">
                  Error ID: {this.state.errorId}
                </p>
              )}
            </motion.div>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FaRedo className="text-sm" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FaHome className="text-sm" />
                Go Home
              </button>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2">
                    <FaBug /> Show Error Details
                  </summary>
                  <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-auto max-h-40">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Specific Error Boundaries for different features
export class ARTryOnErrorBoundary extends BaseErrorBoundary {
  constructor(props) {
    super({
      ...props,
      feature: 'ar-tryon',
      title: 'AR Try-On Error',
      message: 'There was an issue with the AR try-on feature. Please check your camera permissions and try again.'
    });
  }
}

export class PaymentErrorBoundary extends BaseErrorBoundary {
  constructor(props) {
    super({
      ...props,
      feature: 'payment',
      title: 'Payment Error',
      message: 'There was an issue processing your payment. Please try again or contact support.'
    });
  }
}

export class AIFeaturesErrorBoundary extends BaseErrorBoundary {
  constructor(props) {
    super({
      ...props,
      feature: 'ai-features',
      title: 'AI Feature Error',
      message: 'There was an issue with the AI-powered features. Please try again later.'
    });
  }
}

export class DatabaseErrorBoundary extends BaseErrorBoundary {
  constructor(props) {
    super({
      ...props,
      feature: 'database',
      title: 'Database Error',
      message: 'There was an issue connecting to our services. Please check your internet connection.'
    });
  }
}

export class AuthErrorBoundary extends BaseErrorBoundary {
  constructor(props) {
    super({
      ...props,
      feature: 'authentication',
      title: 'Authentication Error',
      message: 'There was an issue with authentication. Please try logging in again.'
    });
  }
}

export default BaseErrorBoundary;