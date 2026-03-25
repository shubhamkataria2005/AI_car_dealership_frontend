import React from 'react';
import './HomePage.css';

const FEATURED_CARS = [
  {
    id: 1, make: 'Toyota', model: 'Camry', year: 2021, price: 24900,
    mileage: 32000, fuel: 'Petrol', transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80',
    badge: 'Great Value'
  },
  {
    id: 2, make: 'Honda', model: 'CR-V', year: 2020, price: 31500,
    mileage: 41000, fuel: 'Petrol', transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80',
    badge: 'Popular'
  },
  {
    id: 3, make: 'Mazda', model: 'CX-5', year: 2022, price: 37800,
    mileage: 18000, fuel: 'Petrol', transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&q=80',
    badge: 'Low KMs'
  },
];

const HomePage = ({ onNavigate }) => {
  return (
    <div className="home-page page">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-eyebrow">Auckland's trusted used car dealer</span>
            <h1>Find Your<br /><em>Perfect</em><br />Used Car</h1>
            <p>Hundreds of quality vehicles, honestly priced. No pressure. No hidden fees. Just great cars.</p>
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
                <strong>200+</strong>
                <span>Cars in stock</span>
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
              <strong>200+</strong>
              <span>Vehicles available now</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH ── */}
      <section className="search-section">
        <div className="container">
          <div className="search-bar-home">
            <div className="search-field">
              <label>Make</label>
              <select>
                <option value="">Any make</option>
                <option>Toyota</option><option>Honda</option>
                <option>Mazda</option><option>Subaru</option>
                <option>Nissan</option><option>Ford</option>
              </select>
            </div>
            <div className="search-field">
              <label>Max Price</label>
              <select>
                <option value="">Any price</option>
                <option>Under $15,000</option><option>Under $25,000</option>
                <option>Under $40,000</option><option>Under $60,000</option>
              </select>
            </div>
            <div className="search-field">
              <label>Body Type</label>
              <select>
                <option value="">Any type</option>
                <option>Sedan</option><option>SUV</option>
                <option>Hatchback</option><option>Ute</option><option>Wagon</option>
              </select>
            </div>
            <button className="search-btn" onClick={() => onNavigate('inventory')}>
              Search Cars
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURED CARS ── */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-label">Hand-picked</div>
              <h2>Featured Vehicles</h2>
            </div>
            <button className="view-all-btn" onClick={() => onNavigate('inventory')}>
              View all vehicles
            </button>
          </div>

          <div className="cars-grid">
            {FEATURED_CARS.map(car => (
              <div key={car.id} className="car-card" onClick={() => onNavigate('car-detail', car)}>
                <div className="car-card-image">
                  <img src={car.image} alt={`${car.year} ${car.make} ${car.model}`} />
                  {car.badge && <span className="car-badge">{car.badge}</span>}
                </div>
                <div className="car-card-body">
                  <div className="car-card-title">
                    <h3>{car.make} {car.model}</h3>
                    <span className="car-price">${car.price.toLocaleString()}</span>
                  </div>
                  <div className="car-card-specs">
                    <span>{car.mileage.toLocaleString()} km</span>
                    <span>{car.fuel}</span>
                    <span>{car.transmission}</span>
                  </div>
                  <div className="car-card-footer">
                    <button className="car-card-btn" onClick={e => { e.stopPropagation(); onNavigate('car-detail', car); }}>
                      View Details
                    </button>
                    <span className="car-card-year">{car.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="why-us">
        <div className="container">
          <div className="why-us-header">
            <div className="section-label" style={{ color: 'var(--gold)' }}>Our promise</div>
            <h2>Why Choose Us?</h2>
          </div>
          <div className="why-grid">
            {[
              { n: '150+', icon: '🔍', title: 'Point Inspection', desc: 'Every vehicle is thoroughly checked before it reaches you.' },
              { n: '$0', icon: '💰', title: 'Hidden Fees', desc: 'The price you see is exactly the price you pay. Always.' },
              { n: '100%', icon: '🤖', title: 'AI-Powered', desc: 'Our AI tools help you research, compare, and decide smarter.' },
              { n: 'Full', icon: '📋', title: 'History Reports', desc: 'Complete service and ownership records for every car.' },
            ].map(item => (
              <div key={item.title} className="why-card">
                <span className="why-number">{item.n}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
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