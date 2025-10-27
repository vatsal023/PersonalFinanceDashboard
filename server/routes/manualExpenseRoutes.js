const express = require("express");
const router = express.Router();
const {
  addExpense,
  getExpenses,
  getExpenseOverview,
} = require("../Controllers/manualExpenseController");
const auth = require("../middleware/auth");

// Add new expense
router.post("/", auth, addExpense);

// Get all expenses
router.get("/", auth, getExpenses);

// Get overview (totals per category + total spent)
router.get("/overview", auth, getExpenseOverview);      

module.exports = router;
