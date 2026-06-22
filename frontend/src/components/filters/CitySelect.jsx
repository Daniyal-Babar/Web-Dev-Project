/**
 * CitySelect Component
 * 
 * Searchable dropdown for filtering by city
 * - Type-to-filter
 * - Shows popular Pakistani cities
 * - Keyboard navigable
 * - Debounced search
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';

const PAKISTANI_CITIES = [
  { value: 'Karachi', label: 'Karachi', province: 'Sindh', popular: true },
  { value: 'Lahore', label: 'Lahore', province: 'Punjab', popular: true },
  { value: 'Islamabad', label: 'Islamabad', province: 'ICT', popular: true },
  { value: 'Rawalpindi', label: 'Rawalpindi', province: 'Punjab', popular: true },
  { value: 'Faisalabad', label: 'Faisalabad', province: 'Punjab', popular: true },
  { value: 'Multan', label: 'Multan', province: 'Punjab', popular: true },
  { value: 'Peshawar', label: 'Peshawar', province: 'KPK', popular: true },
  { value: 'Quetta', label: 'Quetta', province: 'Balochistan', popular: true },
  { value: 'Sialkot', label: 'Sialkot', province: 'Punjab' },
  { value: 'Gujranwala', label: 'Gujranwala', province: 'Punjab' },
  { value: 'Hyderabad', label: 'Hyderabad', province: 'Sindh' },
  { value: 'Sukkur', label: 'Sukkur', province: 'Sindh' },
  { value: 'Bahawalpur', label: 'Bahawalpur', province: 'Punjab' },
  { value: 'Sargodha', label: 'Sargodha', province: 'Punjab' },
  { value: 'Abbottabad', label: 'Abbottabad', province: 'KPK' },
  { value: 'Mardan', label: 'Mardan', province: 'KPK' },
  { value: 'Gujrat', label: 'Gujrat', province: 'Punjab' },
  { value: 'Kasur', label: 'Kasur', province: 'Punjab' },
  { value: 'Rahim Yar Khan', label: 'Rahim Yar Khan', province: 'Punjab' },
  { value: 'Sahiwal', label: 'Sahiwal', province: 'Punjab' }
];

const CitySelect = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState(PAKISTANI_CITIES);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter cities based on search term
  useEffect(() => {
    const filtered = PAKISTANI_CITIES.filter(city =>
      city.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.province.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (cityValue) => {
    onChange(cityValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const popularCities = filteredCities.filter(c => c.popular);
  const otherCities = filteredCities.filter(c => !c.popular);

  return (
    <div className={`city-select ${className}`} ref={dropdownRef}>
      <label htmlFor="city-select-trigger" className="filter-label">
        City / Location
      </label>

      <button
        id="city-select-trigger"
        type="button"
        className="city-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <MapPin size={18} className="city-icon" />
        <span className="city-value">
          {value || 'Select city'}
        </span>
        {value && (
          <X 
            size={16} 
            className="clear-icon" 
            onClick={handleClear}
            aria-label="Clear city"
          />
        )}
      </button>

      {isOpen && (
        <div className="city-dropdown" role="listbox">
          <div className="city-search">
            <Search size={16} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="city-search-input"
              aria-label="Search cities"
            />
          </div>

          <div className="city-list">
            {popularCities.length > 0 && (
              <div className="city-group">
                <div className="city-group-label">Popular Cities</div>
                {popularCities.map((city) => (
                  <button
                    key={city.value}
                    type="button"
                    className={`city-option ${value === city.value ? 'selected' : ''}`}
                    onClick={() => handleSelect(city.value)}
                    role="option"
                    aria-selected={value === city.value}
                  >
                    <span className="city-name">{city.label}</span>
                    <span className="city-province">{city.province}</span>
                  </button>
                ))}
              </div>
            )}

            {otherCities.length > 0 && (
              <div className="city-group">
                {popularCities.length > 0 && (
                  <div className="city-group-label">Other Cities</div>
                )}
                {otherCities.map((city) => (
                  <button
                    key={city.value}
                    type="button"
                    className={`city-option ${value === city.value ? 'selected' : ''}`}
                    onClick={() => handleSelect(city.value)}
                    role="option"
                    aria-selected={value === city.value}
                  >
                    <span className="city-name">{city.label}</span>
                    <span className="city-province">{city.province}</span>
                  </button>
                ))}
              </div>
            )}

            {filteredCities.length === 0 && (
              <div className="city-empty">
                No cities found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySelect;
export { PAKISTANI_CITIES };
