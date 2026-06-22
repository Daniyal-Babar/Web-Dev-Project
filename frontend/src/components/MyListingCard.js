/**
 * My Listing Card Component
 * 
 * Individual listing card for My Listings page
 * Shows thumbnail, title, price, status, views, bookings
 * Actions: Edit, Delete, View, Toggle Status
 */

import React, { useState } from 'react';
import './MyListingCard.css';

const MyListingCard = ({ listing, onEdit, onDelete, onView, onToggleStatus }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-badge active';
      case 'inactive':
        return 'status-badge inactive';
      case 'archived':
        return 'status-badge archived';
      default:
        return 'status-badge';
    }
  };

  const formatPrice = (amount, model) => {
    const modelText = {
      hourly: '/hr',
      daily: '/day',
      weekly: '/wk',
      monthly: '/mo'
    };
    return `PKR ${amount.toLocaleString()}${modelText[model] || ''}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getThumbnail = () => {
    if (listing.images && listing.images.length > 0) {
      return listing.images[0].url || listing.images[0];
    }
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit(listing._id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(listing._id, listing.title);
  };

  const handleToggleStatus = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onToggleStatus(listing._id, listing.status);
  };

  const handleView = () => {
    onView(listing._id);
  };

  return (
    <div className="my-listing-card" onClick={handleView}>
      {/* Image */}
      <div className="listing-image-container">
        <img 
          src={getThumbnail()} 
          alt={listing.title}
          className="listing-image"
          loading="lazy"
        />
        <div className={getStatusBadgeClass(listing.status)}>
          {listing.status}
        </div>
        
        {/* Menu Button */}
        <button 
          className="menu-btn"
          onClick={handleToggleMenu}
          aria-label="More options"
        >
          ⋮
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <>
            <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
            <div className="dropdown-menu">
              <button onClick={handleEdit} className="menu-item">
                <span className="menu-icon">✏️</span> Edit
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleView(); }} className="menu-item">
                <span className="menu-icon">👁️</span> View
              </button>
              <button onClick={handleToggleStatus} className="menu-item">
                <span className="menu-icon">
                  {listing.status === 'active' ? '⏸️' : '▶️'}
                </span>
                {listing.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={handleDelete} className="menu-item danger">
                <span className="menu-icon">🗑️</span> Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="listing-content">
        <h3 className="listing-title">{listing.title}</h3>
        
        <div className="listing-price">
          {formatPrice(listing.pricing.amount, listing.pricing.pricingModel)}
        </div>

        <div className="listing-category">
          {listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}
        </div>

        {/* Stats */}
        <div className="listing-stats">
          <div className="stat-item">
            <span className="stat-icon">👁️</span>
            <span className="stat-text">{listing.views || 0} views</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📅</span>
            <span className="stat-text">{listing.bookingsCount || 0} bookings</span>
          </div>
        </div>

        {/* Date */}
        <div className="listing-date">
          Created: {formatDate(listing.createdAt)}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="listing-actions">
        <button 
          onClick={(e) => { e.stopPropagation(); handleEdit(e); }}
          className="action-btn edit"
          title="Edit listing"
        >
          Edit
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleView(); }}
          className="action-btn view"
          title="View listing"
        >
          View
        </button>
      </div>
    </div>
  );
};

export default MyListingCard;
