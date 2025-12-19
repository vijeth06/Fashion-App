/**
 * Email Notification Service - Backend
 * Real email sending using Nodemailer with Gmail/SendGrid/AWS SES
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  initialize() {
    // Configure based on environment variables
    const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';

    try {
      if (emailProvider === 'gmail') {
        // Gmail configuration
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
          }
        });
      } else if (emailProvider === 'sendgrid') {
        // SendGrid configuration
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
      } else if (emailProvider === 'aws-ses') {
        // AWS SES configuration
        const aws = require('aws-sdk');
        aws.config.update({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || 'us-east-1'
        });
        this.transporter = nodemailer.createTransport({
          SES: new aws.SES({ apiVersion: '2010-12-01' })
        });
      } else {
        // Generic SMTP configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          }
        });
      }

      console.log(`✅ Email service initialized with ${emailProvider}`);
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@virtualfashion.com',
      to: order.customerEmail,
      subject: `Order Confirmation #${order.orderId}`,
      html: this.getOrderConfirmationTemplate(order)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Order confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send order confirmation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send order shipped notification
   */
  async sendShippingNotification(order, trackingInfo) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@virtualfashion.com',
      to: order.customerEmail,
      subject: `Your Order #${order.orderId} Has Shipped!`,
      html: this.getShippingNotificationTemplate(order, trackingInfo)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Shipping notification sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send shipping notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send order delivered notification
   */
  async sendDeliveryNotification(order) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@virtualfashion.com',
      to: order.customerEmail,
      subject: `Your Order #${order.orderId} Has Been Delivered!`,
      html: this.getDeliveryNotificationTemplate(order)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Delivery notification sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send delivery notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@virtualfashion.com',
      to: email,
      subject: 'Password Reset Request',
      html: this.getPasswordResetTemplate(resetLink)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send password reset:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@virtualfashion.com',
      to: user.email,
      subject: 'Welcome to Virtual Fashion!',
      html: this.getWelcomeEmailTemplate(user)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Email Templates
   */
  getOrderConfirmationTemplate(order) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 20px; font-weight: bold; margin-top: 20px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
          </div>
          <div class="content">
            <h2>Order #${order.orderId}</h2>
            <p>Hi ${order.customerName},</p>
            <p>We've received your order and will notify you when it ships.</p>
            
            <div class="order-details">
              <h3>Order Items:</h3>
              ${order.items.map(item => `
                <div class="item">
                  <span>${item.name} × ${item.quantity}</span>
                  <span>₹${item.price.toFixed(2)}</span>
                </div>
              `).join('')}
              
              <div class="total">
                <span>Total:</span>
                <span>₹${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <a href="${process.env.FRONTEND_URL}/orders/${order.orderId}" class="button">Track Order</a>
            
            <p>Questions? Contact us at support@virtualfashion.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getShippingNotificationTemplate(order, trackingInfo) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .tracking-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .tracking-number { font-size: 24px; font-weight: bold; color: #667eea; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order Has Shipped!</h1>
          </div>
          <div class="content">
            <h2>Order #${order.orderId}</h2>
            <p>Hi ${order.customerName},</p>
            <p>Great news! Your order is on its way.</p>
            
            <div class="tracking-box">
              <p>Tracking Number:</p>
              <div class="tracking-number">${trackingInfo.trackingNumber}</div>
              <p>Carrier: ${trackingInfo.carrier}</p>
              <p>Estimated Delivery: ${trackingInfo.estimatedDelivery}</p>
              <a href="${trackingInfo.trackingUrl}" class="button">Track Shipment</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getDeliveryNotificationTemplate(order) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Delivered!</h1>
          </div>
          <div class="content">
            <h2>Order #${order.orderId}</h2>
            <p>Hi ${order.customerName},</p>
            <p>Your order has been delivered! We hope you love your new items.</p>
            <a href="${process.env.FRONTEND_URL}/orders/${order.orderId}/review" class="button">Leave a Review</a>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(resetLink) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>You requested to reset your password.</p>
            <p>Click the button below to create a new password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeEmailTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Virtual Fashion!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.displayName || 'there'},</p>
            <p>Welcome to Virtual Fashion - your AI-powered virtual try-on platform!</p>
            <p>Get started by exploring our collection and trying on clothes virtually using AR technology.</p>
            <a href="${process.env.FRONTEND_URL}/products" class="button">Start Shopping</a>
            <p>Have questions? We're here to help at support@virtualfashion.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Verify email configuration
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email server is ready to send messages');
      return true;
    } catch (error) {
      console.error('❌ Email server verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const emailService = new EmailService();
module.exports = emailService;
