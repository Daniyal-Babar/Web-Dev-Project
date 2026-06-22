/**
 * Bookings Redux Slice
 * 
 * Manages bookings state:
 * - List of user bookings
 * - Current booking details
 * - Booking status updates
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    // Set bookings
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },

    // Set current booking
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },

    // Add booking
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
    },

    // Update booking status
    updateBookingStatus: (state, action) => {
      const booking = state.bookings.find(b => b._id === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
      }
    },

    // Cancel booking
    cancelBooking: (state, action) => {
      const booking = state.bookings.find(b => b._id === action.payload.id);
      if (booking) {
        booking.status = 'cancelled';
        booking.cancellation = action.payload.cancellation;
      }
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
  setBookings,
  setCurrentBooking,
  addBooking,
  updateBookingStatus,
  cancelBooking,
  setLoading,
  setError
} = bookingSlice.actions;

export default bookingSlice.reducer;
