// src/components/tools/TradeInCalculator.jsx
import React, { useState } from 'react';
import './Tools.css';
import { API_BASE_URL } from '../../config';

const TradeInCalculator = ({ user, sessionToken }) => {
  const [formData, setFormData] = useState({
    rego: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: '',
    condition: 'GOOD',
    notes: ''
  });
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const conditions = [
    { value: 'EXCELLENT', label: 'Excellent - Like new, no issues' },
    { value: 'GOOD', label: 'Good - Minor wear, well maintained' },
    { value: 'FAIR', label: 'Fair - Some issues, needs attention' },
    { value: 'POOR', label: 'Poor - Major issues, needs repairs' }
  ];

  const calculateEstimate = async () => {
    if (!formData.make || !formData.model || !formData.year || !formData.mileage) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setMessage('');
    setEstimate(null);

    try {
      const token = sessionToken || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/trade-in/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify({
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          mileage: parseInt(formData.mileage),
          condition: formData.condition
        })
      });

      const data = await response.json();
      if (data.success) {
        setEstimate(data.estimatedValue);
      } else {
        setMessage(data.message || 'Failed to calculate estimate');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitTradeIn = async () => {
    if (!user) {
      setMessage('Please login to submit a trade-in request');
      return;
    }
    
    if (!formData.rego) {
      setMessage('Please enter your vehicle registration (rego)');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = sessionToken || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/trade-in/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rego: formData.rego.toUpperCase(),
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          mileage: parseInt(formData.mileage),
          condition: formData.condition,
          notes: formData.notes
        })
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setMessage('✅ Trade-in request submitted! We will contact you soon.');
      } else {
        setMessage(data.message || 'Failed to submit trade-in');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="tool-panel">
        <div className="tool-header">
          <h2>🚗 Trade-In Request Submitted!</h2>
          <p>Thank you for your interest. Our team will review your trade-in and contact you within 24-48 hours.</p>
        </div>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          {estimate && <h3>Estimated Value: ${estimate.toLocaleString()}</h3>}
          <button 
            onClick={() => { setSubmitted(false); setEstimate(null); setFormData({ rego: '', make: '', model: '', year: 2024, mileage: '', condition: 'GOOD', notes: '' }); }}
            className="booking-submit"
            style={{ marginTop: '20px', width: 'auto', padding: '12px 24px' }}
          >
            Submit Another Trade-In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>🔄 Trade-In Your Car</h2>
        <p>Get an estimate for your current car and trade it in when buying your next vehicle</p>
      </div>

      <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        <div className="finance-form">
          <div className="form-field">
            <label>Vehicle Registration (Rego) *</label>
            <input
              type="text"
              value={formData.rego}
              onChange={e => setFormData({...formData, rego: e.target.value.toUpperCase()})}
              placeholder="e.g., ABC123, XYZ789"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase' }}
            />
            <small style={{ fontSize: '10px', color: 'var(--gray)' }}>This helps us track your vehicle and prevent duplicate requests</small>
          </div>

          <div className="form-field">
            <label>Car Make *</label>
            <input
              type="text"
              value={formData.make}
              onChange={e => setFormData({...formData, make: e.target.value})}
              placeholder="e.g., Toyota, Honda, Ford"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          <div className="form-field">
            <label>Car Model *</label>
            <input
              type="text"
              value={formData.model}
              onChange={e => setFormData({...formData, model: e.target.value})}
              placeholder="e.g., Camry, Civic, Mustang"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Year *</label>
              <input
                type="number"
                value={formData.year}
                onChange={e => setFormData({...formData, year: e.target.value})}
                min="1990"
                max="2025"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div className="form-field">
              <label>Mileage (km) *</label>
              <input
                type="number"
                value={formData.mileage}
                onChange={e => setFormData({...formData, mileage: e.target.value})}
                placeholder="e.g., 50000"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Condition *</label>
            <select
              value={formData.condition}
              onChange={e => setFormData({...formData, condition: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)' }}
            >
              {conditions.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Additional Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Any issues, modifications, or special features..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--gray-lighter)', borderRadius: 'var(--radius-sm)', resize: 'vertical' }}
            />
          </div>

          {!estimate ? (
            <button
              onClick={calculateEstimate}
              disabled={loading}
              className="booking-submit"
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Calculating...' : '💰 Get Estimate'}
            </button>
          ) : (
            <div>
              <div style={{ background: 'var(--gold-pale)', padding: '16px', borderRadius: 'var(--radius)', textAlign: 'center', marginBottom: '16px' }}>
                <h3>Estimated Trade-In Value</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--gold)' }}>
                  ${estimate.toLocaleString()}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--gray-dark)', marginTop: '8px' }}>
                  *Final value determined after physical inspection
                </p>
              </div>
              
              <div className="form-actions" style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setEstimate(null)}
                  className="btn-outline"
                  style={{ flex: 1 }}
                >
                  Edit Details
                </button>
                <button
                  onClick={submitTradeIn}
                  disabled={loading}
                  className="booking-submit"
                  style={{ flex: 1 }}
                >
                  {loading ? 'Submitting...' : 'Submit Trade-In Request'}
                </button>
              </div>
            </div>
          )}

          {message && (
            <div style={{ marginTop: '16px', padding: '12px', background: message.includes('✅') ? '#f0fdf4' : '#fef2f2', borderRadius: 'var(--radius)', color: message.includes('✅') ? '#166534' : '#991b1b' }}>
              {message}
            </div>
          )}
        </div>

        <div className="tool-info" style={{ marginTop: '24px' }}>
          <h4>📋 How Trade-In Works:</h4>
          <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Enter your vehicle registration (rego)</li>
            <li>Tell us about your current car</li>
            <li>Get an estimated trade-in value</li>
            <li>Submit your trade-in request</li>
            <li>Our team will inspect your car and provide final offer</li>
            <li>Trade-in value applied as discount on your new car purchase</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TradeInCalculator;