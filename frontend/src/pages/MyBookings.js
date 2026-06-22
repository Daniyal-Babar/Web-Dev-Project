/**
 * My Bookings Page
 * 
 * Features:
 * - Tabbed interface (Upcoming, Past, Cancelled)
 * - Mobile-first responsive design
 * - Booking cards with actions (cancel, modify, contact)
 * - Framer Motion animations
 * - Filter and search functionality
 * - Empty states for each tab
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { setBookings, setLoading, setError, cancelBooking as cancelBookingAction } from '../store/bookingSlice';
import { bookingAPI } from '../services/api';
import './MyBookings.css';

const MyBookings = () => {
  const dispatch = useDispatch();
  const { bookings, isLoading } = useSelector((state) => state.bookings);
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await bookingAPI.getUserBookings({ role: 'borrower' });
      
      if (response.data.success) {
        dispatch(setBookings(response.data.bookings));
      }
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Get count for a specific tab
  const getTabCount = (tab) => {
    const now = new Date();
    let filtered = bookings;

    switch (tab) {
      case 'upcoming':
        filtered = bookings.filter(
          booking => new Date(booking.startDate) > now && booking.status !== 'cancelled'
        );
        break;
      case 'past':
        filtered = bookings.filter(
          booking => new Date(booking.endDate) < now && booking.status !== 'cancelled'
        );
        break;
      case 'cancelled':
        filtered = bookings.filter(booking => booking.status === 'cancelled');
        break;
      default:
        filtered = bookings;
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.length;
  };

  // Filter bookings based on active tab
  const getFilteredBookings = () => {
    const now = new Date();
    let filtered = bookings;

    switch (activeTab) {
      case 'upcoming':
        filtered = bookings.filter(
          booking => new Date(booking.startDate) > now && booking.status !== 'cancelled'
        );
        break;
      case 'past':
        filtered = bookings.filter(
          booking => new Date(booking.endDate) < now && booking.status !== 'cancelled'
        );
        break;
      case 'cancelled':
        filtered = bookings.filter(booking => booking.status === 'cancelled');
        break;
      default:
        filtered = bookings;
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason.trim()) return;

    try {
      const response = await bookingAPI.cancelBooking(selectedBooking._id, { reason: cancelReason });
      
      if (response.data.success) {
        dispatch(cancelBookingAction({
          id: selectedBooking._id,
          cancellation: response.data.cancellation
        }));
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
    }
  };

  const filteredBookings = getFilteredBookings();

  // Tab animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="my-bookings-page">
      <div className="bookings-container">
        {/* Header */}
        <motion.div
          className="bookings-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>My Bookings</h1>
          <p className="subtitle">Manage your rentals and reservations</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="search-section"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="tabs-container"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="tabs">
            {['upcoming', 'past', 'cancelled'].map((tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="tab-count">
                  {getTabCount(tab)}
                </span>
              </button>
            ))}
          </div>
          <motion.div
            className="tab-indicator"
            layoutId="tabIndicator"
          />
        </motion.div>

        {/* Bookings List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="bookings-list"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <motion.div
                className="empty-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="empty-icon">
                  {activeTab === 'upcoming' && '📅'}
                  {activeTab === 'past' && '✅'}
                  {activeTab === 'cancelled' && '❌'}
                </div>
                <h3>No {activeTab} bookings</h3>
                <p>
                  {activeTab === 'upcoming' && 'You don\'t have any upcoming bookings. Start exploring items to rent!'}
                  {activeTab === 'past' && 'Your completed bookings will appear here.'}
                  {activeTab === 'cancelled' && 'You haven\'t cancelled any bookings.'}
                </p>
                {activeTab === 'upcoming' && (
                  <button className="btn-primary" onClick={() => window.location.href = '/browse'}>
                    Browse Listings
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="bookings-grid">
                {filteredBookings.map((booking, index) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    index={index}
                    onCancel={() => {
                      setSelectedBooking(booking);
                      setShowCancelModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Cancel Booking</h3>
                <button className="close-btn" onClick={() => setShowCancelModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel this booking?</p>
                <textarea
                  placeholder="Please provide a reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="cancel-reason-input"
                  rows="4"
                />
                <div className="modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Keep Booking
                  </button>
                  <button
                    className="btn-danger"
                    onClick={handleCancelBooking}
                    disabled={!cancelReason.trim()}
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Booking Card Component
 * Displays individual booking with actions
 */
const BookingCard = ({ booking, index, onCancel }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#4CAF50',
      completed: '#2196F3',
      cancelled: '#F44336'
    };
    return colors[status] || '#757575';
  };

  const calculateDuration = () => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handlePayNow = () => {
    // Navigate to checkout page with booking ID
    navigate(`/checkout/${booking._id}`);
  };

  // Show payment button if payment is pending, missing, or booking is confirmed but not paid
  const isPaymentPending = booking.payment?.status === 'pending' || 
                          !booking.payment?.status || 
                          booking.payment?.status === 'failed' ||
                          (booking.status === 'confirmed' && booking.payment?.status !== 'completed');

  return (
    <motion.div
      className="booking-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
    >
    

      <div className="booking-content">
        <h3 className="booking-title">{booking.listing?.title}</h3>
        
        <div className="booking-details">
          <div className="detail-row">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
            </svg>
            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
          </div>
          
          <div className="detail-row">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M8 3.5a.5.5 0 0 1 .5.5v4l3 1.5a.5.5 0 0 1-.5.866l-3.5-1.75A.5.5 0 0 1 7 8V4a.5.5 0 0 1 .5-.5z"/>
            </svg>
            <span>{calculateDuration()} {calculateDuration() === 1 ? 'day' : 'days'}</span>
          </div>

          <div className="detail-row">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
            </svg>
            <span className="price">Rs. {(booking.pricing?.totalAmount || booking.totalPrice || 0).toLocaleString()}</span>
          </div>
        </div>

        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <div className="booking-page-actions">
            <button
              className="booking-page-action-btn booking-page-pay-now-btn"
              onClick={handlePayNow}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
              </svg>
              Proceed to Checkout
            </button>
            <button
              className="booking-page-action-btn booking-page-contact-btn"
              onClick={() => window.location.href = `/messages?user=${booking.listing?.owner?._id}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z"/>
              </svg>
              Contact Owner
            </button>
            <button
              className="booking-page-action-btn booking-page-cancel-btn"
              onClick={onCancel}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
              </svg>
              Cancel
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyBookings;
