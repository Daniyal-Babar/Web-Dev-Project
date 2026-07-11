/**
 * Navbar Component (Main Entry Point)
 * 
 * Hybrid navigation system that switches between:
 * - Mobile: Bottom navigation bar (< 768px) + Floating theme toggle
 * - Desktop: Top navigation bar (>= 768px)
 * 
 * Never shows both at the same time
 */

import React, { useState, useEffect } from 'react';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import MobileThemeToggle from './MobileThemeToggle';
import './navbar.css';

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size and update navigation type
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <>
      {/* Show only one navigation type at a time */}
      {isMobile ? (
        <>
          <BottomNav />
          <MobileThemeToggle />
        </>
      ) : (
        <TopNav />
      )}
    </>
  );
};

export default Navbar;
