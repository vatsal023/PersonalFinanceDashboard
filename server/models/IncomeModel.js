const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
},{timestamps:true}
);

module.exports = mongoose.model("Income", incomeSchema);
