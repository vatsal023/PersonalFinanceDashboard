const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema(
  {
     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyName: {
      type: String,
      required: true,
    },
     exchange: { type: String, required: true }, // NSE, BSE, etc.
     symbol: { type: String }, // derived from companyName + exchange
    startDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    numberOfShares: {
      type: Number,
      required: true,
    },
    currValue: {
      type: Number,
      default: 0,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "sold"],
      default: "active",
    },
     soldPrice: { type: Number },
    // profitOrLoss: { type: Number },
  },
  { timestamps: true }
);

const Share = mongoose.model("Share", shareSchema);

module.exports = Share;
