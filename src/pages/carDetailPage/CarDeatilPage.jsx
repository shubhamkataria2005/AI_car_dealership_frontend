import React, { useState } from 'react';
import './CarDeatilPage.css'; 

const CarDetailPage = ({ car, user, onNavigate }) => {
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', date: '', time: '' });
  const [bookingStatus, setBookingStatus] = useState(''); // 'success' | 'error' | ''
  const [activeTab, setActiveTab] = useState('details');

  // Fallback if no car passed
  if (!car) {
    return (
      <div className="car-detail-page page">
        <div className="container">
          <p style={{ padding: '48px 0', textAlign: 'center', color: 'var(--gray-dark)' }}>
            No car selected.{' '}
            <button style={{ color: 'var(--blue)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => onNavigate('inventory')}>
              Browse inventory →
            </button>
          </p>
        </div>
      </div>
    );
  }

  const handleBookingChange = (e) =>
    setBookingForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      onNavigate('login');
      return;
    }
    // In a real app: POST to backend
    setBookingStatus('success');
    setBookingForm({ name: '', phone: '', date: '', time: '' });
  };

  const specs = [
    { label: 'Year',         value: car.year          },
    { label: 'Make',         value: car.make          },
    { label: 'Model',        value: car.model         },
    { label: 'Mileage',      value: `${car.mileage?.toLocaleString()} km` },
    { label: 'Fuel Type',    value: car.fuel          },
    { label: 'Transmission', value: car.transmission  },
    { label: 'Body Type',    value: car.body          },
  ];

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

          {/* ── Left: Image + tabs ── */}
          <div className="detail-left">
            <div className="detail-image">
              <img src={car.image} alt={`${car.year} ${car.make} ${car.model}`} />
              {car.badge && <span className="car-badge-lg">{car.badge}</span>}
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
              <button
                className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Specifications
              </button>
              <button
                className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                Features
              </button>
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

          {/* ── Right: Price + booking ── */}
          <div className="detail-right">

            <div className="detail-summary">
              <h1>{car.year} {car.make} {car.model}</h1>
              <div className="detail-price">${car.price?.toLocaleString()}</div>
              <div className="detail-quick-specs">
                <span>🛣 {car.mileage?.toLocaleString()} km</span>
                <span>⛽ {car.fuel}</span>
                <span>⚙️ {car.transmission}</span>
              </div>
            </div>

            {/* Finance teaser */}
            <div className="finance-teaser">
              <span>💳</span>
              <div>
                <strong>From ~${Math.round(car.price / 60 / 10) * 10}/month</strong>
                <p>Over 60 months. Use our finance calculator in the dashboard.</p>
              </div>
            </div>

            {/* Test drive booking */}
            <div className="booking-card">
              <h3>📅 Book a Test Drive</h3>

              {bookingStatus === 'success' ? (
                <div className="booking-success">
                  <span>✅</span>
                  <div>
                    <strong>Booking Confirmed!</strong>
                    <p>We'll contact you to confirm your test drive appointment.</p>
                  </div>
                </div>
              ) : (
                <form className="booking-form" onSubmit={handleBookingSubmit}>
                  <div className="form-field">
                    <label>Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingForm.name}
                      onChange={handleBookingChange}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingForm.phone}
                      onChange={handleBookingChange}
                      placeholder="021 000 0000"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Preferred Date</label>
                      <input
                        type="date"
                        name="date"
                        value={bookingForm.date}
                        onChange={handleBookingChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label>Time</label>
                      <select name="time" value={bookingForm.time} onChange={handleBookingChange} required>
                        <option value="">Select</option>
                        <option>9:00 AM</option>
                        <option>10:00 AM</option>
                        <option>11:00 AM</option>
                        <option>12:00 PM</option>
                        <option>1:00 PM</option>
                        <option>2:00 PM</option>
                        <option>3:00 PM</option>
                        <option>4:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {!user && (
                    <p className="booking-login-note">
                      You need to{' '}
                      <button type="button" onClick={() => onNavigate('login')}>login</button>
                      {' '}to book a test drive.
                    </p>
                  )}

                  <button type="submit" className="booking-submit">
                    {user ? 'Book Test Drive' : 'Login to Book'}
                  </button>
                </form>
              )}
            </div>

            {/* Enquire */}
            <div className="enquire-box">
              <p>Have questions about this vehicle?</p>
              <button
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => user ? onNavigate('dashboard') : onNavigate('login')}
              >
                💬 Chat with AI Assistant
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;