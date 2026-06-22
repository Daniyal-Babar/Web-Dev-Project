/**
 * Payment Routes
 * 
 * Handles all payment-related operations:
 * - Initiating payments via PayRails/Easypaisa
 * - Handling webhook notifications
 * - Checking payment status
 * - Processing refunds
 * 
 * Payment Flow:
 * 1. Borrower initiates payment → /api/payments/initiate
 * 2. Redirected to Easypaisa for payment
 * 3. PayRails sends webhook → /api/payments/payrails/webhook
 * 4. Payment confirmed, booking updated
 * 5. On cancellation, refund processed → /api/payments/:paymentId/refund
 */

const express = require('express');
const router = express.Router();
const payRailsService = require('../services/payrails.service');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { authMiddleware } = require('../middleware/auth');

/**
 * POST /api/payments/initiate
 * Initiate payment for a booking
 * 
 * Protected route - requires authentication
 * 
 * Creates PayRails workflow execution and authorizes payment
 * Returns redirect URL for customer to complete payment on Easypaisa
 */
router.post('/initiate', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    // Validate booking exists
    const booking = await Booking.findById(bookingId)
      .populate('borrower', 'firstName lastName email phoneNumber')
      .populate('listing', 'title');

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Verify user is the borrower
    if (booking.borrower._id.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized: You can only pay for your own bookings' 
      });
    }

    // Check if booking already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ 
        success: false,
        message: 'Booking already paid' 
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ 
      booking: bookingId,
      status: { $in: ['pending', 'completed'] }
    });

    if (existingPayment) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment already initiated for this booking',
        paymentId: existingPayment.paymentId
      });
    }

    // Step 1: Create workflow execution with PayRails
    const execution = await payRailsService.createWorkflowExecution({
      bookingId: booking._id.toString(),
      amount: booking.totalAmount,
      currency: 'PKR',
      holderInfo: {
        userId: booking.borrower._id.toString(),
        name: `${booking.borrower.firstName} ${booking.borrower.lastName}`,
        email: booking.borrower.email,
        phone: booking.borrower.phoneNumber
      }
    });

    // Step 2: Authorize payment with Easypaisa
    const authorization = await payRailsService.authorizePayment({
      executionId: execution.executionId,
      amount: booking.totalAmount,
      currency: 'PKR',
      orderLines: [{
        id: booking._id.toString(),
        name: booking.listing.title,
        quantity: 1,
        unitPrice: {
          currency: 'PKR',
          value: booking.totalAmount.toString()
        }
      }]
    });

    // Create payment record in database
    const payment = new Payment({
      booking: bookingId,
      executionId: execution.executionId,
      paymentId: authorization.paymentId,
      amount: booking.totalAmount,
      currency: 'PKR',
      status: 'pending',
      paymentMethod: 'easypaisa',
      payer: req.userId,
      provider: 'payrails'
    });
    await payment.save();

    // Update booking payment status
    booking.paymentStatus = 'pending';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      paymentId: authorization.paymentId,
      redirectUrl: authorization.redirectUrl, // Frontend redirects user here
      executionId: execution.executionId
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to initiate payment'
    });
  }
});

/**
 * POST /api/payments/payrails/webhook
 * Handle PayRails webhook notifications
 * 
 * Public endpoint - called by PayRails
 * 
 * Webhook events:
 * - Payment successful → Update booking status to confirmed
 * - Payment failed → Mark payment as failed
 */
router.post('/payrails/webhook', async (req, res) => {
  try {
    console.log('PayRails webhook received:', JSON.stringify(req.body, null, 2));

    const { paymentId, status, amount, executionId, event } = req.body;

    // Verify webhook signature (if implemented)
    // const isValid = payRailsService.verifyWebhookSignature(req.body, req.headers['x-payrails-signature']);
    // if (!isValid) {
    //   return res.status(401).json({ message: 'Invalid signature' });
    // }

    // Find payment record
    const payment = await Payment.findOne({ paymentId }).populate('booking');
    
    if (!payment) {
      console.error('Payment not found for webhook:', paymentId);
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Handle different webhook events
    if (status === 'SUCCESS' || status === 'CAPTURED' || event === 'payment.success') {
      // Payment successful
      await payment.markCompleted(req.body);

      // Update booking
      const booking = await Booking.findById(payment.booking._id);
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();

      console.log(`Payment ${paymentId} completed successfully`);

    } else if (status === 'FAILED' || status === 'DECLINED' || event === 'payment.failed') {
      // Payment failed
      await payment.markFailed(req.body.errorCode, req.body.errorMessage, req.body);

      // Update booking
      await Booking.findByIdAndUpdate(payment.booking._id, {
        paymentStatus: 'failed'
      });

      console.log(`Payment ${paymentId} failed`);
    }

    res.status(200).json({ success: true, received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * GET /api/payments/:paymentId/status
 * Check payment status
 * 
 * Protected route - requires authentication
 * 
 * Used to poll payment status while user is on payment page
 */
router.get('/:paymentId/status', authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Check in database first
    const payment = await Payment.findOne({ paymentId }).populate('booking');
    
    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }

    // If already completed, return cached status
    if (payment.status === 'completed') {
      return res.json({
        success: true,
        status: payment.status,
        amount: payment.amount,
        paidAt: payment.paidAt
      });
    }

    // If pending, check with PayRails for latest status
    try {
      const remoteStatus = await payRailsService.getPaymentStatus(paymentId);

      // Update local record if status changed
      if (remoteStatus.status === 'SUCCESS' && payment.status !== 'completed') {
        await payment.markCompleted(remoteStatus.data);

        // Update booking
        await Booking.findByIdAndUpdate(payment.booking._id, {
          paymentStatus: 'paid',
          status: 'confirmed'
        });
      }

      res.json({
        success: true,
        status: remoteStatus.status === 'SUCCESS' ? 'completed' : payment.status,
        amount: payment.amount,
        paidAt: payment.paidAt
      });

    } catch (apiError) {
      // If PayRails API fails, return local status
      console.error('Error checking remote status:', apiError);
      res.json({
        success: true,
        status: payment.status,
        amount: payment.amount
      });
    }

  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * POST /api/payments/:paymentId/refund
 * Process refund for a payment
 * 
 * Protected route - requires authentication
 * 
 * Used when booking is cancelled
 * Refund amount calculated based on cancellation policy
 */
router.post('/:paymentId/refund', authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    // Find payment with booking details
    const payment = await Payment.findOne({ paymentId })
      .populate({
        path: 'booking',
        populate: [
          { path: 'owner', select: 'firstName lastName' },
          { path: 'borrower', select: 'firstName lastName' }
        ]
      });

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment not found' 
      });
    }

    // Verify authorization (owner or borrower can request refund)
    const booking = payment.booking;
    const isOwner = booking.owner._id.toString() === req.userId;
    const isBorrower = booking.borrower._id.toString() === req.userId;

    if (!isOwner && !isBorrower) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized: Only booking participants can request refund' 
      });
    }

    // Check if payment is refundable
    if (payment.status !== 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'Can only refund completed payments' 
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({ 
        success: false,
        message: 'Payment already refunded' 
      });
    }

    // Calculate refund amount based on cancellation policy
    // (This would be calculated by booking cancellation logic)
    const refundAmount = booking.refundAmount || payment.amount;

    if (refundAmount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No refund available for this booking' 
      });
    }

    // Process refund through PayRails
    const refund = await payRailsService.refundPayment({
      paymentId: paymentId,
      amount: refundAmount,
      currency: 'PKR',
      reason: reason || 'Booking cancelled'
    });

    // Update payment record
    await payment.processRefund(refund.refundId, refundAmount, reason);

    // Update booking
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refundId: refund.refundId,
      amount: refundAmount,
      estimatedDays: '3-5 business days'
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to process refund'
    });
  }
});

/**
 * GET /api/payments/booking/:bookingId
 * Get payment details for a booking
 * 
 * Protected route - requires authentication
 */
router.get('/booking/:bookingId', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const payment = await Payment.findOne({ booking: bookingId })
      .populate('payer', 'firstName lastName email')
      .populate('booking', 'status paymentStatus totalAmount');

    if (!payment) {
      return res.status(404).json({ 
        success: false,
        message: 'No payment found for this booking' 
      });
    }

    res.json({
      success: true,
      payment: payment
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * GET /api/payments/my-payments
 * Get current user's payment history
 * 
 * Protected route - requires authentication
 */
router.get('/my-payments', authMiddleware, async (req, res) => {
  try {
    const { type = 'all', status } = req.query;

    const filter = { payer: req.userId };

    if (status) {
      filter.status = status;
    }

    if (type !== 'all') {
      filter.type = type;
    }

    const payments = await Payment.find(filter)
      .populate('booking', 'listing startDate endDate totalAmount')
      .populate({
        path: 'booking',
        populate: {
          path: 'listing',
          select: 'title images'
        }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * ==================== OTP ROUTES ====================
 */

const OTP = require('../models/OTP');
const smsService = require('../services/sms.service');

/**
 * POST /api/payments/send-otp
 * Send OTP for payment verification
 */
router.post('/send-otp', authMiddleware, async (req, res) => {
  try {
    const { phoneNumber, bookingId } = req.body;

    if (!phoneNumber || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and booking ID are required'
      });
    }

    const cleanedPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!/^03\d{9}$/.test(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Pakistani mobile number format'
      });
    }

    // Check if booking exists
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify user is the borrower (if req.user is available)
    if (req.user && booking.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only request OTP for your own bookings'
      });
    }

    // Check rate limiting
    const recentOTP = await OTP.findOne({
      phoneNumber: cleanedPhone,
      bookingId: bookingId,
      createdAt: { $gte: new Date(Date.now() - 60000) }
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'OTP already sent. Please wait 1 minute before requesting again.'
      });
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Send SMS (using existing SMS service)
    await smsService.sendOTP(cleanedPhone, otp);

    // Save OTP
    await OTP.create({
      phoneNumber: cleanedPhone,
      otp: otp,
      bookingId: bookingId,
      expiresAt: expiresAt,
      verified: false,
      attempts: 0
    });

    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300
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
 * POST /api/payments/verify-otp
 * Verify OTP and initiate payment
 */
router.post('/verify-otp', authMiddleware, async (req, res) => {
  try {
    const { phoneNumber, otp, bookingId } = req.body;

    if (!phoneNumber || !otp || !bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, OTP, and booking ID are required'
      });
    }

    const cleanedPhone = phoneNumber.replace(/[\s-]/g, '');

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

    if (otpDoc.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    if (otpDoc.tooManyAttempts()) {
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    if (otpDoc.otp !== otp) {
      await otpDoc.incrementAttempts();
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - otpDoc.attempts} attempts remaining.`
      });
    }

    otpDoc.verified = true;
    await otpDoc.save();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Initiate actual payment with PayRails/Easypaisa
    const paymentResult = await payRailsService.initiatePayment(booking, cleanedPhone);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      redirectUrl: paymentResult.redirectUrl,
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

module.exports = router;

