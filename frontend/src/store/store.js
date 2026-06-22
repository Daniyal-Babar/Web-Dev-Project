/**
 * Redux Store Configuration
 * 
 * Manages global state for:
 * - Authentication (user, token)
 * - Listings
 * - Bookings
 * - UI state (loading, modals, etc.)
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import listingReducer from './listingSlice';
import bookingReducer from './bookingSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    listings: listingReducer,
    bookings: bookingReducer
  }
});

export default store;
