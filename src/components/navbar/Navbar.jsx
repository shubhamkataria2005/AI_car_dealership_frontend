import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ user, currentPage, onNavigate, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home',      page: 'home'      },
    { label: 'Inventory', page: 'inventory' },
  ];

  // Close mobile menu when navigating
  const handleNavigate = (page) => {
    onNavigate(page);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <button className="navbar-logo" onClick={() => handleNavigate('home')}>
          <span className="logo-icon">🚗</span>
          <span className="logo-text">Shubham's Car Dealership</span>
        </button>

        {/* Desktop links */}
        <ul className="navbar-links">
          {navLinks.map(link => (
            <li key={link.page}>
              <button
                className={`nav-link ${currentPage === link.page ? 'active' : ''}`}
                onClick={() => handleNavigate(link.page)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop auth */}
        <div className="navbar-auth">
          {user ? (
            <>
              <button
                className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigate('dashboard')}
              >
                Dashboard
              </button>
              <span className="nav-username">Hi, {user.username}</span>
              <button className="btn-logout" onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn-nav-login" onClick={() => handleNavigate('login')}>
                Login
              </button>
              <button className="btn-nav-register" onClick={() => handleNavigate('register')}>
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          {navLinks.map(link => (
            <button
              key={link.page}
              className={`mobile-link ${currentPage === link.page ? 'active' : ''}`}
              onClick={() => handleNavigate(link.page)}
            >
              {link.label}
            </button>
          ))}

          {user ? (
            <>
              <button
                className="mobile-link"
                onClick={() => handleNavigate('dashboard')}
              >
                Dashboard
              </button>
              <button
                className="mobile-link mobile-logout"
                onClick={() => {
                  onLogout();
                  setMenuOpen(false);
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="mobile-link"
                onClick={() => handleNavigate('login')}
              >
                Login
              </button>
              <button
                className="mobile-link"
                onClick={() => handleNavigate('register')}
              >
                Register
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;