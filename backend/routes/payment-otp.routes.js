/**
 * Payment OTP Routes
 * Handle OTP sending and verification for Easypaisa payments
 */

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const OTP = require('../models/OTP');
const Booking = require('../models/Booking');

// Choose your SMS service (uncomment the one you want to use)
// const smsService = require('../services/sms.twilio.service'); // For Twilio
const smsService = require('../services/sms.service'); // For existing service
// const smsService = require('../services/sms.pakistani.service'); // For Pakistani SMS Gateway

/**
 * Send OTP for payment
 * POST /api/payments/send-otp
 */
router.post('/send-otp', authMiddleware, async (req, res) => {
  try {
    const { phoneNumber, bookingId } = req.body;

    // Validate inputs
    if (!phoneNumber || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and booking ID are required'
      });
    }

    // Validate phone number format (Pakistani: 03XXXXXXXXX)
    const cleanedPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!/^03\d{9}$/.test(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Pakistani mobile number format'
      });
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      borrower: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if OTP was recently sent (rate limiting)
    const recentOTP = await OTP.findOne({
      phoneNumber: cleanedPhone,
      bookingId: bookingId,
      createdAt: { $gte: new Date(Date.now() - 60000) } // Within last 1 minute
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'OTP already sent. Please wait 1 minute before requesting again.'
      });
    }

    // Generate and send OTP
    const { otp, expiresAt } = await smsService.sendPaymentOTP(cleanedPhone);

    // Save OTP to database
    const otpDoc = await OTP.create({
      phoneNumber: cleanedPhone,
      otp: otp,
      bookingId: bookingId,
      expiresAt: expiresAt,
      verified: false,
      attempts: 0
    });

    console.log('OTP sent and saved:', { phone: cleanedPhone, bookingId, otpId: otpDoc._id });

    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300 // 5 minutes in seconds
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
});

/**
 * Verify OTP and initiate payment
 * POST /api/payments/verify-otp
 */
router.post('/verify-otp', authMiddleware, async (req, res) => {
  try {
    const { phoneNumber, otp, bookingId } = req.body;

    // Validate inputs
    if (!phoneNumber || !otp || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, OTP, and booking ID are required'
      });
    }

    const cleanedPhone = phoneNumber.replace(/[\s-]/g, '');

    // Find OTP record
    const otpDoc = await OTP.findOne({
      phoneNumber: cleanedPhone,
      bookingId: bookingId,
      verified: false
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new OTP.'
      });
    }

    // Check if expired
    if (otpDoc.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Check if too many attempts
    if (otpDoc.tooManyAttempts()) {
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (otpDoc.otp !== otp) {
      await otpDoc.incrementAttempts();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - otpDoc.attempts} attempts remaining.`
      });
    }

    // Mark OTP as verified
    otpDoc.verified = true;
    await otpDoc.save();

    // Get booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Here you would integrate with Easypaisa payment gateway
    // For now, we'll return a mock redirect URL
    const redirectUrl = `https://easypaisa.com.pk/payment?ref=${bookingId}&amount=${booking.pricing.totalAmount}&phone=${cleanedPhone}`;

    res.json({
      success: true,
      message: 'OTP verified successfully',
      redirectUrl: redirectUrl,
      bookingId: bookingId
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
});

/**
 * Resend OTP
 * POST /api/payments/resend-otp
 */
router.post('/resend-otp', authMiddleware, async (req, res) => {
  try {
    const { phoneNumber, bookingId } = req.body;

    // Delete old OTPs for this phone/booking
    await OTP.deleteMany({
      phoneNumber: phoneNumber.replace(/[\s-]/g, ''),
      bookingId: bookingId
    });

    // Use the send-otp endpoint logic
    return router.post('/send-otp')(req, res);

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});

module.exports = router;
