// src/components/profile/ProfileSettings.jsx
import React, { useState, useRef } from 'react';
import '../tools/Tools.css';
import { API_BASE_URL } from '../../config';

// Resizes/compresses an image file client-side before it's ever sent to the
// server — keeps the stored base64 string small (typically well under
// 100KB for a headshot-style photo) without needing any file-storage
// infrastructure (S3, etc.) on the backend.
const resizeImage = (file, maxSize = 400) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Could not read that image.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });

const ProfileSettings = ({ user, sessionToken, onUserUpdate }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || null);
  const [photoChanged, setPhotoChanged] = useState(false); // did the user pick/remove a photo this session?
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const fileInputRef = useRef(null);

  const token = sessionToken || localStorage.getItem('token');

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessageType('error');
      setMessage('Please choose an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessageType('error');
      setMessage('Image must be under 10MB.');
      return;
    }

    try {
      const resized = await resizeImage(file);
      setPhotoPreview(resized);
      setPhotoChanged(true);
      setMessage('');
    } catch (err) {
      setMessageType('error');
      setMessage(err.message || 'Failed to process that image.');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoChanged(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const body = { username, phoneNumber };
      if (photoChanged) {
        body.profilePhoto = photoPreview || ''; // empty string tells the backend to clear it
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        setMessageType('success');
        setMessage('Profile updated successfully.');

        if (data.user) {
          setUsername(data.user.username ?? username);
          setPhoneNumber(data.user.phoneNumber ?? phoneNumber);
          setPhotoPreview(data.user.profilePhoto ?? null);
          setPhotoChanged(false);
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
        <p>Manage your name, photo, and the contact details buyers see on your listings</p>
      </div>

      <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <form onSubmit={handleSave} className="finance-form" style={{ maxWidth: 420 }}>

          {/* ── Photo ── */}
          <div className="form-field">
            <label>Profile Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                  background: photoPreview ? `center/cover no-repeat url(${photoPreview})` : 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-ink)', fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: '1.3rem', border: '1px solid var(--border2)'
                }}
              >
                {!photoPreview && (username?.charAt(0)?.toUpperCase() || 'U')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.72rem' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '0.72rem', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                  >
                    Remove photo
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

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