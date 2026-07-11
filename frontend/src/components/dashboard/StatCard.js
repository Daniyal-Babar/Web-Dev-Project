import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, value, label, subtext, trend }) => {
  return (
    <div className="stat-card">
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__content">
        <p className="stat-card__value">
          {value}
          {trend && (
            <span className={`stat-card__trend stat-card__trend--${trend.type}`}>
              {trend.type === 'up' ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </p>
        <p className="stat-card__label">{label}</p>
        {subtext && <p className="stat-card__subtext">{subtext}</p>}
      </div>
    </div>
  );
};

export default StatCard;
