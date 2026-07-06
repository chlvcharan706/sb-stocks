const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
}

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(400).json({ message: 'Email already registered' });

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });
      await Portfolio.create({ user: user._id, holdings: [] });

      const token = signToken(user._id);
      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, balance: user.balance },
      });
    } catch (err) {
      res.status(500).json({ message: 'Registration failed', error: err.message });
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid credentials' });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(400).json({ message: 'Invalid email or password' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: 'Invalid email or password' });

      const token = signToken(user._id);
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, balance: user.balance } });
    } catch (err) {
      res.status(500).json({ message: 'Login failed', error: err.message });
    }
  }
);

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

module.exports = router;
