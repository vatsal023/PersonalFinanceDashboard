const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  nav: { type: Number, required: true },
  units: { type: Number, required: true },
});

const mutualFundSchema = new mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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

    // ✅ Associate each fund with a user
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
},
{timestamps:true}
);

module.exports = mongoose.model("MutualFund", mutualFundSchema);
