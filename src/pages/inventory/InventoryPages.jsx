// src/pages/inventory/InventoryPages.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './InventoryPage.css';
import { API_BASE_URL } from '../../config';

const InventoryPage = ({ onNavigate, locationFilters }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const [filters, setFilters] = useState({
    keyword: '',
    make: 'All',
    body: 'All',
    fuel: 'All',
    maxPrice: 1000000, // Increased to show luxury cars
    sortBy: 'newest',
    source: 'All'
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (locationFilters?.filters) {
      const incoming = locationFilters.filters;
      setFilters(prev => ({
        ...prev,
        keyword: incoming.keyword || '',
        make: incoming.make || 'All',
        body: incoming.bodyType || 'All',
        fuel: incoming.fuel || 'All',
        maxPrice: incoming.maxPrice ? Number(incoming.maxPrice) : 1000000,
        source: incoming.source === 'MARKETPLACE'
          ? 'Marketplace'
          : incoming.source === 'DEALERSHIP'
            ? 'Dealership'
            : 'All',
      }));
    }
  }, [locationFilters]);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError('');
    setDebugInfo('Fetching cars...');

    try {
      const url = `${API_BASE_URL}/api/cars/all`;
      console.log('Fetching from URL:', url);
      setDebugInfo(`Fetching from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('Response status:', response.status);
      setDebugInfo(prev => `${prev}\nResponse status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Full API response:', data);
      setDebugInfo(prev => `${prev}\nData received: ${JSON.stringify(data).substring(0, 500)}`);

      if (data && data.success && Array.isArray(data.cars)) {
        console.log('Cars array length:', data.cars.length);
        
        if (data.cars.length === 0) {
          setDebugInfo(prev => `${prev}\nNo cars found in database!`);
          setError('No cars available in inventory yet.');
          setCars([]);
        } else {
          // Log each car's status for debugging
          data.cars.forEach((car, index) => {
            console.log(`Car ${index + 1}: ${car.make} ${car.model} - Status: "${car.status}", Price: ${car.price}`);
          });
          
          setCars(data.cars);
          setDebugInfo(prev => `${prev}\nCars found: ${data.cars.length}`);
        }
      } else {
        console.error('Unexpected response format:', data);
        setDebugInfo(prev => `${prev}\nUnexpected response format: ${JSON.stringify(data)}`);
        setError('Received unexpected data format from server');
        setCars([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setDebugInfo(prev => `${prev}\nError: ${err.message}`);
      setError(`Failed to load cars: ${err.message}`);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const MAKES = ['All', 'Toyota', 'Honda', 'Mazda', 'Subaru', 'Nissan', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Hyundai', 'Kia', 'Volkswagen', 'Ferrari', 'Lamborghini', 'McLaren', 'Porsche', 'Aston Martin', 'Rolls Royce', 'Bentley', 'Bugatti', 'Koenigsegg', 'Pagani', 'Rimac', 'Lotus'];
  const BODIES = ['All', 'Sedan', 'SUV', 'Hatchback', 'Ute', 'Wagon', 'Coupe', 'Convertible'];
  const FUELS = ['All', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];
  const SOURCES = ['All', 'Marketplace', 'Dealership'];

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  const resetFilters = () => {
    setFilters({
      keyword: '',
      make: 'All',
      body: 'All',
      fuel: 'All',
      maxPrice: 1000000,
      sortBy: 'newest',
      source: 'All'
    });
    setSearch('');
  };

  // Filter cars - FIXED: Don't filter out cars with null or undefined status
  const filtered = cars.filter(car => {
    // FIX: Only filter out if status is explicitly "SOLD" or "RESERVED"
    // Allow null, undefined, "AVAILABLE", or any other status
    if (car.status === 'SOLD' || car.status === 'RESERVED') {
      console.log(`Filtering out ${car.make} ${car.model}: status = ${car.status}`);
      return false;
    }
    
    // Keyword search
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const matchesKw = 
        (car.make || '').toLowerCase().includes(kw) ||
        (car.model || '').toLowerCase().includes(kw) ||
        (car.year || '').toString().includes(kw) ||
        (car.description || '').toLowerCase().includes(kw);
      if (!matchesKw) return false;
    }

    // Quick search
    if (search) {
      const s = search.toLowerCase();
      const matchesSearch = 
        (car.make || '').toLowerCase().includes(s) ||
        (car.model || '').toLowerCase().includes(s) ||
        (car.year || '').toString().includes(s);
      if (!matchesSearch) return false;
    }

    // Make filter
    if (filters.make !== 'All' && car.make !== filters.make) return false;

    // Body type filter
    if (filters.body !== 'All' && car.bodyType !== filters.body) return false;

    // Fuel filter
    if (filters.fuel !== 'All' && car.fuel !== filters.fuel) return false;

    // Price filter - FIX: Handle null/undefined price
    const carPrice = car.price || 0;
    if (carPrice > filters.maxPrice) return false;

    // Source filter
    if (filters.source !== 'All') {
      const expectedSource = filters.source === 'Marketplace' ? 'MARKETPLACE' : 'DEALERSHIP';
      if (car.carSource !== expectedSource) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (filters.sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (filters.sortBy === 'mileage') return (a.mileage || 0) - (b.mileage || 0);
    return (b.year || 0) - (a.year || 0);
  });

  const marketplaceCount = cars.filter(c => c.carSource === 'MARKETPLACE' && c.status !== 'SOLD' && c.status !== 'RESERVED').length;
  const dealershipCount = cars.filter(c => c.carSource === 'DEALERSHIP' && c.status !== 'SOLD' && c.status !== 'RESERVED').length;

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
              <span className="inventory-count">
                {loading ? 'Loading...' : `${filtered.length} vehicles available`}
              </span>
              {!loading && cars.length > 0 && (
                <div className="inventory-source-badges">
                  <span className="source-badge-small marketplace">
                    Marketplace: {marketplaceCount}
                  </span>
                  <span className="source-badge-small dealership">
                    Dealership: {dealershipCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="inventory-layout container">

        <aside className="filters-sidebar">
          <h3>Filter Cars</h3>

          <div className="filter-group">
            <label>Keyword Search</label>
            <input
              type="text"
              placeholder="Make, model, year, keyword..."
              value={filters.keyword}
              onChange={e => setFilter('keyword', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Quick Search</label>
            <input
              type="text"
              placeholder="Make, model, year..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Car Source</label>
            <div className="filter-chips">
              {SOURCES.map(s => (
                <button
                  key={s}
                  className={`filter-chip ${filters.source === s ? 'active' : ''}`}
                  onClick={() => setFilter('source', s)}
                >
                  {s}
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
              max="5000000"
              step="10000"
              value={filters.maxPrice}
              onChange={e => setFilter('maxPrice', Number(e.target.value))}
              className="price-slider"
            />
            <div className="price-range-labels">
              <span>$5,000</span>
              <span>$5,000,000</span>
            </div>
          </div>

          <button className="reset-filters" onClick={resetFilters}>
            Reset Filters
          </button>
        </aside>

        <div className="inventory-main">
          <div className="inventory-toolbar">
            <span className="results-count">
              {loading
                ? 'Loading cars...'
                : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}${filters.keyword ? ` for "${filters.keyword}"` : ''}`
              }
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

          {/* Debug Panel - Remove after fixing */}
          {debugInfo && (
            <div style={{
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '16px',
              fontSize: '11px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <strong>Debug Info:</strong>
              <pre style={{ margin: '5px 0 0 0' }}>{debugInfo}</pre>
            </div>
          )}

          {error && !loading && (
            <div className="no-results">
              <span>⚠️</span>
              <h3>Error Loading Cars</h3>
              <p>{error}</p>
              <button onClick={fetchCars} className="reset-filters" style={{ marginTop: '16px' }}>
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="no-results">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid var(--gray-lighter)',
                  borderTop: '3px solid var(--gold)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                <p>Loading vehicles...</p>
              </div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {!loading && !error && cars.length > 0 && filtered.length === 0 && (
            <div className="no-results">
              <span>🔍</span>
              <h3>No cars match your filters</h3>
              <p>Try different keywords or adjust your filters</p>
              <button className="reset-filters" onClick={resetFilters} style={{ marginTop: '16px', width: 'auto', padding: '10px 24px' }}>
                Clear All Filters
              </button>
            </div>
          )}

          {!loading && !error && cars.length === 0 && (
            <div className="no-results">
              <span>🚗</span>
              <h3>No vehicles in inventory yet</h3>
              <p>Check back soon — new cars are added regularly!</p>
              <button onClick={fetchCars} style={{ marginTop: '16px', padding: '10px 24px', background: 'var(--black)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                Refresh
              </button>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="inventory-grid">
              {filtered.map(car => (
                <div
                  key={car.id}
                  className="car-card"
                  onClick={() => onNavigate('car-detail', car)}
                >
                  <div className="car-card-image">
                    <img
                      src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80'}
                      alt={`${car.year} ${car.make} ${car.model}`}
                      onError={e => {
                        e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80';
                      }}
                    />
                    <span className="car-badge">
                      {car.status === 'AVAILABLE' ? 'Available' : (car.status || 'Available')}
                    </span>
                    {car.carSource === 'DEALERSHIP' && (
                      <span className="source-badge dealership">Dealership</span>
                    )}
                    {car.carSource === 'MARKETPLACE' && (
                      <span className="source-badge marketplace">Private Seller</span>
                    )}
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
                      {car.bodyType && <span>{car.bodyType}</span>}
                    </div>
                    {car.carSource === 'DEALERSHIP' && car.stockNumber && (
                      <div className="car-card-stock">Stock: {car.stockNumber}</div>
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