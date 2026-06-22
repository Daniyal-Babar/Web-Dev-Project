import React from 'react';
import './DashboardHeader.css';

const DashboardHeader = ({ onEditEasypaisa, onWithdraw }) => {
  return (
    <div className="dashboard-header">
      <div className="dashboard-header__content">
        <div className="dashboard-header__text">
          <h1 className="dashboard-header__title">Earnings Dashboard</h1>
          <p className="dashboard-header__subtitle">Track your rentals, bookings, and payouts</p>
        </div>
        <div className="dashboard-header__actions">
          <button 
            className="dashboard-header__btn dashboard-header__btn--secondary"
            onClick={onEditEasypaisa}
          >
            💳 Edit Easypaisa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
