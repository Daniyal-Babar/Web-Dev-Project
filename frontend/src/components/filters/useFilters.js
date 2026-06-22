/**
 * useFilters Hook
 * 
 * Shared filter state logic
 * Manages all filter state and provides utilities
 */

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const useFilters = (initialFilters = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || initialFilters.category || '',
    city: searchParams.get('city') || initialFilters.city || '',
    priceMin: searchParams.get('priceMin') || initialFilters.priceMin || '',
    priceMax: searchParams.get('priceMax') || initialFilters.priceMax || '',
    search: searchParams.get('search') || initialFilters.search || '',
    sortBy: searchParams.get('sortBy') || initialFilters.sortBy || 'newest'
  });

  // Track which filters are active
  const activeFilters = useMemo(() => {
    const active = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'sortBy') {
        active[key] = value;
      }
    });
    return active;
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.keys(activeFilters).length;
  }, [activeFilters]);

  // Update a single filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Update URL params
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      setSearchParams(params);
      
      return newFilters;
    });
  }, [setSearchParams]);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => {
      const merged = { ...prev, ...newFilters };
      
      // Update URL params
      const params = new URLSearchParams();
      Object.entries(merged).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      setSearchParams(params);
      
      return merged;
    });
  }, [setSearchParams]);

  // Remove a single filter
  const removeFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: '' };
      
      // Update URL params
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      setSearchParams(params);
      
      return newFilters;
    });
  }, [setSearchParams]);

  // Reset all filters except sortBy
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      category: '',
      city: '',
      priceMin: '',
      priceMax: '',
      search: '',
      sortBy: filters.sortBy
    };
    
    setFilters(defaultFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    if (defaultFilters.sortBy) params.set('sortBy', defaultFilters.sortBy);
    setSearchParams(params);
  }, [filters.sortBy, setSearchParams]);

  // Check if filters have changed from initial state
  const hasChanges = useMemo(() => {
    return activeFilterCount > 0;
  }, [activeFilterCount]);

  return {
    filters,
    activeFilters,
    activeFilterCount,
    hasChanges,
    updateFilter,
    updateFilters,
    removeFilter,
    resetFilters
  };
};

export default useFilters;
