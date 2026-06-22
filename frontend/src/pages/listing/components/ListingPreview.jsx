/**
 * ListingPreview - Live preview of listing as user fills form
 * Updates in real-time, visible on tablet and desktop only
 * Collapsible for better mobile experience
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ListingPreview.css';

const ListingPreview = ({ formData }) => {
  // Get cover image or placeholder
  const coverImage = formData.images?.[formData.coverImageIndex]?.preview || null;

  // Format price
  const formatPrice = () => {
    if (!formData.price) return '---';
    return `₨ ${parseFloat(formData.price).toLocaleString()}`;
  };

  // Get category display name
  const getCategoryName = () => {
    if (!formData.category) return 'Category';
    return formData.category.charAt(0).toUpperCase() + formData.category.slice(1);
  };

  // Get location display
  const getLocation = () => {
    const { city, address } = formData.location || {};
    if (city && address) return `${address}, ${city}`;
    if (city) return city;
    if (address) return address;
    return 'Location not set';
  };

  // Check if preview has content
  const hasContent = formData.title || formData.price || formData.category || coverImage;

  return (
    <div className="listing-preview">
      <div className="preview-sticky">
        <div className="preview-header">
          <h3>Live Preview</h3>
          <span className="preview-badge">👁️ Preview</span>
        </div>

        <AnimatePresence mode="wait">
          {!hasContent ? (
            <motion.div
              key="empty"
              className="preview-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="empty-icon">📝</div>
              <p>Your listing preview will appear here as you fill in the details</p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              className="preview-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Cover image */}
              <div className="preview-image">
                {coverImage ? (
                  <motion.img
                    src={coverImage}
                    alt="Listing preview"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div className="preview-image-placeholder">
                    <span>📷</span>
                    <p>No image yet</p>
                  </div>
                )}

                {/* Category badge */}
                {formData.category && (
                  <motion.div
                    className="preview-category-badge"
                    initial={{ scale: 0, x: -10 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {getCategoryName()}
                  </motion.div>
                )}
              </div>

              {/* Content */}
              <div className="preview-content">
                {/* Title */}
                <AnimatePresence mode="wait">
                  <motion.h4
                    key={formData.title || 'untitled'}
                    className="preview-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {formData.title || 'Untitled Listing'}
                  </motion.h4>
                </AnimatePresence>

                {/* Price */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${formData.price}-${formData.priceUnit}`}
                    className="preview-price"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <span className="price-amount">{formatPrice()}</span>
                    {formData.price && formData.priceUnit && (
                      <span className="price-unit">/ {formData.priceUnit}</span>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Location */}
                <div className="preview-location">
                  <span className="location-icon">📍</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={getLocation()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {getLocation()}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Description */}
                {formData.description && (
                  <motion.p
                    className="preview-description"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {formData.description.substring(0, 150)}
                    {formData.description.length > 150 && '...'}
                  </motion.p>
                )}

                {/* Features/Details */}
                {Object.keys(formData.details || {}).length > 0 && (
                  <motion.div
                    className="preview-details"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h5>Key Details:</h5>
                    <div className="details-list">
                      {Object.entries(formData.details).slice(0, 3).map(([key, value]) => (
                        value && (
                          <div key={key} className="detail-item">
                            <span className="detail-label">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="detail-value">{value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Image count */}
                {formData.images && formData.images.length > 1 && (
                  <motion.div
                    className="preview-image-count"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    📸 {formData.images.length} photos
                  </motion.div>
                )}

                {/* Rules */}
                {formData.rules && formData.rules.length > 0 && (
                  <motion.div
                    className="preview-rules"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h5>Rules:</h5>
                    <div className="rules-tags">
                      {formData.rules.slice(0, 3).map((rule) => (
                        <span key={rule} className="rule-tag">
                          {rule.replace(/-/g, ' ')}
                        </span>
                      ))}
                      {formData.rules.length > 3 && (
                        <span className="rule-tag">+{formData.rules.length - 3} more</span>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="preview-footer">
                <motion.div
                  className="preview-status"
                  animate={{
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  ✨ Preview updates in real-time
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile note */}
        <div className="preview-mobile-note">
          <p>💡 Preview is best viewed on tablet or desktop</p>
        </div>
      </div>
    </div>
  );
};

export default ListingPreview;
