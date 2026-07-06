import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import TradeModal from '../components/TradeModal';
import { useAuth } from '../context/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function StockDetail() {
  const { symbol } = useParams();
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [tradeType, setTradeType] = useState(null);
  const [message, setMessage] = useState('');
  const { refreshUser } = useAuth();

  const loadQuote = async () => {
    const res = await api.get(`/stocks/${symbol}`);
    setQuote(res.data);
    setHistory((prev) => {
      const next = [...prev, { time: new Date().toLocaleTimeString(), price: res.data.price }];
      return next.slice(-20);
    });
  };

  useEffect(() => {
    loadQuote();
    const interval = setInterval(loadQuote, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  const handleTradeSuccess = async (data) => {
    setMessage(data.message);
    setTradeType(null);
    await refreshUser();
  };

  if (!quote) return <div className="container py-4">Loading quote...</div>;

  const positive = quote.changePercent >= 0;

  return (
    <div className="container py-4">
      {message && <div className="alert alert-success">{message}</div>}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h2>{quote.symbol}</h2>
          <h3>
            ${quote.price?.toFixed(2)}{' '}
            <span className={`badge ${positive ? 'bg-success' : 'bg-danger'}`}>
              {positive ? '▲' : '▼'} {Math.abs(quote.changePercent)}%
            </span>
          </h3>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={() => setTradeType('BUY')}>
            Buy
          </button>
          <button className="btn btn-danger" onClick={() => setTradeType('SELL')}>
            Sell
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3"><strong>Open:</strong> ${quote.open?.toFixed(2)}</div>
        <div className="col-md-3"><strong>High:</strong> ${quote.high?.toFixed(2)}</div>
        <div className="col-md-3"><strong>Low:</strong> ${quote.low?.toFixed(2)}</div>
        <div className="col-md-3"><strong>Prev Close:</strong> ${quote.previousClose?.toFixed(2)}</div>
      </div>

      <div className="card p-3 mb-4" style={{ height: 320 }}>
        <h6>Live Price Trend (this session)</h6>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" hide />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#198754" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {tradeType && (
        <TradeModal
          symbol={quote.symbol}
          companyName={quote.symbol}
          price={quote.price}
          type={tradeType}
          onClose={() => setTradeType(null)}
          onSuccess={handleTradeSuccess}
        />
      )}
    </div>
  );
}
