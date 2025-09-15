const mongoose = require('mongoose');

const PriceDataSchema = new mongoose.Schema({
  symbol: { type: String, required: true, default: 'GLD' },
  labels: [String],
  prices: [Number],
}, { timestamps: true });

// This line is crucial. It compiles the schema into a model and exports it.
module.exports = mongoose.model('PriceData', PriceDataSchema);