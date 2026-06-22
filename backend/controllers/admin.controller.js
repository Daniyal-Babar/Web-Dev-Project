const User = require('../models/User');
const Listing = require('../models/Listing');
const AdminLog = require('../models/AdminLog');

// Get all users (listers)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '', sortBy = 'newest' } = req.query;

    const query = { admin: { $ne: true } };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.roles = role;
    if (status) query.accountStatus = status;

    let sort = {};
    switch (sortBy) {
      case 'newest': sort = { createdAt: -1 }; break;
      case 'oldest': sort = { createdAt: 1 }; break;
      case 'listings': sort = { totalListings: -1 }; break;
      case 'earnings': sort = { totalEarnings: -1 }; break;
      default: sort = { createdAt: -1 };
    }

    const users = await User.find(query)
      .select('-password -tempOtp -tempOtpExpiry')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const totalUsers = await User.countDocuments(query);

    if (AdminLog?.createLog) {
      AdminLog.createLog({ admin: req.user?._id, action: 'view_users', targetType: 'system', details: { page, limit, search, role, status }, ipAddress: req.ip, userAgent: req.get('user-agent') });
    }

    return res.json({ success: true, data: users, pagination: { currentPage: Number(page), totalPages: Math.ceil(totalUsers / Number(limit)), totalUsers, usersPerPage: String(limit) } });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get specific user details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -tempOtp -tempOtpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get user's listings
exports.getUserListings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { owner: req.params.userId };
    if (status) filter.status = status;

    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Listing.countDocuments(filter);
    return res.json({ success: true, data: listings, pagination: { currentPage: Number(page), totalPages: Math.ceil(total / Number(limit)), totalListings: total, listingsPerPage: String(limit) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update user status (suspend/ban/activate)
exports.updateUserStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.accountStatus = status;
    await user.save();
    if (AdminLog?.createLog) AdminLog.createLog({ admin: req.user?._id, action: 'update_user_status', targetType: 'user', targetId: user._id, details: { status, reason }, ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json({ success: true, message: 'User status updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all listings
exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: listings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a listing
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (AdminLog?.createLog) AdminLog.createLog({ admin: req.user?._id, action: 'delete_listing', targetType: 'listing', targetId: req.params.listingId, details: {}, ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update listing status
exports.updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    listing.status = status;
    await listing.save();
    if (AdminLog?.createLog) AdminLog.createLog({ admin: req.user?._id, action: 'update_listing_status', targetType: 'listing', targetId: listing._id, details: { status }, ipAddress: req.ip, userAgent: req.get('user-agent') });
    return res.json({ success: true, message: 'Listing status updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ admin: { $ne: true } });
    const activeUsers = await User.countDocuments({ admin: { $ne: true }, accountStatus: 'active' });
    const suspendedUsers = await User.countDocuments({ admin: { $ne: true }, accountStatus: 'suspended' });
    const bannedUsers = await User.countDocuments({ admin: { $ne: true }, accountStatus: 'banned' });

    const totalListings = await Listing.countDocuments({});
    const activeListings = await Listing.countDocuments({ status: 'active' });
    const pendingListings = await Listing.countDocuments({ status: 'pending' });
    const rejectedListings = await Listing.countDocuments({ status: 'rejected' });

    // Bookings stats - using correct status names
    const Booking = require('../models/Booking');
    const totalBookings = await Booking.countDocuments({});
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    // Revenue calculation from payments
    const Payment = require('../models/Payment');
    const paymentAgg = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = paymentAgg.length > 0 ? paymentAgg[0].total : 0;

    const data = {
      users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, banned: bannedUsers },
      listings: { total: totalListings, active: activeListings, pending: pendingListings, rejected: rejectedListings },
      bookings: { total: totalBookings, pending: pendingBookings, confirmed: confirmedBookings, completed: completedBookings },
      revenue: { total: totalRevenue }
    };

    return res.json({ success: true, data });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Send message to user (stub)
exports.sendMessage = async (req, res) => {
  try {
    return res.json({ success: true, message: 'Messaging not implemented in this restore' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get admin logs
exports.getAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
