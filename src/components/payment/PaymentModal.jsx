// src/components/payment/PaymentModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, order, car, customerDetails, sessionToken }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bankDetails, setBankDetails] = useState(null);
  const [showBankDetails, setShowBankDetails] = useState(false);

  if (!isOpen) return null;

  const handleMockPayment = async () => {
    setLoading(true);
    setError('');

    try {
      const token = sessionToken || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/payments/mock-pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod: 'MOCK'
        })
      });

      const data = await response.json();

      if (data.success) {
        onClose();
        navigate('/purchase-success', { 
          state: { 
            order: data.order || order,
            car: car
          } 
        });
      } else {
        setError(data.message || 'Payment failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadBankDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/bank-details`);
      const data = await response.json();
      if (data.success) {
        setBankDetails(data.bankDetails);
        setShowBankDetails(true);
      }
    } catch (err) {
      setError('Failed to load bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleBankTransfer = () => {
    onClose();
    navigate('/purchase-success', { 
      state: { 
        order: order,
        car: car,
        paymentMethod: 'BANK_TRANSFER',
        pending: true
      } 
    });
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>Complete Payment</h2>
        
        <div className="payment-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Car:</span>
            <span>{car?.make} {car?.model} ({car?.year})</span>
          </div>
          <div className="summary-row">
            <span>Original Price:</span>
            <span>${order?.originalPrice?.toLocaleString()}</span>
          </div>
          {order?.tradeInValue > 0 && (
            <div className="summary-row">
              <span>Trade-In Credit:</span>
              <span>-${order?.tradeInValue?.toLocaleString()}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total to Pay:</span>
            <span>${order?.finalPrice?.toLocaleString()}</span>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Payment Methods</h3>
          
          <div className="method-card" onClick={handleMockPayment}>
            <div className="method-icon">💳</div>
            <div className="method-info">
              <strong>Mock Payment</strong>
              <p>Click to simulate payment - No actual money will be charged</p>
            </div>
          </div>

          <div className="method-card" onClick={loadBankDetails}>
            <div className="method-icon">🏦</div>
            <div className="method-info">
              <strong>Bank Transfer</strong>
              <p>View bank details for manual transfer</p>
            </div>
          </div>
        </div>

        {showBankDetails && bankDetails && (
          <div className="bank-details">
            <h4>Bank Transfer Details</h4>
            <div className="bank-info">
              <p><strong>Account Name:</strong> {bankDetails.accountName}</p>
              <p><strong>Account Number:</strong> {bankDetails.accountNumber}</p>
              <p><strong>Bank:</strong> {bankDetails.bankName}</p>
              <p><strong>Reference:</strong> ORDER-{order?.id}</p>
            </div>
            <button onClick={handleBankTransfer} className="btn-simulate">
              I have made the transfer
            </button>
          </div>
        )}

        {error && <div className="payment-error">{error}</div>}

        {loading && <div className="payment-loading">Processing...</div>}

        <div className="payment-note">
          <p>This is a DEMO payment system. No actual money will be charged.</p>
          <p>Click "Mock Payment" to complete the purchase simulation.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;