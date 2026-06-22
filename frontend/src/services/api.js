/**
 * API Service Module
 * 
 * Centralized API calls for:
 * - Authentication
 * - Users
 * - Listings
 * - Bookings
 * - Payments
 * - Reviews
 * 
 * Handles:
 * - Request/Response formatting
 * - Error handling
 * - Token management
 */

import axios from 'axios';

// Normalize API base URL - ensure it doesn't end with /api since endpoints include it
let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// Remove trailing /api if present, since all endpoints already include /api
if (API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.slice(0, -4);
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request Details:');
    console.log('  - Method:', config.method.toUpperCase());
    console.log('  - BaseURL:', config.baseURL);
    console.log('  - URL:', config.url);
    console.log('  - Full URL:', config.baseURL + config.url);
    console.log('  - Has Auth Token:', !!token);
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 - Token expired
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * ==================== AUTH API ====================
 */

export const authAPI = {
  // Register new user
  register: (userData) => apiClient.post('/api/auth/register', userData),

  // Login user
  login: (credentials) => apiClient.post('/api/auth/login', credentials),

  // Verify email
  verifyEmail: () => apiClient.post('/api/auth/verify-email'),

  // Verify phone
  verifyPhone: () => apiClient.post('/api/auth/verify-phone')
};

/**
 * ==================== USER API ====================
 */

export const userAPI = {
  // Get user profile by ID
  getProfile: (userId) => userId ? apiClient.get(`/api/users/${userId}`) : apiClient.get('/api/users/me/profile'),

  // Get current user profile (alias for clarity)
  getCurrentProfile: () => apiClient.get('/api/users/me/profile'),

  // Update profile
  updateProfile: (userId, data) => apiClient.put(`/api/users/${userId}`, data),

  // Subscribe to paid plan
  subscribePlan: (userId, data) => apiClient.post(`/api/users/${userId}/subscribe`, data)
};

/**
 * ==================== LISTINGS API ====================
 */

export const listingAPI = {
  // Get all listings with filters
  getListings: (params) => apiClient.get('/api/listings', { params }),

  // Get listing details
  getListingById: (id) => apiClient.get(`/api/listings/${id}`),

  // Get current user's listings
  getMyListings: (params) => apiClient.get('/api/listings/my-listings', { params }),

  // Create listing
  createListing: (data) => apiClient.post('/api/listings', data),

  // Update listing
  updateListing: (id, data) => apiClient.put(`/api/listings/${id}`, data),

  // Delete listing
  deleteListing: (id) => apiClient.delete(`/api/listings/${id}`)
};

/**
 * ==================== BOOKINGS API ====================
 */

export const bookingAPI = {
  // Get booking details
  getBooking: (id) => apiClient.get(`/api/bookings/${id}`),

  // Get user's bookings
  getUserBookings: (params) => apiClient.get('/api/bookings/user/my-bookings', { params }),

  // Create booking
  createBooking: (data) => apiClient.post('/api/bookings', data),

  // Confirm booking
  confirmBooking: (id) => apiClient.put(`/api/bookings/${id}/confirm`),

  // Cancel booking
  cancelBooking: (id, data) => apiClient.put(`/api/bookings/${id}/cancel`, data),

  // Initiate payment for booking
  initiatePayment: (bookingId) => apiClient.post('/api/payments/initiate', { bookingId })
};

/**
 * ==================== REVIEWS API ====================
 */

export const reviewAPI = {
  // Get listing reviews
  getListingReviews: (listingId, params) => 
    apiClient.get(`/api/reviews/listing/${listingId}`, { params }),

  // Get user reviews
  getUserReviews: (userId) => apiClient.get(`/api/reviews/user/${userId}`),

  // Create review
  createReview: (data) => apiClient.post('/api/reviews', data),

  // Add owner response
  addResponse: (reviewId, data) => apiClient.post(`/api/reviews/${reviewId}/response`, data)
};

export default apiClient;
