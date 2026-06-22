/**
 * Auth Redux Slice
 * 
 * Manages authentication state:
 * - Current user
 * - JWT token
 * - Login/logout actions
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login action - expects { user, token }
    login: (state, action) => {
      state.user = action.payload.user || action.payload;
      state.token = action.payload.token || localStorage.getItem('token');
      state.isLoading = false;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(state.user));
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
    },

    // Set token separately (for cases where token is set before login action)
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },

    // Logout action
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },

    // Update user profile
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },

    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { login, logout, updateProfile, setLoading, setError, setToken } = authSlice.actions;
export default authSlice.reducer;
