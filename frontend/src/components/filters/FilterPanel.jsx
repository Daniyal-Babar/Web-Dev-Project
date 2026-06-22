/**
 * FilterPanel Component
 * 
 * Main filter container with responsive behavior
 * - Desktop: sticky left sidebar
 * - Mobile: bottom sheet
 * - Manages visibility and focus trap
 */

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import CategorySelect from './CategorySelect';
import CitySelect from './CitySelect';
import PriceRangeSlider from './PriceRangeSlider';
import SearchInput from './SearchInput';
import AppliedFilters from './AppliedFilters';
import FilterActions from './FilterActions';

const FilterPanel = ({ 
  filters,
  onFilterChange,
  onApply,
  onReset,
  isMobile = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [tempFilters, setTempFilters] = useState(filters);

  // Update temp filters when props change (for desktop instant apply)
  useEffect(() => {
    if (!isMobile) {
      setTempFilters(filters);
    }
  }, [filters, isMobile]);

  // Prevent body scroll when mobile filter is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isOpen]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...tempFilters, [key]: value };
    setTempFilters(newFilters);

    // On desktop, apply immediately
    if (!isMobile) {
      onFilterChange(newFilters);
    }
  };

  const handlePriceChange = ({ min, max }) => {
    const newFilters = { 
      ...tempFilters, 
      priceMin: min, 
      priceMax: max 
    };
    setTempFilters(newFilters);

    // On desktop, apply immediately
    if (!isMobile) {
      onFilterChange(newFilters);
    }
  };

  const handleApply = () => {
    onApply(tempFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempFilters({
      category: '',
      city: '',
      priceMin: '',
      priceMax: '',
      search: ''
    });
    onReset();
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleRemoveFilter = (key) => {
    const newFilters = { ...tempFilters, [key]: '' };
    setTempFilters(newFilters);
    
    if (!isMobile) {
      onFilterChange(newFilters);
    }
  };

  const handleClearAll = () => {
    handleReset();
  };

  const activeFilterCount = Object.entries(tempFilters).filter(
    ([key, value]) => value && key !== 'sortBy'
  ).length;

  const hasChanges = activeFilterCount > 0;

  // Mobile trigger button
  if (isMobile && !isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="filter-trigger-btn"
        aria-label="Open filters"
      >
        <SlidersHorizontal size={20} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="filter-badge">{activeFilterCount}</span>
        )}
      </button>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="filter-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Filter panel */}
      <aside 
        className={`filter-panel ${isMobile ? 'filter-panel-mobile' : 'filter-panel-desktop'} ${className}`}
        aria-label="Filters"
      >
        {/* Mobile header */}
        {isMobile && (
          <div className="filter-panel-header">
            <h2 className="filter-panel-title">
              <SlidersHorizontal size={20} />
              Filters
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="filter-close-btn"
              aria-label="Close filters"
            >
              <X size={24} />
            </button>
          </div>
        )}

        {/* Desktop header */}
        {!isMobile && (
          <div className="filter-panel-header">
            <h2 className="filter-panel-title">
              <SlidersHorizontal size={20} />
              Filters
            </h2>
          </div>
        )}

        {/* Applied filters */}
        <AppliedFilters
          filters={tempFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAll}
        />

        {/* Filter controls */}
        <div className="filter-panel-body">
          <div className="filter-section">
            <SearchInput
              value={tempFilters.search}
              onChange={(value) => handleFilterChange('search', value)}
              placeholder="Search items..."
            />
          </div>

          <div className="filter-divider" />

          <div className="filter-section">
            <CategorySelect
              value={tempFilters.category}
              onChange={(value) => handleFilterChange('category', value)}
            />
          </div>

          <div className="filter-divider" />

          <div className="filter-section">
            <CitySelect
              value={tempFilters.city}
              onChange={(value) => handleFilterChange('city', value)}
            />
          </div>

          <div className="filter-divider" />

          <div className="filter-section">
            <PriceRangeSlider
              minValue={tempFilters.priceMin}
              maxValue={tempFilters.priceMax}
              onChange={handlePriceChange}
              currency="PKR"
              min={0}
              max={5000}
              step={1000}
            />
          </div>
        </div>

        {/* Mobile actions */}
        {isMobile && (
          <FilterActions
            onApply={handleApply}
            onReset={handleReset}
            hasChanges={hasChanges}
          />
        )}
      </aside>
    </>
  );
};

export default FilterPanel;
