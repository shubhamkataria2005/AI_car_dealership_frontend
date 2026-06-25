// src/pages/homePage/HomePage.jsx
import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { api } from '../../services/api';
import Reveal from '../../components/ui/Reveal';

const MARQUEE_MAKES = [
  'Toyota', 'Mazda', 'BMW', 'Tesla', 'Ford', 'Honda',
  'Audi', 'Subaru', 'Nissan', 'Mercedes', 'Volkswagen', 'Lexus',
];

const TOOLS = [
  { label: 'AI Assistant',    desc: 'Ask anything about a car, finance, or the buying process.' },
  { label: 'Brand Recognizer', desc: 'Snap a photo, get the make and matching listings.' },
  { label: 'Instant Trade-In', desc: 'A fair value for your current car in seconds.' },
  { label: 'Finance Calculator', desc: 'See real monthly repayments before you commit.' },
];

// Drop your mp4 files at these paths inside the `public/` folder of the
// project. Keep each one small — aim under ~5MB for a 10-20s muted loop.
// No poster image needed — phones/touch devices/slow connections get a
// CSS gradient fallback instead, so there's nothing extra to create.
const HERO_VIDEO_SRC = '/videos/hero.mp4';
const CTA_VIDEO_SRC = '/videos/cta.mp4';

const HomePage = ({ onNavigate }) => {
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState('both');
  const [searchForm, setSearchForm] = useState({ keyword: '', make: '', maxPrice: '', body: '' });

  // Only load/play the video on wide, non-touch screens with a decent
  // connection — never on phones (any orientation), never if the user has
  // reduced motion on, and never on a metered/slow connection if the
  // browser reports one. Everyone else gets a CSS gradient fallback —
  // no extra image asset required.
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isNarrow = window.innerWidth <= 768;
    // Coarse pointer = touch-primary input (phones/tablets), regardless of
    // viewport width — this is what catches a phone held in landscape,
    // which would otherwise slip past a width-only check.
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    const isSlowOrMetered = conn ? (conn.saveData || /^(slow-2g|2g|3g)$/.test(conn.effectiveType || '')) : false;

    setShowVideo(!reduceMotion && !isNarrow && !isTouch && !isSlowOrMetered);
  }, []);

  useEffect(() => {
    api.getAllCars()
      .then((data) => {
        if (data && data.success) setAllCars(data.cars || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const countBySource = (src) => allCars.filter((c) => c.carSource === src).length;

  const displayedCars = (() => {
    if (activePlatform === 'marketplace') return allCars.filter((c) => c.carSource === 'MARKETPLACE').slice(0, 6);
    if (activePlatform === 'dealership') return allCars.filter((c) => c.carSource === 'DEALERSHIP').slice(0, 6);
    return allCars.slice(0, 6);
  })();

  const runSearch = () => {
    const params = {
      source: activePlatform === 'both' ? '' : activePlatform === 'marketplace' ? 'MARKETPLACE' : 'DEALERSHIP',
    };
    if (searchForm.keyword) params.keyword = searchForm.keyword;
    if (searchForm.make) params.make = searchForm.make;
    if (searchForm.maxPrice) params.maxPrice = searchForm.maxPrice;
    if (searchForm.body) params.bodyType = searchForm.body;
    onNavigate('inventory', { filters: params });
  };

  const setField = (k, v) => setSearchForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="home-page page">

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="hp-hero">
        {showVideo ? (
          <div className="hp-hero-media" aria-hidden="true">
            <video
              className="hp-hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src={HERO_VIDEO_SRC} type="video/mp4" />
            </video>
            <div className="hp-hero-media-overlay" />
          </div>
        ) : (
          <div className="hp-hero-media hp-hero-media-static" aria-hidden="true">
            <div className="hp-hero-media-overlay" />
          </div>
        )}
        <div className="hp-hero-glow" aria-hidden="true" />
        <div className="hp-hero-sweep" aria-hidden="true" />
        <div className="container hp-hero-inner">
          <Reveal as="span" className="hp-eyebrow" delay={0}>
            Auckland · buy, sell &amp; trade
          </Reveal>

          <Reveal as="h1" className="hp-hero-title" delay={80}>
            Find your<br />
            <span className="hp-paren">(next)</span> car.
          </Reveal>

          <Reveal as="p" className="hp-hero-sub" delay={200}>
            Private-seller listings and fully inspected dealership cars, in one place.
            Browse, message the seller, sort your finance — without the showroom pressure.
          </Reveal>

          <Reveal className="hp-hero-actions" delay={300}>
            <button className="btn-primary" onClick={() => onNavigate('inventory')}>
              Browse all cars
            </button>
            <button className="btn-outline" onClick={() => onNavigate('register')}>
              Sell your car
            </button>
          </Reveal>

          <Reveal className="hp-hero-meta" delay={420}>
            <div className="hp-meta-item">
              <strong>{loading ? '—' : `${allCars.length}+`}</strong>
              <span>cars available</span>
            </div>
            <div className="hp-meta-rule" />
            <div className="hp-meta-item">
              <strong>2</strong>
              <span>ways to buy</span>
            </div>
            <div className="hp-meta-rule" />
            <div className="hp-meta-item">
              <strong>10yr</strong>
              <span>in business</span>
            </div>
          </Reveal>
        </div>

        {/* Ambient marquee — the signature */}
        <div className="hp-marquee" aria-hidden="true">
          <div className="hp-marquee-track">
            {[...MARQUEE_MAKES, ...MARQUEE_MAKES].map((m, i) => (
              <span className="hp-marquee-item" key={i}>
                {m}<span className="hp-marquee-dot">•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── SEARCH ─────────────────────────── */}
      <section className="hp-search">
        <div className="container">
          <Reveal className="hp-search-bar">
            <div className="hp-field hp-field-grow">
              <label htmlFor="hp-kw">Keyword</label>
              <input
                id="hp-kw" type="text" placeholder="Make, model, year…"
                value={searchForm.keyword}
                onChange={(e) => setField('keyword', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              />
            </div>
            <div className="hp-field">
              <label htmlFor="hp-make">Make</label>
              <select id="hp-make" value={searchForm.make} onChange={(e) => setField('make', e.target.value)}>
                <option value="">Any make</option>
                {['Toyota', 'Honda', 'Mazda', 'Subaru', 'Nissan', 'Ford', 'BMW', 'Mercedes', 'Audi'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="hp-field">
              <label htmlFor="hp-price">Max price</label>
              <select id="hp-price" value={searchForm.maxPrice} onChange={(e) => setField('maxPrice', e.target.value)}>
                <option value="">Any price</option>
                <option value="15000">Under $15k</option>
                <option value="25000">Under $25k</option>
                <option value="40000">Under $40k</option>
                <option value="60000">Under $60k</option>
                <option value="100000">Under $100k</option>
              </select>
            </div>
            <div className="hp-field">
              <label htmlFor="hp-body">Body</label>
              <select id="hp-body" value={searchForm.body} onChange={(e) => setField('body', e.target.value)}>
                <option value="">Any type</option>
                {['Sedan', 'SUV', 'Hatchback', 'Ute', 'Wagon', 'Coupe', 'Convertible'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <button className="hp-search-btn" onClick={runSearch}>Search</button>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────── FEATURED ─────────────────────────── */}
      <section className="hp-featured">
        <div className="container">
          <div className="hp-section-head">
            <Reveal>
              <span className="hp-section-label">Featured</span>
              <h2>
                {activePlatform === 'both' ? 'Latest vehicles'
                  : activePlatform === 'marketplace' ? 'Marketplace listings'
                  : 'Dealership inventory'}
              </h2>
            </Reveal>
            <Reveal className="hp-tabs" delay={120}>
              {[
                { id: 'both', label: `All (${allCars.length})` },
                { id: 'marketplace', label: `Marketplace (${countBySource('MARKETPLACE')})` },
                { id: 'dealership', label: `Dealership (${countBySource('DEALERSHIP')})` },
              ].map((t) => (
                <button
                  key={t.id}
                  className={`hp-tab ${activePlatform === t.id ? 'active' : ''}`}
                  onClick={() => setActivePlatform(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </Reveal>
          </div>

          <div className="hp-cars-grid">
            {loading ? (
              <div className="hp-cars-empty">Loading vehicles…</div>
            ) : displayedCars.length === 0 ? (
              <div className="hp-cars-empty">No cars in this category yet.</div>
            ) : (
              displayedCars.map((car, i) => (
                <Reveal key={car.id} delay={i * 70}>
                  <article className="hp-card" onClick={() => onNavigate('car-detail', car)}>
                    <div className="hp-card-img">
                      <img
                        src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=700&q=80'}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        loading="lazy"
                      />
                      {car.carSource === 'DEALERSHIP' && <span className="hp-tag hp-tag-dealer">Dealership</span>}
                      {car.carSource === 'MARKETPLACE' && <span className="hp-tag hp-tag-market">Private seller</span>}
                      {car.carSource === 'DEALERSHIP' && car.inspectionStatus === 'PASSED' && (
                        <span className="hp-tag-inspected">✓ Inspected</span>
                      )}
                    </div>
                    <div className="hp-card-body">
                      <div className="hp-card-top">
                        <h3>{car.make} {car.model}</h3>
                        <span className="hp-card-price">${car.price?.toLocaleString()}</span>
                      </div>
                      <div className="hp-card-specs">
                        <span>{car.year}</span>
                        <span>{car.mileage?.toLocaleString()} km</span>
                        <span>{car.fuel}</span>
                        <span>{car.transmission}</span>
                      </div>
                      <div className="hp-card-foot">
                        View details <span className="hp-arrow">→</span>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))
            )}
          </div>

          <Reveal className="hp-viewall-wrap">
            <button className="btn-outline" onClick={() => onNavigate('inventory')}>
              View all vehicles
            </button>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────── TWO WAYS TO BUY (editorial split) ───────────────────── */}
      <section className="hp-ways">
        <div className="container">
          <Reveal>
            <span className="hp-section-label">Two ways to buy</span>
            <h2 className="hp-ways-title">Your call. <span className="hp-paren">(both honest)</span></h2>
          </Reveal>

          <div className="hp-ways-grid">
            <Reveal className="hp-way" delay={80}>
              <span className="hp-way-index">Marketplace</span>
              <h3>Buy direct from private sellers</h3>
              <p>Find sharper prices and deal one-to-one. Message the seller, negotiate, and list your own car in minutes.</p>
              <ul className="hp-way-list">
                <li>Direct seller messaging</li>
                <li>Negotiate your own price</li>
                <li>List your car free</li>
                <li>AI price suggestions</li>
              </ul>
              <button className="hp-way-btn" onClick={() => onNavigate('inventory', { filters: { source: 'MARKETPLACE' } })}>
                Browse marketplace →
              </button>
            </Reveal>

            <Reveal className="hp-way hp-way-accent" delay={180}>
              <span className="hp-way-index">Dealership</span>
              <h3>Buy from inspected stock</h3>
              <p>Company-owned cars, professionally checked, with test drives, servicing and warranty options on hand.</p>
              <ul className="hp-way-list">
                <li>150-point inspection</li>
                <li>Test drives available</li>
                <li>Service centre access</li>
                <li>Warranty options</li>
              </ul>
              <button className="hp-way-btn" onClick={() => onNavigate('inventory', { filters: { source: 'DEALERSHIP' } })}>
                Browse dealership →
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────────────── AI TOOLS (differentiator) ───────────────────── */}
      <section className="hp-tools">
        <div className="container">
          <div className="hp-tools-head">
            <Reveal>
              <span className="hp-section-label">Built in</span>
              <h2>Smarter than the average listing site</h2>
            </Reveal>
            <Reveal as="p" className="hp-tools-sub" delay={120}>
              Tools that actually help you decide — free with any account.
            </Reveal>
          </div>
          <div className="hp-tools-grid">
            {TOOLS.map((t, i) => (
              <Reveal key={t.label} className="hp-tool" delay={i * 80}>
                <h4>{t.label}</h4>
                <p>{t.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── CTA ─────────────────────────── */}
      <section className="hp-cta">
        <div className="container">
          <Reveal className="hp-cta-box">
            {showVideo ? (
              <div className="hp-cta-media" aria-hidden="true">
                <video
                  className="hp-cta-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                >
                  <source src={CTA_VIDEO_SRC} type="video/mp4" />
                </video>
                <div className="hp-cta-media-overlay" />
              </div>
            ) : (
              <div className="hp-cta-media hp-cta-media-static" aria-hidden="true">
                <div className="hp-cta-media-overlay" />
              </div>
            )}
            <div className="hp-cta-glow" aria-hidden="true" />
            <div className="hp-cta-content">
              <span className="hp-section-label">Get started today</span>
              <h2>Ready to find your next car?</h2>
              <p>Create a free account to save favourites, book test drives and use every AI tool.</p>
            </div>
            <div className="hp-cta-actions">
              <button className="btn-primary" onClick={() => onNavigate('inventory')}>Browse inventory</button>
              <button className="btn-outline" onClick={() => onNavigate('register')}>Sign up free</button>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
};

export default HomePage;