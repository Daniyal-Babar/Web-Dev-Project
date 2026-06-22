/**
 * Wallet & Earnings Routes
 * 
 * Handles owner's wallet and earnings management:
 * - View wallet balance and earnings
 * - Credit owner's wallet when booking completes
 * - Request withdrawals to Easypaisa account
 * - Transaction history
 * - Manage Easypaisa account details
 * 
 * Wallet Flow:
 * 1. Borrower pays → Money held in platform's PayRails account
 * 2. Booking completes → Owner's wallet credited (amount - platform fee)
 * 3. Owner requests withdrawal → Transferred to their Easypaisa account
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { authMiddleware } = require('../middleware/auth');

/**
 * GET /api/wallet/balance
 * Get owner's wallet balance and earnings summary
 * 
 * Protected route - requires authentication
 */
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found. Please log in again.' 
      });
    }

    // Get total earnings from completed bookings
    const completedBookings = await Booking.find({
      owner: req.userId,
      status: 'completed',
      paymentStatus: 'paid'
    });

    const totalEarnings = completedBookings.reduce((sum, booking) => {
      // Owner gets: total amount - platform fee (10%)
      const platformFee = booking.pricing?.fee || Math.round(booking.totalAmount * 0.10);
      return sum + (booking.totalAmount - platformFee);
    }, 0);

    // Get pending earnings (bookings confirmed but not completed)
    const pendingBookings = await Booking.find({
      owner: req.userId,
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    const pendingEarnings = pendingBookings.reduce((sum, booking) => {
      const platformFee = booking.pricing?.fee || Math.round(booking.totalAmount * 0.10);
      return sum + (booking.totalAmount - platformFee);
    }, 0);

    // Get total withdrawn amount
    const withdrawnAmount = user.wallet.transactions
      .filter(tx => tx.type === 'withdrawal' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);

    res.json({
      success: true,
      wallet: {
        availableBalance: user.wallet.balance,
        totalEarnings: totalEarnings,
        pendingEarnings: pendingEarnings,
        totalWithdrawn: withdrawnAmount,
        currency: user.wallet.currency,
        easypaisaAccount: user.easypaisaAccount || null
      }
    });

  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * POST /api/wallet/credit-owner
 * Credit owner's wallet after booking completion
 * 
 * Protected route - requires authentication
 * Called internally when booking is marked complete
 */
router.post('/credit-owner', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('owner', 'firstName lastName wallet')
      .populate('listing', 'title');

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Verify booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'Booking must be completed before crediting wallet' 
      });
    }

    // Check if payment is confirmed
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ 
        success: false,
        message: 'Payment not confirmed for this booking' 
      });
    }

    // Check if already credited
    const owner = await User.findById(booking.owner._id);
    const alreadyCredited = owner.wallet.transactions.some(
      tx => tx.booking && tx.booking.toString() === bookingId && tx.type === 'credit'
    );

    if (alreadyCredited) {
      return res.status(400).json({ 
        success: false,
        message: 'Wallet already credited for this booking' 
      });
    }

    // Calculate owner's earnings (total - platform fee)
    const platformFee = booking.pricing?.fee || Math.round(booking.totalAmount * 0.10);
    const ownerEarnings = booking.totalAmount - platformFee;

    // Credit to owner's wallet
    owner.wallet.balance += ownerEarnings;
    owner.wallet.transactions.push({
      type: 'credit',
      amount: ownerEarnings,
      description: `Earnings from rental: ${booking.listing.title}`,
      booking: bookingId,
      status: 'completed',
      date: new Date()
    });

    await owner.save();

    res.json({
      success: true,
      message: 'Wallet credited successfully',
      newBalance: owner.wallet.balance,
      credited: ownerEarnings,
      platformFee: platformFee
    });

  } catch (error) {
    console.error('Error crediting wallet:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * GET /api/wallet/transactions
 * Get wallet transaction history
 * 
 * Protected route - requires authentication
 */
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, type } = req.query;

    const user = await User.findById(req.userId)
      .populate({
        path: 'wallet.transactions.booking',
        select: 'listing startDate endDate totalAmount',
        populate: {
          path: 'listing',
          select: 'title'
        }
      });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found. Please log in again.' 
      });
    }

    let transactions = user.wallet.transactions;

    // Filter by type if specified
    if (type) {
      transactions = transactions.filter(tx => tx.type === type);
    }

    // Sort by date (newest first) and limit
    transactions = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      transactions: transactions,
      total: user.wallet.transactions.length
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * POST /api/wallet/withdraw
 * Request withdrawal to Easypaisa account
 * 
 * Protected route - requires authentication
 * 
 * Minimum withdrawal: Rs 500
 * Processing time: 24-48 hours
 */
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found. Please log in again.' 
      });
    }

    // Validation: Easypaisa account must be added
    if (!user.easypaisaAccount) {
      return res.status(400).json({ 
        success: false,
        message: 'Please add your Easypaisa account number first',
        action: 'add_account'
      });
    }

    // Validation: Minimum withdrawal amount
    const MIN_WITHDRAWAL = 500;
    if (amount < MIN_WITHDRAWAL) {
      return res.status(400).json({ 
        success: false,
        message: `Minimum withdrawal amount is Rs ${MIN_WITHDRAWAL}` 
      });
    }

    // Validation: Sufficient balance
    if (amount > user.wallet.balance) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient balance',
        availableBalance: user.wallet.balance
      });
    }

    // Deduct from wallet immediately
    user.wallet.balance -= amount;
    
    // Add withdrawal transaction (status: pending)
    user.wallet.transactions.push({
      type: 'withdrawal',
      amount: amount,
      description: `Withdrawal to Easypaisa: ${user.easypaisaAccount}`,
      status: 'pending',
      date: new Date()
    });

    await user.save();

    // TODO: Integrate with actual Easypaisa transfer API
    // Options:
    // 1. PayRails payout API (if available)
    // 2. Easypaisa Merchant-to-Wallet API
    // 3. Manual processing by admin
    
    // For now, create a withdrawal request for admin to process
    console.log(`Withdrawal request: Rs ${amount} to ${user.easypaisaAccount} for user ${user._id}`);

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully. Money will be transferred to your Easypaisa account within 24-48 hours.',
      newBalance: user.wallet.balance,
      withdrawalAmount: amount,
      easypaisaAccount: user.easypaisaAccount,
      estimatedTime: '24-48 hours'
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * POST /api/wallet/add-easypaisa-account
 * Save or update Easypaisa account number
 * 
 * Protected route - requires authentication
 * 
 * Format: 03XXXXXXXXX (11 digits starting with 03)
 */
router.post('/add-easypaisa-account', authMiddleware, async (req, res) => {
  try {
    const { easypaisaAccount } = req.body;

    // Validate format: 03XXXXXXXXX
    const phoneRegex = /^03\d{9}$/;
    if (!phoneRegex.test(easypaisaAccount)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid Easypaisa account number. Format should be: 03XXXXXXXXX (11 digits)' 
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found. Please log in again.' 
      });
    }

    // Save Easypaisa account
    const previousAccount = user.easypaisaAccount;
    user.easypaisaAccount = easypaisaAccount;
    await user.save();

    res.json({
      success: true,
      message: previousAccount 
        ? 'Easypaisa account updated successfully' 
        : 'Easypaisa account added successfully',
      easypaisaAccount: easypaisaAccount
    });

  } catch (error) {
    console.error('Error adding Easypaisa account:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * GET /api/wallet/earnings-by-month
 * Get monthly earnings breakdown
 * 
 * Protected route - requires authentication
 */
router.get('/earnings-by-month', authMiddleware, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const bookings = await Booking.find({
      owner: req.userId,
      status: 'completed',
      paymentStatus: 'paid',
      completedAt: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
      }
    });

    // Group by month
    const monthlyEarnings = {};
    for (let i = 1; i <= 12; i++) {
      monthlyEarnings[i] = 0;
    }

    bookings.forEach(booking => {
      const month = new Date(booking.completedAt).getMonth() + 1;
      const platformFee = booking.pricing?.fee || Math.round(booking.totalAmount * 0.10);
      const ownerEarning = booking.totalAmount - platformFee;
      monthlyEarnings[month] += ownerEarning;
    });

    res.json({
      success: true,
      year: parseInt(year),
      monthlyEarnings: monthlyEarnings
    });

  } catch (error) {
    console.error('Error fetching monthly earnings:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * GET /api/wallet/statistics
 * Get comprehensive wallet statistics
 * 
 * Protected route - requires authentication
 */
router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found. Please log in again.' 
      });
    }

    // Total earnings from all completed bookings
    const completedBookings = await Booking.find({
      owner: req.userId,
      status: 'completed',
      paymentStatus: 'paid'
    });

    const totalEarnings = completedBookings.reduce((sum, booking) => {
      const platformFee = booking.pricing?.fee || Math.round(booking.totalAmount * 0.10);
      return sum + (booking.totalAmount - platformFee);
    }, 0);

    // Average earning per booking
    const averageEarning = completedBookings.length > 0 
      ? totalEarnings / completedBookings.length 
      : 0;

    // Total withdrawn
    const totalWithdrawn = user.wallet.transactions
      .filter(tx => tx.type === 'withdrawal' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Pending withdrawals
    const pendingWithdrawals = user.wallet.transactions
      .filter(tx => tx.type === 'withdrawal' && tx.status === 'pending')
      .reduce((sum, tx) => sum + tx.amount, 0);

    res.json({
      success: true,
      statistics: {
        currentBalance: user.wallet.balance,
        totalEarnings: totalEarnings,
        totalWithdrawn: totalWithdrawn,
        pendingWithdrawals: pendingWithdrawals,
        averageEarningPerBooking: Math.round(averageEarning),
        totalBookings: completedBookings.length,
        currency: 'PKR'
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

/**
 * POST /api/wallet/send-easypaisa-otp
 * Send OTP to Easypaisa account for verification
 * 
 * Protected route - requires authentication
 */
router.post('/send-easypaisa-otp', authMiddleware, async (req, res) => {
  try {
    const { easypaisaAccount } = req.body;

    // Validate Easypaisa account format
    if (!easypaisaAccount || !/^03\d{9}$/.test(easypaisaAccount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Easypaisa account number. Format: 03XXXXXXXXX'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in user session (in production, use Redis or similar)
    // For now, store in memory with expiration
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Store OTP temporarily (you should implement proper OTP storage/expiry)
    user.tempOtp = otp;
    user.tempOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.tempEasypaisaAccount = easypaisaAccount;
    await user.save();

    // In production, send SMS via SMS service (Twilio, etc.)
    console.log(`OTP for ${easypaisaAccount}: ${otp}`);
    
    // For development, return OTP (remove in production)
    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

/**
 * POST /api/wallet/verify-easypaisa-otp
 * Verify OTP and save Easypaisa account
 * 
 * Protected route - requires authentication
 */
router.post('/verify-easypaisa-otp', authMiddleware, async (req, res) => {
  try {
    const { easypaisaAccount, otp } = req.body;

    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format'
      });
    }

    // Explicitly select the OTP fields that are hidden by default
    const user = await User.findById(req.userId).select('+tempOtp +tempOtpExpiry +tempEasypaisaAccount');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP is expired
    if (!user.tempOtpExpiry || Date.now() > user.tempOtpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (user.tempOtp !== otp || user.tempEasypaisaAccount !== easypaisaAccount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Save Easypaisa account
    user.easypaisaAccount = easypaisaAccount;
    user.easypaisaVerified = true;
    
    // Clear temporary OTP data
    user.tempOtp = undefined;
    user.tempOtpExpiry = undefined;
    user.tempEasypaisaAccount = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'Easypaisa account verified and saved successfully',
      easypaisaAccount: user.easypaisaAccount
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

module.exports = router;
