import React from 'react';
import './categories.css';

const CategoryCard = ({ icon, title, description, count, onClick }) => {
  return (
    <div 
      className="category-card" 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      }}
      aria-label={`Browse ${title}`}
    >
      <div className="category-card__icon">{icon}</div>
      <div className="category-card__content">
        <h3 className="category-card__title">{title}</h3>
        <p className="category-card__description">{description}</p>
      </div>
      {count && (
        <p className="category-card__count">{count} listings</p>
      )}
    </div>
  );
};

export default CategoryCard;
