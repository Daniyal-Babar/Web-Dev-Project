/**
 * Loading Skeleton Component
 * 
 * Shows skeleton loaders while data is being fetched
 * Mimics the layout of listing cards
 */

import React from 'react';
import './LoadingSkeleton.css';

const LoadingSkeleton = ({ count = 6 }) => {
  return (
    <div className="skeleton-grid">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-image shimmer"></div>
          <div className="skeleton-content">
            <div className="skeleton-title shimmer"></div>
            <div className="skeleton-price shimmer"></div>
            <div className="skeleton-category shimmer"></div>
            <div className="skeleton-stats">
              <div className="skeleton-stat shimmer"></div>
              <div className="skeleton-stat shimmer"></div>
            </div>
            <div className="skeleton-date shimmer"></div>
          </div>
          <div className="skeleton-actions">
            <div className="skeleton-btn shimmer"></div>
            <div className="skeleton-btn shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
