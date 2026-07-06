const express = require('express');
const authMiddleware = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const { getQuote } = require('../utils/stockApi');

const router = express.Router();

// GET /api/portfolio - holdings enriched with live prices + P&L
router.get('/', authMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.userId });
    const user = await User.findById(req.userId).select('-password');

    if (!portfolio) return res.json({ holdings: [], balance: user.balance, totalValue: user.balance });

    const enriched = await Promise.all(
      portfolio.holdings.map(async (h) => {
        const { price } = await getQuote(h.symbol);
        const marketValue = +(price * h.quantity).toFixed(2);
        const investedValue = +(h.avgBuyPrice * h.quantity).toFixed(2);
        const profitLoss = +(marketValue - investedValue).toFixed(2);
        const profitLossPercent = investedValue ? +((profitLoss / investedValue) * 100).toFixed(2) : 0;
        return {
          symbol: h.symbol,
          companyName: h.companyName,
          quantity: h.quantity,
          avgBuyPrice: h.avgBuyPrice,
          currentPrice: price,
          marketValue,
          investedValue,
          profitLoss,
          profitLossPercent,
        };
      })
    );

    const holdingsValue = enriched.reduce((sum, h) => sum + h.marketValue, 0);

    res.json({
      holdings: enriched,
      balance: user.balance,
      holdingsValue: +holdingsValue.toFixed(2),
      totalValue: +(user.balance + holdingsValue).toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch portfolio', error: err.message });
  }
});

module.exports = router;
