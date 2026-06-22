/**
 * Checkout Page - Manual Easypaisa Payment
 * 
 * Features:
 * - Display booking summary
 * - Show owner's Easypaisa number
 * - Manual payment instructions
 * - Payment confirmation button
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { bookingAPI } from '../services/api';
import apiClient from '../services/api';
import './CheckoutPageNew.css';

const CheckoutPageNew = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getBooking(bookingId);
      setBooking(response.data.booking);
      setError(null);
    } catch (error) {
      console.error('Error fetching booking:', error);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBooking();
  }, [user, navigate, fetchBooking]);

  const handleConfirmPayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      const response = await apiClient.post(`/api/bookings/${bookingId}/confirm-payment`);

      if (response.data.success) {
        setPaymentConfirmed(true);
        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setError(error.response?.data?.message || 'Failed to confirm payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDays = () => {
    if (!booking) return 0;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="checkout-page-new">
        <div className="checkout-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="checkout-page-new">
        <div className="checkout-container">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/my-bookings')} className="btn-secondary">
              Back to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-new">
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <button onClick={() => navigate('/my-bookings')} className="back-btn">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            Back
          </button>
          <h1>Checkout</h1>
        </div>

        <div className="checkout-content">
          {/* Booking Summary */}
          <div className="booking-summary-card">
            <h2>Booking Summary</h2>
            
            <div className="summary-item">
              <img 
                src={booking.listing?.images?.[0] || '/placeholder.jpg'} 
                alt={booking.listing?.title}
                className="item-image"
              />
              <div className="item-details">
                <h3>{booking.listing?.title}</h3>
                <p className="item-category">{booking.listing?.category}</p>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span className="label">Rental Period</span>
              <span className="value">{calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}</span>
            </div>

            <div className="summary-row">
              <span className="label">Start Date</span>
              <span className="value">{formatDate(booking.startDate)}</span>
            </div>

            <div className="summary-row">
              <span className="label">End Date</span>
              <span className="value">{formatDate(booking.endDate)}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span className="label">Price per day</span>
              <span className="value">Rs. {(booking.pricing?.pricePerUnit || 0).toLocaleString()}</span>
            </div>

            <div className="summary-row">
              <span className="label">Subtotal</span>
              <span className="value">Rs. {(booking.pricing?.subtotal || 0).toLocaleString()}</span>
            </div>

            {booking.pricing?.platformFee > 0 && (
              <div className="summary-row">
                <span className="label">Service Fee</span>
                <span className="value">Rs. {booking.pricing.platformFee.toLocaleString()}</span>
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span className="label">Total Amount</span>
              <span className="value">Rs. {(booking.pricing?.totalAmount || booking.totalPrice || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-card">
            <div className="payment-header">
              <div className="easypaisa-logo">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="8" fill="#00A651"/>
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">EP</text>
                </svg>
              </div>
              <div>
                <h2>Pay with Easypaisa</h2>
                <p>Manual payment to owner</p>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                </svg>
                {error}
              </div>
            )}

            {paymentConfirmed ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Payment Confirmed!</h3>
                <p>Redirecting to your bookings...</p>
              </div>
            ) : (
              <div className="payment-instructions">
                {booking?.owner?.easypaisaNumber ? (
                  <>
                    <div className="owner-easypaisa-section">
                      <label className="form-label">Owner's Easypaisa Number</label>
                      <div className="easypaisa-number-display">
                        <span className="easypaisa-icon">💳</span>
                        <span className="number">{booking.owner.easypaisaNumber}</span>
                        <button 
                          className="copy-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(booking.owner.easypaisaNumber);
                            alert('Number copied!');
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>

                    <div className="instructions-box">
                      <h3>Payment Instructions</h3>
                      <ol>
                        <li>Open your Easypaisa app or visit nearest agent</li>
                        <li>Send <strong>Rs. {(booking.pricing?.totalAmount || 0).toLocaleString()}</strong> to the number above</li>
                        <li>After payment, click "I've Paid" button below</li>
                        <li>Owner will confirm the booking</li>
                      </ol>
                    </div>

                    <button
                      onClick={handleConfirmPayment}
                      disabled={processing}
                      className="btn-primary btn-full"
                    >
                      {processing ? (
                        <>
                          <div className="btn-spinner"></div>
                          Confirming...
                        </>
                      ) : (
                        "✓ I've Paid"
                      )}
                    </button>
                  </>
                ) : (
                  <div className="no-easypaisa-message">
                    <p>⚠️ Owner hasn't set up their Easypaisa account yet.</p>
                    <p>Please contact the owner to complete payment.</p>
                    <button 
                      onClick={() => navigate('/my-bookings')}
                      className="btn-secondary btn-full"
                    >
                      Back to Bookings
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="security-note">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
                <path d="M10.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
              </svg>
              Your payment is secured with 256-bit SSL encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPageNew;
