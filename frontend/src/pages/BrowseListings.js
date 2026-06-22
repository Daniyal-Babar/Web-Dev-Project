/**
 * Browse Listings Page Component
 * 
 * Features:
 * - Filter by category, price, location
 * - Search functionality
 * - Sort options (newest, popular, price)
 * - Pagination
 * - Map view showing rental locations
 * - Responsive filter panel (desktop sidebar / mobile sheet)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FilterPanel, useFilters } from '../components/filters';
import ListingCard from '../components/ListingCard';
import MapView from '../components/MapView';
import '../components/filters/filters.css';
import './BrowseListings.css';
import { Grid, Map, ArrowLeft } from 'lucide-react';

const BrowseListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or map
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);
  
  // Use filters hook
  const {
    filters,
    updateFilters,
    resetFilters
  } = useFilters();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  /**
   * Fetch listings based on filters
   */
  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/listings', {
        params: {
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        }
      });

      setListings(response.data.listings);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  /**
   * Handle filter changes (desktop instant apply)
   */
  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  /**
   * Handle mobile apply filters
   */
  const handleApplyFilters = (newFilters) => {
    updateFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  /**
   * Handle filter reset
   */
  const handleResetFilters = () => {
    resetFilters();
    setPagination({ ...pagination, page: 1 });
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (sortBy) => {
    updateFilters({ sortBy });
    setPagination({ ...pagination, page: 1 });
    setIsSortDropdownOpen(false);
  };

  // Sort options configuration
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' }
  ];

  const selectedSortLabel = sortOptions.find(opt => opt.value === filters.sortBy)?.label || 'Newest First';

  return (
    <div className="browse-page">
      <div className="container">
        <div className="browse-header">
          {/* Back Button */}
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
            {!isMobile && <span>Back</span>}
          </button>

          <h1>Browse Rentals</h1>
          
          <div className="browse-actions">
            {/* Mobile filter trigger */}
            {isMobile && (
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                isMobile={true}
              />
            )}
            
            {/* View toggle */}
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid size={18} />
                {!isMobile && <span>Grid</span>}
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
                aria-label="Map view"
              >
                <Map size={18} />
                {!isMobile && <span>Map</span>}
              </button>
            </div>
          </div>
        </div>

        <div className="browse-content">
          {/* Desktop Filter Sidebar */}
          {!isMobile && (
            <aside className="filters-sidebar">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                isMobile={false}
              />
            </aside>
          )}

          {/* Main Content */}
          <div className="browse-main">
            {/* Sort Bar */}
            <div className="sort-bar">
              <span>Showing {listings.length} of {pagination.total} results</span>
              {isMobile ? (
                // Custom dropdown for mobile
                <div className="sort-dropdown" ref={sortDropdownRef}>
                  <button
                    type="button"
                    className="sort-dropdown__button"
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    aria-label="Select sort option"
                    aria-expanded={isSortDropdownOpen}
                  >
                    <span>{selectedSortLabel}</span>
                    <span className="sort-dropdown__arrow">▼</span>
                  </button>
                  {isSortDropdownOpen && (
                    <div className="sort-dropdown__menu">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`sort-dropdown__item ${filters.sortBy === option.value ? 'active' : ''}`}
                          onClick={() => handleSortChange(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Native select for desktop
                <select 
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Listings Grid or Map */}
            {loading ? (
              <div className="loading">Loading listings...</div>
            ) : viewMode === 'grid' ? (
              <div className="listings-grid">
                {listings.length > 0 ? (
                  listings.map(listing => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))
                ) : (
                  <div className="no-results">
                    <p>No listings found matching your criteria</p>
                  </div>
                )}
              </div>
            ) : (
              <MapView listings={listings} />
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button 
                  disabled={pagination.page === 1}
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button 
                    key={i + 1}
                    className={pagination.page === i + 1 ? 'active' : ''}
                    onClick={() => setPagination({ ...pagination, page: i + 1 })}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseListings;
