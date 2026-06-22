/**
 * Payment Success Page
 * 
 * Displayed after successful payment completion via Easypaisa
 * Shows confirmation and booking details
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './PaymentResult.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id');

  useEffect(() => {
    if (paymentId) {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [paymentId]);

  const verifyPayment = async () => {
    try {
      const response = await axios.get(`/api/payments/${paymentId}/status`);
      setPaymentDetails(response.data);
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-result-page">
        <div className="result-container">
          <div className="loading">Verifying payment...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page success">
      <div className="result-container">
        <div className="result-icon success-icon">
          <span className="checkmark">✓</span>
        </div>

        <h1 className="result-title">Payment Successful!</h1>
        <p className="result-message">
          Your payment has been processed successfully. Your booking is now confirmed.
        </p>

        {paymentDetails && (
          <div className="payment-info">
            <div className="info-row">
              <span className="info-label">Amount Paid:</span>
              <span className="info-value">Rs {paymentDetails.amount?.toLocaleString()}</span>
            </div>
            {paymentDetails.paidAt && (
              <div className="info-row">
                <span className="info-label">Payment Date:</span>
                <span className="info-value">
                  {new Date(paymentDetails.paidAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>✓ Check your email for booking confirmation</li>
            <li>✓ You'll receive SMS updates about your booking</li>
            <li>✓ Contact the owner for pickup/delivery arrangements</li>
          </ul>
        </div>

        <div className="result-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/my-bookings')}
          >
            View My Bookings
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
