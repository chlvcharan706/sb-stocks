# SB Stocks — Paper Trading Platform

A full-stack (MERN) web application for practicing stock trading with virtual funds,
real-time US market data, and portfolio tracking — built for stock market enthusiasts
who want a risk-free way to learn and test strategies.

## Tech Stack
- **Frontend:** React, React Router, Bootstrap 5, Recharts
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt
- **Market Data:** Finnhub API (free tier) with a built-in mock-data fallback so the app
  runs out of the box even without an API key.

## Features
- Secure registration & login (JWT-based sessions)
- Personalized dashboard with live-ish stock listings and search
- Stock detail page with a live price chart and Buy/Sell actions
- Paper trading engine: buy/sell using virtual funds, average cost basis tracking
- Portfolio page with holdings, market value, and profit/loss
- Transaction history endpoint

## Project Structure
```
sb-stocks/
├── backend/          # Express API server
│   ├── models/       # Mongoose schemas: User, Portfolio, Transaction
│   ├── routes/        # auth, stocks, trade, portfolio
│   ├── middleware/    # JWT auth middleware
│   ├── utils/         # stock data layer (live API + mock fallback)
│   └── server.js
└── frontend/          # React app (Create React App structure)
    └── src/
        ├── pages/      # Home, Login, Register, Dashboard, StockDetail, Portfolio
        ├── components/ # Navbar, StockCard, TradeModal
        └── context/    # AuthContext
```

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET, and (optionally) FINNHUB_API_KEY
npm run dev
```
The API runs on `http://localhost:5000` by default.

> **No Finnhub key?** No problem — the app automatically falls back to realistic mock
> pricing for a curated list of well-known stocks (AAPL, MSFT, GOOGL, TSLA, etc.) so you
> can develop and demo without any external dependency. Get a free key at
> https://finnhub.io to switch to live data.

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if your backend runs on a different URL
npm start
```
The app runs on `http://localhost:3000` by default.

### 3. MongoDB
Make sure MongoDB is running locally (`mongodb://localhost:27017`) or update
`MONGO_URI` in `backend/.env` to point to a MongoDB Atlas cluster.

## API Overview
| Method | Route                  | Description                          |
|--------|-------------------------|--------------------------------------|
| POST   | /api/auth/register       | Create a new account                |
| POST   | /api/auth/login          | Login and receive a JWT             |
| GET    | /api/auth/me             | Get current user (auth required)    |
| GET    | /api/stocks              | List tracked stocks with quotes     |
| GET    | /api/stocks/search?q=    | Search stocks by symbol/name        |
| GET    | /api/stocks/:symbol      | Get a single stock quote            |
| POST   | /api/trade/buy           | Buy shares (auth required)          |
| POST   | /api/trade/sell          | Sell shares (auth required)         |
| GET    | /api/trade/history       | Transaction history (auth required) |
| GET    | /api/portfolio           | Holdings + P&L (auth required)      |

## Notes for Deployment / Demo
- Update the `demo` and `GitHub` links in your project workspace once deployed
  (e.g., frontend on Vercel/Netlify, backend on Render/Railway, DB on Atlas).
- Each new user starts with a configurable virtual balance (default $100,000, set via
  `STARTING_BALANCE` in `backend/.env`).

## Possible Next Steps
- Historical price charts (daily/weekly candles) via a charting API
- Watchlists and price alerts
- Leaderboard comparing portfolio performance across users
- Dark mode / theme toggle
