import React from 'react';
import './Footer.css';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-brand">
          <button className="footer-logo" onClick={() => onNavigate('home')}>
            🚗 Shubham's Car Dealership
          </button>
          <p>Quality used cars at honest prices. Find your perfect vehicle today.</p>
        </div>

        <div className="footer-links">
          <h4>Browse</h4>
          <button onClick={() => onNavigate('home')}>Home</button>
          <button onClick={() => onNavigate('inventory')}>All Cars</button>
        </div>

        <div className="footer-links">
          <h4>Account</h4>
          <button onClick={() => onNavigate('login')}>Login</button>
          <button onClick={() => onNavigate('register')}>Register</button>
          <button onClick={() => onNavigate('dashboard')}>Dashboard</button>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>📍 Auckland, New Zealand</p>
          <p>📞 +64 9 123 4567</p>
          <p>✉️ hello@drivewise.co.nz</p>
        </div>

      </div>
      <div className="footer-bottom">
        <p>© 2025 DriveWise. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;