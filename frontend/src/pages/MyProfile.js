/**
 * My Profile Page
 * 
 * Complete profile UI with real database data
 * 
 * Features:
 * - Profile summary card
 * - Personal details (editable)
 * - Verification status
 * - Account information
 * - Statistics dashboard
 * - Reviews summary
 * - Location & preferences
 * - Action panel
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MyProfile.css';
import { userAPI, reviewAPI, bookingAPI } from '../services/api';

// Default user structure
const DEFAULT_USER = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  bio: '',
  profileImage: null,
  roles: [],
  memberSince: new Date().toISOString(),
  accountType: 'free',
  subscriptionExpiry: null,
  language: 'en',
  verified: {
    email: false,
    phone: false,
    id: false,
    face: false,
    fingerprint: false
  },
  stats: {
    totalListings: 0,
    totalBookingsMade: 0,
    totalBookingsReceived: 0,
    ratingAsOwner: 0,
    ratingAsBorrower: 0,
    totalReviews: 0,
    totalEarnings: 0
  },
  notifications: {
    email: true,
    sms: true,
    push: false
  },
  recentReviews: []
};

const MyProfile = () => {
  // State
  const [user, setUser] = useState(DEFAULT_USER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    city: '',
    language: 'en'
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Helper function to transform stored user to profile format
  const transformStoredUserToProfile = (storedUser) => {
    return {
      _id: storedUser._id || storedUser.id,
      firstName: storedUser.firstName || '',
      lastName: storedUser.lastName || '',
      email: storedUser.email || '',
      phone: storedUser.phoneNumber || storedUser.phone || '',
      city: storedUser.address?.city || storedUser.city || '',
      bio: storedUser.bio || '',
      profileImage: storedUser.profileImage || null,
      address: storedUser.address || {},
      roles: (storedUser.roles || []).map(role => role === 'lister' ? 'owner' : role),
      memberSince: storedUser.createdAt || new Date().toISOString(),
      accountType: storedUser.accountType || 'free',
      subscriptionExpiry: storedUser.subscriptionExpiry || null,
      language: storedUser.language || 'en',
      verified: {
        email: storedUser.emailVerified || false,
        phone: storedUser.phoneVerified || false,
        id: storedUser.idVerified || false,
        face: storedUser.faceVerified || false,
        fingerprint: storedUser.fingerprintVerified || false
      },
      stats: {
        totalListings: storedUser.totalListings || 0,
        totalBookingsMade: 0,
        totalBookingsReceived: 0,
        ratingAsOwner: storedUser.overallRating || 0,
        ratingAsBorrower: storedUser.overallRating || 0,
        totalReviews: storedUser.reviewCount || 0,
        totalEarnings: storedUser.totalEarnings || 0
      },
      notifications: {
        email: storedUser.notificationPreferences?.emailNotifications !== false,
        sms: storedUser.notificationPreferences?.smsNotifications !== false,
        push: storedUser.notificationPreferences?.pushNotifications || false
      },
      notificationPreferences: storedUser.notificationPreferences || {},
      recentReviews: []
    };
  };

  // Update editData when user data changes
  useEffect(() => {
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio || '',
      city: user.city || '',
      language: user.language || 'en'
    });
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      
      if (!token) {
        // If no token but we have stored user, use that as fallback
        if (storedUser) {
          const fallbackUser = transformStoredUserToProfile(storedUser);
          setUser(fallbackUser);
          setLoading(false);
          setError('Please login to refresh your profile data');
          return;
        }
        setError('Please login to view your profile');
        setLoading(false);
        return;
      }

      // Try to fetch user profile from API
      let profileData = null;
      try {
        const profileResponse = await userAPI.getCurrentProfile();
        
        if (profileResponse?.data?.user) {
          profileData = profileResponse.data.user;
        } else if (profileResponse?.data && !profileResponse.data.user) {
          // Response might have user data directly
          profileData = profileResponse.data;
        }
      } catch (apiError) {
        console.warn('API call failed, using stored user data:', apiError);
        // Fallback to stored user if API fails
        if (storedUser) {
          profileData = storedUser;
        } else {
          throw apiError;
        }
      }
      
      if (!profileData) {
        throw new Error('Unable to load profile data');
      }

      // Fetch user reviews (non-blocking)
      let reviewsData = { reviews: [], averageRating: 0, totalReviews: 0 };
      if (profileData._id) {
        try {
          const reviewsResponse = await reviewAPI.getUserReviews(profileData._id);
          if (reviewsResponse?.data) {
            reviewsData = reviewsResponse.data;
          }
        } catch (err) {
          console.warn('Failed to fetch reviews (non-critical):', err);
          // Use fallback data from profile
          if (profileData.reviewCount) {
            reviewsData.totalReviews = profileData.reviewCount;
          }
          if (profileData.overallRating) {
            reviewsData.averageRating = profileData.overallRating;
          }
        }
      }

      // Fetch bookings to calculate statistics (non-blocking)
      let bookingsMade = 0;
      let bookingsReceived = 0;
      if (profileData._id) {
        try {
          const bookingsResponse = await bookingAPI.getUserBookings({ role: 'all' });
          const bookings = bookingsResponse?.data?.bookings || [];
          const userId = profileData._id;
          
          // Count bookings where user is borrower (bookings made)
          bookingsMade = bookings.filter(b => {
            const borrowerId = typeof b.borrower === 'object' ? b.borrower?._id : b.borrower;
            return borrowerId === userId || String(borrowerId) === String(userId);
          }).length;
          
          // Count bookings where user is owner (bookings received)
          bookingsReceived = bookings.filter(b => {
            const ownerId = typeof b.owner === 'object' ? b.owner?._id : b.owner;
            return ownerId === userId || String(ownerId) === String(userId);
          }).length;
        } catch (err) {
          console.warn('Failed to fetch bookings (non-critical):', err);
          // Fallback to using totalBookings from profile if available
          if (profileData.totalBookings) {
            bookingsMade = Math.floor(profileData.totalBookings / 2);
            bookingsReceived = Math.ceil(profileData.totalBookings / 2);
          }
        }
      }

      // Transform database data to UI format
      const transformedUser = {
        _id: profileData._id, // Preserve user ID for API calls
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phoneNumber || '',
        city: profileData.address?.city || '',
        bio: profileData.bio || '',
        profileImage: profileData.profileImage || null,
        address: profileData.address || {}, // Preserve full address object
        roles: profileData.roles?.map(role => role === 'lister' ? 'owner' : role) || [],
        memberSince: profileData.createdAt || new Date().toISOString(),
        accountType: profileData.accountType || 'free',
        subscriptionExpiry: profileData.subscriptionExpiry || null,
        language: profileData.language || 'en',
        verified: {
          email: profileData.emailVerified || false,
          phone: profileData.phoneVerified || false,
          id: profileData.idVerified || false,
          face: profileData.faceVerified || false,
          fingerprint: profileData.fingerprintVerified || false
        },
        stats: {
          totalListings: profileData.totalListings || 0,
          totalBookingsMade: bookingsMade,
          totalBookingsReceived: bookingsReceived,
          ratingAsOwner: profileData.overallRating || 0,
          ratingAsBorrower: profileData.overallRating || 0, // Using overall rating for both
          totalReviews: reviewsData.totalReviews || profileData.reviewCount || 0,
          totalEarnings: profileData.totalEarnings || 0
        },
        notifications: {
          email: profileData.notificationPreferences?.emailNotifications !== false,
          sms: profileData.notificationPreferences?.smsNotifications !== false,
          push: profileData.notificationPreferences?.pushNotifications || false
        },
        notificationPreferences: profileData.notificationPreferences || {}, // Preserve for updates
        recentReviews: (reviewsData.reviews || []).slice(0, 3).map(review => ({
          id: review._id,
          reviewer: review.reviewerUser?.firstName && review.reviewerUser?.lastName
            ? `${review.reviewerUser.firstName} ${review.reviewerUser.lastName}`
            : 'Anonymous',
          rating: review.overallRating || 0,
          comment: review.description || review.title || '',
          date: review.createdAt || new Date().toISOString()
        }))
      };

      setUser(transformedUser);
      setError(null); // Clear any previous errors on success
    } catch (err) {
      console.error('Error fetching user data:', err);
      
      // Try to use stored user as last resort
      const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
      if (storedUser) {
        console.log('Using stored user data as fallback');
        const fallbackUser = transformStoredUserToProfile(storedUser);
        setUser(fallbackUser);
        setError('Using cached profile data. Some information may be outdated.');
      } else {
        // Provide more detailed error message
        let errorMessage = 'Failed to load profile data';
        
        if (err.response) {
          // Server responded with error
          errorMessage = err.response.data?.message || 
                        `Server error: ${err.response.status} ${err.response.statusText}`;
        } else if (err.request) {
          // Request made but no response
          errorMessage = 'No response from server. Please check if the backend is running.';
        } else {
          // Error setting up request
          errorMessage = err.message || 'Failed to load profile data';
        }
        
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleEditToggle = () => {
    if (editMode) {
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        city: user.city,
        language: user.language
      });
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (!user._id) {
        alert('User ID not found. Please login again.');
        return;
      }

      // Prepare update data
      const updateData = {
        firstName: editData.firstName,
        lastName: editData.lastName,
        bio: editData.bio,
        language: editData.language
      };

      // Add city to address
      updateData.address = {
        ...(user.address || {}),
        city: editData.city
      };

      // Call API to update profile
      const response = await userAPI.updateProfile(user._id, updateData);
      
      if (response.data.success) {
        // Update local state
        setUser(prev => ({ 
          ...prev, 
          ...editData,
          address: {
            ...prev.address,
            city: editData.city
          }
        }));
        setEditMode(false);
        // Refresh data to get latest from server
        await fetchUserData();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      city: user.city,
      language: user.language
    });
    setEditMode(false);
  };

  const handleNotificationToggle = async (type) => {
    try {
      if (!user._id) {
        alert('User ID not found. Please login again.');
        return;
      }

      // Map UI notification types to API format
      const notificationMap = {
        email: 'emailNotifications',
        sms: 'smsNotifications',
        push: 'pushNotifications'
      };

      const newValue = !user.notifications[type];
      const updateData = {
        notificationPreferences: {
          ...(user.notificationPreferences || {}),
          [notificationMap[type]]: newValue
        }
      };

      // Update via API
      await userAPI.updateProfile(user._id, updateData);

      // Update local state
      setUser(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [type]: newValue
        },
        notificationPreferences: {
          ...prev.notificationPreferences,
          [notificationMap[type]]: newValue
        }
      }));
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      alert(err.response?.data?.message || 'Failed to update notification preferences');
    }
  };

  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const isFullyVerified = () => {
    return user.verified.email && user.verified.phone;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '½'}
        {'☆'.repeat(5 - Math.ceil(rating))}
      </>
    );
  };

  if (loading && !user.firstName) {
    return (
      <div className="my-profile-page">
        <div className="profile-container">
          <h1 className="profile-page-title">My Profile</h1>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show full error page if we have no user data at all
  if (error && !user.firstName && !user.email) {
    const isAuthError = error.includes('login') || error.includes('401') || error.includes('Unauthorized');
    
    return (
      <div className="my-profile-page">
        <div className="profile-container">
          <h1 className="profile-page-title">My Profile</h1>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ color: 'red', marginBottom: '1rem' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                ⚠️ Error Loading Profile
              </p>
              <p>{error}</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={fetchUserData} 
                style={{ 
                  marginTop: '1rem', 
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                🔄 Retry
              </button>
              {isAuthError && (
                <Link 
                  to="/login"
                  style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    display: 'inline-block',
                    fontSize: '1rem'
                  }}
                >
                  🔐 Go to Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-profile-page">
      <div className="profile-container">
        <h1 className="profile-page-title">My Profile</h1>
        
        {/* Show warning banner if there's an error but we have user data */}
        {error && (user.firstName || user.email) && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <strong>⚠️ Notice:</strong> {error}
            </div>
            <button 
              onClick={fetchUserData}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        )}

        {/* Desktop Layout */}
        <div className="profile-layout">
          {/* Left Column - Profile Summary */}
          <aside className="profile-sidebar">
            <div className="profile-summary-card">
              <div className="profile-avatar-wrapper">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {getInitials()}
                  </div>
                )}
                <button className="avatar-edit-btn" aria-label="Change profile photo">
                  📷
                </button>
              </div>

              <h2 className="profile-name">{user.firstName} {user.lastName}</h2>

              <div className="profile-badges">
                {user.roles.includes('owner') && (
                  <span className="role-badge role-owner">Owner</span>
                )}
                {user.roles.includes('borrower') && (
                  <span className="role-badge role-borrower">Borrower</span>
                )}
              </div>

              <p className="profile-city">📍 {user.city}</p>
              <p className="profile-member-since">
                Member since {formatDate(user.memberSince)}
              </p>

              {isFullyVerified() && (
                <div className="verified-badge">
                  ✓ Verified User
                </div>
              )}
            </div>

            {/* Account Type Card */}
            <div className={`account-type-card ${user.accountType}`}>
              <div className="account-type-header">
                <span className="account-icon">
                  {user.accountType === 'paid' ? '👑' : '👤'}
                </span>
                <h3>{user.accountType === 'paid' ? 'Premium Account' : 'Free Account'}</h3>
              </div>

              {user.accountType === 'paid' ? (
                <>
                  <ul className="account-features">
                    <li>✓ Listings for 1 month</li>
                    <li>✓ No ads</li>
                    <li>✓ Verified badge</li>
                    <li>✓ Priority support</li>
                  </ul>
                  <p className="subscription-expiry">
                    Expires: {formatDate(user.subscriptionExpiry)}
                  </p>
                  <button className="btn-manage-subscription">
                    Manage Subscription
                  </button>
                </>
              ) : (
                <>
                  <ul className="account-features">
                    <li>• 48-hour listings</li>
                    <li>• Ads shown</li>
                    <li>• Basic features</li>
                  </ul>
                  <button className="btn-upgrade">
                    Upgrade to Premium - Rs 500/mo
                  </button>
                </>
              )}
            </div>
          </aside>

          {/* Right Column - Main Content */}
          <main className="profile-main-content">
            {/* Statistics Dashboard */}
            <section className="profile-stats-grid" aria-label="Statistics">
              <div className="profile-stat-card">
                <div className="profile-stat-icon">📦</div>
                <div className="profile-stat-value">{user.stats.totalListings}</div>
                <div className="profile-stat-label">Listings Created</div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon">📅</div>
                <div className="profile-stat-value">{user.stats.totalBookingsMade}</div>
                <div className="profile-stat-label">Bookings Made</div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon">📥</div>
                <div className="profile-stat-value">{user.stats.totalBookingsReceived}</div>
                <div className="profile-stat-label">Bookings Received</div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon">💰</div>
                <div className="profile-stat-value">Rs {user.stats.totalEarnings.toLocaleString()}</div>
                <div className="profile-stat-label">Total Earnings</div>
              </div>
            </section>

            {/* Personal Details */}
            <section className="profile-section">
              <div className="section-header">
                <h3 className="section-title">👤 Personal Information</h3>
                <button 
                  className="btn-edit-section"
                  onClick={handleEditToggle}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="info-grid">
                <div className="info-field">
                  <label className="info-label">First Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="firstName"
                      value={editData.firstName}
                      onChange={handleInputChange}
                      className="info-input"
                    />
                  ) : (
                    <div className="info-value">{user.firstName}</div>
                  )}
                </div>

                <div className="info-field">
                  <label className="info-label">Last Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="lastName"
                      value={editData.lastName}
                      onChange={handleInputChange}
                      className="info-input"
                    />
                  ) : (
                    <div className="info-value">{user.lastName}</div>
                  )}
                </div>

                <div className="info-field">
                  <label className="info-label">Email Address</label>
                  <div className="info-value">
                    {user.email}
                    {user.verified.email && <span className="verify-icon">✓</span>}
                  </div>
                </div>

                <div className="info-field">
                  <label className="info-label">Phone Number</label>
                  <div className="info-value">
                    {user.phone}
                    {user.verified.phone && <span className="verify-icon">✓</span>}
                  </div>
                </div>

                <div className="info-field">
                  <label className="info-label">City</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="city"
                      value={editData.city}
                      onChange={handleInputChange}
                      className="info-input"
                    />
                  ) : (
                    <div className="info-value">{user.city}</div>
                  )}
                </div>

                <div className="info-field">
                  <label className="info-label">Language</label>
                  {editMode ? (
                    <select
                      name="language"
                      value={editData.language}
                      onChange={handleInputChange}
                      className="info-input"
                    >
                      <option value="en">English</option>
                      <option value="ur">اردو (Urdu)</option>
                    </select>
                  ) : (
                    <div className="info-value">
                      {user.language === 'ur' ? 'اردو (Urdu)' : 'English'}
                    </div>
                  )}
                </div>

                <div className="info-field info-field-full">
                  <label className="info-label">About Me</label>
                  {editMode ? (
                    <textarea
                      name="bio"
                      value={editData.bio}
                      onChange={handleInputChange}
                      className="info-textarea"
                      rows="3"
                      maxLength={500}
                    />
                  ) : (
                    <div className="info-value">{user.bio}</div>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="edit-actions">
                  <button className="btn-save" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button className="btn-cancel" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              )}
            </section>

            {/* Verification Status */}
            <section className="profile-section">
              <div className="section-header">
                <h3 className="section-title">🛡️ Verification Status</h3>
              </div>

              <div className="verification-list">
                <div className="verification-item">
                  <div className="verification-info">
                    <span className="verification-icon">📧</span>
                    <div>
                      <h4>Email Verification</h4>
                      <p>Verify your email address</p>
                    </div>
                  </div>
                  {user.verified.email ? (
                    <span className="status-verified">✓ Verified</span>
                  ) : (
                    <button className="btn-verify">Verify</button>
                  )}
                </div>

                <div className="verification-item">
                  <div className="verification-info">
                    <span className="verification-icon">📱</span>
                    <div>
                      <h4>Phone Verification</h4>
                      <p>Verify your phone number</p>
                    </div>
                  </div>
                  {user.verified.phone ? (
                    <span className="status-verified">✓ Verified</span>
                  ) : (
                    <button className="btn-verify">Verify</button>
                  )}
                </div>

                <div className="verification-item">
                  <div className="verification-info">
                    <span className="verification-icon">🪪</span>
                    <div>
                      <h4>ID Verification</h4>
                      <p>Upload government-issued ID</p>
                    </div>
                  </div>
                  {user.accountType === 'free' ? (
                    <span className="status-premium-only">Premium Only</span>
                  ) : user.verified.id ? (
                    <span className="status-verified">✓ Verified</span>
                  ) : (
                    <button className="btn-verify">Verify</button>
                  )}
                </div>

                <div className="verification-item">
                  <div className="verification-info">
                    <span className="verification-icon">😊</span>
                    <div>
                      <h4>Face Verification</h4>
                      <p>Selfie verification for trust</p>
                    </div>
                  </div>
                  {user.accountType === 'free' ? (
                    <span className="status-premium-only">Premium Only</span>
                  ) : user.verified.face ? (
                    <span className="status-verified">✓ Verified</span>
                  ) : (
                    <button className="btn-verify">Verify</button>
                  )}
                </div>

                <div className="verification-item">
                  <div className="verification-info">
                    <span className="verification-icon">👆</span>
                    <div>
                      <h4>Fingerprint Verification</h4>
                      <p>Biometric verification</p>
                    </div>
                  </div>
                  {user.accountType === 'free' ? (
                    <span className="status-premium-only">Premium Only</span>
                  ) : user.verified.fingerprint ? (
                    <span className="status-verified">✓ Verified</span>
                  ) : (
                    <button className="btn-verify">Verify</button>
                  )}
                </div>
              </div>
            </section>

            {/* Ratings & Reviews */}
            <section className="profile-section">
              <div className="section-header">
                <h3 className="section-title">⭐ Ratings & Reviews</h3>
              </div>

              <div className="ratings-summary">
                <div className="rating-card">
                  <div className="rating-value">{user.stats.ratingAsOwner}</div>
                  <div className="rating-stars">{renderStars(user.stats.ratingAsOwner)}</div>
                  <div className="rating-label">As Owner</div>
                </div>
                <div className="rating-card">
                  <div className="rating-value">{user.stats.ratingAsBorrower}</div>
                  <div className="rating-stars">{renderStars(user.stats.ratingAsBorrower)}</div>
                  <div className="rating-label">As Borrower</div>
                </div>
                <div className="rating-card">
                  <div className="rating-value">{user.stats.totalReviews}</div>
                  <div className="rating-label">Total Reviews</div>
                </div>
              </div>

              <div className="reviews-preview">
                {user.recentReviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="review-author">{review.reviewer}</span>
                      <span className="review-rating">{'★'.repeat(review.rating)}</span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    <span className="review-date">{formatDate(review.date)}</span>
                  </div>
                ))}
              </div>

              <Link to="/reviews" className="btn-view-all">
                View All Reviews →
              </Link>
            </section>

            {/* Preferences */}
            <section className="profile-section">
              <div className="section-header">
                <h3 className="section-title">⚙️ Preferences</h3>
              </div>

              <div className="preferences-list">
                <div className="preference-item">
                  <div className="preference-info">
                    <span className="preference-icon">🔔</span>
                    <div>
                      <h4>Email Notifications</h4>
                      <p>Receive updates via email</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={user.notifications.email}
                      onChange={() => handleNotificationToggle('email')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <span className="preference-icon">💬</span>
                    <div>
                      <h4>SMS Notifications</h4>
                      <p>Receive text message alerts</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={user.notifications.sms}
                      onChange={() => handleNotificationToggle('sms')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <span className="preference-icon">📲</span>
                    <div>
                      <h4>Push Notifications</h4>
                      <p>Receive mobile app notifications</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={user.notifications.push}
                      onChange={() => handleNotificationToggle('push')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Action Panel */}
            <section className="profile-section">
              <div className="section-header">
                <h3 className="section-title">🔗 Quick Actions</h3>
              </div>

              <div className="actions-grid">
                <Link to="/my-listings" className="action-link">
                  <span className="action-icon">📦</span>
                  My Listings
                </Link>
                <Link to="/my-bookings" className="action-link">
                  <span className="action-icon">📅</span>
                  My Bookings
                </Link>
                <Link to="/messages" className="action-link">
                  <span className="action-icon">💬</span>
                  Messages
                </Link>
                <button className="action-link">
                  <span className="action-icon">🔒</span>
                  Change Password
                </button>
              </div>

              <div className="danger-zone">
                <button 
                  className="btn-danger"
                  onClick={() => setShowLogoutModal(true)}
                >
                  🚪 Logout
                </button>
                <button 
                  className="btn-danger btn-delete"
                  onClick={() => setShowDeleteModal(true)}
                >
                  🗑️ Delete Account
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm-danger">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>⚠️ Delete Account</h3>
            <p>
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn-confirm-danger">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
