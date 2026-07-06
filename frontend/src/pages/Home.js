import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="container py-5 text-center">
      <h1 className="display-5 fw-bold mb-3">
        <i className="fa-solid fa-chart-line text-success me-2"></i>SB Stocks
      </h1>
      <p className="lead mb-4">
        Practice and improve your stock trading skills with real-time market data and
        zero financial risk — powered by paper trading with virtual funds.
      </p>
      {user ? (
        <Link to="/dashboard" className="btn btn-success btn-lg">
          Go to Dashboard
        </Link>
      ) : (
        <div className="d-flex justify-content-center gap-3">
          <Link to="/register" className="btn btn-success btn-lg">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-outline-secondary btn-lg">
            Login
          </Link>
        </div>
      )}

      <div className="row mt-5">
        <div className="col-md-4">
          <i className="fa-solid fa-wallet fa-2x text-success mb-2"></i>
          <h5>Virtual Funds</h5>
          <p className="text-muted">Trade with simulated money — no financial risk.</p>
        </div>
        <div className="col-md-4">
          <i className="fa-solid fa-chart-simple fa-2x text-success mb-2"></i>
          <h5>Live Market Data</h5>
          <p className="text-muted">Real-time US stock quotes and historical trends.</p>
        </div>
        <div className="col-md-4">
          <i className="fa-solid fa-briefcase fa-2x text-success mb-2"></i>
          <h5>Portfolio Tracking</h5>
          <p className="text-muted">Analyze your strategies and track performance.</p>
        </div>
      </div>
    </div>
  );
}
