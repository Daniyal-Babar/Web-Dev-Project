/**
 * MobileThemeToggle Component
 * 
 * Floating theme toggle button for mobile only
 * Appears in top-right corner
 */

import React from 'react';
import Theme from '../theme/Theme';
import './mobileThemeToggle.css';

const MobileThemeToggle = () => {
  return (
    <div className="mobile-theme-toggle">
      <Theme />
    </div>
  );
};

export default MobileThemeToggle;
