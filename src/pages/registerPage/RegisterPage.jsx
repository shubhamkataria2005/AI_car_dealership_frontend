import React, { useState } from 'react';
import '../loginPage/LoginPage.css';
import { API_BASE_URL } from '../../config';

const Register = ({ onLoginSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redirecting, setRedirecting] = useState(false);

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
        
        // Check if the backend returns user and token (auto-login)
        if (data.user && data.sessionToken) {
          setRedirecting(true);
          // Store token and user data
          localStorage.setItem('token', data.sessionToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          // Auto-login after registration
          setTimeout(() => {
            onLoginSuccess(data.user, data.sessionToken);
          }, 1500);
        } else {
          // If backend doesn't auto-login, go to login page after delay
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

  // Show redirecting message
  if (redirecting) {
    return (
      <div className="auth-page">
        <div className="auth-panel-left">
          <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80" alt="" />
          <div className="auth-panel-overlay" />
          <div className="auth-panel-text">
            <span className="auth-panel-eyebrow">Welcome!</span>
            <h2>Account Created!</h2>
            <p>Redirecting you to your dashboard...</p>
          </div>
        </div>
        <div className="auth-panel-right" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h2>Registration Successful!</h2>
            <p>Please wait, redirecting to dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-panel-left">
        <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80" alt="" />
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