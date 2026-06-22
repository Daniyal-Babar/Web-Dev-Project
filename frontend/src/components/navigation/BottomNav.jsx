/**
 * BottomNav Component
 * 
 * Mobile navigation bar - fixed to bottom of screen
 * Features icon + label for each route with active states
 * Profile button opens ProfileModal
 */

import React, { useState } from 'react';
import NavItem from './NavItem';
import ProfileModal from './ProfileModal';

const BottomNav = () => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Navigation items
  const navItems = [
    { to: '/browse', icon: '🔍', label: 'Browse' },
    { to: '/create-listing', icon: '➕', label: 'Create' },
    { to: '/my-bookings', icon: '📋', label: 'Bookings' },
  ];

  return (
    <>
      <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
        <div className="bottom-nav__container">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              className="bottom-nav__item"
            />
          ))}
          
          {/* Profile - Opens Modal */}
          <button
            className="bottom-nav__item"
            onClick={() => setIsProfileModalOpen(true)}
            aria-label="Profile menu"
          >
            <span className="bottom-nav__icon">👤</span>
            <span className="bottom-nav__label">Profile</span>
          </button>
        </div>
      </nav>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default BottomNav;
