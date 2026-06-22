// backend/routes/auth.routes.js
/**
 * Authentication Routes
 * 
 * Handles:
 * - User registration
 * - Login
 * - Token refresh
 * - Email/Phone verification
 * - Password reset
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Create new user account
 */
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, roles } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this email or phone number already exists' });
    }

    const user = new User({ firstName, lastName, email, phoneNumber, password, roles: roles || ['borrower'] });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ success: true, message: 'User registered successfully', token, user: user.getPublicProfile() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/auth/login
 * User login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ success: true, message: 'Login successful', token, user: user.getPublicProfile() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/auth/verify-email
 * Protected route - requires authentication
 */
router.post('/verify-email', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.emailVerified = true;
    await user.save();
    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/auth/verify-phone
 * Protected route - requires authentication
 */
router.post('/verify-phone', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.phoneVerified = true;
    await user.save();
    res.status(200).json({ success: true, message: 'Phone verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
