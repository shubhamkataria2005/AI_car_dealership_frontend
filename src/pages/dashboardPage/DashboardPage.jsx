// src/pages/dashboardPage/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import ChatAssistant    from '../../components/tools/ChatAssistant';
import CarRecognizer    from '../../components/tools/CarRecognizer';
import FinanceCalculator from '../../components/tools/FinanceCalculator';
import MessagesInbox    from '../../components/messaging/MessagesInbox';
import ServiceCenter    from '../../components/service/ServiceCenter';
import TradeInCalculator from '../../components/tools/TradeInCalculator';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Dashboard = ({ user, sessionToken, onLogout, onNavigate }) => {
  const [activeTool,       setActiveTool]       = useState('chat');
  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);
  const [showListCarForm,  setShowListCarForm]  = useState(false);
  const [showDealershipForm, setShowDealershipForm] = useState(false);
  const [unreadCount,      setUnreadCount]      = useState(0);

  const [carFormData,   setCarFormData]   = useState({
    make: '', model: '', year: new Date().getFullYear(),
    price: '', mileage: '', fuel: 'Petrol',
    transmission: 'Automatic', bodyType: 'Sedan',
    description: '', imageUrl: ''
  });
  const [listingStatus, setListingStatus] = useState('');

  const token = sessionToken || localStorage.getItem('token');
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSalesEmployee = user?.role === 'SALES_EMPLOYEE' || user?.isEmployee || isAdmin;

  useEffect(() => {
    console.log('Dashboard loaded with user:', user);
    console.log('Is Sales Employee:', isSalesEmployee);
    console.log('User role:', user?.role);
    if (!user && !token) {
      console.log('No user found, redirecting to login');
      onNavigate('login');
    }
  }, [user, token, onNavigate]);

  useEffect(() => {
    if (user && token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const fetchUnreadCount = async () => {
    try {
      const res  = await fetch(`${API_BASE_URL}/api/messages/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.count !== undefined) setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const tools = [
    { id: 'messages',   label: 'Messages',           icon: '✉️',  desc: 'Inbox & conversations' },
    { id: 'service',    label: 'Service Center',     icon: '🔧',  desc: 'Book test drives & service' },
    { id: 'tradein',    label: 'Trade-In',           icon: '🔄',  desc: 'Trade your car for a new one' },
    { id: 'chat',       label: 'AI Assistant',       icon: '💬',  desc: 'Chat about cars & buying' },
    { id: 'recognizer', label: 'Car Recognizer',     icon: '🔍',  desc: 'Identify car brand from photo' },
    { id: 'finance',    label: 'Finance Calculator', icon: '💰',  desc: 'Estimate monthly payments' },
  ];

  const handleToolClick = (id) => {
    setActiveTool(id);
    setShowListCarForm(false);
    setShowDealershipForm(false);
    setMobileMenuOpen(false);
    if (id === 'messages') setUnreadCount(0);
  };

  const handleCarFormChange = e =>
    setCarFormData({ ...carFormData, [e.target.name]: e.target.value });

  const handleListCar = async (e) => {
    e.preventDefault();
    setListingStatus('loading');
    try {
      const res = await fetch(`${API_BASE_URL}/api/cars/list`, {
        method:  'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body:    JSON.stringify({
          ...carFormData,
          price:    parseFloat(carFormData.price),
          mileage:  parseInt(carFormData.mileage),
          year:     parseInt(carFormData.year)
        })
      });
      const data = await res.json();
      if (data.success) {
        setListingStatus('success');
        setCarFormData({
          make: '', model: '', year: new Date().getFullYear(),
          price: '', mileage: '', fuel: 'Petrol',
          transmission: 'Automatic', bodyType: 'Sedan',
          description: '', imageUrl: ''
        });
        setTimeout(() => { 
          setListingStatus(''); 
          setShowListCarForm(false); 
        }, 2000);
      } else {
        setListingStatus('error');
        setTimeout(() => setListingStatus(''), 3000);
      }
    } catch (err) {
      console.error('Error listing car:', err);
      setListingStatus('error');
      setTimeout(() => setListingStatus(''), 3000);
    }
  };

  const handleAddDealershipCar = async (e) => {
    e.preventDefault();
    setListingStatus('loading');
    try {
      const res = await fetch(`${API_BASE_URL}/api/cars/dealership/add`, {
        method:  'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body:    JSON.stringify({
          ...carFormData,
          price:    parseFloat(carFormData.price),
          mileage:  parseInt(carFormData.mileage),
          year:     parseInt(carFormData.year)
        })
      });
      const data = await res.json();
      if (data.success) {
        setListingStatus('success');
        setCarFormData({
          make: '', model: '', year: new Date().getFullYear(),
          price: '', mileage: '', fuel: 'Petrol',
          transmission: 'Automatic', bodyType: 'Sedan',
          description: '', imageUrl: ''
        });
        setTimeout(() => { 
          setListingStatus(''); 
          setShowDealershipForm(false); 
        }, 2000);
      } else {
        setListingStatus('error');
        setTimeout(() => setListingStatus(''), 3000);
      }
    } catch (err) {
      console.error('Error adding dealership car:', err);
      setListingStatus('error');
      setTimeout(() => setListingStatus(''), 3000);
    }
  };

  const renderTool = () => {
    if (showListCarForm) return renderListCarForm(false);
    if (showDealershipForm) return renderListCarForm(true);
    switch (activeTool) {
      case 'messages':   return <MessagesInbox user={user} sessionToken={token} />;
      case 'service':    return <ServiceCenter user={user} sessionToken={token} />;
      case 'tradein':    return <TradeInCalculator user={user} sessionToken={token} />;
      case 'chat':       return <ChatAssistant user={user} sessionToken={token} />;
      case 'recognizer': return <CarRecognizer sessionToken={token} />;
      case 'finance':    return <FinanceCalculator />;
      default:           return <ChatAssistant user={user} sessionToken={token} />;
    }
  };

  const renderListCarForm = (isDealership = false) => (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>{isDealership ? '🏢 Add Dealership Car' : '📝 List Your Car for Sale'}</h2>
        <p>{isDealership ? 'Add a company-owned car to dealership inventory' : 'Fill in the details below to list your car on our marketplace'}</p>
      </div>
      <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        {listingStatus === 'success' && (
          <div style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
            <strong>✅ {isDealership ? 'Dealership Car Added Successfully!' : 'Car Listed Successfully!'}</strong>
          </div>
        )}
        {listingStatus === 'error' && (
          <div style={{ marginBottom: '20px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
            ❌ Failed to {isDealership ? 'add dealership car' : 'list car'}. Please try again.
          </div>
        )}
        <form onSubmit={isDealership ? handleAddDealershipCar : handleListCar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>Make *</label>
              <input type="text" name="make" value={carFormData.make} onChange={handleCarFormChange}
                placeholder="e.g., Toyota" required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--cream)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>Model *</label>
              <input type="text" name="model" value={carFormData.model} onChange={handleCarFormChange}
                placeholder="e.g., Camry" required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--cream)' }} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>Year *</label>
              <input type="number" name="year" value={carFormData.year} onChange={handleCarFormChange}
                placeholder="2023" required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--cream)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>Price (NZD) *</label>
              <input type="number" name="price" value={carFormData.price} onChange={handleCarFormChange}
                placeholder="25000" required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--cream)' }} />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>Mileage (km) *</label>
            <input type="number" name="mileage" value={carFormData.mileage} onChange={handleCarFormChange}
              placeholder="35000" required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--cream)' }} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>Fuel</label>
              <select name="fuel" value={carFormData.fuel} onChange={handleCarFormChange}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--cream)' }}>
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Hybrid</option>
                <option>Electric</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>Transmission</label>
              <select name="transmission" value={carFormData.transmission} onChange={handleCarFormChange}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--cream)' }}>
                <option>Automatic</option>
                <option>Manual</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>Body Type</label>
              <select name="bodyType" value={carFormData.bodyType} onChange={handleCarFormChange}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--cream)' }}>
                <option>Sedan</option>
                <option>SUV</option>
                <option>Hatchback</option>
                <option>Ute</option>
                <option>Wagon</option>
                <option>Coupe</option>
              </select>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>Image URL</label>
            <input type="text" name="imageUrl" value={carFormData.imageUrl} onChange={handleCarFormChange}
              placeholder="https://example.com/car.jpg"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--cream)' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>Description</label>
            <textarea name="description" value={carFormData.description} onChange={handleCarFormChange}
              rows={4} placeholder="Describe the car's condition, features, service history..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--cream)', fontFamily: 'var(--font-sans)', resize: 'vertical' }} />
          </div>
          
          <button type="submit" disabled={listingStatus === 'loading'}
            style={{ padding: '13px', background: 'var(--black)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: '700', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {listingStatus === 'loading' ? (isDealership ? 'Adding...' : 'Listing...') : (isDealership ? 'Add to Dealership' : 'List Car for Sale')}
          </button>
        </form>
      </div>
    </div>
  );

  if (!user && !token) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-top">
          <button className="dash-logo" onClick={() => onNavigate('home')}>
            🚗 Shubham's Car Dealership
          </button>

          <div className="dash-user">
            <div className="dash-avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
            <div className="dash-user-info">
              <strong>{user?.username || 'User'}</strong>
              <span>{user?.email || 'user@email.com'}</span>
              {(user?.role === 'SALES_EMPLOYEE' || user?.isEmployee) && <span style={{ fontSize: '10px', color: 'var(--gold)' }}>🏢 Sales Employee</span>}
              {user?.role === 'ADMIN' && <span style={{ fontSize: '10px', color: 'var(--gold)' }}>⚙️ Admin</span>}
              {user?.role === 'SUPER_ADMIN' && <span style={{ fontSize: '10px', color: 'var(--gold)' }}>👑 Super Admin</span>}
            </div>
          </div>

          <nav className="dash-nav">
            <p className="dash-nav-label">Browse</p>
            <button className="dash-nav-link" onClick={() => onNavigate('home')}>🏠 Home</button>
            <button className="dash-nav-link" onClick={() => onNavigate('inventory')}>🚗 Inventory</button>

            <p className="dash-nav-label">Sell</p>
            <button
              className={`dash-nav-link ${showListCarForm ? 'active' : ''}`}
              onClick={() => { setShowListCarForm(true); setShowDealershipForm(false); setActiveTool(null); }}
            >
              📝 List on Marketplace
            </button>
            
            {isSalesEmployee && (
              <button
                className={`dash-nav-link ${showDealershipForm ? 'active' : ''}`}
                onClick={() => { setShowDealershipForm(true); setShowListCarForm(false); setActiveTool(null); }}
              >
                🏢 Add Dealership Car
              </button>
            )}

            <p className="dash-nav-label">Tools</p>
            {tools.map(tool => (
              <button
                key={tool.id}
                className={`dash-nav-link ${activeTool === tool.id && !showListCarForm && !showDealershipForm ? 'active' : ''}`}
                onClick={() => handleToolClick(tool.id)}
              >
                <span>{tool.icon}</span>
                <span>{tool.label}</span>
                {tool.id === 'messages' && unreadCount > 0 && (
                  <span className="nav-unread-badge" style={{ marginLeft: 'auto', background: 'var(--gold)', color: 'white', borderRadius: '10px', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}

            {isAdmin && (
              <>
                <p className="dash-nav-label">Admin</p>
                <button 
                  className="dash-nav-link"
                  onClick={() => {
                    console.log('Navigating to admin panel');
                    onNavigate('admin');
                  }}
                >
                  ⚙️ Admin Panel
                </button>
              </>
            )}
          </nav>
        </div>

        <button className="dash-logout" onClick={onLogout}>🚪 Logout</button>
      </aside>

      <main className="dash-main">
        <div className="dash-mobile-bar">
          <button className="dash-logo" onClick={() => onNavigate('home')}>🚗 Shubham's Cars</button>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
        </div>

        <div className="dash-mobile-tabs">
          <button className={`mobile-tab ${showListCarForm ? 'active' : ''}`}
            onClick={() => { setShowListCarForm(true); setShowDealershipForm(false); setActiveTool(null); }}>
            <span>📝</span><span>List</span>
          </button>
          {isSalesEmployee && (
            <button className={`mobile-tab ${showDealershipForm ? 'active' : ''}`}
              onClick={() => { setShowDealershipForm(true); setShowListCarForm(false); setActiveTool(null); }}>
              <span>🏢</span><span>Dealer</span>
            </button>
          )}
          {tools.map(tool => (
            <button key={tool.id}
              className={`mobile-tab ${activeTool === tool.id && !showListCarForm && !showDealershipForm ? 'active' : ''}`}
              onClick={() => handleToolClick(tool.id)}
              style={{ position: 'relative' }}>
              <span>{tool.icon}</span>
              <span>{tool.label === 'Service Center' ? 'Service' : tool.label}</span>
              {tool.id === 'messages' && unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '6px', right: '6px', background: 'var(--gold)', color: 'white', fontSize: '10px', fontWeight: '700', borderRadius: '10px', padding: '1px 5px' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
          {isAdmin && (
            <button
              className="mobile-tab"
              onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
            >
              <span>⚙️</span><span>Admin</span>
            </button>
          )}
        </div>

        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu" onClick={e => e.stopPropagation()}>
              <div className="mobile-menu-user">
                <div className="dash-avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
                <div>
                  <strong>{user?.username}</strong>
                  <span>{user?.email}</span>
                  {(user?.role === 'SALES_EMPLOYEE' || user?.isEmployee) && <span style={{ fontSize: '10px', display: 'block' }}>🏢 Sales Employee</span>}
                </div>
              </div>
              <button className="mobile-menu-link" onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}>🏠 Home</button>
              <button className="mobile-menu-link" onClick={() => { onNavigate('inventory'); setMobileMenuOpen(false); }}>🚗 Inventory</button>
              <button className="mobile-menu-link" onClick={() => { setShowListCarForm(true); setShowDealershipForm(false); setActiveTool(null); setMobileMenuOpen(false); }}>📝 List on Marketplace</button>
              {isSalesEmployee && (
                <button className="mobile-menu-link" onClick={() => { setShowDealershipForm(true); setShowListCarForm(false); setActiveTool(null); setMobileMenuOpen(false); }}>🏢 Add Dealership Car</button>
              )}
              {isAdmin && (
                <button 
                  className="mobile-menu-link"
                  onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                >
                  ⚙️ Admin Panel
                </button>
              )}
              <button className="mobile-menu-link mobile-menu-logout" onClick={onLogout}>🚪 Logout</button>
            </div>
          </div>
        )}

        <div className="dash-tool-area">
          {renderTool()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;