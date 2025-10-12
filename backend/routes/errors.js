// Backend Error Logging Route
const express = require('express');
const router = express.Router();

// Middleware for error logging
const errorLogger = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(body) {
    if (res.statusCode >= 400) {
      // Log error responses
      console.error('API Error:', {
        url: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        body,
        headers: req.headers,
        timestamp: new Date().toISOString()
      });
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};

// Single error logging endpoint
router.post('/log', async (req, res) => {
  try {
    const errorData = req.body;
    
    // Validate error data
    if (!errorData.message || !errorData.timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Missing required error fields'
      });
    }

    // Log to console (replace with your logging service)
    console.error('Frontend Error:', {
      ...errorData,
      serverTimestamp: new Date().toISOString()
    });

    // Store in database (implement your storage logic)
    // await storeError(errorData);

    res.json({
      success: true,
      message: 'Error logged successfully'
    });
  } catch (error) {
    console.error('Failed to log error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log error'
    });
  }
});

// Batch error logging endpoint
router.post('/batch', async (req, res) => {
  try {
    const { errors, metadata } = req.body;
    
    if (!Array.isArray(errors) || errors.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or empty errors array'
      });
    }

    // Process each error
    const processedErrors = errors.map(error => ({
      ...error,
      batchId: metadata?.batchId,
      serverTimestamp: new Date().toISOString()
    }));

    // Log to console (replace with your logging service)
    console.error('Frontend Error Batch:', {
      count: processedErrors.length,
      batchId: metadata?.batchId,
      errors: processedErrors
    });

    // Store in database (implement your storage logic)
    // await storeErrorBatch(processedErrors);

    res.json({
      success: true,
      message: `Logged ${processedErrors.length} errors successfully`,
      batchId: metadata?.batchId
    });
  } catch (error) {
    console.error('Failed to log error batch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log error batch'
    });
  }
});

module.exports = router;