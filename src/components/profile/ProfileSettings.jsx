// src/components/profile/ProfileSettings.jsx
import React, { useState, useRef } from 'react';
import './ProfileSettings.css';
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
  const [photoChanged, setPhotoChanged] = useState(false);
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
        body.profilePhoto = photoPreview || '';
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
    <div className="profile-panel">
      <div className="profile-header">
        <h2>Profile</h2>
        <p>Manage your name, photo, and the contact details buyers see on your listings</p>
      </div>

      <div className="profile-body">
        <form onSubmit={handleSave} className="profile-form">

          {/* ── Photo ── */}
          <div className="profile-photo-section">
            <div className="profile-avatar-wrap">
              <div
                className="profile-avatar"
                style={photoPreview ? { backgroundImage: `url(${photoPreview})` } : undefined}
              >
                {!photoPreview && (username?.charAt(0)?.toUpperCase() || 'U')}
              </div>
              <button
                type="button"
                className="profile-avatar-edit-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Change photo"
                aria-label="Change photo"
              >
                ✎
              </button>
            </div>

            <div className="profile-photo-actions">
              <div className="profile-photo-buttons">
                <button type="button" className="profile-photo-btn" onClick={() => fileInputRef.current?.click()}>
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                {photoPreview && (
                  <button type="button" className="profile-photo-remove" onClick={handleRemovePhoto}>
                    Remove
                  </button>
                )}
              </div>
              <p className="profile-photo-hint">JPG or PNG — resized automatically</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              hidden
            />
          </div>

          <div className="profile-divider" />

          {/* ── Fields ── */}
          <div className="profile-fields">
            <div className="profile-field">
              <label htmlFor="profile-username">Username</label>
              <input
                id="profile-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                minLength={3}
                maxLength={50}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">Email</label>
              <input id="profile-email" type="email" value={user?.email || ''} disabled />
              <span className="profile-field-note">Email can't be changed here</span>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-phone">Phone Number</label>
              <input
                id="profile-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="021 555 0123"
              />
              <span className="profile-field-note">Shown to buyers on your car listings</span>
            </div>
          </div>

          {message && (
            <div className={`profile-message ${messageType}`}>{message}</div>
          )}

          <button type="submit" className="profile-save-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;