import React, { useState, useEffect } from 'react';
import './CarDeatilPage.css';
import { api } from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const CarDetailPage = ({ car: propCar, user, onNavigate, sessionToken }) => {
  const [car, setCar] = useState(propCar);
  const [loading, setLoading] = useState(!propCar);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', date: '', time: '' });
  const [bookingStatus, setBookingStatus] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [messageStatus, setMessageStatus] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);

  useEffect(() => {
    if (!propCar) {
      const carId = window.location.pathname.split('/').pop();
      api.getCarById(carId)
        .then(data => {
          if (data.success) {
            setCar(data.car);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [propCar]);

  const handleBookingChange = (e) =>
    setBookingForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      onNavigate('login');
      return;
    }
    setBookingStatus('success');
    setBookingForm({ name: '', phone: '', date: '', time: '' });
    setTimeout(() => setBookingStatus(''), 5000);
  };

  const handleSendMessage = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if (!messageText.trim()) return;
    
    try {
      const token = sessionToken || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: car.sellerId,
          carId: car.id,
          content: messageText
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessageStatus('success');
        setMessageText('');
        setShowMessageForm(false);
        setTimeout(() => setMessageStatus(''), 3000);
      } else {
        setMessageStatus('error');
        setTimeout(() => setMessageStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageStatus('error');
      setTimeout(() => setMessageStatus(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="car-detail-page page">
        <div className="container">
          <p style={{ padding: '48px 0', textAlign: 'center' }}>Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="car-detail-page page">
        <div className="container">
          <p style={{ padding: '48px 0', textAlign: 'center', color: 'var(--gray-dark)' }}>
            Car not found.{' '}
            <button style={{ color: 'var(--blue)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => onNavigate('inventory')}>
              Browse inventory →
            </button>
          </p>
        </div>
      </div>
    );
  }

  const specs = [
    { label: 'Year', value: car.year },
    { label: 'Make', value: car.make },
    { label: 'Model', value: car.model },
    { label: 'Mileage', value: `${car.mileage?.toLocaleString()} km` },
    { label: 'Fuel Type', value: car.fuel },
    { label: 'Transmission', value: car.transmission },
    { label: 'Body Type', value: car.bodyType },
    { label: 'Seller', value: car.sellerName },
  ];

  return (
    <div className="car-detail-page page">
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
          {/* Left side - Image and Specs */}
          <div className="detail-left">
            <div className="detail-image">
              <img src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'} 
                   alt={`${car.year} ${car.make} ${car.model}`} />
              <span className="car-badge-lg">{car.status === 'AVAILABLE' ? 'Available' : 'Sold'}</span>
            </div>

            <div className="detail-tabs">
              <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
                Specifications
              </button>
              <button className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>
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
                {['Bluetooth Audio', 'Reverse Camera', 'Lane Keep Assist', 'Apple CarPlay', 'Cruise Control', 'Alloy Wheels', 'Keyless Entry', 'Dual-zone Climate Control'].map(f => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Right side - Price, Booking, and Message */}
          <div className="detail-right">
            <div className="detail-summary">
              <h1>{car.year} {car.make} {car.model}</h1>
              <div className="detail-price">${car.price?.toLocaleString()}</div>
              <div className="detail-quick-specs">
                <span>🛣 {car.mileage?.toLocaleString()} km</span>
                <span>⛽ {car.fuel}</span>
                <span>⚙️ {car.transmission}</span>
              </div>
              <div className="detail-quick-specs">
                <span>👤 Seller: {car.sellerName}</span>
                <span>📅 Listed {new Date(car.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* MESSAGE SELLER SECTION - WITH SEND BUTTON */}
            <div className="booking-card">
              <h3>💬 Message Seller</h3>
              
              {!user ? (
                <div className="enquire-box">
                  <p>You need to login to contact the seller</p>
                  <button className="booking-submit" onClick={() => onNavigate('login')}>
                    Login to Message
                  </button>
                </div>
              ) : user.id === car.sellerId ? (
                <div className="enquire-box">
                  <p>This is your listing. You can't message yourself.</p>
                </div>
              ) : (
                <>
                  {messageStatus === 'success' && (
                    <div className="booking-success">
                      <span>✅</span>
                      <div>
                        <strong>Message Sent!</strong>
                        <p>The seller will get back to you soon.</p>
                      </div>
                    </div>
                  )}
                  
                  {messageStatus === 'error' && (
                    <div className="auth-error">
                      ❌ Failed to send message. Please try again.
                    </div>
                  )}
                  
                  {!showMessageForm ? (
                    <button 
                      className="booking-submit" 
                      onClick={() => setShowMessageForm(true)}
                      style={{ background: '#2563eb' }}
                    >
                      📧 Contact Seller
                    </button>
                  ) : (
                    <div className="booking-form">
                      <div className="form-field">
                        <label>Your Message</label>
                        <textarea
                          rows="4"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder={`Hi ${car.sellerName}, I'm interested in the ${car.year} ${car.make} ${car.model}. Is it still available?`}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit', marginBottom: '12px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button 
                          className="booking-submit" 
                          onClick={handleSendMessage}
                          disabled={!messageText.trim()}
                          style={{ flex: 1 }}
                        >
                          📤 Send Message
                        </button>
                        <button 
                          className="btn-outline" 
                          onClick={() => setShowMessageForm(false)}
                          style={{ padding: '12px 20px' }}
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

            {/* AI Assistant */}
            <div className="enquire-box">
              <p>Have questions about this vehicle?</p>
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