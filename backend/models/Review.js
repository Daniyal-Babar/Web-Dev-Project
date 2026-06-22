/**
 * Review Model
 * 
 * Stores reviews and ratings for:
 * - Listings (by borrowers)
 * - Users (by both owners and borrowers)
 * - Category-specific ratings
 * 
 * Note: Reviews only shown for paid account listings
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // References
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  reviewerUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Review Content
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },

  // Ratings
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  categoryRating: {
    type: String, // e.g., 'property', 'vehicles', etc.
    required: true
  },

  // Detailed Ratings (category-specific)
  detailedRatings: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    },
    condition: {
      type: Number,
      min: 1,
      max: 5
    },
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Review Type
  reviewType: {
    type: String,
    enum: ['borrower_to_owner', 'owner_to_borrower'],
    required: true
  },

  // Visibility Control
  isVisible: {
    type: Boolean,
    default: true
  },
  // Only show if listing owner has paid account
  visibleOnlyIfPaid: {
    type: Boolean,
    default: true
  },

  // Moderation
  isVerified: {
    type: Boolean,
    default: false
  },
  flaggedForModeration: {
    type: Boolean,
    default: false
  },
  moderationReason: String,

  // Owner Response
  ownerResponse: {
    response: String,
    respondedAt: Date
  },

  // Helpful Votes
  helpfulCount: {
    type: Number,
    default: 0
  },
  unhelpfulCount: {
    type: Number,
    default: 0
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

reviewSchema.index({ listing: 1 });
reviewSchema.index({ reviewedUser: 1 });
reviewSchema.index({ reviewerUser: 1 });
reviewSchema.index({ categoryRating: 1 });
reviewSchema.index({ createdAt: -1 });

// ==================== MIDDLEWARE ====================

/**
 * Update listing and user ratings after review is saved
 */
reviewSchema.post('save', async function(doc) {
  const Listing = mongoose.model('Listing');
  const User = mongoose.model('User');

  // Update listing rating
  const listingReviews = await mongoose.model('Review').find({ listing: doc.listing });
  const avgRating = listingReviews.reduce((sum, review) => sum + review.overallRating, 0) / listingReviews.length;

  await Listing.findByIdAndUpdate(doc.listing, {
    'rating.average': avgRating,
    'rating.count': listingReviews.length
  });

  // Update user rating for the reviewed user
  const userReviews = await mongoose.model('Review').find({ reviewedUser: doc.reviewedUser });
  const userAvgRating = userReviews.reduce((sum, review) => sum + review.overallRating, 0) / userReviews.length;

  await User.findByIdAndUpdate(doc.reviewedUser, {
    overallRating: userAvgRating,
    reviewCount: userReviews.length
  });
});

module.exports = mongoose.model('Review', reviewSchema);
