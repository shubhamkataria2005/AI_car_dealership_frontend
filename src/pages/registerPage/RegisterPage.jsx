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
          <img src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=900&q=80" alt="" />
          <div className="auth-panel-overlay" />
          <div className="auth-panel-text">
            <span className="auth-panel-eyebrow">Welcome!</span>
            <h2>Account Created<br />Successfully</h2>
            <p>Redirecting you to your dashboard...</p>
          </div>
        </div>
        <div className="auth-panel-right" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
            <h2>Welcome to Shubham's Car Dealership!</h2>
            <p>Your account has been created. Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel-left">
        <img src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=900&q=80" alt="" />
        <div className="auth-panel-overlay" />
        <div className="auth-panel-text">
          <span className="auth-panel-eyebrow">Join today</span>
          <h2>Find your<br />perfect vehicle</h2>
          <p>Create an account to save favourites, book test drives, and access our AI tools.</p>
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
          <p>Free to join. No obligations.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && !redirecting && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input 
              id="username" 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="Choose a username" 
              required 
              disabled={loading || success} 
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
              disabled={loading || success} 
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
              placeholder="Create a strong password" 
              required 
              disabled={loading || success} 
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading || success}>
            {loading ? 'Creating account...' : success ? 'Account Created!' : 'Create Account'}
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