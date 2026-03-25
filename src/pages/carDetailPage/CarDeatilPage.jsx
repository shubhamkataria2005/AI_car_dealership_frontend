import React, { useState } from 'react';
import './CarDeatilPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const CarDetailPage = ({ car, user, onNavigate, sessionToken }) => {
  const [bookingForm,   setBookingForm]   = useState({ name: '', phone: '', date: '', time: '' });
  const [bookingStatus, setBookingStatus] = useState('');
  const [activeTab,     setActiveTab]     = useState('details');

  // Message state
  const [messageText,    setMessageText]    = useState('');
  const [messageStatus,  setMessageStatus]  = useState(''); // 'success' | 'error' | 'sending' | ''
  const [showMsgForm,    setShowMsgForm]    = useState(false);

  // ── No car passed ──────────────────────────────────────────────────────
  if (!car) {
    return (
      <div className="car-detail-page page">
        <div className="container">
          <p style={{ padding: '48px 0', textAlign: 'center', color: 'var(--gray-dark)' }}>
            No car selected.{' '}
            <button
              style={{ color: 'var(--blue)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => onNavigate('inventory')}
            >
              Browse inventory →
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── Booking handlers ───────────────────────────────────────────────────
  const handleBookingChange = e =>
    setBookingForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleBookingSubmit = e => {
    e.preventDefault();
    if (!user) { onNavigate('login'); return; }
    setBookingStatus('success');
    setBookingForm({ name: '', phone: '', date: '', time: '' });
  };

  // ── Send message ───────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!user) { onNavigate('login'); return; }
    if (!messageText.trim()) return;

    setMessageStatus('sending');

    try {
      const token = sessionToken || localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: car.sellerId,
          carId:      car.id,
          content:    messageText
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessageStatus('success');
        setMessageText('');
        setShowMsgForm(false);
        setTimeout(() => setMessageStatus(''), 4000);
      } else {
        setMessageStatus('error');
        setTimeout(() => setMessageStatus(''), 4000);
      }
    } catch (err) {
      console.error('Send message error:', err);
      setMessageStatus('error');
      setTimeout(() => setMessageStatus(''), 4000);
    }
  };

  // ── Spec rows ──────────────────────────────────────────────────────────
  const specs = [
    { label: 'Year',         value: car.year },
    { label: 'Make',         value: car.make },
    { label: 'Model',        value: car.model },
    { label: 'Mileage',      value: car.mileage ? `${car.mileage.toLocaleString()} km` : null },
    { label: 'Fuel Type',    value: car.fuel },
    { label: 'Transmission', value: car.transmission },
    { label: 'Body Type',    value: car.bodyType },
    { label: 'Seller',       value: car.sellerName },
  ];

  const isSeller = user && user.id === car.sellerId;

  return (
    <div className="car-detail-page page">

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <button onClick={() => onNavigate('home')}>Home</button>
          <span>›</span>
          <button onClick={() => onNavigate('inventory')}>Inventory</button>
          <span>›</span>
          <span>{car.year} {car.make} {car.model}</span>
        </div>
      </div>

      <div className="container">
        <div className="detail-layout">

          {/* ── LEFT: image + tabs ── */}
          <div className="detail-left">
            <div className="detail-image">
              <img
                src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'}
                alt={`${car.year} ${car.make} ${car.model}`}
              />
              {car.badge && <span className="car-badge-lg">{car.badge}</span>}
            </div>

            <div className="detail-tabs">
              <button className={`tab-btn ${activeTab === 'details'  ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Specifications</button>
              <button className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>Features</button>
            </div>

            {activeTab === 'details' && (
              <div className="specs-grid">
                {specs.filter(s => s.value).map(spec => (
                  <div key={spec.label} className="spec-row">
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'features' && (
              <ul className="features-list">
                {['Bluetooth Audio', 'Reverse Camera', 'Lane Keep Assist',
                  'Apple CarPlay', 'Cruise Control', 'Alloy Wheels',
                  'Keyless Entry', 'Dual-zone Climate Control'].map(f => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            )}
          </div>

          {/* ── RIGHT: price, messaging, booking ── */}
          <div className="detail-right">

            {/* Price summary */}
            <div className="detail-summary">
              <h1>{car.year} {car.make} {car.model}</h1>
              <div className="detail-price">${car.price?.toLocaleString()}</div>
              <div className="detail-quick-specs">
                <span>🛣 {car.mileage?.toLocaleString()} km</span>
                <span>⛽ {car.fuel}</span>
                <span>⚙️ {car.transmission}</span>
              </div>
              {car.sellerName && (
                <div className="detail-quick-specs">
                  <span>👤 {car.sellerName}</span>
                </div>
              )}
            </div>

            {/* ── MESSAGE SELLER ── */}
            <div className="booking-card">
              <h3>💬 Message Seller</h3>

              {/* Not logged in */}
              {!user && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--gray-dark)', margin: 0 }}>
                    Login to contact the seller about this car.
                  </p>
                  <button className="booking-submit" onClick={() => onNavigate('login')}>
                    Login to Message
                  </button>
                </div>
              )}

              {/* This is your own listing */}
              {isSeller && (
                <p style={{ fontSize: '14px', color: 'var(--gray-dark)', margin: 0 }}>
                  This is your listing. Check your{' '}
                  <button
                    style={{ background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
                    onClick={() => onNavigate('dashboard')}
                  >
                    messages inbox
                  </button>
                  {' '}for buyer enquiries.
                </p>
              )}

              {/* Logged in, not seller */}
              {user && !isSeller && (
                <>
                  {/* Success banner */}
                  {messageStatus === 'success' && (
                    <div className="booking-success" style={{ marginBottom: '12px' }}>
                      <span>✅</span>
                      <div>
                        <strong>Message Sent!</strong>
                        <p>The seller will get back to you soon. Check your inbox in the dashboard.</p>
                      </div>
                    </div>
                  )}

                  {/* Error banner */}
                  {messageStatus === 'error' && (
                    <div className="auth-error" style={{ marginBottom: '12px' }}>
                      ❌ Failed to send. Please try again.
                    </div>
                  )}

                  {/* Form toggle */}
                  {!showMsgForm ? (
                    <button
                      className="booking-submit"
                      onClick={() => setShowMsgForm(true)}
                      style={{ background: 'var(--black)' }}
                    >
                      📧 Contact Seller
                    </button>
                  ) : (
                    <div className="booking-form">
                      <div className="form-field">
                        <label>Your Message</label>
                        <textarea
                          rows={4}
                          value={messageText}
                          onChange={e => setMessageText(e.target.value)}
                          placeholder={`Hi ${car.sellerName || 'there'}, I'm interested in the ${car.year} ${car.make} ${car.model}. Is it still available?`}
                          style={{
                            width: '100%', padding: '10px 12px',
                            border: '1px solid var(--gray-lighter)',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            resize: 'vertical',
                            background: 'var(--cream)'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <button
                          className="booking-submit"
                          onClick={handleSendMessage}
                          disabled={!messageText.trim() || messageStatus === 'sending'}
                          style={{ flex: 1 }}
                        >
                          {messageStatus === 'sending' ? 'Sending...' : '📤 Send Message'}
                        </button>
                        <button
                          onClick={() => { setShowMsgForm(false); setMessageText(''); }}
                          style={{
                            padding: '12px 16px',
                            background: 'none',
                            border: '1px solid var(--gray-lighter)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: 'var(--gray-dark)'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Finance teaser */}
            <div className="finance-teaser">
              <span>💳</span>
              <div>
                <strong>From ~${Math.round((car.price || 0) / 60 / 10) * 10}/month</strong>
                <p>Over 60 months. Use our finance calculator in the dashboard.</p>
              </div>
            </div>

            {/* ── TEST DRIVE BOOKING ── */}
            <div className="booking-card">
              <h3>📅 Book a Test Drive</h3>

              {bookingStatus === 'success' ? (
                <div className="booking-success">
                  <span>✅</span>
                  <div>
                    <strong>Booking Confirmed!</strong>
                    <p>We'll contact you to confirm your appointment.</p>
                  </div>
                </div>
              ) : (
                <form className="booking-form" onSubmit={handleBookingSubmit}>
                  <div className="form-field">
                    <label>Your Name</label>
                    <input type="text" name="name" value={bookingForm.name} onChange={handleBookingChange} placeholder="Full name" required />
                  </div>
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={bookingForm.phone} onChange={handleBookingChange} placeholder="021 000 0000" required />
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Preferred Date</label>
                      <input type="date" name="date" value={bookingForm.date} onChange={handleBookingChange} min={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="form-field">
                      <label>Time</label>
                      <select name="time" value={bookingForm.time} onChange={handleBookingChange} required>
                        <option value="">Select</option>
                        {['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'].map(t => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {!user && (
                    <p className="booking-login-note">
                      You need to <button type="button" onClick={() => onNavigate('login')}>login</button> to book.
                    </p>
                  )}
                  <button type="submit" className="booking-submit">
                    {user ? 'Book Test Drive' : 'Login to Book'}
                  </button>
                </form>
              )}
            </div>

            {/* AI assistant shortcut */}
            <div className="enquire-box">
              <p>Have more questions about this vehicle?</p>
              <button
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => user ? onNavigate('dashboard') : onNavigate('login')}
              >
                🤖 Chat with AI Assistant
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;