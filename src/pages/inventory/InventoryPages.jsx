import React, { useState, useEffect } from 'react';
import './InventoryPage.css';
import { api } from '../../services/api';

const InventoryPage = ({ onNavigate, locationFilters }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    make: 'All', 
    body: 'All', 
    fuel: 'All', 
    maxPrice: 100000, 
    sortBy: 'newest' 
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Load filters from navigation if passed
    if (locationFilters?.filters) {
      setFilters(prev => ({ ...prev, ...locationFilters.filters }));
    }
  }, [locationFilters]);

  useEffect(() => {
    setLoading(true);
    api.getAllCars()
      .then(data => {
        if (data.success) {
          setCars(data.cars);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const MAKES = ['All', 'Toyota', 'Honda', 'Mazda', 'Subaru', 'Nissan', 'Ford'];
  const BODIES = ['All', 'Sedan', 'SUV', 'Hatchback', 'Ute', 'Wagon'];
  const FUELS = ['All', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  const filtered = cars
    .filter(car => {
      if (filters.make !== 'All' && car.make !== filters.make) return false;
      if (filters.body !== 'All' && car.bodyType !== filters.body) return false;
      if (filters.fuel !== 'All' && car.fuel !== filters.fuel) return false;
      if (car.price > filters.maxPrice) return false;
      if (search && !`${car.make} ${car.model} ${car.year}`.toLowerCase().includes(search.toLowerCase())) return false;
      return car.status === 'AVAILABLE';
    })
    .sort((a, b) => {
      if (filters.sortBy === 'price-low') return a.price - b.price;
      if (filters.sortBy === 'price-high') return b.price - a.price;
      if (filters.sortBy === 'mileage') return a.mileage - b.mileage;
      return b.year - a.year;
    });

  return (
    <div className="inventory-page page">
      <div className="inventory-header">
        <div className="container">
          <div className="inventory-header-inner">
            <div>
              <div className="inventory-eyebrow">Browse our stock</div>
              <h1>Car Inventory</h1>
            </div>
            <span className="inventory-count">{filtered.length} vehicles available</span>
          </div>
        </div>
      </div>

      <div className="inventory-layout container">
        <aside className="filters-sidebar">
          <h3>Filter Cars</h3>

          <div className="filter-group">
            <label>Search</label>
            <input type="text" placeholder="Make, model, year..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="filter-group">
            <label>Make</label>
            <div className="filter-chips">
              {MAKES.map(m => <button key={m} className={`filter-chip ${filters.make === m ? 'active' : ''}`} onClick={() => setFilter('make', m)}>{m}</button>)}
            </div>
          </div>

          <div className="filter-group">
            <label>Body Type</label>
            <div className="filter-chips">
              {BODIES.map(b => <button key={b} className={`filter-chip ${filters.body === b ? 'active' : ''}`} onClick={() => setFilter('body', b)}>{b}</button>)}
            </div>
          </div>

          <div className="filter-group">
            <label>Fuel Type</label>
            <div className="filter-chips">
              {FUELS.map(f => <button key={f} className={`filter-chip ${filters.fuel === f ? 'active' : ''}`} onClick={() => setFilter('fuel', f)}>{f}</button>)}
            </div>
          </div>

          <div className="filter-group">
            <label>Max Price: ${filters.maxPrice.toLocaleString()}</label>
            <input type="range" min="5000" max="100000" step="1000" value={filters.maxPrice} onChange={e => setFilter('maxPrice', Number(e.target.value))} className="price-slider" />
            <div className="price-range-labels"><span>$5,000</span><span>$100,000</span></div>
          </div>

          <button className="reset-filters" onClick={() => { setFilters({ make: 'All', body: 'All', fuel: 'All', maxPrice: 100000, sortBy: 'newest' }); setSearch(''); }}>
            Reset Filters
          </button>
        </aside>

        <div className="inventory-main">
          <div className="inventory-toolbar">
            <span className="results-count">{filtered.length} results</span>
            <select value={filters.sortBy} onChange={e => setFilter('sortBy', e.target.value)} className="sort-select">
              <option value="newest">Newest first</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="mileage">Lowest Mileage</option>
            </select>
          </div>

          {loading ? (
            <div className="no-results">Loading cars...</div>
          ) : filtered.length === 0 ? (
            <div className="no-results">
              <span>🚗</span>
              <h3>No cars match your filters</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="inventory-grid">
              {filtered.map(car => (
                <div key={car.id} className="car-card" onClick={() => onNavigate('car-detail', car)}>
                  <div className="car-card-image">
                    <img src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80'} 
                         alt={`${car.year} ${car.make} ${car.model}`} />
                    <span className="car-badge">{car.status === 'AVAILABLE' ? 'Available' : 'Sold'}</span>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
