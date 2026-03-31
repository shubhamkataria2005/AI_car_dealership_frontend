// src/components/service/ServiceCenter.jsx
import React, { useState, useEffect } from 'react';
import './ServiceCenter.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ServiceCenter = ({ user, sessionToken }) => {
  const [appointments, setAppointments] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    carId: '',
    serviceType: 'TEST_DRIVE',
    appointmentDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const serviceTypes = [
    { value: 'TEST_DRIVE', label: 'Test Drive', description: 'Schedule a test drive for any dealership car' },
    { value: 'INSPECTION', label: 'Pre-Purchase Inspection', description: 'Get a professional inspection before buying' },
    { value: 'MAINTENANCE', label: 'Service & Maintenance', description: 'Regular maintenance for your car' },
    { value: 'REPAIR', label: 'Repair', description: 'Fix issues with your car' }
  ];

  const fetchAppointments = async () => {
    try {
      const token = sessionToken || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/service/my-appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAppointments(data.appointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const token = sessionToken || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/service/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingForm)
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage('Appointment booked successfully!');
        setBookingForm({ carId: '', serviceType: 'TEST_DRIVE', appointmentDate: '', notes: '' });
        fetchAppointments();
      } else {
        setMessage('Failed to book appointment: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>Service Center</h2>
        <p>Book test drives, inspections, and maintenance services</p>
      </div>

      <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        {/* Service Types Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {serviceTypes.map(service => (
            <div key={service.value} style={{ padding: '20px', background: 'var(--cream)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-lighter)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{service.label.split(' ')[0]}</div>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--black)' }}>{service.label}</h3>
              <p style={{ fontSize: '13px', color: 'var(--gray-dark)', margin: 0 }}>{service.description}</p>
            </div>
          ))}
        </div>

        {/* Booking Form */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-serif)', fontSize: '20px' }}>Book an Appointment</h3>
          
          {message && (
            <div style={{ 
              marginBottom: '20px', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius)', 
              background: message.includes('successfully') ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${message.includes('successfully') ? '#bbf7d0' : '#fecaca'}`,
              color: message.includes('successfully') ? '#166534' : '#991b1b'
            }}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-field">
              <label>Service Type *</label>
              <select 
                value={bookingForm.serviceType} 
                onChange={e => setBookingForm({...bookingForm, serviceType: e.target.value})}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}
              >
                {serviceTypes.map(st => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Car ID (if applicable)</label>
              <input 
                type="text" 
                placeholder="Enter car ID or leave blank"
                value={bookingForm.carId}
                onChange={e => setBookingForm({...bookingForm, carId: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}
              />
            </div>

            <div className="form-field">
              <label>Preferred Date & Time *</label>
              <input 
                type="datetime-local" 
                value={bookingForm.appointmentDate}
                onChange={e => setBookingForm({...bookingForm, appointmentDate: e.target.value})}
                min={getMinDateTime()}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}
              />
            </div>

            <div className="form-field">
              <label>Additional Notes</label>
              <textarea 
                rows="3"
                placeholder="Any specific requirements or questions..."
                value={bookingForm.notes}
                onChange={e => setBookingForm({...bookingForm, notes: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontFamily: 'var(--font-sans)', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="booking-submit" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>

        {/* My Appointments */}
        {appointments.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-serif)', fontSize: '20px' }}>Your Appointments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {appointments.map(apt => (
                <div key={apt.id} style={{ padding: '16px', background: 'var(--cream)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-lighter)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <strong style={{ color: 'var(--gold)' }}>{apt.serviceType?.replace('_', ' ')}</strong>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '11px', 
                      fontWeight: '700',
                      background: apt.status === 'SCHEDULED' ? '#fef3c7' : apt.status === 'COMPLETED' ? '#d1fae5' : '#fee2e2',
                      color: apt.status === 'SCHEDULED' ? '#92400e' : apt.status === 'COMPLETED' ? '#065f46' : '#991b1b'
                    }}>
                      {apt.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--gray-dark)' }}>
                    {new Date(apt.appointmentDate).toLocaleString()}
                  </div>
                  {apt.carId && (
                    <div style={{ fontSize: '13px', color: 'var(--gray)', marginTop: '4px' }}>
                      Car ID: {apt.carId}
                    </div>
                  )}
                  {apt.notes && (
                    <div style={{ fontSize: '13px', color: 'var(--gray)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--gray-lighter)' }}>
                      Notes: {apt.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCenter;