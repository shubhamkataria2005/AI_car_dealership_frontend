import React, { useState } from 'react';
import '../loginPage/LoginPage.css';
import { API_BASE_URL } from '../../config';

const Register = ({ onLoginSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        if (data.user && data.sessionToken) {
          setSuccess('Account created! Redirecting...');
          setTimeout(() => onLoginSuccess(data.user, data.sessionToken), 1200);
        } else {
          setSuccess('Account created! Please sign in.');
          setTimeout(() => onNavigate('login'), 1500);
        }
      } else setError(data.message || 'Registration failed. Please try again.');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

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
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" required disabled={loading} />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" required disabled={loading} />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" required disabled={loading} />
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