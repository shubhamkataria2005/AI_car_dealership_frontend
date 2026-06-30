// src/pages/homePage/HomePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import './HomePage.css';
import { api } from '../../services/api';
import Reveal from '../../components/ui/Reveal';
import HeroScene from '../../components/ui/HeroScene';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'motion/react';

// ─── 3D tilt card ────────────────────────────────────────────────────────────
const TiltCard = ({ children, className, intensity = 7, onClick, style, ...props }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 400, damping: 32 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 400, damping: 32 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ─── Animated count-up ───────────────────────────────────────────────────────
const CountUp = ({ end, suffix = '', duration = 1.8 }) => {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!isInView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(end);
      return;
    }
    let frame = 0;
    const total = Math.round(duration * 60);
    const timer = setInterval(() => {
      frame++;
      const eased = 1 - Math.pow(1 - frame / total, 3);
      setCount(Math.floor(eased * end));
      if (frame >= total) { setCount(end); clearInterval(timer); }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ─── Constants ───────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
});

const MARQUEE_MAKES = [
  'Toyota', 'Mazda', 'BMW', 'Tesla', 'Ford', 'Honda',
  'Audi', 'Subaru', 'Nissan', 'Mercedes', 'Volkswagen', 'Lexus',
];

const STATS = [
  { end: 500,  suffix: '+',  label: 'Cars Sold' },
  { end: 10,   suffix: 'yr', label: 'In Business' },
  { end: 1200, suffix: '+',  label: 'Happy Customers' },
  { end: 100,  suffix: '%',  label: 'Vehicles Inspected' },
];

const PROCESS = [
  {
    step: '01',
    eyebrow: 'Discover',
    title: 'Browse our full inventory',
    body: 'Every vehicle is in stock and ready to view. Filter by make, body type, or price — and know exactly what you\'re looking at before you arrive.',
  },
  {
    step: '02',
    eyebrow: 'Experience',
    title: 'Get behind the wheel',
    body: 'Book a no-pressure test drive at a time that suits you. Our team answers every question and never rushes the decision.',
  },
  {
    step: '03',
    eyebrow: 'Purchase',
    title: 'Drive home in confidence',
    body: 'Flexible finance, trade-in valuation, and warranty options — all handled in one visit. No hidden surprises at signing.',
  },
];

const SERVICES = [
  {
    icon: '$',
    eyebrow: 'Finance',
    title: 'Finance Calculator',
    desc: 'See real monthly repayments before you commit. Compare loan terms and find a payment that fits your life.',
    cta: 'Calculate now',
    navigate: 'dashboard',
    color: 'rgba(255,122,26,0.12)',
    glow: 'rgba(255,122,26,0.3)',
  },
  {
    icon: '↺',
    eyebrow: 'Trade-In',
    title: 'Instant Trade-In',
    desc: 'Get an AI-powered estimate for your current car. Our model trained on 90,000+ records gives you a fair starting price in seconds.',
    cta: 'Get estimate',
    navigate: 'dashboard',
    color: 'rgba(74,170,255,0.10)',
    glow: 'rgba(74,170,255,0.25)',
  },
  {
    icon: '→',
    eyebrow: 'Test Drive',
    title: 'Book a Test Drive',
    desc: 'Choose your car, pick a time, and we\'ll have it ready and waiting. No pressure, just you and the road.',
    cta: 'Book now',
    navigate: 'register',
    color: 'rgba(52,211,153,0.10)',
    glow: 'rgba(52,211,153,0.25)',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
const HomePage = ({ onNavigate }) => {
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchForm, setSearchForm] = useState({ keyword: '', make: '', maxPrice: '', body: '' });

  useEffect(() => {
    api.getAllCars()
      .then((d) => { if (d?.success) setAllCars(d.cars || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayedCars = allCars.filter((c) => c.carSource === 'DEALERSHIP').slice(0, 6);

  const runSearch = () => {
    const p = { source: 'DEALERSHIP' };
    if (searchForm.keyword)  p.keyword  = searchForm.keyword;
    if (searchForm.make)     p.make     = searchForm.make;
    if (searchForm.maxPrice) p.maxPrice = searchForm.maxPrice;
    if (searchForm.body)     p.bodyType = searchForm.body;
    onNavigate('inventory', { filters: p });
  };

  const setField = (k, v) => setSearchForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="home-page page">

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="hp-hero">
        <HeroScene />

        <div className="container hp-hero-inner">
          <motion.span className="hp-eyebrow" {...fadeUp(0)}>
            Auckland · inspected vehicles
          </motion.span>

          <motion.h1 className="hp-hero-title" {...fadeUp(0.1)}>
            Find your<br />
            <span className="hp-paren">(next)</span> car.
          </motion.h1>

          <motion.p className="hp-hero-sub" {...fadeUp(0.22)}>
            Every car professionally inspected, test-drive ready, and backed by warranty options.
            Browse our stock, sort your finance — without the showroom pressure.
          </motion.p>

          <motion.div className="hp-hero-actions" {...fadeUp(0.34)}>
            <button className="btn-primary" onClick={() => onNavigate('inventory')}>
              Browse all cars
            </button>
            <button className="btn-outline" onClick={() => onNavigate('register')}>
              Book a test drive
            </button>
          </motion.div>

          <motion.div className="hp-hero-meta" {...fadeUp(0.46)}>
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
          </motion.div>
        </div>

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

      {/* ─────────────────────────── STATS ─────────────────────────── */}
      <section className="hp-stats">
        <div className="container">
          <div className="hp-stats-grid">
            {STATS.map((s, i) => (
              <Reveal key={s.label} className="hp-stat-item" delay={i * 75}>
                <div className="hp-stat-number">
                  <CountUp end={s.end} suffix={s.suffix} />
                </div>
                <div className="hp-stat-label">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── FEATURED ─────────────────────────── */}
      <section className="hp-featured">
        <div className="container">
          <div className="hp-section-head">
            <Reveal>
              <span className="hp-section-label">Featured</span>
              <h2>Latest vehicles</h2>
            </Reveal>
          </div>

          <div className="hp-cars-grid">
            {loading ? (
              <div className="hp-cars-empty">Loading vehicles…</div>
            ) : displayedCars.length === 0 ? (
              <div className="hp-cars-empty">No cars in this category yet.</div>
            ) : (
              displayedCars.map((car, i) => (
                <TiltCard
                  key={car.id}
                  className="hp-card"
                  onClick={() => onNavigate('car-detail', car)}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="hp-card-img">
                    <img
                      src={car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=700&q=80'}
                      alt={`${car.year} ${car.make} ${car.model}`}
                      loading="lazy"
                    />
                    {car.inspectionStatus === 'PASSED' && (
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
                </TiltCard>
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

      {/* ─────────────────────────── HOW IT WORKS ─────────────────────────── */}
      <section className="hp-process">
        <div className="container">
          <Reveal className="hp-process-head">
            <span className="hp-section-label">Process</span>
            <h2>Buying a car<br />should be simple.</h2>
            <p>Three steps. No runaround.</p>
          </Reveal>

          <div className="hp-process-steps">
            {PROCESS.map((step, i) => (
              <Reveal
                key={step.step}
                className={`hp-process-row${i % 2 === 1 ? ' hp-process-row-rev' : ''}`}
                delay={100}
              >
                <div className="hp-process-text">
                  <span className="hp-process-eyebrow">{step.eyebrow}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
                <div className="hp-process-visual">
                  <div className="hp-process-num-bg" aria-hidden="true">{step.step}</div>
                  <motion.div
                    className="hp-process-card"
                    initial={{ opacity: 0, x: i % 2 === 0 ? 48 : -48, rotateY: i % 2 === 0 ? 12 : -12 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
                    style={{ transformPerspective: 1000 }}
                  >
                    <div className="hp-process-card-num">{step.step}</div>
                    <div className="hp-process-card-eyebrow">{step.eyebrow}</div>
                    <div className="hp-process-card-divider" />
                    <div className="hp-process-card-title">{step.title}</div>
                  </motion.div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── SERVICES ─────────────────────────── */}
      <section className="hp-services">
        <div className="container">
          <div className="hp-section-head">
            <Reveal>
              <span className="hp-section-label">Services</span>
              <h2>Everything you need,<br />one dealership.</h2>
            </Reveal>
          </div>
          <div className="hp-services-grid">
            {SERVICES.map((svc, i) => (
              <Reveal key={svc.eyebrow} delay={i * 90}>
                <TiltCard
                  className="hp-svc-card"
                  onClick={() => onNavigate(svc.navigate)}
                  style={{ '--svc-bg': svc.color, '--svc-glow': svc.glow, cursor: 'pointer' }}
                  whileTap={{ scale: 0.97 }}
                  intensity={6}
                >
                  <div className="hp-svc-icon-box">
                    <span className="hp-svc-icon">{svc.icon}</span>
                  </div>
                  <div className="hp-svc-eyebrow">{svc.eyebrow}</div>
                  <h3 className="hp-svc-title">{svc.title}</h3>
                  <p className="hp-svc-desc">{svc.desc}</p>
                  <div className="hp-svc-cta">
                    <span>{svc.cta}</span>
                    <span className="hp-svc-arrow">→</span>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── CTA ─────────────────────────── */}
      <section className="hp-cta">
        <div className="container">
          <Reveal className="hp-cta-box">
            <div className="hp-cta-media hp-cta-media-static" aria-hidden="true">
              <div className="hp-cta-media-overlay" />
            </div>
            <div className="hp-cta-glow" aria-hidden="true" />
            <div className="hp-cta-content">
              <span className="hp-section-label">Get started today</span>
              <h2>Ready to find your next car?</h2>
              <p>Create a free account to save favourites, book test drives and get an instant trade-in valuation.</p>
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
