// src/components/profile/ProfileSettings.jsx
import React, { useState } from 'react';
import '../tools/Tools.css';
import { API_BASE_URL } from '../../config';

// Lets a logged-in user update their username and/or phone number. The
// phone number is what unlocks the "Call" button on a seller's car
// listings — existing accounts (registered before this field existed, or
// who skipped it at signup) use this to add one. Note: only NEW listings
// pick up an updated phone number — cars already listed keep whatever
// they were listed with, same as seller name/email already behave.
const ProfileSettings = ({ user, sessionToken, onUserUpdate }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'

  const token = sessionToken || localStorage.getItem('token');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, phoneNumber })
      });
      const data = await res.json();

      if (data.success) {
        setMessageType('success');
        setMessage('Profile updated. Re-list a car (or it\u2019ll apply to new listings) to activate the Call button.');

        // Keep username in sync with whatever the server actually saved
        // (in case it was unchanged/rejected) and propagate app-wide so
        // the Navbar/sidebar update without needing a refresh.
        if (data.user) {
          setUsername(data.user.username ?? username);
          setPhoneNumber(data.user.phoneNumber ?? phoneNumber);
          onUserUpdate?.({ ...user, ...data.user });
        }
      } else {
        setMessageType('error');
        setMessage(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setMessageType('error');
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>Profile</h2>
        <p>Manage your name and the contact details buyers see on your listings</p>
      </div>

      <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <form onSubmit={handleSave} className="finance-form" style={{ maxWidth: 420 }}>

          <div className="form-field">
            <label htmlFor="profile-username">Username</label>
            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              minLength={3}
              maxLength={50}
              style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', color: 'var(--text)' }}
            />
          </div>

          <div className="form-field">
            <label>Email</label>
            <input type="email" value={user?.email || ''} disabled style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface3)', color: 'var(--muted)' }} />
          </div>

          <div className="form-field">
            <label htmlFor="profile-phone">Phone Number</label>
            <input
              id="profile-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="021 555 0123"
              style={{ width: '100%', padding: '11px 13px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface2)', color: 'var(--text)' }}
            />
          </div>

          {message && (
            <div
              style={{
                marginTop: '4px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.86rem',
                background: messageType === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(255,92,108,0.1)',
                border: messageType === 'success' ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(255,92,108,0.25)',
                color: messageType === 'success' ? 'var(--green)' : '#FF8A95',
                lineHeight: 1.5
              }}
            >
              {message}
            </div>
          )}

          <button type="submit" className="booking-submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;