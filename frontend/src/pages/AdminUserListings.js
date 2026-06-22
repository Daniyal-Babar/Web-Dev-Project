import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminUserListings.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminUserListings = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchUserDetails();
    fetchUserListings();
  }, [userId, currentPage, filterStatus]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      setUser(data.data.user);
      setStats(data.data.stats);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details.');
    }
  };

  const fetchUserListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(filterStatus && { status: filterStatus })
      });

      const response = await fetch(`${API_URL}/api/admin/users/${userId}/listings?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      setListings(data.data || []);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId, listingTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${listingTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const reason = prompt('Reason for deleting this listing:');
      
      if (!reason) {
        alert('Deletion reason is required');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete listing');
      }

      alert('Listing deleted successfully');
      fetchUserListings();
      fetchUserDetails(); // Refresh stats
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Failed to delete listing: ' + err.message);
    }
  };

  const handleValidateListing = async (listingId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate and validate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} this listing?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const reason = prompt(`Reason for ${action}ing this listing:`);

      const response = await fetch(`${API_URL}/api/admin/listings/${listingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, reason })
      });

      if (!response.ok) {
        throw new Error('Failed to update listing status');
      }

      alert(`Listing ${action}d successfully`);
      fetchUserListings();
    } catch (err) {
      console.error('Error updating listing status:', err);
      alert('Failed to update listing status: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (pricing) => {
    if (!pricing) return 'N/A';
    return `${pricing.currency || 'PKR'} ${pricing.amount?.toLocaleString() || 0}/${pricing.pricingModel || 'day'}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'admin-listings-status-active';
      case 'inactive': return 'admin-listings-status-inactive';
      case 'archived': return 'admin-listings-status-archived';
      default: return '';
    }
  };

  if (error && !user) {
    return (
      <div className="admin-user-listings">
        <div className="admin-listings-error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/admin')}>Back to Admin Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-listings">
      <div className="admin-listings-page-header">
        <button className="admin-listings-back-btn" onClick={() => navigate('/admin')}>
          ← Back to Dashboard
        </button>
        <h1>User Listings Management</h1>
      </div>

      {user && (
        <div className="admin-listings-user-info-card">
          <div className="admin-listings-user-profile">
            <img 
              src={user.profileImage || '/default-avatar.png'} 
              alt={user.firstName}
              className="admin-listings-user-avatar-large"
            />
            <div className="admin-listings-user-details">
              <h2>{user.firstName} {user.lastName}</h2>
              <p className="admin-listings-user-email">{user.email}</p>
              <p className="admin-listings-user-phone">{user.phoneNumber || 'No phone number'}</p>
              <span className={`admin-listings-status-badge ${getStatusBadgeClass(user.accountStatus)}`}>
                {user.accountStatus}
              </span>
            </div>
          </div>

          {stats && (
            <div className="admin-listings-user-stats">
              <div className="admin-listings-stat-item">
                <span className="admin-listings-stat-label">Total Listings</span>
                <span className="admin-listings-stat-value">{stats.totalListings || 0}</span>
              </div>
              <div className="admin-listings-stat-item">
                <span className="admin-listings-stat-label">Active Listings</span>
                <span className="admin-listings-stat-value">{stats.activeListings || 0}</span>
              </div>
              <div className="admin-listings-stat-item">
                <span className="admin-listings-stat-label">Total Bookings</span>
                <span className="admin-listings-stat-value">{stats.totalBookingsReceived || 0}</span>
              </div>
              <div className="admin-listings-stat-item">
                <span className="admin-listings-stat-label">Total Revenue</span>
                <span className="admin-listings-stat-value">PKR {stats.totalRevenue?.toLocaleString() || 0}</span>
              </div>
              <div className="admin-listings-stat-item">
                <span className="admin-listings-stat-label">Average Rating</span>
                <span className="admin-listings-stat-value">
                  {stats.averageRating ? `⭐ ${stats.averageRating.toFixed(1)}` : 'No ratings'}
                </span>
              </div>
              <div className="admin-listings-stat-item">
                <span className="admin-listings-stat-label">Member Since</span>
                <span className="admin-listings-stat-value">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="admin-listings-listings-section">
        <div className="admin-listings-section-header">
          <h3>All Listings ({pagination?.totalListings || 0})</h3>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="admin-listings-status-filter"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-listings-loading">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="admin-listings-no-listings">
            <p>No listings found for this user.</p>
          </div>
        ) : (
          <>
            <div className="admin-listings-listings-grid">
              {listings.map(listing => (
                <div key={listing._id} className="admin-listings-listing-card">
                  <div className="admin-listings-listing-image">
                    <img 
                      src={listing.images?.[0]?.url || '/placeholder-image.png'} 
                      alt={listing.title}
                    />
                    <span className={`admin-listings-status-badge ${getStatusBadgeClass(listing.status)}`}>
                      {listing.status}
                    </span>
                  </div>
                  
                  <div className="admin-listings-listing-content">
                    <h4 className="admin-listings-listing-title">{listing.title}</h4>
                    <p className="admin-listings-listing-category">{listing.category} - {listing.subCategory}</p>
                    <p className="admin-listings-listing-price">{formatPrice(listing.pricing)}</p>
                    <p className="admin-listings-listing-location">
                      📍 {listing.location?.city}, {listing.location?.province}
                    </p>
                    <div className="admin-listings-listing-meta">
                      <span>⭐ {listing.rating?.average?.toFixed(1) || 'No rating'} ({listing.rating?.count || 0})</span>
                      <span>Posted {formatDate(listing.createdAt)}</span>
                    </div>
                  </div>

                  <div className="admin-listings-listing-actions">
                    <button 
                      className="admin-listings-btn-view"
                      onClick={() => window.open(`/listing/${listing._id}`, '_blank')}
                    >
                      View Details
                    </button>
                    <button 
                      className={listing.status === 'active' ? 'admin-listings-btn-deactivate' : 'admin-listings-btn-activate'}
                      onClick={() => handleValidateListing(listing._id, listing.status)}
                    >
                      {listing.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className="admin-listings-btn-delete"
                      onClick={() => handleDeleteListing(listing._id, listing.title)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="admin-listings-pagination">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="admin-listings-pagination-btn"
                >
                  Previous
                </button>
                <span className="admin-listings-pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button 
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="admin-listings-pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUserListings;
