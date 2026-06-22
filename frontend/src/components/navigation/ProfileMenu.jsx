/**
 * ProfileMenu Component
 * 
 * User profile dropdown menu
 * Shows user info and quick actions
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
    navigate('/');
  };

  // If no user, show login button
  if (!user) {
    return (
      <Link to="/login" className="profile-menu__login-btn">
        Login
      </Link>
    );
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        className="profile-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="profile-menu__avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <span className="profile-menu__name">{user.name || 'User'}</span>
      </button>

      {isOpen && (
        <div className="profile-menu__dropdown" role="menu">
          <div className="profile-menu__header">
            <div className="profile-menu__user-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <ul className="profile-menu__list">
            {user.admin && (
              <li>
                <Link
                  to="/admin"
                  className="profile-menu__link profile-menu__link--admin"
                  onClick={() => setIsOpen(false)}
                  role="menuitem"
                >
                  ⚡ Admin Dashboard
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/profile"
                className="profile-menu__link"
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                My Profile
              </Link>
            </li>
            <li>
              <Link
                to="/my-bookings"
                className="profile-menu__link"
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                My Bookings
              </Link>
            </li>
            <li>
              <Link
                to="/my-listings"
                className="profile-menu__link"
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                My Listings
              </Link>
            </li>
            <li>
              <Link
                to="/earnings"
                className="profile-menu__link"
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                💰 Earnings
              </Link>
            </li>
          </ul>

          <div className="profile-menu__footer">
            <button
              className="profile-menu__logout"
              onClick={handleLogout}
              role="menuitem"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
