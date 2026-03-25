import React, { useState } from 'react';
import './LoginPage.css';
import { API_BASE_URL } from '../../config';

const Login = ({ onLoginSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) onLoginSuccess(data.user, data.sessionToken);
      else setError(data.message || 'Invalid credentials. Please try again.');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-panel-left">
        <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80" alt="" />
        <div className="auth-panel-overlay" />
        <div className="auth-panel-text">
          <span className="auth-panel-eyebrow">Welcome back</span>
          <h2>Your next car<br />is waiting for you</h2>
          <p>Hundreds of quality used vehicles, honestly priced and ready to drive.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-panel-right">
        <button className="auth-back" onClick={() => onNavigate('home')}>
          ← Back to home
        </button>

        <div className="auth-header">
          <div className="auth-brand">Shubham's Car Dealership</div>
          <h2>Sign In</h2>
          <p>Access your account and AI tools</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" required disabled={loading} />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Your password" required disabled={loading} />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button onClick={() => onNavigate('register')}>Create one here</button>
        </p>
      </div>
    </div>
  );
};

export default Login;