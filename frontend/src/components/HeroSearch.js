import React, { useState, useEffect, useRef } from 'react';
import './heroSearch.css';

const HeroSearch = ({ onSearch, categories = [] }) => {
  const [searchValue, setSearchValue] = useState('');
  const [category, setCategory] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(category, searchValue);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setCategory(categoryId);
    setIsDropdownOpen(false);
  };

  const selectedCategoryName = categories.find(c => (c.id || c.name) === category)?.name || 'Category';

  return (
    <form className="hero-search" onSubmit={handleSubmit}>
      <div className="hero-search__container">
        {/* Category Dropdown - Custom on mobile, native on desktop */}
        <div className="hero-search__category" ref={dropdownRef}>
          {isMobile ? (
            // Custom dropdown for mobile
            <div className="hero-search__custom-dropdown">
              <button
                type="button"
                className="hero-search__dropdown-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="Select category"
                aria-expanded={isDropdownOpen}
              >
                <span>{selectedCategoryName}</span>
                <span className="hero-search__dropdown-arrow">▼</span>
              </button>
              {isDropdownOpen && (
                <div className="hero-search__dropdown-menu">
                  <button
                    type="button"
                    className={`hero-search__dropdown-item ${category === '' ? 'active' : ''}`}
                    onClick={() => handleCategorySelect('')}
                  >
                    Category
                  </button>
                  {categories?.map((c) => (
                    <button
                      key={c.id || c.name}
                      type="button"
                      className={`hero-search__dropdown-item ${category === (c.id || c.name) ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(c.id || c.name)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Native select for desktop
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Select category"
            >
              <option value="">Category</option>
              {categories?.map((c) => (
                <option key={c.id || c.name} value={c.id || c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search Input - Dominates the Space */}
        <div className="hero-search__input">
          <input
            type="text"
            placeholder="Search rentals, locations, keywords…"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Search rentals"
          />
        </div>

        {/* Search Button - Prominent */}
        <button 
          type="submit" 
          className="hero-search__button"
          aria-label="Search"
        >
          <span className="hero-search__button-text">Search</span>
          <span className="hero-search__button-icon">→</span>
        </button>
      </div>
    </form>
  );
};

export default HeroSearch;
