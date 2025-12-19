const express = require('express');
const router = express.Router();
const CartReservation = require('../models/CartReservation');
const Product = require('../models/Product');
const { verifyFirebaseToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const RESERVATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

/**
 * @route   POST /api/reservations/reserve-items
 * @desc    Reserve cart items for checkout
 * @access  Private
 */
router.post('/reserve-items',
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { items } = req.body;
      const userId = req.user._id || req.user.uid;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Items array is required'
        });
      }

      const reservations = [];
      const unavailableItems = [];

      // Check all items before reserving (atomic check)
      for (const item of items) {
        const product = await Product.findOne({ productId: item.productId });

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.productId} not found`
          });
        }

        // Find inventory record
        const inventoryItem = product.inventory?.find(inv =>
          inv.size === item.size && inv.color === item.color
        );

        if (!inventoryItem || inventoryItem.quantity - inventoryItem.reserved < item.quantity) {
          unavailableItems.push({
            productId: item.productId,
            name: product.name,
            size: item.size,
            requested: item.quantity,
            available: inventoryItem ? (inventoryItem.quantity - inventoryItem.reserved) : 0
          });
        }
      }

      // If any item unavailable, reject entire reservation
      if (unavailableItems.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient inventory for some items',
          unavailableItems: unavailableItems
        });
      }

      // All items available, create reservations
      const expiresAt = new Date(Date.now() + RESERVATION_TIMEOUT);
      const reservationId = uuidv4();

      for (const item of items) {
        const reservation = new CartReservation({
          userId: userId,
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          expiresAt: expiresAt,
          status: 'reserved'
        });

        await reservation.save();
        reservations.push(reservation);

        // Increment reserved count
        await Product.updateOne(
          { productId: item.productId, 'inventory.size': item.size, 'inventory.color': item.color },
          { $inc: { 'inventory.$.reserved': item.quantity } }
        );
      }

      res.json({
        success: true,
        message: 'Items reserved successfully',
        reservationId: reservationId,
        expiresAt: expiresAt,
        expiresIn: RESERVATION_TIMEOUT / 1000 // seconds
      });

    } catch (error) {
      console.error('Reservation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error reserving items'
      });
    }
  }
);

/**
 * @route   POST /api/reservations/confirm
 * @desc    Confirm reservation and deduct from inventory
 * @access  Private
 */
router.post('/confirm',
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { items, orderId } = req.body;
      const userId = req.user._id || req.user.uid;

      // Find active reservations
      const reservations = await CartReservation.find({
        userId: userId,
        productId: { $in: items.map(i => i.productId) },
        status: 'reserved',
        expiresAt: { $gt: new Date() }
      });

      if (reservations.length !== items.length) {
        return res.status(400).json({
          success: false,
          message: 'Some reservations have expired'
        });
      }

      // Deduct from inventory
      for (const item of items) {
        const result = await Product.updateOne(
          { 
            productId: item.productId, 
            'inventory.size': item.size,
            'inventory.color': item.color,
            'inventory.quantity': { $gte: item.quantity }
          },
          { 
            $inc: { 
              'inventory.$.quantity': -item.quantity,
              'inventory.$.reserved': -item.quantity
            }
          }
        );

        if (result.modifiedCount === 0) {
          // Rollback
          for (const prevItem of items) {
            if (prevItem.productId !== item.productId) {
              await Product.updateOne(
                { productId: prevItem.productId },
                { $inc: { 'inventory.$.quantity': prevItem.quantity } }
              );
            }
          }

          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for ${item.productId}`
          });
        }
      }

      // Mark reservations as confirmed
      await CartReservation.updateMany(
        { _id: { $in: reservations.map(r => r._id) } },
        { 
          status: 'confirmed',
          confirmedAt: new Date(),
          orderId: orderId
        }
      );

      res.json({
        success: true,
        message: 'Inventory confirmed and deducted'
      });

    } catch (error) {
      console.error('Confirmation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error confirming reservation'
      });
    }
  }
);

/**
 * @route   POST /api/reservations/release
 * @desc    Release reservation if checkout cancelled
 * @access  Private
 */
router.post('/release',
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { reservationIds } = req.body;
      const userId = req.user._id || req.user.uid;

      // Find reservations
      const reservations = await CartReservation.find({
        _id: { $in: reservationIds },
        userId: userId,
        status: 'reserved'
      });

      // Release reserved inventory
      for (const reservation of reservations) {
        await Product.updateOne(
          { productId: reservation.productId },
          { $inc: { 'inventory.$.reserved': -reservation.quantity } }
        );

        reservation.status = 'released';
        reservation.releasedAt = new Date();
        await reservation.save();
      }

      res.json({
        success: true,
        message: 'Reservations released'
      });

    } catch (error) {
      console.error('Release error:', error);
      res.status(500).json({
        success: false,
        message: 'Error releasing reservations'
      });
    }
  }
);

/**
 * Background job: Clean up expired reservations
 * Run every 5 minutes
 */
async function cleanupExpiredReservations() {
  try {
    const expiredReservations = await CartReservation.find({
      status: 'reserved',
      expiresAt: { $lt: new Date() }
    });

    for (const reservation of expiredReservations) {
      // Release reserved inventory
      await Product.updateOne(
        { productId: reservation.productId },
        { $inc: { 'inventory.$.reserved': -reservation.quantity } }
      );

      reservation.status = 'expired';
      await reservation.save();
    }

    if (expiredReservations.length > 0) {
      console.log(`Cleaned up ${expiredReservations.length} expired reservations`);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Start cleanup job
setInterval(cleanupExpiredReservations, 5 * 60 * 1000);

module.exports = router;
