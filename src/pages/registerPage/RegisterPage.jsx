import React, { useState, useEffect } from 'react';
import '../loginPage/LoginPage.css';
import { API_BASE_URL } from '../../config';

// Same clip as the login page — drop it once at public/videos/auth.mp4.
// No poster image needed — phones/touch devices/slow connections get a
// CSS gradient fallback.
const AUTH_VIDEO_SRC = '/videos/auth.mp4';

const Register = ({ onLoginSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    const isSlowOrMetered = conn ? (conn.saveData || /^(slow-2g|2g|3g)$/.test(conn.effectiveType || '')) : false;

    setShowVideo(!reduceMotion && !isSlowOrMetered);
  }, []);

  const handleChange = e => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
    setError(''); 
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); 
    setError(''); 
    setSuccess('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Account created successfully!');
        
        if (data.user && data.sessionToken) {
          setRedirecting(true);
          localStorage.setItem('token', data.sessionToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          setTimeout(() => {
            onLoginSuccess(data.user, data.sessionToken);
          }, 1500);
        } else {
          setTimeout(() => {
            onNavigate('login');
          }, 1500);
        }
      } else {
        setError(data.message || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch { 
      setError('Network error. Please try again.'); 
      setLoading(false);
    }
  };

  const renderAuthPanelMedia = () => (
    showVideo ? (
      <div className="auth-panel-media" aria-hidden="true">
        <video
          className="auth-panel-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={AUTH_VIDEO_SRC} type="video/mp4" />
        </video>
      </div>
    ) : (
      <div className="auth-panel-media auth-panel-media-static" aria-hidden="true" />
    )
  );

  if (redirecting) {
    return (
      <div className="auth-page">
        <div className="auth-panel-left">
          {renderAuthPanelMedia()}
          <div className="auth-panel-overlay" />
          <div className="auth-panel-text">
            <span className="auth-panel-eyebrow">Welcome!</span>
            <h2>Account Created!</h2>
            <p>Redirecting you to your dashboard...</p>
          </div>
        </div>
        <div className="auth-panel-right" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Registration Successful!</h2>
            <p>Please wait, redirecting to dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Left cinematic panel */}
      <div className="auth-panel-left">
        {renderAuthPanelMedia()}
        <div className="auth-panel-overlay" />
        <div className="auth-panel-text">
          <span className="auth-panel-eyebrow">Join the community</span>
          <h2>Start your journey<br />with us today</h2>
          <p>Access AI tools, save favourites, and get the best deals on your next car.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-panel-right">
        <button className="auth-back" onClick={() => onNavigate('home')}>
          ← Back to home
        </button>

        <div className="auth-header">
          <div className="auth-brand">Shubham's Car Dealership</div>
          <h2>Create Account</h2>
          <p>Get access to AI tools and exclusive deals</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input 
              id="username" 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="Your name" 
              required 
              disabled={loading} 
            />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email" 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="you@email.com" 
              required 
              disabled={loading} 
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="At least 6 characters" 
              required 
              disabled={loading} 
            />
          </div>
          <div className="form-field">
            <label htmlFor="phoneNumber">Phone Number <span style={{ opacity: 0.6, textTransform: 'none' }}>(optional)</span></label>
            <input 
              id="phoneNumber" 
              type="tel" 
              name="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleChange} 
              placeholder="021 555 0123" 
              disabled={loading} 
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')}>Sign in here</button>
        </p>
      </div>
    </div>
  );
};

export default Register;