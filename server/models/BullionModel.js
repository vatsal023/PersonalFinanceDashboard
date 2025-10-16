const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  quantity: { type: Number, required: true },
  purity: { type: Number, required: true },
  rate: { type: Number, required: true },
  amountInvested: { type: Number, required: true },
});

const bullionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String },
  investments: [investmentSchema],
  currentRate: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "sold"], default: "active" },
  endDate: { type: Date },
  soldRate: { type: Number },
});

module.exports = mongoose.model("Bullion", bullionSchema);
