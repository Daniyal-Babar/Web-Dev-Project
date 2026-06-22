import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import './BookingForm.css';

const BookingForm = ({ listing, onBookingSuccess }) => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState('info');

  // Calculate number of days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 0;
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!listing?.pricing?.amount) return 0;
    const days = calculateDays();
    const dailyRate = listing.pricing.amount;
    
    // Adjust based on pricing model
    let multiplier = 1;
    if (listing.pricing.pricingModel === 'hourly') {
      multiplier = days * 24;
    } else if (listing.pricing.pricingModel === 'weekly') {
      multiplier = days / 7;
    } else if (listing.pricing.pricingModel === 'monthly') {
      multiplier = days / 30;
    } else {
      // daily
      multiplier = days;
    }
    
    return Math.ceil(dailyRate * multiplier);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      setMessage('Please select both start and end dates.');
      setMessageType('error');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setMessage('End date must be after start date.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Create booking using API
      const bookingData = {
        listing: listing._id || listing.id,
        startDate,
        endDate,
        deliveryMethod: 'self_pickup', // Default to self pickup
        bookingType: 'instant', // Default to instant booking
        paymentMethod: 'easypaisa' // Default payment method
      };

      const response = await bookingAPI.createBooking(bookingData);
      const bookingId = response.data?.booking?._id || response.data?.booking?.id;
      
      if (!bookingId) {
        console.error('Invalid response:', response.data);
        throw new Error('No booking ID received from server');
      }

      setMessage('Booking created successfully! Redirecting to payment...');
      setMessageType('success');
      
      // Navigate to checkout page after short delay
      setTimeout(() => {
        navigate(`/checkout/${bookingId}`);
        if (onBookingSuccess) {
          onBookingSuccess();
        }
      }, 1000);
    } catch (error) {
      console.error('Booking error:', error);
      setMessage(error.response?.data?.message || 'Failed to submit booking. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const days = calculateDays();
  const total = calculateTotal();

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h3>Book This Listing</h3>
      
      <div className="booking-form__fields">
        <div className="booking-form__field-group">
          <label>
            Start Date
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required 
            />
          </label>
          
          <label>
            End Date
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              required 
            />
          </label>
        </div>

        {startDate && endDate && days > 0 && (
          <div className="booking-form__date-info">
            <span>Duration:</span>
            <span className="booking-form__date-days">
              {days} {days === 1 ? 'day' : 'days'}
            </span>
          </div>
        )}
      </div>

      {listing?.pricing && total > 0 && (
        <div className="booking-form__price-summary">
          <div className="booking-form__price-row">
            <span className="booking-form__price-label">Rate:</span>
            <span>Rs {listing.pricing.amount?.toLocaleString() || 0} / {listing.pricing.pricingModel || 'day'}</span>
          </div>
          {days > 0 && (
            <>
              <div className="booking-form__price-row">
                <span className="booking-form__price-label">Duration:</span>
                <span>{days} {days === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="booking-form__price-row">
                <span className="booking-form__price-label">Total:</span>
                <span className="booking-form__price-value">
                  Rs {total.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isLoading || !listing}
        className="booking-form__submit-btn"
      >
        {isLoading ? (
          <span className="booking-form__loading">
            <span className="booking-form__spinner"></span>
            Processing...
          </span>
        ) : (
          'Submit Booking'
        )}
      </button>

      {message && (
        <p className={`booking-form__message booking-form__message--${messageType}`}>
          {message}
        </p>
      )}

      {!listing && (
        <p className="booking-form__note">Listing data not loaded yet.</p>
      )}
    </form>
  );
};

export default BookingForm;
