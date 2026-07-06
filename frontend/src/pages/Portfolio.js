import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/portfolio');
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="container py-4">Loading portfolio...</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">My Portfolio</h2>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center p-3 shadow-sm">
            <small className="text-muted">Cash Balance</small>
            <h4>${data.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center p-3 shadow-sm">
            <small className="text-muted">Holdings Value</small>
            <h4>${data.holdingsValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center p-3 shadow-sm">
            <small className="text-muted">Total Portfolio Value</small>
            <h4>${data.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
          </div>
        </div>
      </div>

      <h5 className="mb-3">Holdings</h5>
      {data.holdings.length === 0 ? (
        <p className="text-muted">
          You don't own any stocks yet. Head to the{' '}
          <Link to="/dashboard">dashboard</Link> to start trading.
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Qty</th>
                <th>Avg Buy Price</th>
                <th>Current Price</th>
                <th>Market Value</th>
                <th>P&L</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.holdings.map((h) => (
                <tr key={h.symbol}>
                  <td><strong>{h.symbol}</strong></td>
                  <td>{h.companyName}</td>
                  <td>{h.quantity}</td>
                  <td>${h.avgBuyPrice.toFixed(2)}</td>
                  <td>${h.currentPrice.toFixed(2)}</td>
                  <td>${h.marketValue.toFixed(2)}</td>
                  <td className={h.profitLoss >= 0 ? 'text-success' : 'text-danger'}>
                    {h.profitLoss >= 0 ? '+' : ''}
                    ${h.profitLoss.toFixed(2)} ({h.profitLossPercent}%)
                  </td>
                  <td>
                    <Link to={`/stocks/${h.symbol}`} className="btn btn-sm btn-outline-primary">
                      Trade
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
