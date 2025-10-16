const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  nav: { type: Number, required: true },
  units: { type: Number, required: true },
});

const mutualFundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  frequency: {
    type: String,
    enum: ["monthly", "yearly", "one-time"],
    default: "monthly",
  },
  investments: [investmentSchema],
  currNAV: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "sold"], default: "active" },
  endDate: { type: Date },
   soldNAV: { type: Number },  ///added   
});

module.exports = mongoose.model("MutualFund", mutualFundSchema);
