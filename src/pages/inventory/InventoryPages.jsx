import React, { useState } from 'react';
import './InventoryPage.css';

const ALL_CARS = [
  { id: 1,  make: 'Toyota',  model: 'Camry',     year: 2021, price: 24900, mileage: 32000, fuel: 'Petrol',  transmission: 'Automatic', body: 'Sedan',     image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80', badge: 'Great Value' },
  { id: 2,  make: 'Honda',   model: 'CR-V',       year: 2020, price: 31500, mileage: 41000, fuel: 'Petrol',  transmission: 'Automatic', body: 'SUV',       image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80', badge: 'Popular' },
  { id: 3,  make: 'Mazda',   model: 'CX-5',       year: 2022, price: 37800, mileage: 18000, fuel: 'Petrol',  transmission: 'Automatic', body: 'SUV',       image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&q=80', badge: 'Low KMs' },
  { id: 4,  make: 'Subaru',  model: 'Forester',   year: 2020, price: 29900, mileage: 55000, fuel: 'Petrol',  transmission: 'Automatic', body: 'SUV',       image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&q=80' },
  { id: 5,  make: 'Nissan',  model: 'Leaf',        year: 2021, price: 33500, mileage: 22000, fuel: 'Electric',transmission: 'Automatic', body: 'Hatchback', image: 'https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=600&q=80', badge: 'EV' },
  { id: 6,  make: 'Toyota',  model: 'Hilux',       year: 2019, price: 45000, mileage: 68000, fuel: 'Diesel',  transmission: 'Manual',    body: 'Ute',       image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { id: 7,  make: 'Honda',   model: 'Civic',       year: 2022, price: 26500, mileage: 14000, fuel: 'Petrol',  transmission: 'Automatic', body: 'Sedan',     image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80', badge: 'New Arrival' },
  { id: 8,  make: 'Ford',    model: 'Ranger',      year: 2020, price: 42000, mileage: 72000, fuel: 'Diesel',  transmission: 'Automatic', body: 'Ute',       image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80' },
  { id: 9,  make: 'Mazda',   model: 'Mazda3',      year: 2021, price: 22900, mileage: 38000, fuel: 'Petrol',  transmission: 'Automatic', body: 'Hatchback', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600&q=80' },
  { id: 10, make: 'Subaru',  model: 'Outback',     year: 2021, price: 34900, mileage: 27000, fuel: 'Petrol',  transmission: 'Automatic', body: 'Wagon',     image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80' },
  { id: 11, make: 'Toyota',  model: 'Corolla',     year: 2020, price: 21500, mileage: 44000, fuel: 'Hybrid',  transmission: 'Automatic', body: 'Sedan',     image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80', badge: 'Hybrid' },
  { id: 12, make: 'Nissan',  model: 'X-Trail',     year: 2019, price: 27800, mileage: 61000, fuel: 'Petrol',  transmission: 'Automatic', body: 'SUV',       image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80' },
];

const MAKES   = ['All', 'Toyota', 'Honda', 'Mazda', 'Subaru', 'Nissan', 'Ford'];
const BODIES  = ['All', 'Sedan', 'SUV', 'Hatchback', 'Ute', 'Wagon'];
const FUELS   = ['All', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];

const InventoryPage = ({ onNavigate }) => {
  const [filters, setFilters] = useState({
    make: 'All', body: 'All', fuel: 'All',
    maxPrice: 100000, sortBy: 'newest'
  });
  const [search, setSearch] = useState('');

  const setFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const filtered = ALL_CARS
    .filter(car => {
      if (filters.make !== 'All' && car.make !== filters.make) return false;
      if (filters.body !== 'All' && car.body !== filters.body) return false;
      if (filters.fuel !== 'All' && car.fuel !== filters.fuel) return false;
      if (car.price > filters.maxPrice) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${car.make} ${car.model} ${car.year}`.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'price-low')  return a.price - b.price;
      if (filters.sortBy === 'price-high') return b.price - a.price;
      if (filters.sortBy === 'mileage')    return a.mileage - b.mileage;
      return b.year - a.year; // newest
    });

  return (
    <div className="inventory-page page">
      <div className="inventory-header">
        <div className="container">
          <h1>Car Inventory</h1>
          <p>{filtered.length} vehicles available</p>
        </div>
      </div>

      <div className="inventory-layout container">

        {/* ── Sidebar filters ── */}
        <aside className="filters-sidebar">
          <h3>Filter Cars</h3>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Make, model, year..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Make</label>
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

          <div className="filter-group">
            <label>Body Type</label>
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

          <div className="filter-group">
            <label>Fuel Type</label>
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
            onClick={() => { setFilters({ make: 'All', body: 'All', fuel: 'All', maxPrice: 100000, sortBy: 'newest' }); setSearch(''); }}
          >
            Reset Filters
          </button>
        </aside>

        {/* ── Cars list ── */}
        <div className="inventory-main">
          <div className="inventory-toolbar">
            <span className="results-count">{filtered.length} results</span>
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

          {filtered.length === 0 ? (
            <div className="no-results">
              <span>🚗</span>
              <h3>No cars match your filters</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="inventory-grid">
              {filtered.map(car => (
                <div
                  key={car.id}
                  className="car-card"
                  onClick={() => onNavigate('car-detail', car)}
                >
                  <div className="car-card-image">
                    <img src={car.image} alt={`${car.year} ${car.make} ${car.model}`} />
                    {car.badge && <span className="car-badge">{car.badge}</span>}
                  </div>
                  <div className="car-card-body">
                    <div className="car-card-title">
                      <h3>{car.year} {car.make} {car.model}</h3>
                      <span className="car-price">${car.price.toLocaleString()}</span>
                    </div>
                    <div className="car-card-specs">
                      <span>🛣 {car.mileage.toLocaleString()} km</span>
                      <span>⛽ {car.fuel}</span>
                      <span>⚙️ {car.transmission}</span>
                    </div>
                    <button className="car-card-btn">View Details</button>
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