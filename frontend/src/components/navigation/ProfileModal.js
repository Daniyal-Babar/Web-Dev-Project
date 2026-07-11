/**
 * ProfileModal Component (Mobile Only)
 * 
 * Slide-up modal that appears when user taps Profile icon
 * Shows: Avatar, Email, Navigation links, Logout
 * Supports swipe-down gesture to close
 */

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import './profileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const modalRef = useRef(null);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Handle touch/mouse events for swipe gesture
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal || !isOpen) return;

    const handleStart = (e) => {
      const y = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
      setStartY(y);
      setCurrentY(y);
      setIsDragging(true);
    };

    const handleMove = (e) => {
      if (!isDragging) return;
      const y = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
      const diff = y - startY;
      
      // Only allow downward swipe
      if (diff > 0) {
        setCurrentY(y);
        modal.style.transform = `translateY(${diff}px)`;
      }
    };

    const handleEnd = () => {
      if (!isDragging) return;
      const diff = currentY - startY;
      
      // If swiped down more than 200px, close modal
      if (diff > 200) {
        modal.style.transform = 'translateY(100%)';
        setTimeout(onClose, 200);
      } else {
        // Otherwise, snap back
        modal.style.transform = 'translateY(0)';
      }
      
      setIsDragging(false);
      setStartY(0);
      setCurrentY(0);
    };

    // Add event listeners
    modal.addEventListener('touchstart', handleStart, { passive: true });
    modal.addEventListener('touchmove', handleMove, { passive: true });
    modal.addEventListener('touchend', handleEnd);
    modal.addEventListener('mousedown', handleStart);
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    return () => {
      modal.removeEventListener('touchstart', handleStart);
      modal.removeEventListener('touchmove', handleMove);
      modal.removeEventListener('touchend', handleEnd);
      modal.removeEventListener('mousedown', handleStart);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
    };
  }, [isOpen, isDragging, startY, currentY, onClose]);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="profile-modal-backdrop" onClick={onClose} />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`profile-modal ${isOpen ? 'profile-modal--open' : ''}`}
      >
        {/* Handle bar - visual indicator for swipe */}
        <div className="profile-modal__handle" />

        {/* User Info */}
        <div className="profile-modal__header">
          <div className="profile-modal__avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-modal__user-info">
            <p className="profile-modal__name">{user?.name || 'User'}</p>
            <p className="profile-modal__email">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="profile-modal__menu">
          <button 
            className="profile-modal__item"
            onClick={() => handleNavigation('/profile')}
          >
            <span className="profile-modal__icon">👤</span>
            <span className="profile-modal__text">My Profile</span>
            <span className="profile-modal__arrow">→</span>
          </button>

          <button 
            className="profile-modal__item"
            onClick={() => handleNavigation('/my-bookings')}
          >
            <span className="profile-modal__icon">📋</span>
            <span className="profile-modal__text">My Bookings</span>
            <span className="profile-modal__arrow">→</span>
          </button>

          <button 
            className="profile-modal__item"
            onClick={() => handleNavigation('/my-listings')}
          >
            <span className="profile-modal__icon">📦</span>
            <span className="profile-modal__text">My Listings</span>
            <span className="profile-modal__arrow">→</span>
          </button>

          <button 
            className="profile-modal__item"
            onClick={() => handleNavigation('/earnings')}
          >
            <span className="profile-modal__icon">💰</span>
            <span className="profile-modal__text">Earnings</span>
            <span className="profile-modal__arrow">→</span>
          </button>

          <div className="profile-modal__divider" />

          <button 
            className="profile-modal__item profile-modal__item--logout"
            onClick={handleLogout}
          >
            <span className="profile-modal__icon">🚪</span>
            <span className="profile-modal__text">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileModal;
