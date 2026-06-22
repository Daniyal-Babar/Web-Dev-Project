/**
 * AppliedFilters Component
 * 
 * Shows active filters as chips
 * - One-click removal
 * - Clear all option
 * - Shows filter count
 */

import React from 'react';
import { X } from 'lucide-react';
import { CATEGORIES } from './CategorySelect';

const AppliedFilters = ({ filters, onRemove, onClearAll, className = '' }) => {
  const getFilterLabel = (key, value) => {
    switch (key) {
      case 'category':
        const category = CATEGORIES.find(c => c.value === value);
        return category ? category.label : value;
      case 'city':
        return value;
      case 'priceMin':
        return `Min: PKR ${parseInt(value).toLocaleString()}`;
      case 'priceMax':
        return `Max: PKR ${parseInt(value).toLocaleString()}`;
      case 'search':
        return `"${value}"`;
      default:
        return value;
    }
  };

  const getFilterKey = (key) => {
    switch (key) {
      case 'priceMin':
      case 'priceMax':
        return 'Price';
      default:
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  const filterEntries = Object.entries(filters).filter(([key, value]) => 
    value && key !== 'sortBy'
  );

  if (filterEntries.length === 0) {
    return null;
  }

  return (
    <div className={`applied-filters ${className}`}>
      <div className="applied-filters-header">
        <span className="applied-filters-count">
          {filterEntries.length} {filterEntries.length === 1 ? 'filter' : 'filters'} applied
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="clear-all-btn"
          aria-label="Clear all filters"
        >
          Clear all
        </button>
      </div>

      <div className="filter-chips">
        {filterEntries.map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => onRemove(key)}
            className="filter-chip"
            aria-label={`Remove ${getFilterKey(key)} filter`}
          >
            <span className="filter-chip-label">
              {getFilterLabel(key, value)}
            </span>
            <X size={14} className="filter-chip-remove" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AppliedFilters;
