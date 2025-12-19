/**
 * Authentication Middleware
 * 
 * Features:
 * - Firebase token verification
 * - JWT token support
 * - Role-based access control
 * - Request tracking
 * 
 * @version 1.0.0
 */

const admin = require('firebase-admin');

/**
 * Verify Firebase ID token
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify the token with Firebase Admin
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Attach user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        customClaims: decodedToken
      };

      next();

    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      
      if (verifyError.code === 'auth/id-token-expired') {
        return res.status(401).json({
          success: false,
          error: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }

      if (verifyError.code === 'auth/argument-error') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Token verification failed',
        code: 'VERIFICATION_FAILED'
      });
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication system error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional authentication - don't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without user info
    return next();
  }

  // If token is provided, verify it
  return verifyFirebaseToken(req, res, next);
};

/**
 * Check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'NO_AUTH'
    });
  }

  // Check custom claims for admin role
  if (!req.user.customClaims.admin) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
      code: 'FORBIDDEN'
    });
  }

  next();
};

/**
 * Check if user owns the resource
 */
const requireOwnership = (uidParamName = 'firebaseUid') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_AUTH'
      });
    }

    const resourceUid = req.params[uidParamName] || req.body[uidParamName];

    if (req.user.uid !== resourceUid && !req.user.customClaims.admin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - you can only access your own resources',
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};

/**
 * Add request tracking ID
 */
const addRequestId = (req, res, next) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * Log authenticated requests
 */
const logAuthRequest = (req, res, next) => {
  if (req.user) {
    console.log(`[${req.requestId}] Authenticated request from ${req.user.email} (${req.user.uid})`);
  }
  next();
};

module.exports = {
  verifyFirebaseToken,
  optionalAuth,
  requireAdmin,
  requireOwnership,
  addRequestId,
  logAuthRequest
};
