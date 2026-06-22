/**
 * PriceRangeSlider Component
 * 
 * Dual-handle slider for price range filtering
 * - Min and max values
 * - Update on release (not on drag)
 * - Optional manual numeric input
 * - Keyboard adjustable
 */

import React, { useState, useEffect } from 'react';

const PriceRangeSlider = ({ 
  minValue = '', 
  maxValue = '', 
  onChange, 
  currency = 'PKR',
  min = 0,
  max = 5000,
  step = 1000,
  className = '' 
}) => {
  const [localMin, setLocalMin] = useState(minValue || min);
  const [localMax, setLocalMax] = useState(maxValue || max);
  const [isDragging, setIsDragging] = useState(false);

  // Update local state when props change
  useEffect(() => {
    if (!isDragging) {
      setLocalMin(minValue || min);
      setLocalMax(maxValue || max);
    }
  }, [minValue, maxValue, min, max, isDragging]);

  const handleMinChange = (e) => {
    const value = parseInt(e.target.value);
    if (value <= localMax) {
      setLocalMin(value);
    }
  };

  const handleMaxChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= localMin) {
      setLocalMax(value);
    }
  };

  const handleMinInputChange = (e) => {
    const value = e.target.value === '' ? '' : parseInt(e.target.value);
    if (value === '' || (value >= min && value <= localMax)) {
      setLocalMin(value);
    }
  };

  const handleMaxInputChange = (e) => {
    const value = e.target.value === '' ? '' : parseInt(e.target.value);
    if (value === '' || (value <= max && value >= localMin)) {
      setLocalMax(value);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Apply changes on release
    onChange({
      min: localMin === min ? '' : localMin,
      max: localMax === max ? '' : localMax
    });
  };

  const handleInputBlur = () => {
    // Apply changes when input loses focus
    onChange({
      min: localMin === min ? '' : localMin,
      max: localMax === max ? '' : localMax
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-PK').format(num);
  };

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className={`price-range-slider ${className}`}>
      <label className="filter-label">Price Range</label>

      <div className="price-display">
        <span className="price-value">
          {currency} {formatNumber(localMin)}
        </span>
        <span className="price-separator">-</span>
        <span className="price-value">
          {currency} {formatNumber(localMax)}
        </span>
      </div>

      <div className="slider-container">
        <div className="slider-track">
          <div 
            className="slider-range"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`
            }}
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="slider-thumb slider-thumb-min"
          aria-label="Minimum price"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localMin}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="slider-thumb slider-thumb-max"
          aria-label="Maximum price"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localMax}
        />
      </div>

      <div className="price-inputs">
        <div className="price-input-group">
          <label htmlFor="price-min-input" className="price-input-label">
            Min
          </label>
          <div className="price-input-wrapper">
            <span className="price-input-currency">{currency}</span>
            <input
              id="price-min-input"
              type="number"
              min={min}
              max={localMax}
              step={step}
              value={localMin}
              onChange={handleMinInputChange}
              onBlur={handleInputBlur}
              className="price-input"
              aria-label="Minimum price input"
            />
          </div>
        </div>

        <div className="price-input-group">
          <label htmlFor="price-max-input" className="price-input-label">
            Max
          </label>
          <div className="price-input-wrapper">
            <span className="price-input-currency">{currency}</span>
            <input
              id="price-max-input"
              type="number"
              min={localMin}
              max={max}
              step={step}
              value={localMax}
              onChange={handleMaxInputChange}
              onBlur={handleInputBlur}
              className="price-input"
              aria-label="Maximum price input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
