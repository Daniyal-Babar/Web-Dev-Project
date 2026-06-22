/**
 * Review Routes
 * 
 * Handles:
 * - Create review
 * - Get reviews for listing
 * - Get reviews for user
 * - Update review
 * - Delete review (only by creator)
 * - Add owner response
 * 
 * IMPORTANT: Reviews only visible for paid account listings
 */

const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Listing = require('../models/Listing');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/reviews
 * Create new review
 * 
 * Protected route - requires authentication
 * 
 * Body: {
 *   booking: string (booking ID),
 *   listing: string (listing ID),
 *   reviewedUser: string (user ID),
 *   title: string,
 *   description: string,
 *   overallRating: number (1-5),
 *   detailedRatings: {
 *     cleanliness: number,
 *     condition: number,
 *     accuracy: number,
 *     communication: number,
 *     value: number
 *   }
 * }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      booking, listing, reviewedUser,
      title, description, overallRating, detailedRatings
    } = req.body;

    // Get listing to check account type
    const listingDoc = await Listing.findById(listing);
    if (!listingDoc) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Create review
    const review = new Review({
      booking,
      listing,
      reviewerUser: req.userId,
      reviewedUser,
      title,
      description,
      overallRating,
      categoryRating: listingDoc.category,
      detailedRatings,
      reviewType: req.userId === listingDoc.owner ? 'owner_to_borrower' : 'borrower_to_owner',
      isVisible: listingDoc.accountType === 'paid',
      visibleOnlyIfPaid: listingDoc.accountType === 'paid'
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/reviews/listing/:listingId
 * Get all reviews for a listing
 * 
 * Only shows reviews if listing owner has paid account
 * 
 * Query:
 * - sort: 'recent' | 'helpful' | 'rating_high' | 'rating_low'
 * - page: number
 * - limit: number
 */
router.get('/listing/:listingId', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if reviews should be visible
    if (!listing.canShowReviews()) {
      return res.status(200).json({
        success: true,
        message: 'Reviews not available for free accounts',
        reviews: [],
        reviewsVisible: false
      });
    }

    const { sort = 'recent', page = 1, limit = 5 } = req.query;

    let sortOption = {};
    switch (sort) {
      case 'helpful':
        sortOption = { helpfulCount: -1 };
        break;
      case 'rating_high':
        sortOption = { overallRating: -1 };
        break;
      case 'rating_low':
        sortOption = { overallRating: 1 };
        break;
      default: // recent
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      listing: req.params.listingId,
      isVisible: true,
      flaggedForModeration: false
    })
      .populate('reviewerUser', 'firstName lastName profileImage overallRating')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({
      listing: req.params.listingId,
      isVisible: true,
      flaggedForModeration: false
    });

    res.status(200).json({
      success: true,
      reviews,
      reviewsVisible: true,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/reviews/user/:userId
 * Get all reviews for a user
 * 
 * Shows user's overall rating and recent reviews
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewedUser: req.params.userId,
      isVisible: true,
      flaggedForModeration: false
    })
      .populate('listing', 'title category')
      .populate('reviewerUser', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      reviews,
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/reviews/:id/response
 * Add owner response to review
 * 
 * Protected route - only listing owner can respond
 * 
 * Body: {
 *   response: string
 * }
 */
router.post('/:id/response', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is listing owner
    const listing = await Listing.findById(review.listing);
    if (listing.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only listing owner can respond to reviews'
      });
    }

    review.ownerResponse = {
      response: req.body.response,
      respondedAt: new Date()
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
