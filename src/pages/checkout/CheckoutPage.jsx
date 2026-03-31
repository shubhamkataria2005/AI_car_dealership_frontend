// src/pages/checkout/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';
import { API_BASE_URL } from '../../config';
import PaymentModal from '../../components/payment/PaymentModal';

const CheckoutPage = ({ car, user, sessionToken, onNavigate }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tradeIns, setTradeIns] = useState([]);
  const [selectedTradeIn, setSelectedTradeIn] = useState(null);
  const [useTradeIn, setUseTradeIn] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    pickupMethod: 'delivery',
    deliveryAddress: '',
    specialInstructions: '',
    paymentMethod: 'mock'
  });

  // Load user's approved trade-ins
  useEffect(() => {
    if (user && sessionToken) {
      fetchTradeIns();
      // Pre-fill form with user data
      if (user) {
        const nameParts = user.username?.split(' ') || [''];
        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user.email || ''
        }));
      }
    }
  }, [user]);

  const fetchTradeIns = async () => {
    try {
      const token = sessionToken || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/trade-in/my-trade-ins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        const approvedTradeIns = data.tradeIns.filter(t => t.status === 'APPROVED');
        setTradeIns(approvedTradeIns);
      }
    } catch (err) {
      console.error('Error fetching trade-ins:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateFinalPrice = () => {
    let finalPrice = car.price;
    if (useTradeIn && selectedTradeIn) {
      finalPrice = finalPrice - selectedTradeIn.finalValue;
      if (finalPrice < 0) finalPrice = 0;
    }
    return finalPrice;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.address || !formData.city || !formData.postcode) {
      setError('Please fill in your address details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = sessionToken || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/cars/purchase-with-payment/${car.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tradeInId: useTradeIn && selectedTradeIn ? selectedTradeIn.id : null,
          customerDetails: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postcode: formData.postcode,
            pickupMethod: formData.pickupMethod,
            deliveryAddress: formData.pickupMethod === 'delivery' ? formData.deliveryAddress : null,
            specialInstructions: formData.specialInstructions
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        setShowPaymentModal(true);
      } else {
        setError(data.message || 'Failed to create order');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result) => {
    // Navigate to success page or dashboard
    navigate('/purchase-success', { state: { order: order, car: car } });
  };

  if (!car) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="error-message">
            <p>No car selected. <button onClick={() => onNavigate('inventory')}>Browse cars</button></p>
          </div>
        </div>
      </div>
    );
  }

  const finalPrice = calculateFinalPrice();

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-layout">
          
          {/* Left Column - Order Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>
            
            <div className="car-summary">
              <img src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=80'} alt={car.model} />
              <div className="car-details">
                <h3>{car.year} {car.make} {car.model}</h3>
                <p>{car.mileage?.toLocaleString()} km • {car.fuel} • {car.transmission}</p>
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Vehicle Price:</span>
                    <span>${car.price?.toLocaleString()}</span>
                  </div>
                  {useTradeIn && selectedTradeIn && (
                    <div className="price-row trade-in">
                      <span>Trade-In Credit ({selectedTradeIn.tradeMake} {selectedTradeIn.tradeModel}):</span>
                      <span>-${selectedTradeIn.finalValue?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="price-row total">
                    <span>Total to Pay:</span>
                    <span>${finalPrice?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade-In Section */}
            {tradeIns.length > 0 && (
              <div className="trade-in-section">
                <h3>Apply Trade-In Credit</h3>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={useTradeIn} 
                    onChange={(e) => setUseTradeIn(e.target.checked)}
                  />
                  Use an approved trade-in
                </label>
                
                {useTradeIn && (
                  <select 
                    value={selectedTradeIn?.id || ''} 
                    onChange={(e) => {
                      const trade = tradeIns.find(t => t.id === parseInt(e.target.value));
                      setSelectedTradeIn(trade);
                    }}
                    className="tradein-select"
                  >
                    <option value="">Select a trade-in vehicle</option>
                    {tradeIns.map(trade => (
                      <option key={trade.id} value={trade.id}>
                        {trade.tradeMake} {trade.tradeModel} ({trade.tradeYear}) - ${trade.finalValue?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Customer Details Form */}
          <div className="checkout-form">
            <h2>Customer Details</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmitOrder}>
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <div className="form-field">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="021 000 0000"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Address Details</h3>
                <div className="form-field">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Postcode *</label>
                    <input
                      type="text"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Delivery Options</h3>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="pickupMethod"
                      value="pickup"
                      checked={formData.pickupMethod === 'pickup'}
                      onChange={handleInputChange}
                    />
                    <span>Pick up from dealership</span>
                    <small>Free - Auckland CBD</small>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="pickupMethod"
                      value="delivery"
                      checked={formData.pickupMethod === 'delivery'}
                      onChange={handleInputChange}
                    />
                    <span>Home Delivery</span>
                    <small>$200 - Nationwide delivery</small>
                  </label>
                </div>

                {formData.pickupMethod === 'delivery' && (
                  <div className="form-field">
                    <label>Delivery Address</label>
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      placeholder="If different from above"
                    />
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3>Special Instructions</h3>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any special requests or notes..."
                />
              </div>

              <button 
                type="submit" 
                className="btn-checkout"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Proceed to Payment • $${finalPrice?.toLocaleString()}`}
              </button>

              <div className="secure-note">
                <span>🔒</span>
                <p>Your payment information is secure. No actual payment will be processed in demo mode.</p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        order={order}
        car={car}
        customerDetails={formData}
        sessionToken={sessionToken}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CheckoutPage;