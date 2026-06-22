import React from 'react';
import HeroSearch from './HeroSearch';
import CategoryGrid from './CategoryGrid';
import './HeroSection.css';

const HeroSection = ({ 
  onSearch, 
  categories = [], 
  onCategoryClick,
  title = "Find Your Perfect Rental",
  subtitle = "Discover thousands of trusted listings for property, vehicles, equipment, and more"
}) => {
  return (
    <section className="hero-section">
      <div className="hero-section__content">
        {/* Hero Title */}
        <h1 className="hero-section__title">{title}</h1>
        
        {/* Hero Subtitle */}
        <p className="hero-section__subtitle">{subtitle}</p>
        
        {/* Hero Search Command Bar */}
        <div className="hero-section__search">
          <HeroSearch 
            onSearch={onSearch}
            categories={categories}
          />
        </div>

        {/* Trust Signals */}
        <div className="hero-section__trust-signals">
          <span className="trust-signal">
            <span className="trust-signal__icon">✓</span>
            Verified listings
          </span>
          <span className="trust-signal">
            <span className="trust-signal__icon">🔒</span>
            Secure payments
          </span>
          <span className="trust-signal">
            <span className="trust-signal__icon">📍</span>
            Local rentals near you
          </span>
        </div>
      </div>

      {/* Category Grid - Partially visible below fold */}
      <div className="hero-section__categories">
        <CategoryGrid 
          categories={categories}
          onCategoryClick={onCategoryClick}
        />
      </div>
    </section>
  );
};

export default HeroSection;
