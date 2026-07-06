const express = require('express');
const { getQuote, searchSymbols, listStocks } = require('../utils/stockApi');

const router = express.Router();

// GET /api/stocks - listing of tracked stocks with live/mock prices
router.get('/', async (req, res) => {
  try {
    const stocks = await listStocks();
    res.json({ stocks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stocks', error: err.message });
  }
});

// GET /api/stocks/search?q=appl
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) return res.json({ results: [] });
    const results = await searchSymbols(q);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});

// GET /api/stocks/:symbol - single quote detail
router.get('/:symbol', async (req, res) => {
  try {
    const quote = await getQuote(req.params.symbol);
    res.json({ symbol: req.params.symbol.toUpperCase(), ...quote });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quote', error: err.message });
  }
});

module.exports = router;
