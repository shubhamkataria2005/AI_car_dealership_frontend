// src/pages/carDetailPage/CarDeatilPage.jsx
import React, { useState, useEffect } from 'react';
import './CarDeatilPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const TIME_OPTIONS = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'];

// "10:00 AM" -> "10:00:00" so it combines with the date input into a
// LocalDateTime string the backend (LocalDateTime.parse) can read directly:
// e.g. "2026-06-25T10:00:00"
const to24Hour = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
};

const formatApptDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });
};

const STATUS_LABELS = {
  SCHEDULED: 'Pending Approval',
  CONFIRMED: 'Confirmed',
};

const CarDetailPage = ({ car, user, onNavigate, sessionToken }) => {
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', date: '', time: '' });
  const [bookingStatus, setBookingStatus] = useState(''); // '' | 'loading' | 'success' | 'error'
  const [bookingError, setBookingError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const [messageText, setMessageText] = useState('');
  const [messageStatus, setMessageStatus] = useState('');
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  // NEW — existing booking for this car (dealership cars only) + reschedule UI
  const [existingBooking, setExistingBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [bookedSlots, setBookedSlots] = useState([]); // ISO datetime strings already taken on the selected date

  const token = sessionToken || localStorage.getItem('token');
  const isDealershipCar = car?.carSource === 'DEALERSHIP';

  // Does the user already have an active booking for this specific car?
  useEffect(() => {
    if (!user || !car?.id || !isDealershipCar) {
      setLoadingBooking(false);
      return;
    }
    setLoadingBooking(true);
    fetch(`${API_BASE_URL}/api/service/my-appointment-for-car/${car.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { if (data.success) setExistingBooking(data.appointment); })
      .catch(() => {})
      .finally(() => setLoadingBooking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, car?.id]);

  // Which slots are already taken for whichever date is currently selected
  // (new-booking form, or the reschedule form if that's open)?
  useEffect(() => {
    const dateToCheck = showReschedule ? rescheduleForm.date : bookingForm.date;
    if (!dateToCheck || !car?.id || !isDealershipCar) {
      setBookedSlots([]);
      return;
    }
    fetch(`${API_BASE_URL}/api/service/booked-slots/${car.id}?date=${dateToCheck}`)
      .then(res => res.json())
      .then(data => { if (data.success) setBookedSlots(data.bookedSlots || []); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingForm.date, rescheduleForm.date, showReschedule, car?.id]);

  const isSlotTaken = (date, time) => {
    if (!date || !time) return false;
    return bookedSlots.includes(`${date}T${to24Hour(time)}`);
  };

  if (!car) {
    return (
      <div className="car-detail-page page">
        <div className="container">
          <p style={{ padding: '48px 0', textAlign: 'center', color: 'var(--gray-dark)' }}>
            No car selected.{' '}
            <button
              style={{ color: 'var(--gold)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => onNavigate('inventory')}
            >
              Browse inventory
            </button>
          </p>
        </div>
      </div>
    );
  }

  const handleBookingChange = e =>
    setBookingForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) { onNavigate('login'); return; }

    setBookingStatus('loading');
    setBookingError('');

    try {
      const appointmentDate = `${bookingForm.date}T${to24Hour(bookingForm.time)}`;

      const response = await fetch(`${API_BASE_URL}/api/service/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          carId: car.id,
          serviceType: 'TEST_DRIVE',
          appointmentDate,
          notes: `Contact: ${bookingForm.name || user?.username || 'N/A'}, ${bookingForm.phone || 'no phone given'}`
        })
      });

      const data = await response.json();

      if (data.success) {
        setBookingStatus('success');
        setExistingBooking(data.appointment); // show the booking card instead of resetting to blank
        setBookingForm({ name: '', phone: '', date: '', time: '' });
      } else {
        setBookingStatus('error');
        setBookingError(data.message || 'Failed to book test drive. Please try again.');
        if (data.existingAppointment) setExistingBooking(data.existingAppointment);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setBookingStatus('error');
      setBookingError('Network error. Please try again.');
    }
  };

  const handleRescheduleChange = e =>
    setRescheduleForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setBookingStatus('loading');
    setBookingError('');

    try {
      const appointmentDate = `${rescheduleForm.date}T${to24Hour(rescheduleForm.time)}`;

      const response = await fetch(`${API_BASE_URL}/api/service/${existingBooking.id}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentDate })
      });

      const data = await response.json();

      if (data.success) {
        setExistingBooking(data.appointment);
        setShowReschedule(false);
        setBookingStatus('success');
        setRescheduleForm({ date: '', time: '' });
      } else {
        setBookingStatus('error');
        setBookingError(data.message || 'Failed to reschedule. Please try again.');
      }
    } catch (err) {
      console.error('Reschedule error:', err);
      setBookingStatus('error');
      setBookingError('Network error. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!user) { onNavigate('login'); return; }
    if (!messageText.trim()) return;

    setMessageStatus('sending');

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: car.sellerId,
          carId: car.id,
          content: messageText
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

  const openTestDriveChat = () => {
    setMessageText(prev => prev || `Hi ${car.sellerName || 'there'}, I'm interested in test driving the ${car.year} ${car.make} ${car.model}. What times work for you?`);
    setShowMsgForm(true);
  };

  const handleEmailSeller = () => {
    const subject = encodeURIComponent(`Enquiry about ${car.year} ${car.make} ${car.model}`);
    const body = encodeURIComponent(
      `Hi ${car.sellerName || 'there'},\n\nI'm interested in the ${car.year} ${car.make} ${car.model} listed for $${car.price?.toLocaleString()}. Is it still available?\n\nThanks`
    );
    window.location.href = `mailto:${car.sellerEmail || ''}?subject=${subject}&body=${body}`;
  };

  const specs = [
    { label: 'Year', value: car.year },
    { label: 'Make', value: car.make },
    { label: 'Model', value: car.model },
    { label: 'Mileage', value: car.mileage ? `${car.mileage.toLocaleString()} km` : null },
    { label: 'Fuel Type', value: car.fuel },
    { label: 'Transmission', value: car.transmission },
    { label: 'Body Type', value: car.bodyType },
    { label: 'Seller', value: car.sellerName },
  ];

  const isSeller = user && user.id === car.sellerId;
  const isSold = car.status === 'SOLD';
  const isReserved = car.status === 'RESERVED';

  return (
    <div className="car-detail-page page">

      <div className="breadcrumb">
        <div className="container">
          <button onClick={() => onNavigate('home')}>Home</button>
          <span>/</span>
          <button onClick={() => onNavigate('inventory')}>Inventory</button>
          <span>/</span>
          <span>{car.year} {car.make} {car.model}</span>
        </div>
      </div>

      <div className="container">
        <div className="detail-layout">

          <div className="detail-left">
            <div className="detail-image">
              <img
                src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'}
                alt={`${car.year} ${car.make} ${car.model}`}
              />
              {car.badge && <span className="car-badge-lg">{car.badge}</span>}
              {isSold && <span className="car-badge-lg" style={{ background: '#991b1b' }}>SOLD</span>}
              {isReserved && <span className="car-badge-lg" style={{ background: '#e67e22' }}>RESERVED</span>}
            </div>

            <div className="detail-tabs">
              <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Specifications</button>
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

          <div className="detail-right">

            <div className="detail-summary">
              <h1>{car.year} {car.make} {car.model}</h1>
              <div className="detail-price">${car.price?.toLocaleString()}</div>
              <div className="detail-quick-specs">
                <span>{car.mileage?.toLocaleString()} km</span>
                <span>{car.fuel}</span>
                <span>{car.transmission}</span>
              </div>
              {car.sellerName && (
                <div className="detail-quick-specs">
                  <span>{car.sellerName}</span>
                </div>
              )}
              {isDealershipCar && (
                <div className="detail-quick-specs">
                  <span>Dealership Car</span>
                  {car.inspectionStatus === 'PASSED' && <span>Inspected</span>}
                </div>
              )}
            </div>

            {isSeller && (
              <div className="booking-card">
                <h3>Your Listing</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-dark)' }}>
                  This is your car listing. Check your dashboard for inquiries.
                </p>
                <button
                  className="btn-outline"
                  style={{ width: '100%', marginTop: '12px' }}
                  onClick={() => onNavigate('dashboard')}
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {isSold && (
              <div className="booking-card">
                <h3>Sold</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-dark)' }}>
                  This vehicle has been sold. Check our inventory for similar cars.
                </p>
                <button
                  className="btn-outline"
                  style={{ width: '100%', marginTop: '12px' }}
                  onClick={() => onNavigate('inventory')}
                >
                  Browse More Cars
                </button>
              </div>
            )}

            {isReserved && (
              <div className="booking-card">
                <h3>Reserved - Pending Sale</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-dark)' }}>
                  This vehicle has been reserved by another buyer pending finalisation with the seller.
                </p>
              </div>
            )}

            {/* ===== CONTACT DEALER (Chat / Call / Email) ===== */}
            <div className="contact-dealer-card">
              <h3>Contact Dealer</h3>

              {car.sellerName && (
                <div className="contact-dealer-seller">
                  <div className="contact-dealer-avatar">
                    {car.sellerName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="contact-dealer-seller-info">
                    <strong>{car.sellerName}</strong>
                    <span>{isDealershipCar ? 'In-trade dealer' : 'Private seller'}</span>
                  </div>
                </div>
              )}

              {!user && (
                <>
                  <p className="contact-dealer-login-note">
                    Login to contact the seller about this car.
                  </p>
                  <button className="booking-submit" onClick={() => onNavigate('login')}>
                    Login to Contact
                  </button>
                </>
              )}

              {isSeller && (
                <p className="contact-dealer-login-note" style={{ margin: 0 }}>
                  This is your listing. Check your{' '}
                  <button
                    style={{ background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 600, cursor: 'pointer', fontSize: '14px', padding: 0 }}
                    onClick={() => onNavigate('dashboard')}
                  >
                    messages inbox
                  </button>
                  {' '}for buyer enquiries.
                </p>
              )}

              {user && !isSeller && (
                <>
                  <div className="contact-dealer-actions">
                    <button
                      className="contact-dealer-btn"
                      onClick={() => setShowMsgForm(prev => !prev)}
                    >
                      <span className="icon">Chat</span>
                      Chat
                    </button>
                    <button
                      className="contact-dealer-btn"
                      onClick={() => setShowPhone(prev => !prev)}
                      disabled={!car.sellerPhone}
                      title={!car.sellerPhone ? 'Phone number not provided' : ''}
                    >
                      <span className="icon">Call</span>
                      Call
                    </button>
                    <button
                      className="contact-dealer-btn"
                      onClick={handleEmailSeller}
                      disabled={!car.sellerEmail}
                      title={!car.sellerEmail ? 'Email not provided' : ''}
                    >
                      <span className="icon">Email</span>
                      Email
                    </button>
                  </div>

                  {showPhone && car.sellerPhone && (
                    <div className="contact-dealer-phone-reveal">
                      <a href={`tel:${car.sellerPhone}`}>{car.sellerPhone}</a>
                    </div>
                  )}

                  {messageStatus === 'success' && (
                    <div className="booking-success" style={{ marginTop: '12px' }}>
                      <span>✓</span>
                      <div>
                        <strong>Message Sent!</strong>
                        <p>The seller will get back to you soon. Check your inbox in the dashboard.</p>
                      </div>
                    </div>
                  )}

                  {messageStatus === 'error' && (
                    <div className="auth-error" style={{ marginTop: '12px' }}>
                      Failed to send. Please try again.
                    </div>
                  )}

                  {showMsgForm && (
                    <div className="contact-dealer-chat-panel">
                      <div className="form-field">
                        <label>Your Message</label>
                        <textarea
                          rows={4}
                          value={messageText}
                          onChange={e => setMessageText(e.target.value)}
                          placeholder={`Hi ${car.sellerName || 'there'}, I'm interested in the ${car.year} ${car.make} ${car.model}. Is it still available?`}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <button
                          className="booking-submit"
                          onClick={handleSendMessage}
                          disabled={!messageText.trim() || messageStatus === 'sending'}
                          style={{ flex: 1 }}
                        >
                          {messageStatus === 'sending' ? 'Sending...' : 'Send Message'}
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

            <div className="finance-teaser">
              <span>$</span>
              <div>
                <strong>From ${Math.round((car.price || 0) / 60 / 10) * 10}/month</strong>
                <p>Over 60 months. Use our finance calculator in the dashboard.</p>
              </div>
            </div>

            {/* ===== TEST DRIVES — marketplace vs dealership ===== */}
            {!isDealershipCar ? (
              <div className="booking-card">
                <h3>Test Drives</h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-dark)', marginBottom: '12px' }}>
                  This car is from a private seller, so test drives are arranged directly with them rather than through our booking system.
                </p>
                {!user && (
                  <button className="booking-submit" onClick={() => onNavigate('login')}>
                    Login to Message Seller
                  </button>
                )}
                {user && !isSeller && (
                  <button className="booking-submit" onClick={openTestDriveChat}>
                    Message Seller to Arrange
                  </button>
                )}
                {isSeller && (
                  <p style={{ fontSize: '13px', color: 'var(--gray)' }}>
                    Buyers will message you directly to arrange a time — check your dashboard inbox.
                  </p>
                )}
              </div>
            ) : (
              <div className="booking-card">
                <h3>Book a Test Drive</h3>

                {loadingBooking ? (
                  <p style={{ fontSize: '13px', color: 'var(--gray)' }}>Checking your bookings…</p>

                ) : existingBooking && !showReschedule ? (
                  <div>
                    <div className="booking-success">
                      <span>✓</span>
                      <div>
                        <strong>{STATUS_LABELS[existingBooking.status] || existingBooking.status}</strong>
                        <p>{formatApptDate(existingBooking.appointmentDate)}</p>
                      </div>
                    </div>
                    <button
                      className="btn-outline"
                      style={{ width: '100%', marginTop: '12px' }}
                      onClick={() => setShowReschedule(true)}
                    >
                      Change Date / Time
                    </button>
                  </div>

                ) : existingBooking && showReschedule ? (
                  <form className="booking-form" onSubmit={handleRescheduleSubmit}>
                    {bookingStatus === 'error' && <div className="auth-error">{bookingError}</div>}
                    <p style={{ fontSize: '13px', color: 'var(--gray-dark)', margin: 0 }}>
                      Currently booked for <strong>{formatApptDate(existingBooking.appointmentDate)}</strong>. Pick a new time below.
                    </p>
                    <div className="form-row">
                      <div className="form-field">
                        <label>New Date</label>
                        <input type="date" name="date" value={rescheduleForm.date} onChange={handleRescheduleChange} min={new Date().toISOString().split('T')[0]} required />
                      </div>
                      <div className="form-field">
                        <label>New Time</label>
                        <select name="time" value={rescheduleForm.time} onChange={handleRescheduleChange} required>
                          <option value="">Select</option>
                          {TIME_OPTIONS.map(t => (
                            <option key={t} value={t} disabled={isSlotTaken(rescheduleForm.date, t)}>
                              {t}{isSlotTaken(rescheduleForm.date, t) ? ' — Unavailable' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="booking-submit" disabled={bookingStatus === 'loading'} style={{ flex: 1 }}>
                        {bookingStatus === 'loading' ? 'Saving...' : 'Confirm New Time'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowReschedule(false); setRescheduleForm({ date: '', time: '' }); }}
                        style={{ padding: '12px 16px', background: 'none', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '13px', color: 'var(--gray-dark)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>

                ) : (
                  <form className="booking-form" onSubmit={handleBookingSubmit}>
                    {bookingStatus === 'error' && <div className="auth-error">{bookingError}</div>}
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
                          {TIME_OPTIONS.map(t => (
                            <option key={t} value={t} disabled={isSlotTaken(bookingForm.date, t)}>
                              {t}{isSlotTaken(bookingForm.date, t) ? ' — Unavailable' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {!user && (
                      <p className="booking-login-note">
                        You need to <button type="button" onClick={() => onNavigate('login')}>login</button> to book.
                      </p>
                    )}
                    <button type="submit" className="booking-submit" disabled={!user || bookingStatus === 'loading'}>
                      {bookingStatus === 'loading' ? 'Booking...' : user ? 'Book Test Drive' : 'Login to Book'}
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="enquire-box">
              <p>Have more questions about this vehicle?</p>
              <button
                className="btn-outline"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => user ? onNavigate('dashboard') : onNavigate('login')}
              >
                Chat with AI Assistant
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;