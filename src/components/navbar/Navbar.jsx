// src/components/navbar/Navbar.jsx
import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ user, currentPage, onNavigate, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home',      page: 'home'      },
    { label: 'Inventory', page: 'inventory' },
  ];

  const handleNavigate = (page) => {
    onNavigate(page);
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">

        <button className="navbar-logo" onClick={() => handleNavigate('home')}>
          <span className="logo-text"><span>Shubham's Car Dealership</span></span>
        </button>

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
          {user && (
            <li>
              <button
                className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigate('dashboard')}
              >
                Dashboard
              </button>
            </li>
          )}
        </ul>

        <div className="navbar-auth">
          {user ? (
            <>
              <span className="nav-username">Hi, {user.username}</span>
              <button className="btn-logout" onClick={() => { onLogout(); setMenuOpen(false); }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn-nav-login" onClick={() => handleNavigate('login')}>
                Sign In
              </button>
              <button className="btn-nav-register" onClick={() => handleNavigate('register')}>
                Get Started
              </button>
            </>
          )}
        </div>

        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>
      </div>

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
              <button className="mobile-link" onClick={() => handleNavigate('dashboard')}>Dashboard</button>
              <button className="mobile-link mobile-logout" onClick={() => { onLogout(); setMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <button className="mobile-link" onClick={() => handleNavigate('login')}>Sign In</button>
              <button className="mobile-link" onClick={() => handleNavigate('register')}>Get Started</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;