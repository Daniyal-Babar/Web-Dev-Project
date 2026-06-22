/**
 * CategorySelect Component
 * 
 * Dropdown select for filtering by category
 * - Icon + label per category
 * - Single selection
 * - Keyboard navigable
 * - Custom dropdown on mobile to prevent oversized menu
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Car, 
  Shirt, 
  Wrench, 
  Briefcase, 
  Dog, 
  Ship, 
  Plane 
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories', icon: null },
  { value: 'property', label: 'Property', icon: Home },
  { value: 'vehicles', label: 'Vehicles', icon: Car },
  { value: 'clothes', label: 'Clothes', icon: Shirt },
  { value: 'equipment', label: 'Equipment', icon: Wrench },
  { value: 'services', label: 'Services', icon: Briefcase },
  { value: 'animals', label: 'Animals', icon: Dog },
  { value: 'boats', label: 'Boats', icon: Ship },
  { value: 'air_transport', label: 'Air Transport', icon: Plane }
];

const CategorySelect = ({ value, onChange, className = '' }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleCustomSelect = (categoryValue) => {
    onChange(categoryValue);
    setIsDropdownOpen(false);
  };

  const selectedCategory = CATEGORIES.find(cat => cat.value === value);
  const SelectedIcon = selectedCategory?.icon;

  return (
    <div className={`category-select ${className}`}>
      <label htmlFor="category-select" className="filter-label">
        Category
      </label>
      
      <div className="select-wrapper" ref={dropdownRef}>
        {isMobile ? (
          // Custom dropdown for mobile
          <>
            {SelectedIcon && (
              <SelectedIcon className="select-icon" size={18} />
            )}
            <button
              type="button"
              className="category-dropdown-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="Select category"
              aria-expanded={isDropdownOpen}
            >
              <span>{selectedCategory?.label || 'All Categories'}</span>
              <span className="category-dropdown-arrow">▼</span>
            </button>
            {isDropdownOpen && (
              <div className="category-dropdown-menu">
                {CATEGORIES.map((category) => {
                  const CategoryIcon = category.icon;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      className={`category-dropdown-item ${value === category.value ? 'active' : ''}`}
                      onClick={() => handleCustomSelect(category.value)}
                    >
                      {CategoryIcon && <CategoryIcon size={16} />}
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          // Native select for desktop
          <>
            {SelectedIcon && (
              <SelectedIcon className="select-icon" size={18} />
            )}
            <select
              id="category-select"
              value={value}
              onChange={handleChange}
              className="category-dropdown"
              aria-label="Select category"
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
};

export default CategorySelect;
export { CATEGORIES };
