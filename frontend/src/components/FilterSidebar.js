import React from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="filter-sidebar">
      <h3>Filters</h3>
      <label>
        Category
        <input name="category" value={filters.category} onChange={handleChange} />
      </label>
      <label>
        City
        <input name="city" value={filters.city} onChange={handleChange} />
      </label>
      <label>
        Min Price
        <input name="priceMin" value={filters.priceMin} onChange={handleChange} />
      </label>
      <label>
        Max Price
        <input name="priceMax" value={filters.priceMax} onChange={handleChange} />
      </label>
      <label>
        Search
        <input name="search" value={filters.search} onChange={handleChange} />
      </label>
    </div>
  );
};

export default FilterSidebar;
