/**
 * Home Page Component
 * 
 * Displays:
 * - Modern hero section with command-style search
 * - Interactive category cards
 * - How it works section
 * - Stats showcase
 * - Call-to-action
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  // 6 Main categories with icons and descriptions
  const categories = [
    {
      id: 'property',
      name: 'Property',
      title: 'Property',
      description: 'Rent homes, rooms & offices',
      icon: '🏠',
      count: 245
    },
    {
      id: 'vehicles',
      name: 'Vehicles',
      title: 'Vehicles',
      description: 'Cars, bikes & more',
      icon: '🚗',
      count: 512
    },
    {
      id: 'electronics',
      name: 'Electronics',
      title: 'Electronics',
      description: 'Laptops, cameras & gadgets',
      icon: '💻',
      count: 334
    },
    {
      id: 'furniture',
      name: 'Furniture',
      title: 'Furniture',
      description: 'Tables, chairs & decor',
      icon: '🛋️',
      count: 178
    },
    {
      id: 'equipment',
      name: 'Equipment',
      title: 'Equipment',
      description: 'Tools, machinery & gear',
      icon: '🔧',
      count: 421
    },
    {
      id: 'events',
      name: 'Events',
      title: 'Events',
      description: 'Venues, spaces & supplies',
      icon: '🎉',
      count: 89
    }
  ];

  const handleSearch = (category, searchValue) => {
    // Navigate to browse page with search parameters
    navigate(`/browse?category=${category}&search=${searchValue}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/browse?category=${category.id || category.name}`);
  };

  return (
    <div className="home-page">
      {/* Modern Hero Section with Search & Categories */}
      <HeroSection 
        onSearch={handleSearch}
        categories={categories}
        onCategoryClick={handleCategoryClick}
        title="Find Your Perfect Rental"
        subtitle="Discover thousands of trusted listings for property, vehicles, equipment, and more"
      />

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Search</h3>
              <p>Browse thousands of items across 8 categories</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Select & Book</h3>
              <p>Choose your item and instant book or request</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Pay Securely</h3>
              <p>Multiple payment options: JazzCash, Easypaisa, Cards</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Enjoy & Return</h3>
              <p>Use the rental and return safely</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stat">
            <h3>1,234+</h3>
            <p>Active Listings</p>
          </div>
          <div className="stat">
            <h3>5,678+</h3>
            <p>Happy Users</p>
          </div>
          <div className="stat">
            <h3>9,012+</h3>
            <p>Successful Rentals</p>
          </div>
          <div className="stat">
            <h3>98%</h3>
            <p>Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Start Renting?</h2>
          <p>Join thousands of renters and earn money by listing your items</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/register')}
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
