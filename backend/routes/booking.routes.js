/**
 * Booking Routes
 * 
 * Handles:
 * - Create booking (instant or request-based)
 * - Get booking details
 * - Confirm booking
 * - Cancel booking
 * - Get user's bookings
 * - Update booking status
 */

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/bookings
 * Create new booking
 * 
 * Protected route - requires authentication
 * 
 * Body: {
 *   listing: string (listing ID),
 *   startDate: date,
 *   endDate: date,
 *   bookingType: 'instant' | 'request',
 *   deliveryMethod: 'self_pickup' | 'owner_delivery' | 'courier',
 *   paymentMethod: 'jazz_cash' | 'easypaisa' | 'card' | 'bank_transfer'
 * }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      listing: listingId, startDate, endDate,
      bookingType, deliveryMethod, paymentMethod
    } = req.body;

    // Get listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check availability
    if (!listing.isAvailableForDates(new Date(startDate), new Date(endDate))) {
      return res.status(409).json({
        success: false,
        message: 'Listing is not available for selected dates'
      });
    }

    // Calculate pricing
    const start = new Date(startDate);
    const end = new Date(endDate);
    let units = 0;

    switch (listing.pricing.pricingModel) {
      case 'hourly':
        units = (end - start) / (1000 * 60 * 60);
        break;
      case 'daily':
        units = (end - start) / (1000 * 60 * 60 * 24);
        break;
      case 'weekly':
        units = (end - start) / (1000 * 60 * 60 * 24 * 7);
        break;
      case 'monthly':
        units = (end - start) / (1000 * 60 * 60 * 24 * 30);
        break;
    }

    const subtotal = listing.pricing.amount * units;
    const platformFee = subtotal * 0.10; // 10% platform fee
    const tax = (subtotal + platformFee) * 0.17; // 17% GST for Pakistan
    const totalAmount = subtotal + platformFee + tax;

    // Map pricing model to rental duration unit
    const unitMap = {
      'hourly': 'hours',
      'daily': 'days',
      'weekly': 'weeks',
      'monthly': 'months'
    };

    // Create booking
    const booking = new Booking({
      listing: listingId,
      owner: listing.owner,
      borrower: req.userId,
      startDate,
      endDate,
      bookingType,
      status: bookingType === 'instant' ? 'confirmed' : 'pending',
      rentalDuration: {
        value: Math.ceil(units),
        unit: unitMap[listing.pricing.pricingModel] || 'days'
      },
      pricing: {
        pricePerUnit: listing.pricing.amount,
        units: Math.ceil(units),
        subtotal,
        platformFee,
        tax,
        totalAmount
      },
      deliveryMethod,
      payment: {
        method: paymentMethod,
        status: bookingType === 'instant' ? 'completed' : 'pending'
      }
    });

    await booking.save();

    // Add booking to listing's booked dates
    listing.availability.bookedDates.push({
      startDate,
      endDate,
      bookingId: booking._id
    });
    await listing.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/bookings/:id
 * Get booking details
 * 
 * Protected route - only owner, borrower, or admin can view
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('owner', 'firstName lastName email phoneNumber')
      .populate('borrower', 'firstName lastName email phoneNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access - user must be either owner or borrower
    const userId = req.userId || req.user?._id?.toString();
    
    if (booking.owner._id.toString() !== userId && booking.borrower._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/bookings/user/my-bookings
 * Get all bookings for current user (as borrower or owner)
 * 
 * Protected route - requires authentication
 * 
 * Query:
 * - role: 'borrower' | 'owner' | 'all'
 * - status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
 */
router.get('/user/my-bookings', authMiddleware, async (req, res) => {
  try {
    const { role = 'all', status } = req.query;

    const filter = {};

    // Filter by role
    if (role === 'borrower') {
      filter.borrower = req.userId;
    } else if (role === 'owner') {
      filter.owner = req.userId;
    } else {
      filter.$or = [
        { borrower: req.userId },
        { owner: req.userId }
      ];
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('listing', 'title category images pricing')
      .populate('owner', 'firstName lastName')
      .populate('borrower', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/bookings/:id/confirm
 * Owner confirms pending booking
 * 
 * Protected route - only owner can confirm
 */
router.put('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is owner
    if (booking.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only owner can confirm booking'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be confirmed'
      });
    }

    await booking.confirmBooking();

    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/bookings/:id/cancel
 * Cancel booking with refund
 * 
 * Protected route - borrower or owner can cancel
 * 
 * Body: {
 *   reason: string
 * }
 */
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access
    if (booking.owner.toString() !== req.userId && 
        booking.borrower.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled'
      });
    }

    // Determine who is cancelling
    const cancelledBy = booking.owner.toString() === req.userId ? 'owner' : 'borrower';

    await booking.cancelBooking(cancelledBy, req.body.reason);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/bookings/:id/complete
 * Mark booking as completed
 * 
 * Protected route - requires authentication (owner only)
 * 
 * When owner marks booking complete:
 * - Booking status changed to 'completed'
 * - Owner's wallet automatically credited with earnings
 */
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    
    const booking = await Booking.findById(req.params.id)
      .populate('owner', 'firstName lastName wallet')
      .populate('listing', 'title');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify only owner can mark as complete
    if (booking.owner._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can mark booking as completed'
      });
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be marked as complete'
      });
    }

    // Check if payment is confirmed
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment must be confirmed before completing booking'
      });
    }

    // Mark booking as completed
    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    // Credit owner's wallet
    const owner = await User.findById(booking.owner._id);
    
    // Check if already credited
    const alreadyCredited = owner.wallet.transactions.some(
      tx => tx.booking && tx.booking.toString() === booking._id.toString() && tx.type === 'credit'
    );

    if (!alreadyCredited) {
      // Calculate owner's earnings (total - platform fee)
      const platformFee = booking.pricing?.fee || Math.round(booking.totalAmount * 0.10);
      const ownerEarnings = booking.totalAmount - platformFee;

      // Credit wallet
      owner.wallet.balance += ownerEarnings;
      owner.wallet.transactions.push({
        type: 'credit',
        amount: ownerEarnings,
        description: `Earnings from rental: ${booking.listing.title}`,
        booking: booking._id,
        status: 'completed',
        date: new Date()
      });
      await owner.save();

      res.json({
        success: true,
        message: 'Booking completed and earnings credited to wallet',
        booking: booking,
        earning: ownerEarnings,
        newWalletBalance: owner.wallet.balance
      });
    } else {
      res.json({
        success: true,
        message: 'Booking marked as completed',
        booking: booking
      });
    }

  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

