// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setSessionToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
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
      />
    </Router>
  );
}

function AppContent({ user, sessionToken, currentPage, currentCar, locationFilters, onNavigate, onLoginSuccess, onLogout }) {
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

  if ((currentPage === 'dashboard' || currentPage === 'admin') && !user) {
    setTimeout(() => handleNavigateWrapper('login'), 0);
    return null;
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
      </main>
      <Footer onNavigate={handleNavigateWrapper} />
    </div>
  );
}

export default App;