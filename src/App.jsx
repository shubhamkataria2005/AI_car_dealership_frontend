// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/navbar/Navbar.jsx';
import Footer from './components/footer/Footer.jsx';
import HomePage from './pages/homePage/HomePage.jsx';
import InventoryPage from './pages/inventory/InventoryPages.jsx';
import CarDetailPage from './pages/carDetailPage/CarDeatilPage.jsx';
import DashboardPage from './pages/dashboardPage/DashboardPage.jsx';
import LoginPage from './pages/loginPage/LoginPage.jsx';
import RegisterPage from './pages/registerPage/RegisterPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import CheckoutPage from './pages/checkout/CheckoutPage.jsx';
import PurchaseSuccessPage from './pages/purchaseSuccess/PurchaseSuccessPage.jsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [currentCar, setCurrentCar] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [locationFilters, setLocationFilters] = useState(null); // FIX: store filters for inventory
  // NEW: true once we've finished checking localStorage for an existing
  // session. Until then, `user` being null doesn't actually mean "not
  // logged in" — it just means we haven't checked yet. Acting on that too
  // early is what caused a redirect-to-login/back-to-dashboard ping-pong
  // fast enough to trip Chrome's navigation flood protection and crash the
  // tab on a hard refresh of /dashboard or /admin.
  const [authChecked, setAuthChecked] = useState(false);

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page);
    if (data && page === 'car-detail') {
      setCurrentCar(data);
    }
    if (data && page === 'checkout') {
      setCurrentCar(data);
    }
    // FIX: capture filter data when navigating to inventory
    if (page === 'inventory') {
      setLocationFilters(data || null);
    }
  };

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    setSessionToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('home');
  };

  // NEW: called after a successful profile edit (username/phone) so the
  // change shows up immediately in the Navbar/Dashboard sidebar without
  // requiring a refresh or re-login.
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setSessionToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setAuthChecked(true);
  }, []);

  return (
    <Router>
      <AppContent
        user={user}
        sessionToken={sessionToken}
        currentPage={currentPage}
        currentCar={currentCar}
        locationFilters={locationFilters}
        onNavigate={handleNavigate}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
        authChecked={authChecked}
      />
    </Router>
  );
}

function AppContent({ user, sessionToken, currentPage, currentCar, locationFilters, onNavigate, onLoginSuccess, onLogout, onUserUpdate, authChecked }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' && currentPage !== 'home') {
      onNavigate('home');
    } else if (path === '/inventory' && currentPage !== 'inventory') {
      onNavigate('inventory');
    } else if (path.startsWith('/car/') && currentPage !== 'car-detail') {
      onNavigate('car-detail');
    } else if (path === '/checkout' && currentPage !== 'checkout') {
      onNavigate('checkout');
    } else if (path === '/dashboard' && currentPage !== 'dashboard') {
      onNavigate('dashboard');
    } else if (path === '/admin' && currentPage !== 'admin') {
      onNavigate('admin');
    } else if (path === '/purchase-success' && currentPage !== 'purchase-success') {
      onNavigate('purchase-success');
    } else if (path === '/login' && currentPage !== 'login') {
      onNavigate('login');
    } else if (path === '/register' && currentPage !== 'register') {
      onNavigate('register');
    }
  }, [location.pathname]);

  useEffect(() => {
    switch (currentPage) {
      case 'home':
        if (location.pathname !== '/') navigate('/');
        break;
      case 'inventory':
        if (location.pathname !== '/inventory') navigate('/inventory');
        break;
      case 'car-detail':
        if (currentCar?.id && location.pathname !== `/car/${currentCar.id}`) {
          navigate(`/car/${currentCar.id}`);
        }
        break;
      case 'checkout':
        if (location.pathname !== '/checkout') navigate('/checkout');
        break;
      case 'dashboard':
        if (location.pathname !== '/dashboard') navigate('/dashboard');
        break;
      case 'admin':
        if (location.pathname !== '/admin') navigate('/admin');
        break;
      case 'purchase-success':
        if (location.pathname !== '/purchase-success') navigate('/purchase-success');
        break;
      case 'login':
        if (location.pathname !== '/login') navigate('/login');
        break;
      case 'register':
        if (location.pathname !== '/register') navigate('/register');
        break;
      default:
        if (location.pathname !== '/') navigate('/');
    }
  }, [currentPage, currentCar, navigate, location.pathname]);

  const handleNavigateWrapper = (page, data = null) => {
    onNavigate(page, data);
  };

  if ((currentPage === 'dashboard' || currentPage === 'admin')) {
    if (!authChecked) {
      // Still checking localStorage — we genuinely don't know yet whether
      // this person is logged in. Render nothing for this one instant
      // rather than guessing "not logged in" and redirecting, which was
      // the actual cause of the crash on refresh.
      return null;
    }
    if (!user) {
      setTimeout(() => handleNavigateWrapper('login'), 0);
      return null;
    }
  }

  return (
    <div className="App">
      <Navbar
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigateWrapper}
        onLogout={onLogout}
      />
      <main className="main-content">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
          >
        <Routes>
          <Route path="/" element={<HomePage onNavigate={handleNavigateWrapper} />} />

          {/* FIX: pass locationFilters to InventoryPage */}
          <Route
            path="/inventory"
            element={
              <InventoryPage
                onNavigate={handleNavigateWrapper}
                locationFilters={locationFilters}
              />
            }
          />

          <Route
            path="/car/:id"
            element={
              <CarDetailPage
                car={currentCar}
                user={user}
                sessionToken={sessionToken}
                onNavigate={handleNavigateWrapper}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                car={currentCar}
                user={user}
                sessionToken={sessionToken}
                onNavigate={handleNavigateWrapper}
              />
            }
          />
          <Route
            path="/purchase-success"
            element={
              <PurchaseSuccessPage
                onNavigate={handleNavigateWrapper}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              user ?
                <DashboardPage
                  user={user}
                  sessionToken={sessionToken}
                  onLogout={onLogout}
                  onNavigate={handleNavigateWrapper}
                  onUserUpdate={onUserUpdate}
                /> :
                <LoginPage onLoginSuccess={onLoginSuccess} onNavigate={handleNavigateWrapper} />
            }
          />
          <Route
            path="/admin"
            element={
              user ?
                <AdminDashboard
                  user={user}
                  sessionToken={sessionToken}
                  onLogout={onLogout}
                  onNavigate={handleNavigateWrapper}
                /> :
                <LoginPage onLoginSuccess={onLoginSuccess} onNavigate={handleNavigateWrapper} />
            }
          />
          <Route path="/login" element={<LoginPage onLoginSuccess={onLoginSuccess} onNavigate={handleNavigateWrapper} />} />
          <Route path="/register" element={<RegisterPage onLoginSuccess={onLoginSuccess} onNavigate={handleNavigateWrapper} />} />
        </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer onNavigate={handleNavigateWrapper} />

    </div>
  );
}

export default App;