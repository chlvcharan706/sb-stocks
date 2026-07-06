const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const { getQuote } = require('../utils/stockApi');

const router = express.Router();

// POST /api/trade/buy { symbol, quantity, companyName }
router.post('/buy', authMiddleware, async (req, res) => {
  try {
    const { symbol, quantity, companyName } = req.body;
    const qty = Number(quantity);
    if (!symbol || !qty || qty <= 0) {
      return res.status(400).json({ message: 'Symbol and a positive quantity are required' });
    }

    const user = await User.findById(req.userId);
    const { price } = await getQuote(symbol);
    const total = +(price * qty).toFixed(2);

    if (user.balance < total) {
      return res.status(400).json({ message: 'Insufficient virtual balance for this trade' });
    }

    let portfolio = await Portfolio.findOne({ user: req.userId });
    if (!portfolio) portfolio = await Portfolio.create({ user: req.userId, holdings: [] });

    const holding = portfolio.holdings.find((h) => h.symbol === symbol.toUpperCase());
    if (holding) {
      const newQty = holding.quantity + qty;
      holding.avgBuyPrice = +(((holding.avgBuyPrice * holding.quantity) + total) / newQty).toFixed(2);
      holding.quantity = newQty;
      if (companyName) holding.companyName = companyName;
    } else {
      portfolio.holdings.push({
        symbol: symbol.toUpperCase(),
        companyName: companyName || symbol.toUpperCase(),
        quantity: qty,
        avgBuyPrice: price,
      });
    }

    user.balance = +(user.balance - total).toFixed(2);

    await user.save();
    await portfolio.save();
    await Transaction.create({
      user: req.userId,
      symbol: symbol.toUpperCase(),
      companyName: companyName || symbol.toUpperCase(),
      type: 'BUY',
      quantity: qty,
      price,
      total,
    });

    res.json({ message: 'Buy order executed', balance: user.balance, portfolio });
  } catch (err) {
    res.status(500).json({ message: 'Buy order failed', error: err.message });
  }
});

// POST /api/trade/sell { symbol, quantity }
router.post('/sell', authMiddleware, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const qty = Number(quantity);
    if (!symbol || !qty || qty <= 0) {
      return res.status(400).json({ message: 'Symbol and a positive quantity are required' });
    }

    const portfolio = await Portfolio.findOne({ user: req.userId });
    const holding = portfolio && portfolio.holdings.find((h) => h.symbol === symbol.toUpperCase());

    if (!holding || holding.quantity < qty) {
      return res.status(400).json({ message: 'You do not own enough shares to sell' });
    }

    const { price } = await getQuote(symbol);
    const total = +(price * qty).toFixed(2);

    holding.quantity -= qty;
    if (holding.quantity === 0) {
      portfolio.holdings = portfolio.holdings.filter((h) => h.symbol !== symbol.toUpperCase());
    }

    const user = await User.findById(req.userId);
    user.balance = +(user.balance + total).toFixed(2);

    await user.save();
    await portfolio.save();
    await Transaction.create({
      user: req.userId,
      symbol: symbol.toUpperCase(),
      companyName: holding.companyName,
      type: 'SELL',
      quantity: qty,
      price,
      total,
    });

    res.json({ message: 'Sell order executed', balance: user.balance, portfolio });
  } catch (err) {
    res.status(500).json({ message: 'Sell order failed', error: err.message });
  }
});

// GET /api/trade/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100);
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', error: err.message });
  }
});

module.exports = router;
