/**
 * Admin Authentication Middleware
 * 
 * Protects admin-only routes by verifying:
 * 1. User is authenticated
 * 2. User has admin privileges (admin: true)
 * 
 * Usage:
 * router.get('/admin/users', auth, adminAuth, adminController.getUsers);
 */

const adminAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!req.user.admin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    if (req.user.accountStatus !== 'active') {
      return res.status(403).json({ success: false, message: `Account is ${req.user.accountStatus}. Contact support.` });
    }

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Server error during admin authentication' });
  }
};

module.exports = adminAuth;
