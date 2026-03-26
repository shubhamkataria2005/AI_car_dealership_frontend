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
import AdminDashboard from './pages/admin/AdminDashboard.jsx';  // ADD THIS IMPORT
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [currentCar, setCurrentCar] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page, data = null) => {
    setCurrentPage(page);
    if (data && page === 'car-detail') {
      setCurrentCar(data);
    }
  };

  const handleLoginSuccess = (userData, token) => {
    console.log('Login success, setting user and navigating to dashboard');
    setUser(userData);
    setSessionToken(token);
    // Store token in localStorage for persistence
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    // Force navigation to dashboard
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    console.log('Logging out');
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('home');
  };

  // Check for existing session on load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      console.log('Found stored session, restoring user');
      setSessionToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Don't automatically navigate to dashboard on load, let the URL decide
    }
  }, []);

  return (
    <Router>
      <AppContent 
        user={user}
        sessionToken={sessionToken}
        currentPage={currentPage}
        currentCar={currentCar}
        onNavigate={handleNavigate}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    </Router>
  );
}

function AppContent({ user, sessionToken, currentPage, currentCar, onNavigate, onLoginSuccess, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Sync navigation state with URL changes
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' && currentPage !== 'home') {
      onNavigate('home');
    } else if (path === '/inventory' && currentPage !== 'inventory') {
      onNavigate('inventory');
    } else if (path.startsWith('/car/') && currentPage !== 'car-detail') {
      onNavigate('car-detail');
    } else if (path === '/dashboard' && currentPage !== 'dashboard') {
      onNavigate('dashboard');
    } else if (path === '/admin' && currentPage !== 'admin') {  // ADD THIS
      onNavigate('admin');
    } else if (path === '/login' && currentPage !== 'login') {
      onNavigate('login');
    } else if (path === '/register' && currentPage !== 'register') {
      onNavigate('register');
    }
  }, [location.pathname]);

  // Navigate when currentPage changes
  useEffect(() => {
    console.log('Current page changed to:', currentPage);
    switch(currentPage) {
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
      case 'dashboard':
        if (location.pathname !== '/dashboard') navigate('/dashboard');
        break;
      case 'admin':  // ADD THIS CASE
        if (location.pathname !== '/admin') navigate('/admin');
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
    console.log('Navigating to:', page);
    onNavigate(page, data);
  };

  // Protect dashboard and admin routes
  if ((currentPage === 'dashboard' || currentPage === 'admin') && !user) {
    console.log('Protected route: redirecting to login');
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
          <Route path="/inventory" element={<InventoryPage onNavigate={handleNavigateWrapper} />} />
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
          {/* ADD ADMIN ROUTE */}
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