import React from 'react';
import './OwnerCard.css';

const OwnerCard = ({ owner }) => {
  if (!owner) {
    return (
      <div className="owner-card">
        <p>Owner info unavailable.</p>
      </div>
    );
  }

  // Get owner name from firstName/lastName or name property
  const ownerName = owner.firstName && owner.lastName 
    ? `${owner.firstName} ${owner.lastName}`
    : owner.name || owner.firstName || owner.lastName || 'Owner';

  // Get initials for avatar placeholder
  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return '';
    // Remove any non-digit characters for display
    return phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="owner-card">
      {/* Owner Header */}
      <div className="owner-card__header">
        {owner.profileImage ? (
          <img 
            src={owner.profileImage} 
            alt={ownerName}
            className="owner-card__avatar"
          />
        ) : (
          <div className="owner-card__avatar-placeholder">
            {getInitials(ownerName)}
          </div>
        )}
        
        <div className="owner-card__info">
          <h3>
            {ownerName}
            {owner.isVerified && (
              <span className="owner-card__verified">
                <span className="owner-card__verified-icon">✓</span>
                Verified
              </span>
            )}
          </h3>
          
          {owner.overallRating && (
            <div className="owner-card__rating">
              <div className="owner-card__rating-stars">
                {'★'.repeat(Math.round(owner.overallRating))}
                {'☆'.repeat(5 - Math.round(owner.overallRating))}
              </div>
              <span className="owner-card__rating-value">
                {owner.overallRating?.toFixed(1) || '0.0'}
              </span>
              {owner.ratingCount && (
                <span className="owner-card__rating-count">
                  ({owner.ratingCount})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Owner Details */}
      <div className="owner-card__details">
        {owner.email && (
          <div className="owner-card__detail-item">
            <div className="owner-card__detail-icon">✉</div>
            <div className="owner-card__detail-text">
              <span className="owner-card__detail-label">Email:</span>
              {owner.email}
            </div>
          </div>
        )}
        
        {(owner.phone || owner.phoneNumber) && (
          <div className="owner-card__detail-item">
            <div className="owner-card__detail-icon">📞</div>
            <div className="owner-card__detail-text">
              <span className="owner-card__detail-label">Phone:</span>
              {formatPhone(owner.phone || owner.phoneNumber)}
            </div>
          </div>
        )}
      </div>

      {/* Contact Button */}
      <div className="owner-card__contact">
        <button className="owner-card__contact-btn">
          Contact Owner
        </button>
      </div>
    </div>
  );
};

export default OwnerCard;
