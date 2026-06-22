/**
 * My Listings Page
 * 
 * Displays all listings created by the current user
 * Features:
 * - Filter by status (all, active, inactive, archived)
 * - Sort by newest, oldest, popular
 * - Edit, delete, view listing actions
 * - Pagination
 * - Empty state for new users
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingAPI } from '../services/api';
import MyListingCard from '../components/MyListingCard';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import EditListingModal from '../components/EditListingModal';
import './MyListings.css';

const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ show: false, listingId: null, listingTitle: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, listing: null });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalViews: 0,
    totalBookings: 0
  });

  const calculateStats = useCallback((listingsData) => {
    const active = listingsData.filter(l => l.status === 'active').length;
    const inactive = listingsData.filter(l => l.status === 'inactive').length;
    const totalViews = listingsData.reduce((sum, l) => sum + (l.views || 0), 0);
    const totalBookings = listingsData.reduce((sum, l) => sum + (l.bookingsCount || 0), 0);
    
    setStats({
      total: totalCount,
      active,
      inactive,
      totalViews,
      totalBookings
    });
  }, [totalCount]);

  // Fetch listings
  const fetchMyListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 12,
        sortBy
      };
      
      if (selectedStatus) {
        params.status = selectedStatus;
      }

      console.log('Fetching my listings with params:', params);
      console.log('Token exists:', !!localStorage.getItem('token'));
      console.log('Token value:', localStorage.getItem('token')?.substring(0, 20) + '...');
      console.log('API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
      
      const response = await listingAPI.getMyListings(params);
      
      console.log('My listings response:', response.data);
      
      if (response.data.success) {
        setListings(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalCount(response.data.pagination.total);
        
        // Calculate stats
        calculateStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.response?.data?.message);
      console.error('Error status:', err.response?.status);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      setError(err.response?.data?.message || err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, sortBy, calculateStats, navigate]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (listingId) => {
    const listing = listings.find(l => l._id === listingId);
    if (listing) {
      setEditModal({ show: true, listing });
    }
  };

  const handleEditSave = async (listingId, updatedData) => {
    try {
      await listingAPI.updateListing(listingId, updatedData);
      
      // Update local state
      setListings(listings.map(l => 
        l._id === listingId ? { ...l, ...updatedData } : l
      ));
      
      setEditModal({ show: false, listing: null });
      
      // Optional: Show success message
      console.log('Listing updated successfully');
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleEditClose = () => {
    setEditModal({ show: false, listing: null });
  };

  const handleView = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  const handleDeleteClick = (listingId, listingTitle) => {
    setDeleteModal({ show: true, listingId, listingTitle });
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await listingAPI.deleteListing(deleteModal.listingId);
      
      // Remove from list
      setListings(listings.filter(l => l._id !== deleteModal.listingId));
      setDeleteModal({ show: false, listingId: null, listingTitle: '' });
      
      // Show success toast (you can add a toast component)
      alert('Listing deleted successfully');
      
      // Refresh if current page is now empty
      if (listings.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchMyListings();
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert(err.response?.data?.message || 'Failed to delete listing');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, listingId: null, listingTitle: '' });
  };

  const handleToggleStatus = async (listingId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      await listingAPI.updateListing(listingId, { status: newStatus });
      
      // Update local state
      setListings(listings.map(l => 
        l._id === listingId ? { ...l, status: newStatus } : l
      ));
      
      alert(`Listing is now ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update listing status');
    }
  };

  const handleCreateNew = () => {
    navigate('/create-listing');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && listings.length === 0) {
    return (
      <div className="my-listings-container">
        <div className="my-listings-header">
          <h1>My Listings</h1>
        </div>
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-listings-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchMyListings} className="btn-retry">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-listings-container">
      {/* Header */}
      <div className="my-listings-header">
        <div className="header-left">
          <h1>My Listings</h1>
          <span className="listing-count">{totalCount} {totalCount === 1 ? 'listing' : 'listings'}</span>
        </div>
        <button onClick={handleCreateNew} className="btn-create-new">
          <span className="plus-icon">+</span> Create New Listing
        </button>
      </div>

      {/* Stats Cards */}
      {!selectedStatus && listings.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">📋</div>
            <div className="stat-content">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Listings</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active">✓</div>
            <div className="stat-content">
              <span className="stat-value">{stats.active}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon views">👁</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalViews}</span>
              <span className="stat-label">Total Views</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bookings">📅</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalBookings}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="filters-bar">
        <div className="status-tabs">
          <button 
            className={`tab ${selectedStatus === '' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('')}
          >
            All
          </button>
          <button 
            className={`tab ${selectedStatus === 'active' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('active')}
          >
            Active
          </button>
          <button 
            className={`tab ${selectedStatus === 'inactive' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('inactive')}
          >
            Inactive
          </button>
          <button 
            className={`tab ${selectedStatus === 'archived' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('archived')}
          >
            Archived
          </button>
        </div>

        <div className="sort-dropdown">
          <label htmlFor="sort">Sort by:</label>
          <select id="sort" value={sortBy} onChange={handleSortChange}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <EmptyState 
          title="No listings yet"
          message="Create your first listing to start earning"
          actionLabel="Create Listing"
          onAction={handleCreateNew}
        />
      ) : (
        <>
          <div className="listings-grid">
            {listings.map(listing => (
              <MyListingCard
                key={listing._id}
                listing={listing}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onView={handleView}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`page-number ${page === currentPage ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="page-ellipsis">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <ConfirmModal
          title="Delete Listing"
          message={`Are you sure you want to delete "${deleteModal.listingTitle}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          loading={deleteLoading}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          danger
        />
      )}

      {/* Edit Listing Modal */}
      <EditListingModal
        listing={editModal.listing}
        isOpen={editModal.show}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default MyListings;
