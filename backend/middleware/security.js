/**
 * Security and Compliance Middleware
 * 
 * Features:
 * - GDPR compliance
 * - Data encryption
 * - Input validation and sanitization
 * - Security headers
 * - Rate limiting
 * - Audit logging
 * 
 * @version 2.0.0
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Security Configuration
const SECURITY_CONFIG = {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 64,
    tagLength: 16,
    iterations: 100000
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: '24h',
    issuer: 'vf-tryon-app',
    audience: 'vf-tryon-users'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },
  passwordPolicy: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  }
};

// GDPR Compliance Schema
const GDPRConsentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  consentType: {
    type: String,
    enum: ['essential', 'analytics', 'marketing', 'personalization'],
    required: true
  },
  consented: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
  consentSource: String, // 'registration', 'cookie_banner', 'settings'
  withdrawnAt: Date,
  legalBasis: {
    type: String,
    enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'],
    default: 'consent'
  }
});

// Audit Log Schema
const AuditLogSchema = new mongoose.Schema({
  userId: String,
  sessionId: String,
  action: { type: String, required: true },
  resource: String,
  method: String,
  endpoint: String,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  details: Object,
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  success: { type: Boolean, default: true },
  errorDetails: String
});

// Data Processing Record Schema (GDPR Article 30)
const DataProcessingRecordSchema = new mongoose.Schema({
  processingId: { type: String, required: true, unique: true },
  controllerName: { type: String, required: true },
  dataSubjectCategories: [String], // e.g., ['customers', 'employees', 'website_visitors']
  personalDataCategories: [String], // e.g., ['identity', 'contact', 'transaction']
  purposeOfProcessing: { type: String, required: true },
  legalBasis: {
    type: String,
    enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'],
    required: true
  },
  dataRetentionPeriod: String,
  securityMeasures: [String],
  thirdPartyTransfers: [{
    recipient: String,
    country: String,
    safeguards: String
  }],
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

// Create models
const GDPRConsent = mongoose.model('GDPRConsent', GDPRConsentSchema);
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
const DataProcessingRecord = mongoose.model('DataProcessingRecord', DataProcessingRecordSchema);

/**
 * Security Headers Middleware
 */
const securityHeaders = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow for React development
        connectSrc: ["'self'", "wss:", "ws:", "https:"],
        mediaSrc: ["'self'", "blob:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"]
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for camera access
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  });
};

/**
 * Input Validation and Sanitization Middleware
 */
const validateAndSanitize = (schema) => {
  return (req, res, next) => {
    try {
      // Sanitize string inputs
      const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
          return xss(validator.escape(obj));
        } else if (Array.isArray(obj)) {
          return obj.map(sanitizeObject);
        } else if (obj && typeof obj === 'object') {
          const sanitized = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
          }
          return sanitized;
        }
        return obj;
      };

      // Sanitize request body
      if (req.body) {
        req.body = sanitizeObject(req.body);
      }

      // Validate against schema if provided
      if (schema) {
        const validation = schema.validate(req.body);
        if (validation.error) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validation.error.details.map(detail => detail.message)
          });
        }
        req.validatedData = validation.value;
      }

      next();
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Validation processing failed'
      });
    }
  };
};

/**
 * Audit Logging Middleware
 */
const auditLogger = (options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Capture original res.json to log response
    const originalJson = res.json;
    let responseBody;
    
    res.json = function(body) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    // Continue to next middleware
    next();

    // Log after response
    res.on('finish', async () => {
      try {
        const endTime = Date.now();
        const duration = endTime - startTime;

        const auditEntry = new AuditLog({
          userId: req.user?.uid || req.user?.id,
          sessionId: req.sessionId || req.headers['x-session-id'],
          action: `${req.method} ${req.originalUrl}`,
          resource: req.route?.path,
          method: req.method,
          endpoint: req.originalUrl,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          details: {
            requestBody: options.logRequestBody ? req.body : undefined,
            responseBody: options.logResponseBody ? responseBody : undefined,
            statusCode: res.statusCode,
            duration,
            headers: options.logHeaders ? req.headers : undefined
          },
          riskLevel: determineRiskLevel(req, res),
          success: res.statusCode < 400,
          errorDetails: res.statusCode >= 400 ? responseBody?.message : undefined
        });

        await auditEntry.save();
      } catch (error) {
        console.error('Audit logging failed:', error);
      }
    });
  };
};

/**
 * GDPR Compliance Middleware
 */
const gdprCompliance = {
  /**
   * Check user consent for data processing
   */
  checkConsent: (consentType = 'essential') => {
    return async (req, res, next) => {
      try {
        const userId = req.user?.uid || req.user?.id;
        
        if (!userId && consentType !== 'essential') {
          return res.status(403).json({
            success: false,
            message: 'User consent verification required',
            consentRequired: consentType
          });
        }

        if (userId && consentType !== 'essential') {
          const consent = await GDPRConsent.findOne({
            userId,
            consentType,
            consented: true,
            withdrawnAt: { $exists: false }
          });

          if (!consent) {
            return res.status(403).json({
              success: false,
              message: `Consent required for ${consentType} data processing`,
              consentRequired: consentType
            });
          }
        }

        next();
      } catch (error) {
        console.error('Consent check failed:', error);
        res.status(500).json({
          success: false,
          message: 'Consent verification failed'
        });
      }
    };
  },

  /**
   * Record user consent
   */
  recordConsent: async (userId, email, consentType, consented, metadata = {}) => {
    try {
      const consent = new GDPRConsent({
        userId,
        email,
        consentType,
        consented,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        consentSource: metadata.source || 'api'
      });

      await consent.save();
      return { success: true, consentId: consent._id };
    } catch (error) {
      console.error('Failed to record consent:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Withdraw consent
   */
  withdrawConsent: async (userId, consentType) => {
    try {
      await GDPRConsent.updateMany(
        { userId, consentType, consented: true },
        { withdrawnAt: new Date() }
      );
      return { success: true };
    } catch (error) {
      console.error('Failed to withdraw consent:', error);
      return { success: false, error: error.message };
    }
  }
};

/**
 * Data Encryption Service
 */
class EncryptionService {
  constructor() {
    this.masterKey = process.env.MASTER_ENCRYPTION_KEY || crypto.randomBytes(32);
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data) {
    try {
      const iv = crypto.randomBytes(SECURITY_CONFIG.encryption.ivLength);
      const cipher = crypto.createCipher(SECURITY_CONFIG.encryption.algorithm, this.masterKey, iv);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData, iv, tag) {
    try {
      const decipher = crypto.createDecipher(
        SECURITY_CONFIG.encryption.algorithm,
        this.masterKey,
        Buffer.from(iv, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Data decryption failed');
    }
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(data, salt = null) {
    try {
      const actualSalt = salt || crypto.randomBytes(SECURITY_CONFIG.encryption.saltLength);
      const hash = crypto.pbkdf2Sync(
        data,
        actualSalt,
        SECURITY_CONFIG.encryption.iterations,
        64,
        'sha512'
      );
      
      return {
        hash: hash.toString('hex'),
        salt: actualSalt.toString('hex')
      };
    } catch (error) {
      console.error('Hashing failed:', error);
      throw new Error('Data hashing failed');
    }
  }

  /**
   * Verify hashed data
   */
  verifyHash(data, hash, salt) {
    try {
      const verification = this.hash(data, Buffer.from(salt, 'hex'));
      return verification.hash === hash;
    } catch (error) {
      console.error('Hash verification failed:', error);
      return false;
    }
  }
}

/**
 * Enhanced Rate Limiting
 */
const createAdvancedRateLimit = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || SECURITY_CONFIG.rateLimit.windowMs,
    max: options.max || SECURITY_CONFIG.rateLimit.max,
    message: options.message || SECURITY_CONFIG.rateLimit.message,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for certain conditions
      if (options.skipSuccessfulRequests && req.res?.statusCode < 400) {
        return true;
      }
      return false;
    },
    keyGenerator: (req) => {
      // Custom key generation for rate limiting
      return options.keyGenerator ? options.keyGenerator(req) : req.ip;
    },
    handler: async (req, res) => {
      // Handle rate limit violations
      try {
        // Attempt to log, but don't crash if it fails
        console.warn(`Rate limit exceeded for IP: ${req.ip}`);
      } catch (err) {
        console.error('Error logging rate limit:', err);
      }
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: req.rateLimit?.resetTime
      });
    }
  });
};

/**
 * Determine risk level for audit logging
 */
function determineRiskLevel(req, res) {
  // High risk operations
  if (req.originalUrl.includes('/admin') || 
      req.originalUrl.includes('/delete') ||
      req.originalUrl.includes('/payment')) {
    return 'high';
  }

  // Medium risk operations
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    return 'medium';
  }

  // Error responses
  if (res.statusCode >= 400) {
    return res.statusCode >= 500 ? 'high' : 'medium';
  }

  return 'low';
}

/**
 * Password Security Validation
 */
const validatePassword = (password) => {
  const policy = SECURITY_CONFIG.passwordPolicy;
  const errors = [];

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }

  if (password.length > policy.maxLength) {
    errors.push(`Password must be no more than ${policy.maxLength} characters long`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  securityHeaders,
  validateAndSanitize,
  auditLogger,
  gdprCompliance,
  EncryptionService,
  createAdvancedRateLimit,
  validatePassword,
  GDPRConsent,
  AuditLog,
  DataProcessingRecord,
  SECURITY_CONFIG
};