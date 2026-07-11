/**
 * SearchInput Component
 * 
 * Keyword-based search with debouncing
 * - Clear button
 * - Debounced input (500ms)
 * - Accessible
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = 'Search items...', 
  debounceMs = 500,
  className = '' 
}) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localValue, onChange, value, debounceMs]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={`search-input-wrapper ${className}`}>
      <Search size={18} className="search-icon" aria-hidden="true" />
      
      <input
        id="search-input"
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="search-field"
        aria-label="Search items"
      />
      
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="search-clear"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
