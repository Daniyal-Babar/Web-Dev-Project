/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches user information to requests
 * Used to protect routes that require authentication
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token
 * Adds user ID to request if token is valid
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;

    // Load full user for downstream middlewares/controllers
    const user = await User.findById(decoded.id).select('-password -tempOtp -tempOtpExpiry');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found for provided token'
      });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Optional authentication middleware
 * Doesn't fail if token is missing, but adds user info if valid token is present
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
    }
  } catch (error) {
    // Silently fail - route will work without auth
  }
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth
};
