/**
 * Payment Model
 * 
 * Tracks all payment transactions in the system
 * 
 * Types:
 * - payment: Customer pays for booking
 * - payout: Platform pays owner
 * - refund: Money returned to customer
 * 
 * Status:
 * - pending: Payment initiated but not completed
 * - completed: Payment successful
 * - failed: Payment failed
 * - refunded: Payment refunded to customer
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Associated booking
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },

  // PayRails execution ID
  executionId: {
    type: String,
    required: true,
    index: true
  },

  // PayRails payment ID
  paymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Payment amount
  amount: {
    type: Number,
    required: true,
    min: 0
  },

  // Currency (PKR for Pakistan)
  currency: {
    type: String,
    default: 'PKR',
    enum: ['PKR', 'USD', 'EUR', 'GBP']
  },

  // Transaction type
  type: {
    type: String,
    enum: ['payment', 'payout', 'refund'],
    default: 'payment'
  },

  // Payment status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },

  // Payment method used
  paymentMethod: {
    type: String,
    default: 'easypaisa',
    enum: ['easypaisa', 'jazzcash', 'card', 'bank_transfer']
  },

  // Payment gateway provider
  provider: {
    type: String,
    default: 'payrails',
    enum: ['payrails', 'stripe', 'manual']
  },

  // User who paid (borrower)
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // User who receives payment (owner) - optional, used for payouts
  payee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  // When payment was completed
  paidAt: {
    type: Date
  },

  // Refund information
  refundId: {
    type: String,
    sparse: true,
    index: true
  },

  refundAmount: {
    type: Number,
    min: 0
  },

  refundedAt: {
    type: Date
  },

  refundReason: {
    type: String
  },

  // Webhook data from PayRails
  webhookData: {
    type: Object
  },

  // Additional metadata
  metadata: {
    // Platform fee deducted
    platformFee: Number,
    
    // Owner's earning (after fee)
    ownerEarning: Number,
    
    // Transaction reference
    transactionRef: String,
    
    // Additional notes
    notes: String
  },

  // Error information (if payment failed)
  errorCode: String,
  errorMessage: String

}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for faster queries
paymentSchema.index({ booking: 1, status: 1 });
paymentSchema.index({ payer: 1, status: 1 });
paymentSchema.index({ payee: 1, type: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for checking if payment is successful
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

// Virtual for checking if payment is pending
paymentSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

// Instance method to mark payment as completed
paymentSchema.methods.markCompleted = function(webhookData) {
  this.status = 'completed';
  this.paidAt = new Date();
  if (webhookData) {
    this.webhookData = webhookData;
  }
  return this.save();
};

// Instance method to mark payment as failed
paymentSchema.methods.markFailed = function(errorCode, errorMessage, webhookData) {
  this.status = 'failed';
  this.errorCode = errorCode;
  this.errorMessage = errorMessage;
  if (webhookData) {
    this.webhookData = webhookData;
  }
  return this.save();
};

// Instance method to process refund
paymentSchema.methods.processRefund = function(refundId, refundAmount, reason) {
  this.status = 'refunded';
  this.refundId = refundId;
  this.refundAmount = refundAmount;
  this.refundedAt = new Date();
  this.refundReason = reason;
  return this.save();
};

// Static method to get total earnings for a user
paymentSchema.statics.getTotalEarnings = async function(userId) {
  const result = await this.aggregate([
    {
      $match: {
        payee: mongoose.Types.ObjectId(userId),
        status: 'completed',
        type: 'payout'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = async function(userId, userType = 'borrower') {
  const matchField = userType === 'borrower' ? 'payer' : 'payee';
  
  const stats = await this.aggregate([
    {
      $match: {
        [matchField]: mongoose.Types.ObjectId(userId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalAmount: 0,
    totalTransactions: 0,
    averageAmount: 0
  };
};

// Pre-save middleware to calculate metadata
paymentSchema.pre('save', function(next) {
  // Calculate platform fee and owner earning for new payments
  if (this.isNew && this.type === 'payment') {
    const PLATFORM_FEE_PERCENTAGE = 0.10; // 10%
    this.metadata = this.metadata || {};
    this.metadata.platformFee = Math.round(this.amount * PLATFORM_FEE_PERCENTAGE);
    this.metadata.ownerEarning = this.amount - this.metadata.platformFee;
  }
  next();
});

// Enable virtuals in JSON
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema);
