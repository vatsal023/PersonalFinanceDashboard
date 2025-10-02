const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: {
    type: String,
    enum: [
      "Food & Dining",
      "Bills & Utilities",
      "Entertainment",
      "Transport",
      "Shopping",
      "Health",
      "Miscellaneous"
    ],
    required: true
  },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // e.g. "2025-10"
}, { timestamps: true });

module.exports = mongoose.model("Budget", BudgetSchema);
