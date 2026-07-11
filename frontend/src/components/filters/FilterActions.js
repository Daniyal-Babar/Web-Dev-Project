/**
 * FilterActions Component
 * 
 * Apply and Reset buttons for mobile
 * - Fixed at bottom of sheet
 * - Disabled Apply if no change
 * - Reset clears filters
 */

import React from 'react';

const FilterActions = ({ 
  onApply, 
  onReset, 
  hasChanges, 
  isApplying = false,
  className = '' 
}) => {
  return (
    <div className={`filter-actions ${className}`}>
      <button
        type="button"
        onClick={onReset}
        className="filter-action-btn reset-btn"
        aria-label="Reset filters"
      >
        Reset
      </button>
      
      <button
        type="button"
        onClick={onApply}
        disabled={!hasChanges || isApplying}
        className="filter-action-btn apply-btn"
        aria-label="Apply filters"
      >
        {isApplying ? 'Applying...' : 'Apply Filters'}
      </button>
    </div>
  );
};

export default FilterActions;
