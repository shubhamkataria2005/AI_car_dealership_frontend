import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AdminDashboard = ({ user, sessionToken, onNavigate, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = sessionToken || localStorage.getItem('token');
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  console.log('AdminDashboard - User:', user);
  console.log('AdminDashboard - Token:', token);
  console.log('AdminDashboard - isAdmin:', isAdmin);

  useEffect(() => {
    if (!user || !isAdmin) {
      console.log('Not admin, redirecting to dashboard');
      onNavigate('dashboard');
    }
  }, [user, isAdmin, onNavigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [activeTab, user]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching data for tab:', activeTab);
      
      if (activeTab === 'dashboard') {
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        console.log('Stats response:', data);
        if (data.success) {
          setStats(data);
        } else {
          setError(data.message || 'Failed to load stats');
        }
      } else if (activeTab === 'users') {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        console.log('Users response:', data);
        if (data.success) {
          setUsers(data.users);
        } else {
          setError(data.message || 'Failed to load users');
        }
      } else if (activeTab === 'cars') {
        const response = await fetch(`${API_BASE_URL}/api/admin/cars`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        console.log('Cars response:', data);
        if (data.success) {
          setCars(data.cars);
        } else {
          setError(data.message || 'Failed to load cars');
        }
      } else if (activeTab === 'messages') {
        const response = await fetch(`${API_BASE_URL}/api/admin/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        console.log('Messages response:', data);
        if (data.success) {
          setMessages(data.messages);
        } else {
          setError(data.message || 'Failed to load messages');
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
        alert('User role updated successfully');
      } else {
        alert(data.message || 'Failed to update user role');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Network error. Please try again.');
    }
  };

  const deleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This will also delete all their listings.`)) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
        alert('User deleted successfully');
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Network error. Please try again.');
    }
  };

  const updateCarStatus = async (carId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/cars/${carId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
        alert('Car status updated successfully');
      } else {
        alert(data.message || 'Failed to update car status');
      }
    } catch (err) {
      console.error('Error updating car status:', err);
      alert('Network error. Please try again.');
    }
  };

  const deleteCar = async (carId, carName) => {
    if (!confirm(`Are you sure you want to delete "${carName}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/cars/${carId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
        alert('Car deleted successfully');
      } else {
        alert(data.message || 'Failed to delete car');
      }
    } catch (err) {
      console.error('Error deleting car:', err);
      alert('Network error. Please try again.');
    }
  };

  const renderDashboard = () => {
    if (!stats) return <div className="admin-loading">No data available</div>;
    
    return (
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers || 0}</p>
            <div className="stat-breakdown">
              <span>👤 {stats.regularUsers || 0} Users</span>
              <span>👔 {stats.admins || 0} Admins</span>
              <span>👑 {stats.superAdmins || 0} Super Admins</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-info">
            <h3>Total Cars</h3>
            <p className="stat-number">{stats.totalCars || 0}</p>
            <div className="stat-breakdown">
              <span>✅ {stats.availableCars || 0} Available</span>
              <span>💰 {stats.soldCars || 0} Sold</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <h3>Total Messages</h3>
            <p className="stat-number">{stats.totalMessages || 0}</p>
          </div>
        </div>
        
        <div className="stat-card full-width">
          <h3>📊 Recent Users</h3>
          <div className="recent-list">
            {stats.recentUsers?.length > 0 ? stats.recentUsers.map(userItem => (
              <div key={userItem.id} className="recent-item">
                <span>{userItem.username}</span>
                <span className={`role-badge role-${userItem.role?.toLowerCase()}`}>
                  {userItem.role}
                </span>
                <span>{userItem.email}</span>
              </div>
            )) : <div>No recent users</div>}
          </div>
        </div>
        
        <div className="stat-card full-width">
          <h3>🚗 Recent Car Listings</h3>
          <div className="recent-list">
            {stats.recentCars?.length > 0 ? stats.recentCars.map(car => (
              <div key={car.id} className="recent-item">
                <span>{car.year} {car.make} {car.model}</span>
                <span className="price-badge">${car.price?.toLocaleString()}</span>
                <span className={`status-badge status-${car.status?.toLowerCase()}`}>
                  {car.status}
                </span>
              </div>
            )) : <div>No recent cars</div>}
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? users.map(userItem => (
            <tr key={userItem.id}>
              <td>{userItem.id}</td>
              <td>{userItem.username}</td>
              <td>{userItem.email}</td>
              <td>
                {isSuperAdmin ? (
                  <select 
                    value={userItem.role} 
                    onChange={(e) => updateUserRole(userItem.id, e.target.value)}
                    className="role-select"
                    disabled={userItem.id === user?.id}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                ) : (
                  <span className={`role-badge role-${userItem.role?.toLowerCase()}`}>
                    {userItem.role}
                  </span>
                )}
              </td>
              <td>
                {((isSuperAdmin && userItem.role !== 'SUPER_ADMIN') || 
                  (isAdmin && userItem.role === 'USER')) && userItem.id !== user?.id && (
                  <button 
                    className="delete-btn"
                    onClick={() => deleteUser(userItem.id, userItem.username)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCars = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Car</th>
            <th>Year</th>
            <th>Price</th>
            <th>Seller</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cars.length > 0 ? cars.map(car => (
            <tr key={car.id}>
              <td>{car.id}</td>
              <td>{car.make} {car.model}</td>
              <td>{car.year}</td>
              <td>${car.price?.toLocaleString()}</td>
              <td>{car.sellerName}</td>
              <td>
                <select 
                  value={car.status} 
                  onChange={(e) => updateCarStatus(car.id, e.target.value)}
                  className={`status-select`}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="SOLD">Sold</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </td>
              <td>
                <button 
                  className="delete-btn"
                  onClick={() => deleteCar(car.id, `${car.make} ${car.model}`)}
                >
                  Delete
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>No cars found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderMessages = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>From</th>
            <th>To</th>
            <th>Car ID</th>
            <th>Message</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {messages.length > 0 ? messages.map(msg => (
            <tr key={msg.id}>
              <td>{msg.id}</td>
              <td>{msg.senderName} (ID: {msg.senderId})</td>
              <td>{msg.receiverName} (ID: {msg.receiverId})</td>
              <td>{msg.carId || 'N/A'}</td>
              <td className="message-preview">{msg.content?.substring(0, 100)}...</td>
              <td>{new Date(msg.createdAt).toLocaleString()}</td>
              <td>
                <span className={`status-badge ${msg.isRead ? 'read' : 'unread'}`}>
                  {msg.isRead ? 'Read' : 'Unread'}
                </span>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>No messages found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo" onClick={() => onNavigate('home')}>
          🚗 Admin Panel
        </div>
        
        <div className="admin-user-info">
          <div className="admin-avatar">{user.username?.charAt(0).toUpperCase()}</div>
          <div className="admin-user-details">
            <strong>{user.username}</strong>
            <span className={`role-badge role-${user.role?.toLowerCase()}`}>
              {user.role}
            </span>
          </div>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`admin-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`admin-nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button 
            className={`admin-nav-link ${activeTab === 'cars' ? 'active' : ''}`}
            onClick={() => setActiveTab('cars')}
          >
            🚗 Cars
          </button>
          <button 
            className={`admin-nav-link ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            💬 Messages
          </button>
        </nav>
        
        <button className="admin-logout" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
      
      <div className="admin-main">
        <div className="admin-header">
          <h2>Admin Control Panel</h2>
          <button className="back-to-site" onClick={() => onNavigate('dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
        
        {error && <div className="admin-error">{error}</div>}
        
        {loading ? (
          <div className="admin-loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'cars' && renderCars()}
            {activeTab === 'messages' && renderMessages()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;