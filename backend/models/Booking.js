/**
 * Booking Model
 * 
 * Represents rental bookings with two modes:
 * - Instant booking: Automatically confirmed
 * - Request-based: Requires owner approval
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // References
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Booking Details
  bookingType: {
    type: String,
    enum: ['instant', 'request'],
    default: 'instant'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Duration
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  rentalDuration: {
    value: Number,
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months']
    }
  },

  // Pricing
  pricing: {
    pricePerUnit: {
      type: Number,
      required: true
    },
    units: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    platformFee: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'PKR'
    }
  },

  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['jazz_cash', 'easypaisa', 'card', 'bank_transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    refundAmount: Number,
    refundedAt: Date
  },

  // Cancellation
  cancellation: {
    isCancelled: {
      type: Boolean,
      default: false
    },
    cancelledBy: {
      type: String,
      enum: ['owner', 'borrower', 'system']
    },
    cancelledAt: Date,
    reason: String,
    refundPercentage: {
      type: Number,
      default: 0
    }
  },

  // Delivery & Return
  deliveryMethod: {
    type: String,
    enum: ['self_pickup', 'owner_delivery', 'courier'],
    required: true
  },
  pickupLocation: {
    address: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    }
  },
  returnLocation: {
    address: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    }
  },

  // Reminders
  reminders: {
    confirmationSent: Boolean,
    reminderBeforeStartSent: Boolean,
    reminderBeforeEndSent: Boolean
  },

  // Dispute Information
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    description: String,
    filedBy: {
      type: String,
      enum: ['owner', 'borrower']
    },
    filedAt: Date,
    status: {
      type: String,
      enum: ['open', 'resolved', 'escalated']
    },
    resolution: String,
    resolvedAt: Date
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ==================== INDEXES ====================

bookingSchema.index({ listing: 1 });
bookingSchema.index({ owner: 1 });
bookingSchema.index({ borrower: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

// ==================== METHODS ====================

/**
 * Mark booking as confirmed
 */
bookingSchema.methods.confirmBooking = function() {
  this.status = 'confirmed';
  this.payment.status = 'completed';
  this.payment.paidAt = new Date();
  return this.save();
};

/**
 * Cancel booking with refund calculation
 */
bookingSchema.methods.cancelBooking = function(cancelledBy, reason) {
  this.status = 'cancelled';
  this.cancellation.isCancelled = true;
  this.cancellation.cancelledBy = cancelledBy;
  this.cancellation.cancelledAt = new Date();
  this.cancellation.reason = reason;

  // Calculate refund based on cancellation time
  const daysUntilStart = Math.ceil(
    (this.startDate - new Date()) / (1000 * 60 * 60 * 24)
  );

  // Full refund if cancelled 7+ days before
  if (daysUntilStart >= 7) {
    this.cancellation.refundPercentage = 100;
  }
  // 50% refund if cancelled 2-7 days before
  else if (daysUntilStart >= 2) {
    this.cancellation.refundPercentage = 50;
  }
  // No refund if cancelled less than 2 days before
  else {
    this.cancellation.refundPercentage = 0;
  }

  return this.save();
};

/**
 * Check if booking can be cancelled
 */
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  return this.status !== 'completed' && this.status !== 'cancelled' && now < this.startDate;
};

module.exports = mongoose.model('Booking', bookingSchema);
