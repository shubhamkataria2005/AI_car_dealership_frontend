import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import ChatAssistant    from '../../components/tools/ChatAssistant';
import CarRecognizer    from '../../components/tools/CarRecognizer';
import FinanceCalculator from '../../components/tools/FinanceCalculator';
import MessagesInbox    from '../../components/messaging/MessagesInbox';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Dashboard = ({ user, sessionToken, onLogout, onNavigate }) => {
  const [activeTool,       setActiveTool]       = useState('chat');
  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);
  const [showListCarForm,  setShowListCarForm]  = useState(false);
  const [unreadCount,      setUnreadCount]      = useState(0);

  // List car form state
  const [carFormData,   setCarFormData]   = useState({
    make: '', model: '', year: new Date().getFullYear(),
    price: '', mileage: '', fuel: 'Petrol',
    transmission: 'Automatic', bodyType: 'Sedan',
    description: '', imageUrl: ''
  });
  const [listingStatus, setListingStatus] = useState('');

  const token = sessionToken || localStorage.getItem('token');

  // ── Poll unread count ────────────────────────────────────────────────────
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res  = await fetch(`${API_BASE_URL}/api/messages/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.count !== undefined) setUnreadCount(data.count);
    } catch {}
  };

  // ── Tools definition ─────────────────────────────────────────────────────
  const tools = [
    { id: 'messages',   label: 'Messages',           icon: '✉️',  desc: 'Inbox & conversations'          },
    { id: 'chat',       label: 'AI Assistant',        icon: '💬',  desc: 'Chat about cars & buying'        },
    { id: 'recognizer', label: 'Car Recognizer',      icon: '🔍',  desc: 'Identify car brand from photo'   },
    { id: 'finance',    label: 'Finance Calculator',  icon: '💰',  desc: 'Estimate monthly payments'       },
  ];

  // ── Handle tool click ────────────────────────────────────────────────────
  const handleToolClick = (id) => {
    setActiveTool(id);
    setShowListCarForm(false);
    setMobileMenuOpen(false);
    if (id === 'messages') setUnreadCount(0);
  };

  // ── List car handlers ────────────────────────────────────────────────────
  const handleCarFormChange = e =>
    setCarFormData({ ...carFormData, [e.target.name]: e.target.value });

  const handleListCar = async (e) => {
    e.preventDefault();
    setListingStatus('loading');
    try {
      const res = await fetch(`${API_BASE_URL}/api/cars/list`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        setTimeout(() => { setListingStatus(''); setShowListCarForm(false); }, 2000);
      } else {
        setListingStatus('error');
        setTimeout(() => setListingStatus(''), 3000);
      }
    } catch {
      setListingStatus('error');
      setTimeout(() => setListingStatus(''), 3000);
    }
  };

  // ── Render active tool ───────────────────────────────────────────────────
  const renderTool = () => {
    if (showListCarForm) return renderListCarForm();
    switch (activeTool) {
      case 'messages':   return <MessagesInbox user={user} sessionToken={token} />;
      case 'chat':       return <ChatAssistant user={user} sessionToken={token} />;
      case 'recognizer': return <CarRecognizer sessionToken={token} />;
      case 'finance':    return <FinanceCalculator />;
      default:           return <ChatAssistant user={user} sessionToken={token} />;
    }
  };

  const renderListCarForm = () => (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>📝 List Your Car for Sale</h2>
        <p>Fill in the details below to list your car on our marketplace</p>
      </div>
      <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        {listingStatus === 'success' && (
          <div style={{ marginBottom: '20px', padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
            <strong>✅ Car Listed Successfully!</strong>
          </div>
        )}
        {listingStatus === 'error' && (
          <div style={{ marginBottom: '20px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
            ❌ Failed to list car. Please try again.
          </div>
        )}
        <form onSubmit={handleListCar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            [{ name: 'make',  label: 'Make *',       placeholder: 'e.g., Toyota', type: 'text'   },
             { name: 'model', label: 'Model *',      placeholder: 'e.g., Camry',  type: 'text'   }],
            [{ name: 'year',  label: 'Year *',       placeholder: '2023',         type: 'number' },
             { name: 'price', label: 'Price (NZD)*', placeholder: '25000',        type: 'number' }],
            [{ name: 'mileage', label: 'Mileage (km)*', placeholder: '35000', type: 'number' }]
          ].map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: '12px' }}>
              {row.map(f => (
                <div key={f.name}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>{f.label}</label>
                  <input type={f.type} name={f.name} value={carFormData[f.name]} onChange={handleCarFormChange}
                    placeholder={f.placeholder} required
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--cream)' }} />
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { name: 'fuel',         label: 'Fuel',         opts: ['Petrol','Diesel','Hybrid','Electric'] },
              { name: 'transmission', label: 'Transmission', opts: ['Automatic','Manual'] },
              { name: 'bodyType',     label: 'Body Type',    opts: ['Sedan','SUV','Hatchback','Ute','Wagon','Coupe'] }
            ].map(f => (
              <div key={f.name}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-dark)' }}>{f.label}</label>
                <select name={f.name} value={carFormData[f.name]} onChange={handleCarFormChange}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--cream)' }}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
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
            {listingStatus === 'loading' ? 'Listing...' : 'List Car for Sale'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">

      {/* ── Desktop Sidebar ── */}
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
            </div>
          </div>

          <nav className="dash-nav">
            <p className="dash-nav-label">Browse</p>
            <button className="dash-nav-link" onClick={() => onNavigate('home')}>🏠 Home</button>
            <button className="dash-nav-link" onClick={() => onNavigate('inventory')}>🚗 Inventory</button>

            <p className="dash-nav-label">Sell</p>
            <button
              className={`dash-nav-link ${showListCarForm ? 'active' : ''}`}
              onClick={() => { setShowListCarForm(true); setActiveTool(null); }}
            >
              📝 List a Car
            </button>

            <p className="dash-nav-label">Tools</p>
            {tools.map(tool => (
              <button
                key={tool.id}
                className={`dash-nav-link ${activeTool === tool.id && !showListCarForm ? 'active' : ''}`}
                onClick={() => handleToolClick(tool.id)}
              >
                <span>{tool.icon}</span>
                <span>{tool.label}</span>
                {tool.id === 'messages' && unreadCount > 0 && (
                  <span className="nav-unread-badge">{unreadCount}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <button className="dash-logout" onClick={onLogout}>🚪 Logout</button>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">

        {/* Mobile bar */}
        <div className="dash-mobile-bar">
          <button className="dash-logo" onClick={() => onNavigate('home')}>🚗 DriveWise</button>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
        </div>

        {/* Mobile tabs */}
        <div className="dash-mobile-tabs">
          <button className={`mobile-tab ${showListCarForm ? 'active' : ''}`}
            onClick={() => { setShowListCarForm(true); setActiveTool(null); }}>
            <span>📝</span><span>List</span>
          </button>
          {tools.map(tool => (
            <button key={tool.id}
              className={`mobile-tab ${activeTool === tool.id && !showListCarForm ? 'active' : ''}`}
              onClick={() => handleToolClick(tool.id)}
              style={{ position: 'relative' }}>
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
              {tool.id === 'messages' && unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '6px', right: '6px', background: 'var(--gold)', color: 'white', fontSize: '10px', fontWeight: '700', borderRadius: '10px', padding: '1px 5px' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile overlay menu */}
        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu" onClick={e => e.stopPropagation()}>
              <div className="mobile-menu-user">
                <div className="dash-avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
                <div>
                  <strong>{user?.username}</strong>
                  <span>{user?.email}</span>
                </div>
              </div>
              <button className="mobile-menu-link" onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}>🏠 Home</button>
              <button className="mobile-menu-link" onClick={() => { onNavigate('inventory'); setMobileMenuOpen(false); }}>🚗 Inventory</button>
              <button className="mobile-menu-link" onClick={() => { setShowListCarForm(true); setActiveTool(null); setMobileMenuOpen(false); }}>📝 List a Car</button>
              <button className="mobile-menu-link mobile-menu-logout" onClick={onLogout}>🚪 Logout</button>
            </div>
          </div>
        )}

        {/* Tool area */}
        <div className="dash-tool-area">
          {renderTool()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;