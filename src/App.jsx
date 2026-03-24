import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/navbar/Navbar.jsx';
import Footer from './components/footer/Footer.jsx';
import HomePage from './pages/homePage/HomePage.jsx';
import InventoryPage from './pages/inventory/InventoryPages.jsx';
import CarDetailPage from './pages/carDetailPage/CarDeatilPage.jsx';
import DashboardPage from './pages/dashboardPage/DashboardPage.jsx';
import LoginPage from './pages/loginPage/LoginPage.jsx';
import RegisterPage from './pages/registerPage/RegisterPage.jsx';
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
    setUser(userData);
    setSessionToken(token);
    handleNavigate('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSessionToken(null);
    handleNavigate('home');
  };

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

  const handleNavigate = (page, data = null) => {
    onNavigate(page, data);
    switch(page) {
      case 'home':
        navigate('/');
        break;
      case 'inventory':
        navigate('/inventory');
        break;
      case 'car-detail':
        navigate(`/car/${data?.id || '1'}`);
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="App">
      <Navbar 
        user={user} 
        currentPage={currentPage}
        onNavigate={handleNavigate} 
        onLogout={onLogout} 
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
          <Route path="/inventory" element={<InventoryPage onNavigate={handleNavigate} />} />
          <Route path="/car/:id" element={<CarDetailPage car={currentCar} user={user} onNavigate={handleNavigate} />} />
          <Route path="/dashboard" element={
            user ? 
              <DashboardPage 
                user={user} 
                sessionToken={sessionToken}
                onLogout={onLogout} 
                onNavigate={handleNavigate} 
              /> : 
              <LoginPage onLoginSuccess={onLoginSuccess} onNavigate={handleNavigate} />
          } />
          <Route path="/login" element={<LoginPage onLoginSuccess={onLoginSuccess} onNavigate={handleNavigate} />} />
          <Route path="/register" element={<RegisterPage onLoginSuccess={onLoginSuccess} onNavigate={handleNavigate} />} />
        </Routes>
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;