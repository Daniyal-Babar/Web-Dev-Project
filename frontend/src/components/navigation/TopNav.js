/**
 * TopNav Component
 * 
 * Desktop navigation bar - fixed to top of screen
 * Features logo, category dropdown, nav links, and profile menu
 */

import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import CategoryDropdown from './CategoryDropdown.js';
import ProfileMenu from './ProfileMenu.js';
import Theme from '../theme/Theme.js';
import Language from '../language/Language.js';

const TopNav = () => {
  return (
    <nav className="top-nav" role="navigation" aria-label="Main navigation">
      <div className="top-nav__container">
        {/* Logo */}
        <div className="top-nav__logo">
          <Link to="/" className="top-nav__logo-link">
            <span className="top-nav__logo-text">Rental Marketplace</span>
          </Link>
        </div>

        {/* Center Navigation Links */}
        <div className="top-nav__links">
          <NavLink
            to="/browse"
            className={({ isActive }) =>
              `top-nav__link ${isActive ? 'top-nav__link--active' : ''}`
            }
          >
            Browse
          </NavLink>

          {/* Categories Dropdown */}
          <CategoryDropdown />

          <NavLink
            to="/create-listing"
            className={({ isActive }) =>
              `top-nav__link ${isActive ? 'top-nav__link--active' : ''}`
            }
          >
            Create Listing
          </NavLink>

          <NavLink
            to="/my-bookings"
            className={({ isActive }) =>
              `top-nav__link ${isActive ? 'top-nav__link--active' : ''}`
            }
          >
            My Bookings
          </NavLink>
        </div>

        {/* Profile Menu */}
        <div className="top-nav__profile">
          <ProfileMenu />
        </div>
        
        {/* Language Selector */}
        <Language />
        
        {/* Theme Toggle */}
        <Theme />
      </div>
    </nav>
  );
};

export default TopNav;
