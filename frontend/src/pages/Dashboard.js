import React, { useEffect, useState } from 'react';
import api from '../api';
import StockCard from '../components/StockCard';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadStocks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stocks');
      setStocks(res.data.stocks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
    const interval = setInterval(loadStocks, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    const res = await api.get('/stocks/search', { params: { q: query } });
    setSearchResults(res.data.results);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Market Dashboard</h2>
        {user && (
          <span className="text-muted">
            Welcome back, <strong>{user.name}</strong>
          </span>
        )}
      </div>

      <form className="d-flex mb-4" onSubmit={handleSearch}>
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search stocks by symbol or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary">Search</button>
      </form>

      {searchResults && (
        <div className="mb-4">
          <h5>Search Results</h5>
          {searchResults.length === 0 ? (
            <p className="text-muted">No matching stocks found.</p>
          ) : (
            <ul className="list-group">
              {searchResults.map((r) => (
                <li key={r.symbol} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    <strong>{r.symbol}</strong> — {r.companyName}
                  </span>
                  <a href={`/stocks/${r.symbol}`} className="btn btn-sm btn-outline-primary">
                    View
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <h5 className="mb-3">Trending Stocks</h5>
      {loading ? (
        <p>Loading market data...</p>
      ) : (
        <div className="row">
          {stocks.map((s) => (
            <StockCard key={s.symbol} stock={s} />
          ))}
        </div>
      )}
    </div>
  );
}
