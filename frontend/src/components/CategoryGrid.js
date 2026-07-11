import React from 'react';
import CategoryCard from './CategoryCard';
import './categories.css';

const CategoryGrid = ({ categories = [], onCategoryClick }) => {
  // Default categories with icons if none provided
  const defaultCategories = [
    {
      id: 'property',
      icon: '🏠',
      title: 'Property',
      description: 'Rent homes, rooms & offices'
    },
    {
      id: 'vehicles',
      icon: '🚗',
      title: 'Vehicles',
      description: 'Cars, bikes & more'
    },
    {
      id: 'electronics',
      icon: '💻',
      title: 'Electronics',
      description: 'Laptops, cameras & gadgets'
    },
    {
      id: 'furniture',
      icon: '🛋️',
      title: 'Furniture',
      description: 'Tables, chairs & decor'
    },
    {
      id: 'equipment',
      icon: '🔧',
      title: 'Equipment',
      description: 'Tools, machinery & gear'
    },
    {
      id: 'events',
      icon: '🎉',
      title: 'Events',
      description: 'Venues, spaces & supplies'
    }
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  const handleCategoryClick = (category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  return (
    <div className="category-grid">
      <div className="category-grid__container">
        {displayCategories.map((category) => (
          <CategoryCard
            key={category.id || category.name}
            icon={category.icon || '📦'}
            title={category.title || category.name}
            description={category.description || `Browse ${category.name}`}
            count={category.count}
            onClick={() => handleCategoryClick(category)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
