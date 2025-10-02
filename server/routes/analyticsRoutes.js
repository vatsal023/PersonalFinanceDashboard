const express = require("express");
const router = express.Router();
const analyticsController = require("../Controllers/analyticsController");
const auth = require("../middleware/auth");

// Expense Breakdown Pie Chart
router.get("/expense-breakdown",auth, analyticsController.getExpenseBreakdown);

// Spending Trend Line Chart
router.get("/spending-trend", auth, analyticsController.getSpendingTrend);

// Budget Utilization Progress Bars
router.get("/budget-utilization", auth, analyticsController.getBudgetUtilization);

module.exports = router;
