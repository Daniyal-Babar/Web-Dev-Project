/**
 * Payment Failed Page
 * 
 * Displayed when payment fails or is cancelled
 * Provides options to retry or contact support
 */

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentResult.css';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const bookingId = searchParams.get('bookingId') || searchParams.get('booking_id');
  const errorMessage = searchParams.get('error') || 'Payment could not be processed';

  return (
    <div className="payment-result-page failed">
      <div className="result-container">
        <div className="result-icon failed-icon">
          <span className="cross">✕</span>
        </div>

        <h1 className="result-title">Payment Failed</h1>
        <p className="result-message">
          {errorMessage}
        </p>

        <div className="failure-reasons">
          <h3>Common Reasons for Payment Failure:</h3>
          <ul>
            <li>Insufficient balance in Easypaisa account</li>
            <li>Incorrect PIN entered</li>
            <li>Network connectivity issues</li>
            <li>Transaction timeout</li>
            <li>Payment cancelled by user</li>
          </ul>
        </div>

        <div className="result-actions">
          {bookingId && (
            <button 
              className="btn-primary"
              onClick={() => navigate(`/checkout/${bookingId}`)}
            >
              Try Again
            </button>
          )}
          <button 
            className="btn-secondary"
            onClick={() => navigate('/my-bookings')}
          >
            View My Bookings
          </button>
          <button 
            className="btn-tertiary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>

        <div className="support-info">
          <p>Need help? Contact our support team:</p>
          <p className="support-contact">
            📧 support@renthub.pk | 📞 03XX-XXXXXXX
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
