/**
 * CategoryDropdown Component
 * 
 * Desktop dropdown menu showing rental categories
 * Features hover delay and smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CategoryDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Categories grouped by type
  const categories = [
    {
      group: 'Vehicles',
      items: [
        { name: 'Cars', path: '/browse?category=cars' },
        { name: 'Bikes', path: '/browse?category=bikes' },
        { name: 'Boats', path: '/browse?category=boats' },
      ],
    },
    {
      group: 'Properties',
      items: [
        { name: 'Houses', path: '/browse?category=houses' },
        { name: 'Apartments', path: '/browse?category=apartments' },
        { name: 'Vacation Homes', path: '/browse?category=vacation-homes' },
      ],
    },
    {
      group: 'Equipment',
      items: [
        { name: 'Tools', path: '/browse?category=tools' },
        { name: 'Electronics', path: '/browse?category=electronics' },
        { name: 'Sports Equipment', path: '/browse?category=sports' },
      ],
    },
    {
      group: 'Other',
      items: [
        { name: 'Services', path: '/browse?category=services' },
        { name: 'Clothing', path: '/browse?category=clothes' },
        { name: 'Animals', path: '/browse?category=animals' },
      ],
    },
  ];

  // Handle hover with delay
  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  return (
    <div
      className="nav-category-dropdown"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="nav-category-dropdown__trigger"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Categories
        <span className={`nav-category-dropdown__arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="nav-category-dropdown__menu" role="menu">
          <div className="nav-category-dropdown__grid">
            {categories.map((group, idx) => (
              <div key={idx} className="nav-category-group">
                <h3 className="nav-category-group__title">{group.group}</h3>
                <ul className="nav-category-group__list">
                  {group.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Link
                        to={item.path}
                        className="nav-category-group__link"
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
