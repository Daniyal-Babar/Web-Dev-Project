/**
 * Listing Routes
 * 
 * Handles:
 * - Create listing
 * - Get listing details
 * - Update listing
 * - Delete listing
 * - Search listings with filters
 * - Get listings by category
 */

const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

/**
 * POST /api/listings
 * Create new listing
 * 
 * Protected route - requires authentication
 * 
 * Body: {
 *   title: string,
 *   description: string,
 *   category: 'property' | 'vehicles' | 'clothes' | 'equipment' | 'services' | 'animals' | 'boats' | 'air_transport',
 *   subCategory: string,
 *   pricing: {
 *     amount: number,
 *     pricingModel: 'hourly' | 'daily' | 'weekly' | 'monthly'
 *   },
 *   location: {
 *     address: string,
 *     city: string,
 *     province: string,
 *     coordinates: [longitude, latitude],
 *     serviceRadius: number
 *   },
 *   availability: {
 *     availableFrom: date,
 *     availableUntil: date
 *   },
 *   specifications: {...},
 *   images: [...]
 * }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title, description, category, subCategory,
      pricing, location, availability, specifications, images,
      damagePolicy, lostItemPolicy
    } = req.body;

    // Debug: Log the owner ID being used
    console.log('Creating listing for owner ID:', req.userId);

    // Create listing
    const listing = new Listing({
      title,
      description,
      category,
      subCategory,
      owner: req.userId,
      pricing,
      location: {
        ...location,
        coordinates: {
          type: 'Point',
          coordinates: location.coordinates // [longitude, latitude]
        }
      },
      availability,
      specifications,
      images,
      damagePolicy,
      lostItemPolicy,
      accountType: 'free'
    });

    await listing.save();

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/listings/my-listings
 * Get current user's listings
 * 
 * Protected route - requires authentication
 * 
 * Query parameters:
 * - status: 'active' | 'inactive' | 'archived' (optional)
 * - sortBy: 'newest' | 'oldest' | 'popular' (default: 'newest')
 * - page: number (default: 1)
 * - limit: number (default: 10)
 */
router.get('/my-listings', authMiddleware, async (req, res) => {
  try {
    const {
      status,
      sortBy = 'newest',
      page = 1,
      limit = 10
    } = req.query;

    // Debug: Log the user ID from request
    console.log('My-listings request - User ID:', req.userId);

    // Build filter - only show current user's listings
    const filter = { owner: req.userId };
    console.log('My-listings filter:', filter);

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Sorting
    let sortOption = {};
    switch (sortBy) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { views: -1 };
        break;
      default: // newest
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get bookings count for each listing
    const Booking = require('../models/Booking');

    // Query listings
    const listings = await Listing.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title images pricing status category createdAt views isActive');

    // Get bookings count for each listing
    const listingsWithCounts = await Promise.all(
      listings.map(async (listing) => {
        const bookingsCount = await Booking.countDocuments({ listing: listing._id });
        return {
          ...listing.toObject(),
          bookingsCount
        };
      })
    );

    // Count total
    const total = await Listing.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: listingsWithCounts.length,
      data: listingsWithCounts,
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
 * GET /api/listings/:id
 * Get listing details by ID
 * 
 * Increment view count
 * Shows/hides reviews based on account type
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('owner', 'firstName lastName profileImage overallRating');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.status(200).json({
      success: true,
      listing,
      reviewsVisible: listing.canShowReviews()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/listings/:id
 * Update listing details
 * 
 * Protected route - only owner can update
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    // Check ownership
    if (listing.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only owner can update this listing'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'pricing', 'availability',
      'images', 'specifications', 'damagePolicy', 'lostItemPolicy'
    ];

    allowedFields.forEach(field => {
      if (req.body[field]) {
        listing[field] = req.body[field];
      }
    });

    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * DELETE /api/listings/:id
 * Delete listing
 * 
 * Protected route - only owner can delete
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    // Check ownership
    if (listing.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only owner can delete this listing'
      });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/listings
 * Search and filter listings
 * 
 * Query parameters:
 * - category: string
 * - city: string
 * - priceMin: number
 * - priceMax: number
 * - search: string (keyword search)
 * - sortBy: 'newest' | 'popular' | 'price_low' | 'price_high'
 * - page: number (default: 1)
 * - limit: number (default: 10)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category, city, priceMin, priceMax, search,
      sortBy = 'newest', page = 1, limit = 10
    } = req.query;

    // Build filter
    const filter = { isActive: true, status: 'active' };

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Location filter
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    // Price range filter
    if (priceMin || priceMax) {
      filter['pricing.amount'] = {};
      if (priceMin) filter['pricing.amount'].$gte = priceMin;
      if (priceMax) filter['pricing.amount'].$lte = priceMax;
    }

    // Keyword search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOption = {};
    switch (sortBy) {
      case 'popular':
        sortOption = { views: -1 };
        break;
      case 'price_low':
        sortOption = { 'pricing.amount': 1 };
        break;
      case 'price_high':
        sortOption = { 'pricing.amount': -1 };
        break;
      default: // newest
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Query
    const listings = await Listing.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'firstName lastName overallRating accountType');

    // Count total
    const total = await Listing.countDocuments(filter);

    res.status(200).json({
      success: true,
      listings,
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

module.exports = router;
