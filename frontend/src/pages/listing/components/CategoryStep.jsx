/**
 * CategoryStep - Category selection with animated interactive cards
 * Categories: Animals, Vehicles, Houses, Services, Equipment, Clothes
 * Auto-advances to next step on selection
 */

import React from 'react';
import { motion } from 'framer-motion';
import './CategoryStep.css';

// Category definitions with icons
const CATEGORIES = [
  {
    id: 'animals',
    name: 'Animals',
    description: 'Pets, livestock, horses',
    icon: '🐾',
    examples: ['Dogs', 'Cats', 'Horses', 'Birds']
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    description: 'Cars, bikes, trucks',
    icon: '🚗',
    examples: ['Cars', 'Motorcycles', 'Trucks', 'Bicycles']
  },
  {
    id: 'houses',
    name: 'Houses',
    description: 'Homes, apartments, rooms',
    icon: '🏠',
    examples: ['Apartments', 'Houses', 'Rooms', 'Studios']
  },
  {
    id: 'services',
    name: 'Services',
    description: 'Skills, labor, consulting',
    icon: '💼',
    examples: ['Photography', 'Consulting', 'Tutoring', 'Catering']
  },
  {
    id: 'equipment',
    name: 'Equipment',
    description: 'Tools, machines, gear',
    icon: '🔧',
    examples: ['Tools', 'Cameras', 'Machinery', 'Sports Gear']
  },
  {
    id: 'clothes',
    name: 'Clothes',
    description: 'Apparel, costumes, accessories',
    icon: '👔',
    examples: ['Dresses', 'Suits', 'Costumes', 'Accessories']
  }
];

const CategoryStep = ({ formData, updateFormData, errors, onNext }) => {
  /**
   * Handle category selection
   * Auto-advance to next step after selection
   */
  const handleCategorySelect = (categoryId) => {
    updateFormData('category', categoryId);
    
    // Auto-advance after brief delay for visual feedback
    setTimeout(() => {
      onNext();
    }, 300);
  };

  return (
    <div className="category-step">
      <div className="step-header">
        <h2>What are you listing?</h2>
        <p className="step-description">
          Choose the category that best describes your rental item
        </p>
      </div>

      {/* Error message */}
      {errors.category && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
        >
          {errors.category}
        </motion.div>
      )}

      {/* Category grid */}
      <div className="listing-category-grid" role="list">
        {CATEGORIES.map((category, index) => {
          const isSelected = formData.category === category.id;

          return (
            <motion.div
              key={category.id}
              className={`listing-category-card ${isSelected ? 'listing-category-card--selected' : ''}`}
              role="listitem"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.3 
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="button"
                className="listing-category-button"
                onClick={() => handleCategorySelect(category.id)}
                aria-label={`Select ${category.name} category`}
                aria-pressed={isSelected}
              >
                {/* Icon */}
                <motion.div
                  className="listing-category-icon"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {category.icon}
                </motion.div>

                {/* Category info */}
                <h3 className="listing-category-name">{category.name}</h3>
                <p className="listing-category-description">{category.description}</p>

                {/* Examples */}
                <div className="listing-category-examples">
                  {category.examples.slice(0, 2).map((example, i) => (
                    <span key={i} className="listing-example-tag">
                      {example}
                    </span>
                  ))}
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    className="listing-selection-indicator"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    ✓
                  </motion.div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Help text */}
      <div className="step-footer">
        <p className="help-text">
          💡 Not sure which category? Choose the closest match - you can always edit later.
        </p>
      </div>
    </div>
  );
};

export default CategoryStep;
