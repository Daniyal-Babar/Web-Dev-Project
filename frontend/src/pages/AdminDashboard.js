import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // View mode: 'users' or 'stats'
  const [viewMode, setViewMode] = useState('users');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, searchTerm, filterRole, filterStatus, sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(filterRole && { role: filterRole }),
        ...(filterStatus && { status: filterStatus }),
        sortBy
      });

      const response = await fetch(`${API_URL}/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data || []);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/admin/users/${userId}/listings`);
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this user?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const reason = prompt(`Reason for ${newStatus}ing this user:`);
      
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, reason })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      alert(`User ${newStatus} successfully`);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update user status: ' + err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'admin-dashboard-status-active';
      case 'suspended': return 'admin-dashboard-status-suspended';
      case 'banned': return 'admin-dashboard-status-banned';
      default: return '';
    }
  };

  if (error && !users.length) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-dashboard-view-toggle">
          <button 
            className={viewMode === 'users' ? 'active' : ''}
            onClick={() => setViewMode('users')}
          >
            Users Management
          </button>
          <button 
            className={viewMode === 'stats' ? 'active' : ''}
            onClick={() => setViewMode('stats')}
          >
            Statistics
          </button>
        </div>
      </div>

      {viewMode === 'stats' && stats && (
        <div className="admin-dashboard-stats-container">
          <div className="admin-dashboard-stat-card">
            <h3>Total Users</h3>
            <p className="admin-dashboard-stat-number">{stats.users?.total || 0}</p>
            <div className="admin-dashboard-stat-details">
              <span>Active: {stats.users?.active || 0}</span>
              <span>Suspended: {stats.users?.suspended || 0}</span>
              <span>Banned: {stats.users?.banned || 0}</span>
            </div>
          </div>

          <div className="admin-dashboard-stat-card">
            <h3>Total Listings</h3>
            <p className="admin-dashboard-stat-number">{stats.listings?.total || 0}</p>
            <div className="admin-dashboard-stat-details">
              <span>Active: {stats.listings?.active || 0}</span>
              <span>Inactive: {stats.listings?.inactive || 0}</span>
            </div>
          </div>

          <div className="admin-dashboard-stat-card">
            <h3>Total Bookings</h3>
            <p className="admin-dashboard-stat-number">{stats.bookings?.total || 0}</p>
            <div className="admin-dashboard-stat-details">
              <span>Pending: {stats.bookings?.pending || 0}</span>
              <span>Confirmed: {stats.bookings?.confirmed || 0}</span>
              <span>Completed: {stats.bookings?.completed || 0}</span>
            </div>
          </div>

          <div className="admin-dashboard-stat-card">
            <h3>Total Revenue</h3>
            <p className="admin-dashboard-stat-number">PKR {stats.revenue?.total?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}

      {viewMode === 'users' && (
        <>
          <div className="admin-dashboard-filters-section">
            <form onSubmit={handleSearch} className="admin-dashboard-search-form">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-dashboard-search-input"
              />
              <button type="submit" className="admin-dashboard-search-btn">Search</button>
            </form>

            <div className="admin-dashboard-filter-controls">
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                className="admin-dashboard-filter-select"
              >
                <option value="">All Roles</option>
                <option value="lister">Listers</option>
                <option value="renter">Renters</option>
              </select>

              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="admin-dashboard-filter-select"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>

              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="admin-dashboard-filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="listings">Most Listings</option>
                <option value="earnings">Highest Earnings</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="admin-dashboard-loading">Loading users...</div>
          ) : (
            <>
              <div className="admin-dashboard-users-table-container">
                <table className="admin-dashboard-users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Listings</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="admin-dashboard-user-info">
                            <img 
                              src={user.profileImage || '/default-avatar.png'} 
                              alt={user.firstName}
                              className="admin-dashboard-user-avatar"
                            />
                            <span>{user.firstName} {user.lastName}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber || 'N/A'}</td>
                        <td>
                          <button 
                            className="admin-dashboard-listings-count-btn"
                            onClick={() => handleUserClick(user._id)}
                          >
                            {user.totalListings || 0} listings
                          </button>
                        </td>
                        <td>
                          <span className={`admin-dashboard-status-badge ${getStatusBadgeClass(user.accountStatus)}`}>
                            {user.accountStatus}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="admin-dashboard-action-buttons">
                            <button 
                              className="admin-dashboard-btn-view"
                              onClick={() => handleUserClick(user._id)}
                              title="View user's listings"
                            >
                              View
                            </button>
                            {user.accountStatus === 'active' && (
                              <button 
                                className="admin-dashboard-btn-suspend"
                                onClick={() => handleStatusChange(user._id, 'suspended')}
                              >
                                Suspend
                              </button>
                            )}
                            {user.accountStatus === 'suspended' && (
                              <button 
                                className="admin-dashboard-btn-activate"
                                onClick={() => handleStatusChange(user._id, 'active')}
                              >
                                Activate
                              </button>
                            )}
                            {user.accountStatus !== 'banned' && (
                              <button 
                                className="admin-dashboard-btn-ban"
                                onClick={() => handleStatusChange(user._id, 'banned')}
                              >
                                Ban
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && (
                <div className="admin-dashboard-pagination">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="admin-dashboard-pagination-btn"
                  >
                    Previous
                  </button>
                  <span className="admin-dashboard-pagination-info">
                    Page {pagination.currentPage} of {pagination.totalPages} 
                    ({pagination.totalUsers} total users)
                  </span>
                  <button 
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="admin-dashboard-pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
