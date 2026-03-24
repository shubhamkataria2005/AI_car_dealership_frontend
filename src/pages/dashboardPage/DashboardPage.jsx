import React, { useState } from 'react';
import './DashboardPage.css';
import ChatAssistant from '../../components/tools/ChatAssistant';
import CarRecognizer from '../../components/tools/CarRecognizer';
import FinanceCalculator from '../../components/tools/FinanceCalculator';

const Dashboard = ({ user, sessionToken, onLogout, onNavigate }) => {
  const [activeTool, setActiveTool] = useState('chat');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tools = [
    { id: 'chat', label: 'AI Assistant', icon: '💬', desc: 'Chat about cars & buying' },
    { id: 'recognizer', label: 'Car Recognizer', icon: '🔍', desc: 'Identify car brand from photo' },
    { id: 'finance', label: 'Finance Calculator', icon: '💰', desc: 'Estimate monthly payments' },
  ];

  const renderTool = () => {
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