const mongoose = require('mongoose');

/**
 * Listing Schema
 *
 * NOTE:
 * - This schema is aligned with the data shape used in the frontend
 *   `CreateListingPage` and the listing routes.
 * - It keeps some legacy fields (like `pricePerDay`) for backward
 *   compatibility with older data.
 */

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const pricingSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'PKR' },
    pricingModel: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      default: 'daily'
    }
  },
  { _id: false }
);

// Individual booked slot inside availability.bookedDates
const bookedSlotSchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    availableFrom: { type: Date },
    availableUntil: { type: Date },
    // Store booked ranges as objects, not plain dates
    bookedDates: { type: [bookedSlotSchema], default: [] }
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    address: { type: String },
    city: { type: String },
    province: { type: String },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        // [longitude, latitude]
        type: [Number],
        default: [0, 0]
      }
    },
    serviceRadius: { type: Number, default: 10 }
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    // Ownership
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Category / classification
    category: { type: String },
    subCategory: { type: String },

    // Legacy pricing field (older data)
    pricePerDay: { type: Number, default: 0 },

    // New pricing object used by the current frontend
    pricing: pricingSchema,

    // Specifications / additional details
    specifications: {
      type: Object,
      default: {}
    },

    // Images - stored as objects (url, publicId, uploadedAt)
    images: {
      type: [imageSchema],
      default: []
    },

    // Location
    location: locationSchema,

    // Availability
    availability: availabilitySchema,

    // Status & visibility
    // Default is 'active' because the admin dashboard
    // moderation tools are not ready yet.
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected'],
      default: 'active'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    views: {
      type: Number,
      default: 0
    },

    // Safety / policies
    damagePolicy: { type: String },
    lostItemPolicy: { type: String },

    // Account type controlling some premium features (e.g. reviews visibility)
    accountType: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free'
    }
  },
  { timestamps: true }
);

/**
 * Instance methods
 */

listingSchema.methods.canShowReviews = function () {
  // If listing itself is marked as paid, allow reviews
  if (this.accountType === 'paid') return true;

  // If owner is populated and has a paid account, allow reviews
  if (this.owner && this.owner.accountType === 'paid') return true;

  return false;
};

/**
 * Check if listing is available for the given date range.
 *
 * This is used by the booking route:
 *   POST /api/bookings  ->  listing.isAvailableForDates(startDate, endDate)
 *
 * It looks at `availability.bookedDates` and detects any overlap.
 * We support both of these legacy shapes:
 * - [Date, Date, ...]
 * - [{ startDate, endDate, bookingId }, ...]
 */
listingSchema.methods.isAvailableForDates = function (startDate, endDate) {
  if (!startDate || !endDate) return false;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!(start instanceof Date) || isNaN(start) ||
      !(end instanceof Date) || isNaN(end) ||
      start >= end) {
    // Invalid range – treat as not available
    return false;
  }

  const availability = this.availability || {};
  const booked = availability.bookedDates || [];

  // No existing bookings -> available
  if (!Array.isArray(booked) || booked.length === 0) {
    return true;
  }

  // Helper to test interval overlap: [aStart, aEnd) vs [bStart, bEnd)
  const overlaps = (aStart, aEnd, bStart, bEnd) => {
    return aStart < bEnd && bStart < aEnd;
  };

  for (const entry of booked) {
    let bStart;
    let bEnd;

    // Newer shape: object with startDate / endDate
    if (entry && typeof entry === 'object' && (entry.startDate || entry.endDate)) {
      bStart = new Date(entry.startDate);
      bEnd = new Date(entry.endDate);
    } else {
      // Older shape: plain Date values stored directly
      // In that case we treat each date as a single-day booking.
      const d = new Date(entry);
      if (!(d instanceof Date) || isNaN(d)) {
        continue;
      }
      bStart = d;
      // Single day -> add 1 day to get [d, d+1)
      bEnd = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    }

    if (!(bStart instanceof Date) || isNaN(bStart) ||
        !(bEnd instanceof Date) || isNaN(bEnd)) {
      continue;
    }

    if (overlaps(start, end, bStart, bEnd)) {
      // Found a conflicting booking
      return false;
    }
  }

  // No conflicts found
  return true;
};

module.exports = mongoose.model('Listing', listingSchema);
