/**
 * Validation Middleware for Backend Routes
 * 
 * Features:
 * - Input sanitization
 * - Type validation
 * - MongoDB ObjectId validation
 * - Request size limits
 * - SQL/NoSQL injection prevention
 * 
 * @version 1.0.0
 */

const { ObjectId } = require('mongodb');

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName] || req.body[paramName] || req.query[paramName];
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: `${paramName} is required`,
        code: 'VALIDATION_ERROR'
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format`,
        code: 'INVALID_ID'
      });
    }

    next();
  };
};

/**
 * Validate required fields
 */
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = [];
    
    for (const field of fields) {
      const value = req.body[field];
      if (value === undefined || value === null || value === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
        code: 'MISSING_FIELDS',
        fields: missing
      });
    }

    next();
  };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  // Enforce maximum limit
  const maxLimit = 100;
  if (limit > maxLimit) {
    return res.status(400).json({
      success: false,
      error: `Limit cannot exceed ${maxLimit}`,
      code: 'LIMIT_EXCEEDED'
    });
  }

  // Ensure positive values
  if (page < 1 || limit < 1) {
    return res.status(400).json({
      success: false,
      error: 'Page and limit must be positive numbers',
      code: 'INVALID_PAGINATION'
    });
  }

  // Attach validated values to request
  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit
  };

  next();
};

/**
 * Sanitize user input to prevent injection
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
      // Remove MongoDB operators from user input
      if (typeof key === 'string' && key.startsWith('$')) {
        continue;
      }

      if (typeof value === 'string') {
        // Basic XSS prevention
        sanitized[key] = value.replace(/<script[^>]*>.*?<\/script>/gi, '');
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

/**
 * Validate sort parameters
 */
const validateSort = (allowedFields = []) => {
  return (req, res, next) => {
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder;

    if (sortBy && allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sort field. Allowed: ${allowedFields.join(', ')}`,
        code: 'INVALID_SORT_FIELD'
      });
    }

    if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
      return res.status(400).json({
        success: false,
        error: 'Sort order must be "asc" or "desc"',
        code: 'INVALID_SORT_ORDER'
      });
    }

    next();
  };
};

/**
 * Validate email format
 */
const validateEmail = (fieldName = 'email') => {
  return (req, res, next) => {
    const email = req.body[fieldName];
    
    if (!email) {
      return next();
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    next();
  };
};

/**
 * Validate price range
 */
const validatePriceRange = (req, res, next) => {
  const { minPrice, maxPrice } = req.query;

  if (minPrice && isNaN(parseFloat(minPrice))) {
    return res.status(400).json({
      success: false,
      error: 'minPrice must be a number',
      code: 'INVALID_PRICE'
    });
  }

  if (maxPrice && isNaN(parseFloat(maxPrice))) {
    return res.status(400).json({
      success: false,
      error: 'maxPrice must be a number',
      code: 'INVALID_PRICE'
    });
  }

  if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
    return res.status(400).json({
      success: false,
      error: 'minPrice cannot be greater than maxPrice',
      code: 'INVALID_PRICE_RANGE'
    });
  }

  next();
};

/**
 * Validate text search query
 */
const validateSearch = (req, res, next) => {
  const { search } = req.query;

  if (!search) {
    return next();
  }

  // Limit search query length
  if (search.length > 200) {
    return res.status(400).json({
      success: false,
      error: 'Search query too long (max 200 characters)',
      code: 'SEARCH_TOO_LONG'
    });
  }

  // Sanitize search query
  req.query.search = search.trim();

  next();
};

/**
 * Validate Firebase UID format
 */
const validateFirebaseUid = (paramName = 'firebaseUid') => {
  return (req, res, next) => {
    const uid = req.params[paramName] || req.body[paramName];
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        error: `${paramName} is required`,
        code: 'MISSING_FIREBASE_UID'
      });
    }

    // Firebase UIDs are typically 28 characters
    if (typeof uid !== 'string' || uid.length < 10 || uid.length > 128) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Firebase UID format',
        code: 'INVALID_FIREBASE_UID'
      });
    }

    next();
  };
};

/**
 * Validate array input
 */
const validateArray = (fieldName, minLength = 0, maxLength = 100) => {
  return (req, res, next) => {
    const value = req.body[fieldName];

    if (!value) {
      return next();
    }

    if (!Array.isArray(value)) {
      return res.status(400).json({
        success: false,
        error: `${fieldName} must be an array`,
        code: 'INVALID_ARRAY'
      });
    }

    if (value.length < minLength) {
      return res.status(400).json({
        success: false,
        error: `${fieldName} must have at least ${minLength} items`,
        code: 'ARRAY_TOO_SHORT'
      });
    }

    if (value.length > maxLength) {
      return res.status(400).json({
        success: false,
        error: `${fieldName} cannot exceed ${maxLength} items`,
        code: 'ARRAY_TOO_LONG'
      });
    }

    next();
  };
};

/**
 * Validate enum values
 */
const validateEnum = (fieldName, allowedValues) => {
  return (req, res, next) => {
    const value = req.body[fieldName] || req.query[fieldName];

    if (!value) {
      return next();
    }

    if (!allowedValues.includes(value)) {
      return res.status(400).json({
        success: false,
        error: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
        code: 'INVALID_ENUM_VALUE',
        allowedValues
      });
    }

    next();
  };
};

module.exports = {
  validateObjectId,
  validateRequired,
  validatePagination,
  sanitizeInput,
  validateSort,
  validateEmail,
  validatePriceRange,
  validateSearch,
  validateFirebaseUid,
  validateArray,
  validateEnum
};
