const mongoose = require('mongoose');

const HoldingSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, uppercase: true },
    companyName: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    avgBuyPrice: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const PortfolioSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    holdings: [HoldingSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', PortfolioSchema);
