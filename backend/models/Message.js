/**
 * Message Model
 * 
 * Stores secure messages between users
 * - Can be sent before or after booking
 * - Encrypted for privacy
 * - Used for coordination of pickup/delivery
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Conversation Reference
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },

  // Message Details
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Listing Context (optional)
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },

  // Message Content
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Attachment
  attachment: {
    url: String,
    type: String,
    name: String
  },

  // Message Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,

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

messageSchema.index({ conversationId: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });
messageSchema.index({ createdAt: -1 });

// ==================== METHODS ====================

/**
 * Mark message as read
 */
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Message', messageSchema);
