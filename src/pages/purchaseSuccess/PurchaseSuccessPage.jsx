// src/pages/purchaseSuccess/PurchaseSuccessPage.jsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PurchaseSuccessPage.css';

const PurchaseSuccessPage = ({ onNavigate }) => {
  const location = useLocation();
  const { order, car } = location.state || {};

  useEffect(() => {
    if (order) {
      localStorage.removeItem('pendingOrder');
    }
  }, [order]);

  if (!order || !car) {
    return (
      <div className="success-page">
        <div className="success-container">
          <div className="success-icon">
            <span>✓</span>
          </div>
          <h1>Purchase Successful!</h1>
          <p>Thank you for your purchase.</p>
          <div className="action-buttons">
            <button className="btn-primary" onClick={() => onNavigate('home')}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon">
          <span>✓</span>
        </div>
        
        <h1>Purchase Successful!</h1>
        
        <p className="success-message">
          Thank you for your purchase. Your order has been confirmed.
        </p>
        
        <div className="order-details">
          <h2>Order Summary</h2>
          
          <div className="order-info">
            <div className="info-row">
              <span>Order ID:</span>
              <span>#{order.id}</span>
            </div>
            <div className="info-row">
              <span>Vehicle:</span>
              <span>{car.year} {car.make} {car.model}</span>
            </div>
            <div className="info-row">
              <span>Total Paid:</span>
              <span>${order.finalPrice?.toLocaleString()}</span>
            </div>
            <div className="info-row">
              <span>Payment Method:</span>
              <span>{order.paymentMethod || 'Mock Payment'}</span>
            </div>
            <div className="info-row">
              <span>Status:</span>
              <span className="status-paid">Paid</span>
            </div>
          </div>
        </div>
        
        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>You will receive a confirmation email shortly</li>
            <li>Our team will contact you within 24 hours to arrange delivery or pickup</li>
            <li>You can track your order in your dashboard</li>
          </ul>
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn-primary"
            onClick={() => onNavigate('dashboard')}
          >
            Go to Dashboard
          </button>
          <button 
            className="btn-outline"
            onClick={() => onNavigate('home')}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;