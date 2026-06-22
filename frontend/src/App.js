/**
 * Main App Component
 * 
 * Routes configuration for the rental marketplace frontend
 * - Public routes: Home, Browse, Login, Register
 * - Protected routes: Create Listing, Bookings, Profile
 * - Admin routes: Dashboard, User Listings Management
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout
import Navbar from './components/navigation/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import BrowseListings from './pages/BrowseListings';
import ListingDetail from './pages/ListingDetail';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CreateListingPage from './pages/listing/CreateListingPage'; // Updated to use new listing wizard
import MyBookings from './pages/MyBookings';
import MyListings from './pages/MyListings';
import MyProfile from './pages/MyProfile';
import NotFoundPage from './pages/NotFoundPage';

// Payment Pages
import CheckoutPageNew from './pages/CheckoutPageNew';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import EarningsDashboard from './pages/EarningsDashboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUserListings from './pages/AdminUserListings';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowseListings />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route 
              path="/create-listing" 
              element={
                // <ProtectedRoute>
                  <CreateListingPage />
                // </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-bookings" 
              element={
                // <ProtectedRoute>
                  <MyBookings />
                // </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-listings" 
              element={
                // <ProtectedRoute>
                  <MyListings />
                // </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                // <ProtectedRoute>
                  <MyProfile />
                // </ProtectedRoute>
              } 
            />

            {/* Payment Routes */}
            <Route 
              path="/checkout/:bookingId" 
              element={
                // <ProtectedRoute>
                  <CheckoutPageNew />
                // </ProtectedRoute>
              } 
            />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route 
              path="/earnings" 
              element={
                // <ProtectedRoute>
                  <EarningsDashboard />
                // </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                // <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                // </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users/:userId/listings" 
              element={
                // <ProtectedRoute adminOnly={true}>
                  <AdminUserListings />
                // </ProtectedRoute>
              } 
            />

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
