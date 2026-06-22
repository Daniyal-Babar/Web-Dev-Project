/**
 * Empty State Component
 * 
 * Displays when no data is available
 * Used for empty listings, no search results, etc.
 */

import React from 'react';
import './EmptyState.css';

const EmptyState = ({
  title = 'No data found',
  message = 'There is nothing to display at the moment',
  actionLabel,
  onAction,
  icon = '📭'
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-message">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="empty-state-action">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
