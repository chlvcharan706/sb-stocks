import React from 'react';
import { Link } from 'react-router-dom';

export default function StockCard({ stock }) {
  const positive = stock.changePercent >= 0;
  return (
    <div className="col-md-4 col-sm-6 mb-3">
      <div className="card h-100 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="card-title mb-0">{stock.symbol}</h5>
              <small className="text-muted">{stock.companyName}</small>
            </div>
            <span className={`badge ${positive ? 'bg-success' : 'bg-danger'}`}>
              {positive ? '▲' : '▼'} {Math.abs(stock.changePercent)}%
            </span>
          </div>
          <h4 className="mt-3 mb-2">${stock.price?.toFixed(2)}</h4>
          <Link to={`/stocks/${stock.symbol}`} className="btn btn-sm btn-outline-primary w-100">
            View & Trade
          </Link>
        </div>
      </div>
    </div>
  );
}
