import React from 'react';
import './RecentPayouts.css';

const RecentPayouts = ({ payouts }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Completed', className: 'completed' },
      pending: { label: 'Pending', className: 'pending' },
      failed: { label: 'Failed', className: 'failed' },
      processing: { label: 'Processing', className: 'processing' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`recent-payouts__status recent-payouts__status--${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="recent-payouts">
      <h3 className="recent-payouts__title">Recent Payouts</h3>
      
      {payouts && payouts.length > 0 ? (
        <div className="recent-payouts__list">
          {payouts.map((payout, index) => (
            <div key={index} className="recent-payouts__item">
              <div className="recent-payouts__item-header">
                <div className="recent-payouts__item-icon">💳</div>
                <div className="recent-payouts__item-content">
                  <h4 className="recent-payouts__item-title">{payout.description}</h4>
                  <p className="recent-payouts__date">{formatDate(payout.date)}</p>
                </div>
              </div>
              <div className="recent-payouts__item-footer">
                <span className="recent-payouts__amount">
                  Rs {payout.amount.toLocaleString()}
                </span>
                {getStatusBadge(payout.status)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="recent-payouts__empty">
          <div className="recent-payouts__empty-icon">💰</div>
          <p className="recent-payouts__empty-text">No payouts yet</p>
        </div>
      )}
    </div>
  );
};

export default RecentPayouts;
