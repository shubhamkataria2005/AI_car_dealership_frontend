import React, { useState } from 'react';
import './DashboardPage.css';
import ChatAssistant from '../../components/tools/ChatAssistant';
import CarRecognizer from '../../components/tools/CarRecognizer';
import FinanceCalculator from '../../components/tools/FinanceCalculator';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Dashboard = ({ user, sessionToken, onLogout, onNavigate }) => {
  const [activeTool, setActiveTool] = useState('chat');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showListCarForm, setShowListCarForm] = useState(false);
  const [carFormData, setCarFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuel: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    description: '',
    imageUrl: ''
  });
  const [listingStatus, setListingStatus] = useState('');

  const tools = [
    { id: 'chat', label: 'AI Assistant', icon: '💬', desc: 'Chat about cars & buying' },
    { id: 'recognizer', label: 'Car Recognizer', icon: '🔍', desc: 'Identify car brand from photo' },
    { id: 'finance', label: 'Finance Calculator', icon: '💰', desc: 'Estimate monthly payments' },
  ];

  const handleCarFormChange = (e) => {
    setCarFormData({ ...carFormData, [e.target.name]: e.target.value });
  };

  const handleListCar = async (e) => {
    e.preventDefault();
    setListingStatus('loading');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/cars/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          ...carFormData,
          price: parseFloat(carFormData.price),
          mileage: parseInt(carFormData.mileage),
          year: parseInt(carFormData.year)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setListingStatus('success');
        setCarFormData({
          make: '',
          model: '',
          year: new Date().getFullYear(),
          price: '',
          mileage: '',
          fuel: 'Petrol',
          transmission: 'Automatic',
          bodyType: 'Sedan',
          description: '',
          imageUrl: ''
        });
        setTimeout(() => setListingStatus(''), 3000);
        setTimeout(() => setShowListCarForm(false), 2000);
      } else {
        setListingStatus('error');
        setTimeout(() => setListingStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error listing car:', error);
      setListingStatus('error');
      setTimeout(() => setListingStatus(''), 3000);
    }
  };

  const renderTool = () => {
    if (showListCarForm) {
      return (
        <div className="tool-panel">
          <div className="tool-header">
            <h2>📝 List Your Car for Sale</h2>
            <p>Fill in the details below to list your car on our marketplace</p>
          </div>
          
          <div style={{ padding: '24px' }}>
            {listingStatus === 'success' && (
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                <strong>✅ Car Listed Successfully!</strong>
                <p>Your car has been added to the inventory.</p>
              </div>
            )}
            
            {listingStatus === 'error' && (
              <div style={{ marginBottom: '20px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
                ❌ Failed to list car. Please try again.
              </div>
            )}

            <form onSubmit={handleListCar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Make *</label>
                  <input type="text" name="make" value={carFormData.make} onChange={handleCarFormChange} placeholder="e.g., Toyota" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Model *</label>
                  <input type="text" name="model" value={carFormData.model} onChange={handleCarFormChange} placeholder="e.g., Camry" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Year *</label>
                  <input type="number" name="year" value={carFormData.year} onChange={handleCarFormChange} placeholder="2023" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Price (NZD) *</label>
                  <input type="number" name="price" value={carFormData.price} onChange={handleCarFormChange} placeholder="25000" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Mileage (km) *</label>
                  <input type="number" name="mileage" value={carFormData.mileage} onChange={handleCarFormChange} placeholder="35000" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Fuel Type *</label>
                  <select name="fuel" value={carFormData.fuel} onChange={handleCarFormChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Hybrid</option>
                    <option>Electric</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Transmission *</label>
                  <select name="transmission" value={carFormData.transmission} onChange={handleCarFormChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Body Type *</label>
                  <select name="bodyType" value={carFormData.bodyType} onChange={handleCarFormChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Image URL</label>
                <input type="text" name="imageUrl" value={carFormData.imageUrl} onChange={handleCarFormChange} placeholder="https://example.com/car-image.jpg" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Description</label>
                <textarea name="description" value={carFormData.description} onChange={handleCarFormChange} rows="4" placeholder="Describe your car's condition, features, service history..." style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit' }} />
              </div>

              <button type="submit" disabled={listingStatus === 'loading'} style={{ padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                {listingStatus === 'loading' ? 'Listing...' : 'List Car for Sale'}
              </button>
            </form>
          </div>
        </div>
      );
    }
    
    switch (activeTool) {
      case 'chat':
        return <ChatAssistant user={user} sessionToken={sessionToken} />;
      case 'recognizer':
        return <CarRecognizer sessionToken={sessionToken} />;
      case 'finance':
        return <FinanceCalculator />;
      default:
        return <ChatAssistant user={user} sessionToken={sessionToken} />;
    }
  };

  const handleToolClick = (id) => {
    setActiveTool(id);
    setShowListCarForm(false);
    setMobileMenuOpen(false);
  };

  return (
    <div className="dashboard-page">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-top">
          <button className="dash-logo" onClick={() => onNavigate('home')}>
            🚗 DriveWise
          </button>

          <div className="dash-user">
            <div className="dash-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="dash-user-info">
              <strong>{user?.username || 'User'}</strong>
              <span>{user?.email || 'user@email.com'}</span>
            </div>
          </div>

          <nav className="dash-nav">
            <p className="dash-nav-label">Browse</p>
            <button className="dash-nav-link" onClick={() => onNavigate('home')}>
              🏠 Home
            </button>
            <button className="dash-nav-link" onClick={() => onNavigate('inventory')}>
              🚗 Inventory
            </button>

            <p className="dash-nav-label" style={{ marginTop: '20px' }}>Sell a Car</p>
            <button 
              className={`dash-nav-link ${showListCarForm ? 'active' : ''}`}
              onClick={() => {
                setShowListCarForm(true);
                setActiveTool(null);
              }}
            >
              📝 List a Car
            </button>

            <p className="dash-nav-label" style={{ marginTop: '20px' }}>AI Tools</p>
            {tools.map(tool => (
              <button
                key={tool.id}
                className={`dash-nav-link ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => handleToolClick(tool.id)}
              >
                {tool.icon} {tool.label}
              </button>
            ))}
          </nav>
        </div>

        <button className="dash-logout" onClick={onLogout}>
          🚪 Logout
        </button>
      </aside>

      <main className="dash-main">
        <div className="dash-mobile-bar">
          <button className="dash-logo" onClick={() => onNavigate('home')}>
            🚗 DriveWise
          </button>
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>

        <div className="dash-mobile-tabs">
          <button
            className={`mobile-tab ${showListCarForm ? 'active' : ''}`}
            onClick={() => {
              setShowListCarForm(true);
              setActiveTool(null);
            }}
          >
            <span>📝</span>
            <span>List Car</span>
          </button>
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`mobile-tab ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => handleToolClick(tool.id)}
            >
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>

        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu" onClick={e => e.stopPropagation()}>
              <div className="mobile-menu-user">
                <div className="dash-avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
                <div>
                  <strong>{user?.username || 'User'}</strong>
                  <span>{user?.email || 'user@email.com'}</span>
                </div>
              </div>
              <button className="mobile-menu-link" onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}>🏠 Home</button>
              <button className="mobile-menu-link" onClick={() => { onNavigate('inventory'); setMobileMenuOpen(false); }}>🚗 Inventory</button>
              <button className="mobile-menu-link" onClick={() => { setShowListCarForm(true); setActiveTool(null); setMobileMenuOpen(false); }}>📝 List a Car</button>
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
