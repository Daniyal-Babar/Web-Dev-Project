/**
 * User Routes
 * 
 * Handles:
 * - Get user profile
 * - Update user profile
 * - Change password
 * - Subscribe to paid plan
 * - Upload profile picture
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/users/me/profile
 * Get current logged-in user's profile
 * 
 * Protected route - requires authentication
 * NOTE: This route MUST be defined BEFORE /:id to avoid "me" being treated as an ID
 */
router.get('/me/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/users/:id
 * Get user profile by ID
 * Returns public information only
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/users/:id
 * Update user profile
 * 
 * Protected route - user can only update their own profile
 * 
 * Body: {
 *   firstName?: string,
 *   lastName?: string,
 *   bio?: string,
 *   address?: {
 *     street: string,
 *     city: string,
 *     province: string,
 *     postalCode: string
 *   },
 *   notificationPreferences?: {...}
 * }
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Only allow users to update their own profile
    if (req.userId !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Can only update your own profile'
      });
    }

    const allowedFields = [
      'firstName', 'lastName', 'bio', 'address', 
      'notificationPreferences', 'language', 'profileImage'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field]) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/users/:id/subscribe
 * Subscribe to paid plan
 * 
 * Protected route - requires authentication
 * 
 * Body: {
 *   planDuration: 'monthly' or 'yearly',
 *   paymentMethod: 'card', 'jazz_cash', 'easypaisa'
 * }
 */
router.post('/:id/subscribe', authMiddleware, async (req, res) => {
  try {
    const { planDuration } = req.body;

    // Only allow users to subscribe themselves
    if (req.userId !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const user = await User.findById(req.params.id);

    // Calculate subscription expiry
    const expiryDate = new Date();
    if (planDuration === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    user.accountType = 'paid';
    user.subscriptionExpiry = expiryDate;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscribed to paid plan successfully',
      subscriptionExpiry: expiryDate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
