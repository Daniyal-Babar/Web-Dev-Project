import React from 'react';
import './RecentBookings.css';

const RecentBookings = ({ bookings }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { label: 'Confirmed', className: 'confirmed' },
      active: { label: 'Active', className: 'active' },
      completed: { label: 'Completed', className: 'completed' },
      pending: { label: 'Pending', className: 'pending' },
      cancelled: { label: 'Cancelled', className: 'cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`recent-bookings__status recent-bookings__status--${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="recent-bookings">
      <h3 className="recent-bookings__title">Recent Bookings</h3>
      
      {bookings && bookings.length > 0 ? (
        <div className="recent-bookings__list">
          {bookings.map((booking, index) => (
            <div key={index} className="recent-bookings__item">
              <div className="recent-bookings__item-header">
                <h4 className="recent-bookings__item-title">{booking.itemName}</h4>
                {getStatusBadge(booking.status)}
              </div>
              <div className="recent-bookings__item-details">
                <span className="recent-bookings__date">
                  📅 {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                </span>
                <span className="recent-bookings__amount">
                  Rs {booking.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="recent-bookings__empty">
          <div className="recent-bookings__empty-icon">📋</div>
          <p className="recent-bookings__empty-text">No bookings yet</p>
        </div>
      )}
    </div>
  );
};

export default RecentBookings;
