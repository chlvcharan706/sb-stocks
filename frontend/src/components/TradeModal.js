import React, { useState } from 'react';
import api from '../api';

export default function TradeModal({ symbol, companyName, price, type, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const total = (quantity * (price || 0)).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = type === 'BUY' ? '/trade/buy' : '/trade/sell';
      const res = await api.post(endpoint, { symbol, quantity: Number(quantity), companyName });
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Trade failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {type === 'BUY' ? 'Buy' : 'Sell'} {symbol}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <p className="mb-1">Current Price: <strong>${price?.toFixed(2)}</strong></p>
              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <p className="fw-bold">Estimated Total: ${total}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${type === 'BUY' ? 'btn-success' : 'btn-danger'}`}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Confirm ${type === 'BUY' ? 'Buy' : 'Sell'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
