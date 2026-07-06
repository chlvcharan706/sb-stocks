import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand fw-bold" to="/">
        <i className="fa-solid fa-chart-line me-2"></i>SB Stocks
      </Link>
      <div className="collapse navbar-collapse justify-content-end">
        {user ? (
          <ul className="navbar-nav align-items-lg-center gap-2">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/portfolio">Portfolio</Link>
            </li>
            <li className="nav-item">
              <span className="badge bg-success">
                Balance: ${user.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        ) : (
          <ul className="navbar-nav gap-2">
            <li className="nav-item">
              <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-success btn-sm" to="/register">Sign Up</Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}
