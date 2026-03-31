// src/components/footer/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-brand">
          <button className="footer-logo" onClick={() => onNavigate('home')}>
            Shubham's Car Dealership
          </button>
          <p>Quality used vehicles, honestly priced. We believe buying a car should be simple, transparent, and enjoyable.</p>
          <span className="footer-tagline">Auckland, New Zealand · Est. 2015</span>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <button onClick={() => onNavigate('home')}>Home</button>
          <button onClick={() => onNavigate('inventory')}>All Vehicles</button>
          <button onClick={() => onNavigate('dashboard')}>Dashboard</button>
        </div>

        <div className="footer-links">
          <h4>Account</h4>
          <button onClick={() => onNavigate('login')}>Sign In</button>
          <button onClick={() => onNavigate('register')}>Create Account</button>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Auckland, New Zealand</p>
          <p>+64 220 632 005</p>
          <p>hello@shubhamscars.co.nz</p>
          <p>Mon–Sat, 9am–6pm</p>
        </div>

      </div>
      <div className="footer-bottom">
        <p>© 2025 Shubham's Car Dealership. All rights reserved.</p>
        <div className="footer-bottom-right">
          <span>Privacy Policy</span>
          <span>Terms of Use</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;