/**
 * Listings Redux Slice
 * 
 * Manages listings state:
 * - List of all listings
 * - Single listing details
 * - User's own listings
 * - CRUD operations
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  listings: [],
  currentListing: null,
  userListings: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
};

const listingSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    // Set listings list
    setListings: (state, action) => {
      state.listings = action.payload.listings;
      state.pagination = action.payload.pagination;
    },

    // Set current listing details
    setCurrentListing: (state, action) => {
      state.currentListing = action.payload;
    },

    // Add new listing
    addListing: (state, action) => {
      state.userListings.push(action.payload);
    },

    // Update listing
    updateListing: (state, action) => {
      const index = state.listings.findIndex(l => l._id === action.payload._id);
      if (index !== -1) {
        state.listings[index] = action.payload;
      }
    },

    // Delete listing
    deleteListing: (state, action) => {
      state.listings = state.listings.filter(l => l._id !== action.payload);
      state.userListings = state.userListings.filter(l => l._id !== action.payload);
    },

    // Set user listings
    setUserListings: (state, action) => {
      state.userListings = action.payload;
    },

    // Set loading
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  setListings,
  setCurrentListing,
  addListing,
  updateListing,
  deleteListing,
  setUserListings,
  setLoading,
  setError
} = listingSlice.actions;

export default listingSlice.reducer;
