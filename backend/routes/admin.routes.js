/**
 * Admin Routes
 * 
 * All routes are protected by auth and adminAuth middleware
 * Base path: /api/admin
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/admin.controller');

// Apply auth and adminAuth middleware to all admin routes
router.use(authMiddleware);
router.use(adminAuth);

// ============================================
// USER MANAGEMENT
// ============================================

// Get all users (listers)
router.get('/users', adminController.getUsers);

// Get specific user details
router.get('/users/:userId', adminController.getUserDetails);

// Get user's listings
router.get('/users/:userId/listings', adminController.getUserListings);

// Update user status (suspend/ban/activate)
router.patch('/users/:userId/status', adminController.updateUserStatus);

// ============================================
// LISTING MANAGEMENT
// ============================================

// Get all listings
router.get('/listings', adminController.getAllListings);

// Delete a listing
router.delete('/listings/:listingId', adminController.deleteListing);

// Update listing status
router.patch('/listings/:listingId/status', adminController.updateListingStatus);

// ============================================
// DASHBOARD & STATISTICS
// ============================================

// Get dashboard statistics
router.get('/stats', adminController.getDashboardStats);

// ============================================
// MESSAGING
// ============================================

// Send message to user
router.post('/messages', adminController.sendMessage);

// ============================================
// ADMIN LOGS
// ============================================

// Get admin action logs
router.get('/logs', adminController.getAdminLogs);

module.exports = router;
