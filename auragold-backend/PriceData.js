// models/PriceData.js
const mongoose = require('mongoose');

const PriceDataSchema = new mongoose.Schema({
  symbol: { type: String, required: true, default: 'GLD' },
  labels: [String],
  prices: [Number],
}, { timestamps: true }); // timestamps adds createdAt and updatedAt fields

module.exports = mongoose.model('PriceData', PriceDataSchema);