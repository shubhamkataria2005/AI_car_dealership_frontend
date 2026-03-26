// src/pages/inventory/InventoryPages.jsx
import React, { useState, useEffect } from 'react';
import './InventoryPage.css';
import { api } from '../../services/api';

const InventoryPage = ({ onNavigate, locationFilters }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    keyword: '',  // NEW: Keyword search
    make: 'All', 
    body: 'All', 
    fuel: 'All', 
    maxPrice: 100000, 
    sortBy: 'newest',
    source: 'All'
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Load filters from navigation if passed
    if (locationFilters?.filters) {
      const newFilters = { ...filters, ...locationFilters.filters };
      // Handle source mapping
      if (locationFilters.filters.source) {
        if (locationFilters.filters.source === 'marketplace') {
          newFilters.source = 'Marketplace';
        } else if (locationFilters.filters.source === 'dealership') {
          newFilters.source = 'Dealership';
        }
      }
      // Handle keyword from search
      if (locationFilters.filters.keyword) {
        newFilters.keyword = locationFilters.filters.keyword;
      }
      setFilters(newFilters);
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

  const MAKES = ['All', 'Toyota', 'Honda', 'Mazda', 'Subaru', 'Nissan', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Hyundai', 'Kia', 'Volkswagen'];
  const BODIES = ['All', 'Sedan', 'SUV', 'Hatchback', 'Ute', 'Wagon', 'Coupe', 'Convertible'];
  const FUELS = ['All', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];
  const SOURCES = ['All', 'Marketplace', 'Dealership'];

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  const filtered = cars
    .filter(car => {
      // NEW: Keyword search - searches make, model, year, description
      if (filters.keyword) {
        const searchLower = filters.keyword.toLowerCase();
        const matchesSearch = 
          car.make?.toLowerCase().includes(searchLower) ||
          car.model?.toLowerCase().includes(searchLower) ||
          car.year?.toString().includes(searchLower) ||
          (car.description && car.description.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      
      // Make filter
      if (filters.make !== 'All' && car.make !== filters.make) return false;
      
      // Body type filter
      if (filters.body !== 'All' && car.bodyType !== filters.body) return false;
      
      // Fuel filter
      if (filters.fuel !== 'All' && car.fuel !== filters.fuel) return false;
      
      // Price filter
      if (car.price > filters.maxPrice) return false;
      
      // Legacy search filter (make, model, year)
      if (search && !`${car.make} ${car.model} ${car.year}`.toLowerCase().includes(search.toLowerCase())) return false;
      
      // Source filter
      if (filters.source !== 'All') {
        const expectedSource = filters.source === 'Marketplace' ? 'MARKETPLACE' : 'DEALERSHIP';
        if (car.carSource !== expectedSource) return false;
      }
      
      // Only show available cars
      return car.status === 'AVAILABLE';
    })
    .sort((a, b) => {
      if (filters.sortBy === 'price-low') return a.price - b.price;
      if (filters.sortBy === 'price-high') return b.price - a.price;
      if (filters.sortBy === 'mileage') return a.mileage - b.mileage;
      return b.year - a.year; // newest first
    });

  // Get counts for each source
  const marketplaceCount = cars.filter(c => c.carSource === 'MARKETPLACE' && c.status === 'AVAILABLE').length;
  const dealershipCount = cars.filter(c => c.carSource === 'DEALERSHIP' && c.status === 'AVAILABLE').length;

  return (
    <div className="inventory-page page">
      <div className="inventory-header">
        <div className="container">
          <div className="inventory-header-inner">
            <div>
              <div className="inventory-eyebrow">Browse our stock</div>
              <h1>Car Inventory</h1>
            </div>
            <div className="inventory-stats">
              <span className="inventory-count">{filtered.length} vehicles available</span>
              <div className="inventory-source-badges">
                <span className="source-badge-small marketplace">🏪 Marketplace: {marketplaceCount}</span>
                <span className="source-badge-small dealership">🚗 Dealership: {dealershipCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="inventory-layout container">
        <aside className="filters-sidebar">
          <h3>Filter Cars</h3>

          {/* NEW: Keyword Search - Search ANY car */}
          <div className="filter-group">
            <label>🔍 Search ANY Car</label>
            <input 
              type="text" 
              placeholder="Search any make, model, year, or keyword..."
              value={filters.keyword}
              onChange={e => setFilter('keyword', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 14px', 
                border: '1px solid var(--gray-lighter)', 
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                background: 'var(--cream)'
              }}
            />
          </div>

          {/* Existing Search */}
          <div className="filter-group">
            <label>Search</label>
            <input 
              type="text" 
              placeholder="Make, model, year..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          {/* Source Filter */}
          <div className="filter-group">
            <label>Car Source</label>
            <div className="filter-chips">
              {SOURCES.map(s => (
                <button 
                  key={s} 
                  className={`filter-chip ${filters.source === s ? 'active' : ''}`} 
                  onClick={() => setFilter('source', s)}
                >
                  {s === 'Marketplace' ? '🏪 Marketplace' : s === 'Dealership' ? '🚗 Dealership' : 'All'}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Make</label>
            <div className="filter-chips">
              {MAKES.map(m => (
                <button 
                  key={m} 
                  className={`filter-chip ${filters.make === m ? 'active' : ''}`} 
                  onClick={() => setFilter('make', m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Body Type</label>
            <div className="filter-chips">
              {BODIES.map(b => (
                <button 
                  key={b} 
                  className={`filter-chip ${filters.body === b ? 'active' : ''}`} 
                  onClick={() => setFilter('body', b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Fuel Type</label>
            <div className="filter-chips">
              {FUELS.map(f => (
                <button 
                  key={f} 
                  className={`filter-chip ${filters.fuel === f ? 'active' : ''}`} 
                  onClick={() => setFilter('fuel', f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Max Price: ${filters.maxPrice.toLocaleString()}</label>
            <input 
              type="range" 
              min="5000" 
              max="100000" 
              step="1000" 
              value={filters.maxPrice} 
              onChange={e => setFilter('maxPrice', Number(e.target.value))} 
              className="price-slider" 
            />
            <div className="price-range-labels">
              <span>$5,000</span>
              <span>$100,000</span>
            </div>
          </div>

          <button 
            className="reset-filters" 
            onClick={() => { 
              setFilters({ 
                keyword: '',
                make: 'All', 
                body: 'All', 
                fuel: 'All', 
                maxPrice: 100000, 
                sortBy: 'newest',
                source: 'All'
              }); 
              setSearch(''); 
            }}
          >
            Reset Filters
          </button>
        </aside>

        <div className="inventory-main">
          <div className="inventory-toolbar">
            <span className="results-count">
              {filtered.length} results
              {filters.keyword && ` for "${filters.keyword}"`}
            </span>
            <select 
              value={filters.sortBy} 
              onChange={e => setFilter('sortBy', e.target.value)} 
              className="sort-select"
            >
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
              <span>🔍</span>
              <h3>No cars match your search</h3>
              <p>Try different keywords or adjust your filters</p>
              <p style={{ fontSize: '13px', color: 'var(--gold)', marginTop: '8px' }}>
                Popular searches: SUV, Toyota, Electric, under $30k
              </p>
              <button 
                className="reset-filters" 
                onClick={() => { 
                  setFilters({ 
                    keyword: '',
                    make: 'All', 
                    body: 'All', 
                    fuel: 'All', 
                    maxPrice: 100000, 
                    sortBy: 'newest',
                    source: 'All'
                  }); 
                  setSearch(''); 
                }}
                style={{ marginTop: '16px', width: 'auto', padding: '10px 24px' }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="inventory-grid">
              {filtered.map(car => (
                <div key={car.id} className="car-card" onClick={() => onNavigate('car-detail', car)}>
                  <div className="car-card-image">
                    <img 
                      src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80'} 
                      alt={`${car.year} ${car.make} ${car.model}`} 
                    />
                    <span className="car-badge">{car.status === 'AVAILABLE' ? 'Available' : 'Sold'}</span>
                    {/* Source Badge */}
                    {car.carSource === 'DEALERSHIP' && (
                      <span className="source-badge dealership">🏢 Dealership</span>
                    )}
                    {car.carSource === 'MARKETPLACE' && (
                      <span className="source-badge marketplace">👤 Private Seller</span>
                    )}
                    {/* Inspection Status for Dealership Cars */}
                    {car.carSource === 'DEALERSHIP' && car.inspectionStatus === 'PASSED' && (
                      <span className="inspection-badge">✓ Inspected</span>
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
                    {car.carSource === 'DEALERSHIP' && car.stockNumber && (
                      <div className="car-card-stock">
                        <span>Stock #: {car.stockNumber}</span>
                      </div>
                    )}
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