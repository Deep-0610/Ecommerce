import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>E-Commerce</h1>
        </Link>

        <nav className="nav">
          <Link to="/products" className="nav-link">Products</Link>
          {user ? (
            <>
              <Link to="/cart" className="nav-link">
                Cart ({getCartItemCount()})
              </Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <Link to="/db-viewer" className="nav-link">DB Viewer</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
