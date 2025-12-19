const mongoose = require('mongoose');
const { Product } = require('../models/Product');
const Order = require('../models/Order');

class InventoryService {
  constructor() {
    this.lowStockThreshold = 10;
    this.outOfStockThreshold = 0;
    this.reorderQuantity = 50;
    this.reservationTimeout = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Get real-time inventory for a product
   */
  async getProductInventory(productId, size = null, color = null) {
    try {
      const product = await Product.findOne({ productId });
      
      if (!product) {
        throw new Error('Product not found');
      }

      // If specific size/color requested, get specific variant
      if (size || color) {
        const variant = product.inventory.find(inv => 
          (!size || inv.size === size) && (!color || inv.color === color)
        );
        
        if (!variant) {
          return {
            productId,
            size,
            color,
            available: 0,
            reserved: 0,
            status: 'out_of_stock'
          };
        }

        return {
          productId,
          size: variant.size,
          color: variant.color,
          available: variant.quantity - (variant.reserved || 0),
          reserved: variant.reserved || 0,
          totalStock: variant.quantity,
          status: this.getStockStatus(variant.quantity - (variant.reserved || 0)),
          lastUpdated: variant.lastUpdated || product.updatedAt
        };
      }

      // Return aggregate inventory for all variants
      const totalAvailable = product.inventory.reduce((sum, inv) => 
        sum + (inv.quantity - (inv.reserved || 0)), 0);
      
      const totalStock = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      const totalReserved = product.inventory.reduce((sum, inv) => sum + (inv.reserved || 0), 0);

      return {
        productId,
        totalAvailable,
        totalStock,
        totalReserved,
        variants: product.inventory.map(inv => ({
          size: inv.size,
          color: inv.color,
          available: inv.quantity - (inv.reserved || 0),
          reserved: inv.reserved || 0,
          status: this.getStockStatus(inv.quantity - (inv.reserved || 0))
        })),
        status: this.getStockStatus(totalAvailable),
        lastUpdated: product.updatedAt
      };

    } catch (error) {
      console.error('Error getting product inventory:', error);
      throw error;
    }
  }

  /**
   * Reserve inventory for order (temporary hold)
   */
  async reserveInventory(items, orderId, userId) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        const reservations = [];
        
        for (const item of items) {
          const { productId, size, color, quantity } = item;
          
          // Check if enough inventory available
          const inventory = await this.getProductInventory(productId, size, color);
          
          if (inventory.available < quantity) {
            throw new Error(
              `Insufficient inventory for ${productId} (${size}, ${color}). ` +
              `Requested: ${quantity}, Available: ${inventory.available}`
            );
          }

          // Reserve the inventory
          const updateResult = await Product.updateOne(
            {
              productId,
              'inventory.size': size,
              'inventory.color': color,
              'inventory.quantity': { $gte: quantity }
            },
            {
              $inc: {
                'inventory.$.reserved': quantity
              },
              $set: {
                'inventory.$.lastUpdated': new Date()
              }
            },
            { session }
          );

          if (updateResult.modifiedCount === 0) {
            throw new Error(`Failed to reserve inventory for ${productId}`);
          }

          // Store reservation details
          reservations.push({
            productId,
            size,
            color,
            quantity,
            reservedAt: new Date(),
            orderId,
            userId,
            expiresAt: new Date(Date.now() + this.reservationTimeout)
          });
        }

        // Store reservations in database (for tracking and cleanup)
        await this.storeReservations(reservations, session);
        
        // Schedule cleanup for expired reservations
        this.scheduleReservationCleanup(orderId, this.reservationTimeout);

        return reservations;
      });

    } catch (error) {
      console.error('Error reserving inventory:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Confirm inventory reservation (convert to actual purchase)
   */
  async confirmInventoryReservation(orderId) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Get reservation details
        const reservations = await this.getReservations(orderId);
        
        if (!reservations.length) {
          throw new Error(`No reservations found for order ${orderId}`);
        }

        for (const reservation of reservations) {
          const { productId, size, color, quantity } = reservation;
          
          // Move from reserved to sold
          const updateResult = await Product.updateOne(
            {
              productId,
              'inventory.size': size,
              'inventory.color': color,
              'inventory.reserved': { $gte: quantity }
            },
            {
              $inc: {
                'inventory.$.quantity': -quantity,
                'inventory.$.reserved': -quantity,
                'inventory.$.sold': quantity
              },
              $set: {
                'inventory.$.lastUpdated': new Date()
              }
            },
            { session }
          );

          if (updateResult.modifiedCount === 0) {
            throw new Error(`Failed to confirm inventory for ${productId}`);
          }

          // Record sale in inventory history
          await this.recordInventoryTransaction({
            productId,
            size,
            color,
            type: 'sale',
            quantity: -quantity,
            orderId,
            timestamp: new Date(),
            reason: 'Order confirmed'
          }, session);
        }

        // Remove reservations
        await this.removeReservations(orderId, session);
        
        // Check for low stock alerts
        await this.checkLowStockAlerts(reservations);
      });

    } catch (error) {
      console.error('Error confirming inventory reservation:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Cancel inventory reservation (release reserved stock)
   */
  async cancelInventoryReservation(orderId) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        const reservations = await this.getReservations(orderId);
        
        if (!reservations.length) {
          console.log(`No reservations found for order ${orderId}`);
          return;
        }

        for (const reservation of reservations) {
          const { productId, size, color, quantity } = reservation;
          
          // Release reserved inventory
          await Product.updateOne(
            {
              productId,
              'inventory.size': size,
              'inventory.color': color
            },
            {
              $inc: {
                'inventory.$.reserved': -quantity
              },
              $set: {
                'inventory.$.lastUpdated': new Date()
              }
            },
            { session }
          );
        }

        // Remove reservations
        await this.removeReservations(orderId, session);
      });

    } catch (error) {
      console.error('Error canceling inventory reservation:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Update inventory levels (for restocking)
   */
  async updateInventory(productId, size, color, quantity, reason = 'Manual update') {
    try {
      const updateResult = await Product.updateOne(
        {
          productId,
          'inventory.size': size,
          'inventory.color': color
        },
        {
          $inc: {
            'inventory.$.quantity': quantity
          },
          $set: {
            'inventory.$.lastUpdated': new Date()
          }
        }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error('Inventory item not found or update failed');
      }

      // Record inventory transaction
      await this.recordInventoryTransaction({
        productId,
        size,
        color,
        type: quantity > 0 ? 'restock' : 'adjustment',
        quantity,
        timestamp: new Date(),
        reason
      });

      // Get updated inventory
      const updatedInventory = await this.getProductInventory(productId, size, color);
      
      // Check for alerts
      await this.checkInventoryAlerts(updatedInventory);

      return updatedInventory;

    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(threshold = null) {
    try {
      const stockThreshold = threshold || this.lowStockThreshold;
      
      const products = await Product.aggregate([
        {
          $unwind: '$inventory'
        },
        {
          $match: {
            $expr: {
              $lte: [
                { $subtract: ['$inventory.quantity', { $ifNull: ['$inventory.reserved', 0] }] },
                stockThreshold
              ]
            }
          }
        },
        {
          $project: {
            productId: 1,
            name: 1,
            brand: 1,
            size: '$inventory.size',
            color: '$inventory.color',
            available: {
              $subtract: ['$inventory.quantity', { $ifNull: ['$inventory.reserved', 0] }]
            },
            totalStock: '$inventory.quantity',
            reserved: { $ifNull: ['$inventory.reserved', 0] },
            lastUpdated: '$inventory.lastUpdated'
          }
        },
        {
          $sort: { available: 1 }
        }
      ]);

      return products;

    } catch (error) {
      console.error('Error getting low stock items:', error);
      throw error;
    }
  }

  /**
   * Get out of stock items
   */
  async getOutOfStockItems() {
    return this.getLowStockItems(0);
  }

  /**
   * Generate reorder suggestions
   */
  async generateReorderSuggestions() {
    try {
      const lowStockItems = await this.getLowStockItems();
      const salesData = await this.getSalesVelocity();
      
      const suggestions = [];

      for (const item of lowStockItems) {
        const salesVelocity = salesData.find(s => 
          s.productId === item.productId && 
          s.size === item.size && 
          s.color === item.color
        );

        const averageDailySales = salesVelocity ? salesVelocity.avgDailySales : 1;
        const leadTimeDays = 7; // Assume 7-day lead time
        const safetyStock = Math.ceil(averageDailySales * 3); // 3 days safety stock
        
        const recommendedOrderQuantity = Math.max(
          this.reorderQuantity,
          Math.ceil(averageDailySales * leadTimeDays) + safetyStock - item.available
        );

        if (recommendedOrderQuantity > 0) {
          suggestions.push({
            ...item,
            salesVelocity: averageDailySales,
            recommendedOrderQuantity,
            priority: item.available <= 0 ? 'urgent' : 
                     item.available <= 5 ? 'high' : 'medium',
            estimatedStockoutDate: this.estimateStockoutDate(item.available, averageDailySales)
          });
        }
      }

      return suggestions.sort((a, b) => {
        const priorityOrder = { urgent: 3, high: 2, medium: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    } catch (error) {
      console.error('Error generating reorder suggestions:', error);
      throw error;
    }
  }

  /**
   * Get inventory analytics
   */
  async getInventoryAnalytics(startDate, endDate) {
    try {
      const [stockLevels, movements, turnover] = await Promise.all([
        this.getStockLevelAnalytics(),
        this.getInventoryMovements(startDate, endDate),
        this.getInventoryTurnover(startDate, endDate)
      ]);

      return {
        stockLevels,
        movements,
        turnover,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error getting inventory analytics:', error);
      throw error;
    }
  }

  // Helper methods

  getStockStatus(availableQuantity) {
    if (availableQuantity <= this.outOfStockThreshold) return 'out_of_stock';
    if (availableQuantity <= this.lowStockThreshold) return 'low_stock';
    return 'in_stock';
  }

  async storeReservations(reservations, session) {
    // In a real implementation, store in a reservations collection
    // For now, we'll just log them
    console.log('Storing reservations:', reservations.map(r => 
      `${r.productId} (${r.size}, ${r.color}): ${r.quantity}`).join(', '));
  }

  async getReservations(orderId) {
    // In a real implementation, fetch from reservations collection
    // For now, return empty array
    return [];
  }

  async removeReservations(orderId, session) {
    // In a real implementation, remove from reservations collection
    console.log(`Removing reservations for order ${orderId}`);
  }

  scheduleReservationCleanup(orderId, timeout) {
    setTimeout(async () => {
      try {
        await this.cancelInventoryReservation(orderId);
        console.log(`Cleaned up expired reservations for order ${orderId}`);
      } catch (error) {
        console.error(`Error cleaning up reservations for order ${orderId}:`, error);
      }
    }, timeout);
  }

  async recordInventoryTransaction(transaction, session = null) {
    // In a real implementation, store in inventory_transactions collection
    console.log('Recording inventory transaction:', transaction);
  }

  async checkLowStockAlerts(reservations) {
    for (const reservation of reservations) {
      const inventory = await this.getProductInventory(
        reservation.productId, 
        reservation.size, 
        reservation.color
      );
      
      if (inventory.status === 'low_stock' || inventory.status === 'out_of_stock') {
        await this.sendLowStockAlert(inventory);
      }
    }
  }

  async checkInventoryAlerts(inventory) {
    if (inventory.status === 'low_stock' || inventory.status === 'out_of_stock') {
      await this.sendLowStockAlert(inventory);
    }
  }

  async sendLowStockAlert(inventory) {
    // In a real implementation, send email/notification to inventory managers
    console.log(`LOW STOCK ALERT: ${inventory.productId} (${inventory.size}, ${inventory.color}) - ${inventory.available} remaining`);
  }

  async getSalesVelocity() {
    try {
      // Calculate average daily sales for last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const salesData = await Order.aggregate([
        {
          $match: {
            placedAt: { $gte: thirtyDaysAgo },
            'payment.status': 'completed'
          }
        },
        {
          $unwind: '$items'
        },
        {
          $group: {
            _id: {
              productId: '$items.productId',
              size: '$items.size',
              color: '$items.color'
            },
            totalSold: { $sum: '$items.quantity' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $project: {
            productId: '$_id.productId',
            size: '$_id.size',
            color: '$_id.color',
            totalSold: 1,
            orderCount: 1,
            avgDailySales: { $divide: ['$totalSold', 30] }
          }
        }
      ]);

      return salesData;

    } catch (error) {
      console.error('Error calculating sales velocity:', error);
      return [];
    }
  }

  estimateStockoutDate(currentStock, dailySalesRate) {
    if (dailySalesRate <= 0) return null;
    
    const daysUntilStockout = Math.floor(currentStock / dailySalesRate);
    const stockoutDate = new Date();
    stockoutDate.setDate(stockoutDate.getDate() + daysUntilStockout);
    
    return stockoutDate;
  }

  async getStockLevelAnalytics() {
    try {
      const analytics = await Product.aggregate([
        { $unwind: '$inventory' },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$inventory.quantity' },
            totalReserved: { $sum: { $ifNull: ['$inventory.reserved', 0] } },
            inStock: {
              $sum: {
                $cond: [
                  { $gt: [{ $subtract: ['$inventory.quantity', { $ifNull: ['$inventory.reserved', 0] }] }, 10] },
                  1, 0
                ]
              }
            },
            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: [{ $subtract: ['$inventory.quantity', { $ifNull: ['$inventory.reserved', 0] }] }, 0] },
                      { $lte: [{ $subtract: ['$inventory.quantity', { $ifNull: ['$inventory.reserved', 0] }] }, 10] }
                    ]
                  },
                  1, 0
                ]
              }
            },
            outOfStock: {
              $sum: {
                $cond: [
                  { $lte: [{ $subtract: ['$inventory.quantity', { $ifNull: ['$inventory.reserved', 0] }] }, 0] },
                  1, 0
                ]
              }
            }
          }
        }
      ]);

      return analytics[0] || {
        totalProducts: 0,
        totalStock: 0,
        totalReserved: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0
      };

    } catch (error) {
      console.error('Error getting stock level analytics:', error);
      throw error;
    }
  }

  async getInventoryMovements(startDate, endDate) {
    // In a real implementation, fetch from inventory_transactions collection
    return {
      sales: 0,
      restocks: 0,
      adjustments: 0,
      returns: 0
    };
  }

  async getInventoryTurnover(startDate, endDate) {
    // In a real implementation, calculate inventory turnover ratio
    return {
      turnoverRatio: 0,
      averageDaysToSell: 0,
      fastMovingItems: [],
      slowMovingItems: []
    };
  }
}

module.exports = InventoryService;