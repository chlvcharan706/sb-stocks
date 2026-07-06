const axios = require('axios');

// A small, well-known set of symbols used for the mock listing / search fallback.
// If FINNHUB_API_KEY is set in .env, real quotes/search are used instead.
const MOCK_STOCKS = [
  { symbol: 'AAPL', companyName: 'Apple Inc.', basePrice: 210 },
  { symbol: 'MSFT', companyName: 'Microsoft Corporation', basePrice: 445 },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc.', basePrice: 178 },
  { symbol: 'AMZN', companyName: 'Amazon.com, Inc.', basePrice: 195 },
  { symbol: 'TSLA', companyName: 'Tesla, Inc.', basePrice: 245 },
  { symbol: 'NVDA', companyName: 'NVIDIA Corporation', basePrice: 135 },
  { symbol: 'META', companyName: 'Meta Platforms, Inc.', basePrice: 505 },
  { symbol: 'NFLX', companyName: 'Netflix, Inc.', basePrice: 680 },
  { symbol: 'AMD', companyName: 'Advanced Micro Devices, Inc.', basePrice: 158 },
  { symbol: 'IBM', companyName: 'International Business Machines', basePrice: 190 },
  { symbol: 'INTC', companyName: 'Intel Corporation', basePrice: 32 },
  { symbol: 'ORCL', companyName: 'Oracle Corporation', basePrice: 145 },
];

function mockPriceFor(symbol) {
  const stock = MOCK_STOCKS.find((s) => s.symbol === symbol.toUpperCase());
  const base = stock ? stock.basePrice : 100;
  // deterministic-ish small daily variation so refreshes aren't wildly different
  const variation = (Math.sin(Date.now() / 100000 + symbol.length) * 0.02) * base;
  const price = +(base + variation).toFixed(2);
  const changePercent = +((variation / base) * 100).toFixed(2);
  return { price, changePercent };
}

const hasKey = () => !!process.env.FINNHUB_API_KEY && process.env.FINNHUB_API_KEY !== 'your_finnhub_api_key_here';

async function getQuote(symbol) {
  if (hasKey()) {
    try {
      const { data } = await axios.get('https://finnhub.io/api/v1/quote', {
        params: { symbol: symbol.toUpperCase(), token: process.env.FINNHUB_API_KEY },
      });
      if (data && typeof data.c === 'number' && data.c > 0) {
        return {
          price: data.c,
          changePercent: data.pc ? +(((data.c - data.pc) / data.pc) * 100).toFixed(2) : 0,
          high: data.h,
          low: data.l,
          open: data.o,
          previousClose: data.pc,
        };
      }
    } catch (err) {
      console.warn(`Finnhub quote failed for ${symbol}, falling back to mock:`, err.message);
    }
  }
  const mock = mockPriceFor(symbol);
  return { ...mock, high: mock.price * 1.01, low: mock.price * 0.99, open: mock.price, previousClose: mock.price };
}

async function searchSymbols(query) {
  if (hasKey()) {
    try {
      const { data } = await axios.get('https://finnhub.io/api/v1/search', {
        params: { q: query, token: process.env.FINNHUB_API_KEY },
      });
      if (data && Array.isArray(data.result)) {
        return data.result.slice(0, 15).map((r) => ({ symbol: r.symbol, companyName: r.description }));
      }
    } catch (err) {
      console.warn('Finnhub search failed, falling back to mock:', err.message);
    }
  }
  const q = query.toUpperCase();
  return MOCK_STOCKS.filter((s) => s.symbol.includes(q) || s.companyName.toUpperCase().includes(q)).map((s) => ({
    symbol: s.symbol,
    companyName: s.companyName,
  }));
}

async function listStocks() {
  const results = await Promise.all(
    MOCK_STOCKS.map(async (s) => {
      const quote = await getQuote(s.symbol);
      return { symbol: s.symbol, companyName: s.companyName, ...quote };
    })
  );
  return results;
}

module.exports = { getQuote, searchSymbols, listStocks, MOCK_STOCKS };
