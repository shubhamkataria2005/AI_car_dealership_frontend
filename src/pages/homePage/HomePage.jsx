// src/pages/homePage/HomePage.jsx
import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { api } from '../../services/api';

const HomePage = ({ onNavigate }) => {
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState('both');

  useEffect(() => {
    api.getAllCars()
      .then(data => {
        if (data.success) {
          setAllCars(data.cars);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const getDisplayedCars = () => {
    if (activePlatform === 'marketplace') {
      return allCars.filter(car => car.carSource === 'MARKETPLACE').slice(0, 6);
    }
    if (activePlatform === 'dealership') {
      return allCars.filter(car => car.carSource === 'DEALERSHIP').slice(0, 6);
    }
    return allCars.slice(0, 12);
  };

  const getCarCount = () => {
    if (activePlatform === 'marketplace') {
      return allCars.filter(car => car.carSource === 'MARKETPLACE').length;
    }
    if (activePlatform === 'dealership') {
      return allCars.filter(car => car.carSource === 'DEALERSHIP').length;
    }
    return allCars.length;
  };

  const displayedCars = getDisplayedCars();
  const carCount = getCarCount();

  return (
    <div className="home-page page">
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-eyebrow">Auckland's trusted car platform</span>
            <h1>Find Your<br /><em>Perfect</em><br />Car</h1>
            <p>Choose from private sellers on our marketplace or professionally inspected dealership cars.</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => onNavigate('inventory')}>
                Browse All Cars
              </button>
              <button className="btn-outline" onClick={() => onNavigate('register')}>
                Create Account
              </button>
            </div>
            <div className="hero-divider" />
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>{allCars.length}+</strong>
                <span>Cars available</span>
              </div>
              <div className="hero-stat">
                <strong>5★</strong>
                <span>Customer rating</span>
              </div>
              <div className="hero-stat">
                <strong>10yr</strong>
                <span>In business</span>
              </div>
            </div>
          </div>

          <div className="hero-image-wrap">
            <div className="hero-image">
              <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80" alt="Premium used cars" />
            </div>
            <div className="hero-image-badge">
              <strong>{allCars.length}+</strong>
              <span>Vehicles available now</span>
            </div>
          </div>
        </div>
      </section>

      <section className="platform-selector-section">
        <div className="container">
          <div className="platform-tabs">
            <button
              className={`platform-tab ${activePlatform === 'both' ? 'active' : ''}`}
              onClick={() => setActivePlatform('both')}
            >
              All Cars ({allCars.length})
            </button>
            <button
              className={`platform-tab ${activePlatform === 'marketplace' ? 'active' : ''}`}
              onClick={() => setActivePlatform('marketplace')}
            >
              Marketplace ({allCars.filter(car => car.carSource === 'MARKETPLACE').length})
            </button>
            <button
              className={`platform-tab ${activePlatform === 'dealership' ? 'active' : ''}`}
              onClick={() => setActivePlatform('dealership')}
            >
              Dealership ({allCars.filter(car => car.carSource === 'DEALERSHIP').length})
            </button>
          </div>
        </div>
      </section>

      <section className="search-section">
        <div className="container">
          <div className="search-bar-home">
            <div className="search-field">
              <label>Search ANY Car</label>
              <input
                type="text"
                id="search-keyword"
                placeholder="Search any make, model, year, or keyword..."
                style={{
                  padding: '11px 14px',
                  border: '1px solid var(--gray-lighter)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  width: '100%',
                  background: 'var(--white)'
                }}
              />
            </div>
            <div className="search-field">
              <label>Make</label>
              <select id="search-make">
                <option value="">Any make</option>
                <option>Toyota</option><option>Honda</option>
                <option>Mazda</option><option>Subaru</option>
                <option>Nissan</option><option>Ford</option>
                <option>BMW</option><option>Mercedes</option><option>Audi</option>
              </select>
            </div>
            <div className="search-field">
              <label>Max Price</label>
              <select id="search-price">
                <option value="">Any price</option>
                <option value="15000">Under $15,000</option>
                <option value="25000">Under $25,000</option>
                <option value="40000">Under $40,000</option>
                <option value="60000">Under $60,000</option>
                <option value="100000">Under $100,000</option>
              </select>
            </div>
            <div className="search-field">
              <label>Body Type</label>
              <select id="search-body">
                <option value="">Any type</option>
                <option>Sedan</option><option>SUV</option>
                <option>Hatchback</option><option>Ute</option><option>Wagon</option>
                <option>Coupe</option><option>Convertible</option>
              </select>
            </div>
            <button className="search-btn" onClick={() => {
              const keyword = document.getElementById('search-keyword')?.value || '';
              const make = document.getElementById('search-make').value;
              const maxPrice = document.getElementById('search-price').value;
              const bodyType = document.getElementById('search-body').value;
              const params = { source: activePlatform === 'both' ? '' : activePlatform === 'marketplace' ? 'MARKETPLACE' : 'DEALERSHIP' };
              if (keyword) params.keyword = keyword;
              if (make) params.make = make;
              if (maxPrice) params.maxPrice = maxPrice;
              if (bodyType) params.bodyType = bodyType;
              onNavigate('inventory', { filters: params });
            }}>
              Search Cars
            </button>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-label">Featured</div>
              <h2>{activePlatform === 'both' ? 'Latest Vehicles' : activePlatform === 'marketplace' ? 'Marketplace Listings' : 'Dealership Inventory'}</h2>
            </div>
            <button className="view-all-btn" onClick={() => onNavigate('inventory')}>
              View all vehicles
            </button>
          </div>

          <div className="cars-grid">
            {loading ? (
              <div>Loading cars...</div>
            ) : displayedCars.length === 0 ? (
              <div>No cars available in this category.</div>
            ) : (
              displayedCars.map(car => (
                <div key={car.id} className="car-card" onClick={() => onNavigate('car-detail', car)}>
                  <div className="car-card-image">
                    <img src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80'}
                      alt={`${car.year} ${car.make} ${car.model}`} />
                    <span className="car-badge">{car.status === 'AVAILABLE' ? 'Available' : 'Sold'}</span>
                    {car.carSource === 'DEALERSHIP' && (
                      <span className="source-badge dealership">Dealership</span>
                    )}
                    {car.carSource === 'MARKETPLACE' && (
                      <span className="source-badge marketplace">Private Seller</span>
                    )}
                  </div>
                  <div className="car-card-body">
                    <div className="car-card-title">
                      <h3>{car.make} {car.model}</h3>
                      <span className="car-price">${car.price?.toLocaleString()}</span>
                    </div>
                    <div className="car-card-specs">
                      <span>{car.mileage?.toLocaleString()} km</span>
                      <span>{car.fuel}</span>
                      <span>{car.transmission}</span>
                    </div>
                    <div className="car-card-footer">
                      <button className="car-card-btn">View Details</button>
                      <span className="car-card-year">{car.year}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="why-us">
        <div className="container">
          <div className="why-us-header">
            <div className="section-label" style={{ color: 'var(--gold)' }}>Two ways to buy</div>
            <h2>Choose Your Experience</h2>
          </div>
          <div className="why-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="why-card">
              <span className="why-number">Marketplace</span>
              <h3>Marketplace</h3>
              <p>Buy directly from private sellers. Find great deals and negotiate your own price. Like TradeMe but specialized for cars.</p>
              <ul style={{ marginTop: '12px', color: 'var(--gray)', fontSize: '13px' }}>
                <li>Direct seller communication</li>
                <li>Negotiate your price</li>
                <li>List your own car</li>
                <li>AI-powered price suggestions</li>
              </ul>
            </div>
            <div className="why-card">
              <span className="why-number">Dealership</span>
              <h3>Dealership</h3>
              <p>Buy from our professionally inspected, company-owned inventory with full support and service options.</p>
              <ul style={{ marginTop: '12px', color: 'var(--gray)', fontSize: '13px' }}>
                <li>150+ point inspection</li>
                <li>Test drives available</li>
                <li>Service center access</li>
                <li>Warranty options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <div className="cta-content">
              <div className="section-label">Get started today</div>
              <h2>Ready to Find Your Next Car?</h2>
              <p>Create a free account to save favourites, book test drives, and access our AI tools.</p>
            </div>
            <div className="cta-actions">
              <button className="btn-primary" onClick={() => onNavigate('inventory')}>
                Browse Inventory
              </button>
              <button className="btn-outline" onClick={() => onNavigate('register')}>
                Sign Up Free
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;