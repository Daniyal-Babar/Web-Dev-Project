/**
 * NavItem Component
 * 
 * Reusable navigation item with icon, label, and active state
 * Used in both mobile and desktop navigation
 */

import React from 'react';
import { NavLink } from 'react-router-dom';

const NavItem = ({ to, icon, label, className = '', onClick }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-item ${className} ${isActive ? 'nav-item--active' : ''}`
      }
      onClick={onClick}
      aria-label={label}
    >
      {/* Icon placeholder - can be replaced with actual icon component */}
      <span className="nav-item__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="nav-item__label">{label}</span>
    </NavLink>
  );
};

export default NavItem;
