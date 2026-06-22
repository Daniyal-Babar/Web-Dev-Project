/**
 * Earnings Dashboard - Complete Responsive UI
 * 
 * Features:
 * - Dashboard header with actions
 * - Wallet/Payout summary card
 * - Statistics cards (4 metrics)
 * - Earnings chart (7 days)
 * - Recent bookings & payouts
 * - Mobile-first responsive design
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import apiClient from '../services/api';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import WalletCard from '../components/dashboard/WalletCard';
import StatCard from '../components/dashboard/StatCard';
import EarningsChart from '../components/dashboard/EarningsChart';
import RecentBookings from '../components/dashboard/RecentBookings';
import RecentPayouts from '../components/dashboard/RecentPayouts';
import './EarningsDashboard.css';

const EarningsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalListings: 0,
    totalBookings: 0,
    averagePerBooking: 0,
    availableBalance: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Easypaisa account from user profile
  const [easypaisaAccount, setEasypaisaAccount] = useState('');
  const [easypaisaVerified, setEasypaisaVerified] = useState(false);
  
  // Mock data for charts and activity
  const [chartData, setChartData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentPayouts, setRecentPayouts] = useState([]);

  // Modals (for Easypaisa editing - keeping existing functionality)
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempEasypaisaAccount, setTempEasypaisaAccount] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch wallet data
      const walletResponse = await apiClient.get('/api/wallet/balance');
      const walletData = walletResponse.data.wallet || {};
      
      // Fetch listings count
      const listingsResponse = await apiClient.get('/api/listings/my-listings?limit=1');
      const totalListings = listingsResponse.data.pagination?.total || 0;

      // Fetch statistics for bookings
      const statsResponse = await apiClient.get('/api/wallet/statistics');
      const statsData = statsResponse.data.statistics || {};

      setStats({
        totalRevenue: walletData.totalEarnings || 0,
        totalListings,
        totalBookings: statsData.totalBookings || 0,
        averagePerBooking: statsData.averageEarningPerBooking || 0,
        availableBalance: walletData.availableBalance || 0
      });

      // Set Easypaisa account info
      if (walletData.easypaisaAccount) {
        setEasypaisaAccount(walletData.easypaisaAccount);
        setEasypaisaVerified(walletData.easypaisaVerified || false);
      }

      // Generate mock chart data (last 7 days)
      const mockChartData = generateMockChartData(walletData.totalEarnings || 0);
      setChartData(mockChartData);

      // Generate mock recent bookings
      const mockBookings = generateMockBookings();
      setRecentBookings(mockBookings);

      // Generate mock recent payouts
      const mockPayouts = generateMockPayouts();
      setRecentPayouts(mockPayouts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data helpers
  const generateMockChartData = (totalRevenue) => {
    const today = new Date();
    const data = [];
    const dailyAverage = totalRevenue / 7;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Random variation around average
      const earnings = Math.max(0, Math.floor(dailyAverage * (0.5 + Math.random())));
      
      data.push({
        date: dateStr,
        earnings
      });
    }
    
    return data;
  };

  const generateMockBookings = () => {
    if (stats.totalBookings === 0) return [];
    
    return [
      {
        itemName: 'Canon EOS Camera',
        status: 'active',
        startDate: '2026-01-05',
        endDate: '2026-01-12',
        amount: 15000
      },
      {
        itemName: 'Mountain Bike',
        status: 'confirmed',
        startDate: '2026-01-08',
        endDate: '2026-01-10',
        amount: 5000
      },
      {
        itemName: 'Camping Tent',
        status: 'completed',
        startDate: '2025-12-28',
        endDate: '2026-01-02',
        amount: 8000
      }
    ].slice(0, Math.min(3, stats.totalBookings));
  };

  const generateMockPayouts = () => {
    if (stats.totalRevenue === 0) return [];
    
    return [
      {
        description: 'Weekly Payout',
        date: '2026-01-03',
        amount: 12000,
        status: 'completed'
      },
      {
        description: 'Booking Settlement',
        date: '2025-12-28',
        amount: 8500,
        status: 'pending'
      }
    ];
  };

  const handleEditEasypaisa = () => {
    setTempEasypaisaAccount('');
    setShowAccountModal(true);
  };

  const handleWithdraw = () => {
    if (!easypaisaAccount || !easypaisaVerified) {
      alert('Please add and verify your Easypaisa account first');
      return;
    }
    if (stats.availableBalance === 0) {
      alert('No funds available for withdrawal');
      return;
    }
    alert(`Withdrawal request submitted for Rs ${stats.availableBalance.toLocaleString()}`);
  };

  const handleSendOtp = async () => {
    // Validate Easypaisa account number
    if (!/^03\d{9}$/.test(tempEasypaisaAccount)) {
      alert('Invalid Easypaisa account number. Format: 03XXXXXXXXX (11 digits)');
      return;
    }

    setSendingOtp(true);
    try {
      const response = await apiClient.post('/api/wallet/send-easypaisa-otp', {
        easypaisaAccount: tempEasypaisaAccount
      });

      if (response.data.success) {
        alert('OTP sent to your Easypaisa account');
        setShowAccountModal(false);
        setShowOtpModal(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await apiClient.post('/api/wallet/verify-easypaisa-otp', {
        easypaisaAccount: tempEasypaisaAccount,
        otp: otp
      });

      if (response.data.success) {
        alert('Easypaisa account verified and saved successfully!');
        setEasypaisaAccount(tempEasypaisaAccount);
        setEasypaisaVerified(true);
        setShowOtpModal(false);
        setOtp('');
        setTempEasypaisaAccount('');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) {
    return (
      <div className="earnings-dashboard">
        <div className="earnings-dashboard__container">
          <div className="earnings-dashboard__loading">
            <div className="earnings-dashboard__spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="earnings-dashboard">
      <div className="earnings-dashboard__container">
        {/* Header */}
        <DashboardHeader 
          onEditEasypaisa={handleEditEasypaisa}
          onWithdraw={handleWithdraw}
        />

        {/* Statistics Cards Grid */}
        <div className="earnings-dashboard__stats-grid">
          <StatCard 
            icon="💰"
            value={`Rs ${stats.totalRevenue.toLocaleString()}`}
            label="Total Revenue"
            subtext="From renting out items"
          />
          <StatCard 
            icon="📦"
            value={stats.totalListings}
            label="Total Listings"
            subtext="Items available for rent"
          />
          <StatCard 
            icon="📅"
            value={stats.totalBookings}
            label="Total Bookings"
            subtext="Completed bookings"
          />
          <StatCard 
            icon="📊"
            value={`Rs ${Math.round(stats.averagePerBooking).toLocaleString()}`}
            label="Average per Booking"
            subtext="Average earnings"
          />
        </div>

        {/* Earnings Chart */}
        <EarningsChart data={chartData} />

        {/* Recent Activity Section */}
        <div className="earnings-dashboard__activity-grid">
          <RecentBookings bookings={recentBookings} />
          <RecentPayouts payouts={recentPayouts} />
        </div>

        {/* Easypaisa Account Modal */}
        {showAccountModal && (
          <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Easypaisa Account</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowAccountModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <label>
                  Easypaisa Number
                  <input 
                    type="text"
                    placeholder="03XXXXXXXXX"
                    value={tempEasypaisaAccount}
                    onChange={(e) => setTempEasypaisaAccount(e.target.value)}
                    maxLength={11}
                  />
                </label>
                <p className="modal-hint">
                  Format: 03XXXXXXXXX (11 digits)
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowAccountModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                >
                  {sendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div className="modal-overlay" onClick={() => setShowOtpModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Verify OTP</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowOtpModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p className="modal-info">
                  Enter the 6-digit OTP sent to {tempEasypaisaAccount}
                </p>
                <label>
                  OTP Code
                  <input 
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                  />
                </label>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp}
                >
                  {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsDashboard;
