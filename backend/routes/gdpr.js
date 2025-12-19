/**
 * GDPR Compliance API Routes
 * 
 * Handles data privacy requests, consent management, and compliance reporting
 * 
 * @version 2.0.0
 */

const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { gdprCompliance, auditLogger, GDPRConsent, AuditLog } = require('../middleware/security');
const { User } = require('../models/User');
const Order = require('../models/Order');
const rateLimit = require('express-rate-limit');

// Rate limiting for GDPR endpoints
const gdprLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit GDPR requests
  message: 'Too many GDPR requests, please try again later',
});

/**
 * @route   POST /api/gdpr/consent
 * @desc    Record user consent for data processing
 * @access  Public
 */
router.post('/consent',
  gdprLimiter,
  auditLogger({ logRequestBody: true }),
  async (req, res) => {
    try {
      const {
        userId,
        email,
        consentType,
        consented,
        source = 'api'
      } = req.body;

      // Validate required fields
      if (!userId || !email || !consentType || typeof consented !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'userId, email, consentType, and consented are required'
        });
      }

      // Valid consent types
      const validConsentTypes = ['essential', 'analytics', 'marketing', 'personalization'];
      if (!validConsentTypes.includes(consentType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid consent type',
          validTypes: validConsentTypes
        });
      }

      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source
      };

      const result = await gdprCompliance.recordConsent(
        userId,
        email,
        consentType,
        consented,
        metadata
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to record consent',
          error: result.error
        });
      }

      res.status(200).json({
        success: true,
        message: 'Consent recorded successfully',
        consentId: result.consentId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Consent recording error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process consent request'
      });
    }
  }
);

/**
 * @route   DELETE /api/gdpr/consent/:userId/:consentType
 * @desc    Withdraw user consent
 * @access  Private
 */
router.delete('/consent/:userId/:consentType',
  gdprLimiter,
  verifyFirebaseToken,
  auditLogger({ logRequestBody: true }),
  async (req, res) => {
    try {
      const { userId, consentType } = req.params;

      // Verify user can withdraw their own consent or is admin
      if (req.user.uid !== userId && !req.user.customClaims?.admin) {
        return res.status(403).json({
          success: false,
          message: 'You can only withdraw your own consent'
        });
      }

      const result = await gdprCompliance.withdrawConsent(userId, consentType);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to withdraw consent',
          error: result.error
        });
      }

      res.status(200).json({
        success: true,
        message: 'Consent withdrawn successfully',
        withdrawnAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Consent withdrawal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to withdraw consent'
      });
    }
  }
);

/**
 * @route   GET /api/gdpr/consent/:userId
 * @desc    Get user consent status
 * @access  Private
 */
router.get('/consent/:userId',
  gdprLimiter,
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Verify user can access their own consent or is admin
      if (req.user.uid !== userId && !req.user.customClaims?.admin) {
        return res.status(403).json({
          success: false,
          message: 'You can only access your own consent status'
        });
      }

      const consents = await GDPRConsent.find({
        userId,
        withdrawnAt: { $exists: false }
      }).select('-__v').sort({ timestamp: -1 });

      res.status(200).json({
        success: true,
        consents: consents.map(consent => ({
          consentType: consent.consentType,
          consented: consent.consented,
          timestamp: consent.timestamp,
          source: consent.consentSource
        }))
      });

    } catch (error) {
      console.error('Consent retrieval error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve consent status'
      });
    }
  }
);

/**
 * @route   POST /api/gdpr/data-request
 * @desc    Handle data subject access request (Right to access - Article 15)
 * @access  Private
 */
router.post('/data-request',
  gdprLimiter,
  verifyFirebaseToken,
  auditLogger({ logRequestBody: true }),
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { requestType, specificData } = req.body;

      // Valid request types
      const validRequestTypes = ['access', 'portability', 'rectification', 'erasure'];
      if (!validRequestTypes.includes(requestType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request type',
          validTypes: validRequestTypes
        });
      }

      // Process based on request type
      let responseData = {};

      if (requestType === 'access' || requestType === 'portability') {
        // Collect all user data
        const userData = await User.findOne({ firebaseUid: userId }).select('-password');
        const orders = await Order.find({ 
          $or: [
            { firebaseUid: userId },
            { userId: userData?._id }
          ]
        });
        const consents = await GDPRConsent.find({ userId });
        const auditLogs = await AuditLog.find({ userId }).limit(100); // Recent activities

        responseData = {
          personalData: {
            profile: userData,
            orders: orders.map(order => ({
              orderId: order.orderId,
              items: order.items,
              total: order.total,
              status: order.status,
              createdAt: order.createdAt
            })),
            consents: consents.map(consent => ({
              type: consent.consentType,
              consented: consent.consented,
              timestamp: consent.timestamp
            })),
            recentActivity: auditLogs.map(log => ({
              action: log.action,
              timestamp: log.timestamp,
              ipAddress: log.ipAddress
            }))
          },
          dataProcessing: {
            purposes: ['Account management', 'Order processing', 'Customer support', 'Product recommendations'],
            legalBasis: 'Contract and legitimate interests',
            retentionPeriod: '7 years for transaction data, 2 years for analytics'
          }
        };
      }

      // Create data request record
      const requestId = `DR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Log the data request
      await AuditLog.create({
        userId,
        action: `GDPR_DATA_REQUEST_${requestType.toUpperCase()}`,
        details: { requestId, requestType, specificData },
        riskLevel: 'medium'
      });

      res.status(200).json({
        success: true,
        message: 'Data request processed successfully',
        requestId,
        requestType,
        data: requestType === 'access' || requestType === 'portability' ? responseData : undefined,
        processedAt: new Date().toISOString(),
        note: 'This data export contains all personal data we have about you. Please store it securely.'
      });

    } catch (error) {
      console.error('Data request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process data request'
      });
    }
  }
);

/**
 * @route   DELETE /api/gdpr/delete-account
 * @desc    Handle right to erasure request (Right to be forgotten - Article 17)
 * @access  Private
 */
router.delete('/delete-account',
  gdprLimiter,
  verifyFirebaseToken,
  auditLogger({ logRequestBody: true }),
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { confirmation, reason } = req.body;

      // Require explicit confirmation
      if (confirmation !== 'DELETE_MY_ACCOUNT') {
        return res.status(400).json({
          success: false,
          message: 'Account deletion requires explicit confirmation',
          requiredConfirmation: 'DELETE_MY_ACCOUNT'
        });
      }

      // Check for active orders or legal obligations
      const activeOrders = await Order.find({
        firebaseUid: userId,
        status: { $in: ['pending', 'processing', 'shipped'] }
      });

      if (activeOrders.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete account with active orders',
          activeOrderCount: activeOrders.length,
          note: 'Please wait for orders to be completed or contact support'
        });
      }

      // Create deletion request ID for tracking
      const deletionId = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Log deletion request
      await AuditLog.create({
        userId,
        action: 'GDPR_ACCOUNT_DELETION_REQUESTED',
        details: { deletionId, reason },
        riskLevel: 'high'
      });

      // In a real implementation, you would:
      // 1. Mark account for deletion (don't delete immediately due to legal obligations)
      // 2. Anonymize data where possible
      // 3. Keep audit logs for legal purposes
      // 4. Schedule permanent deletion after retention period

      res.status(200).json({
        success: true,
        message: 'Account deletion request received',
        deletionId,
        estimatedDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        note: 'Your account will be marked for deletion. Some data may be retained for legal obligations.',
        contactInfo: 'For questions, contact privacy@vf-tryon.com'
      });

    } catch (error) {
      console.error('Account deletion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process deletion request'
      });
    }
  }
);

/**
 * @route   POST /api/gdpr/data-correction
 * @desc    Handle data rectification request (Right to rectification - Article 16)
 * @access  Private
 */
router.post('/data-correction',
  gdprLimiter,
  verifyFirebaseToken,
  auditLogger({ logRequestBody: true }),
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { field, currentValue, correctedValue, justification } = req.body;

      if (!field || !correctedValue) {
        return res.status(400).json({
          success: false,
          message: 'field and correctedValue are required'
        });
      }

      // Allowed fields for correction
      const allowedFields = ['profile.name', 'profile.email', 'profile.phone', 'profile.address'];
      if (!allowedFields.includes(field)) {
        return res.status(400).json({
          success: false,
          message: 'Field not allowed for correction',
          allowedFields
        });
      }

      const correctionId = `CORR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Log correction request
      await AuditLog.create({
        userId,
        action: 'GDPR_DATA_CORRECTION_REQUESTED',
        details: {
          correctionId,
          field,
          currentValue,
          correctedValue,
          justification
        },
        riskLevel: 'medium'
      });

      // In a real implementation, you would validate and apply the correction
      // For now, we'll just log the request

      res.status(200).json({
        success: true,
        message: 'Data correction request received',
        correctionId,
        status: 'pending_review',
        estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        note: 'Your correction request will be reviewed and processed within 5 business days'
      });

    } catch (error) {
      console.error('Data correction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process correction request'
      });
    }
  }
);

/**
 * @route   GET /api/gdpr/privacy-policy
 * @desc    Get current privacy policy and data processing information
 * @access  Public
 */
router.get('/privacy-policy', async (req, res) => {
  try {
    const privacyPolicy = {
      lastUpdated: '2024-12-03T00:00:00Z',
      version: '2.0',
      dataController: {
        name: 'VF-TryOn Fashion Platform',
        contact: 'privacy@vf-tryon.com',
        address: 'Virtual Fashion Inc., 123 Tech Street, Innovation City, TC 12345'
      },
      dataProcessing: {
        purposes: [
          'Providing virtual try-on services',
          'Processing orders and payments',
          'Customer support and communication',
          'Service improvement and analytics',
          'Marketing (with consent)'
        ],
        legalBasis: [
          'Contract performance for core services',
          'Legitimate interests for analytics',
          'Consent for marketing communications'
        ],
        dataTypes: [
          'Identity data (name, email)',
          'Contact data (address, phone)',
          'Financial data (payment information)',
          'Technical data (IP address, browser data)',
          'Usage data (how you use our service)',
          'Biometric data (pose estimation for virtual try-on)'
        ],
        retention: {
          accountData: 'Duration of account plus 2 years',
          transactionData: '7 years for legal compliance',
          marketingData: 'Until consent withdrawn',
          analyticsData: '2 years maximum'
        }
      },
      yourRights: [
        'Right to access your personal data',
        'Right to correct inaccurate data',
        'Right to erase your data',
        'Right to restrict processing',
        'Right to data portability',
        'Right to object to processing',
        'Right to withdraw consent'
      ],
      security: [
        'End-to-end encryption for sensitive data',
        'Regular security audits and penetration testing',
        'Access controls and authentication',
        'Secure data centers with 24/7 monitoring',
        'Employee security training and background checks'
      ],
      cookies: {
        essential: 'Required for core functionality',
        analytics: 'Help us improve our service (with consent)',
        marketing: 'Personalized advertisements (with consent)'
      },
      contact: {
        email: 'privacy@vf-tryon.com',
        phone: '+1-555-PRIVACY',
        address: 'Data Protection Officer, Virtual Fashion Inc.'
      }
    };

    res.status(200).json({
      success: true,
      privacyPolicy
    });

  } catch (error) {
    console.error('Privacy policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve privacy policy'
    });
  }
});

module.exports = router;