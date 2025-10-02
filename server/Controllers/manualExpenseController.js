const ManualExpense = require("../models/ManualExpenseModel");

// Add a new manual expense
const addExpense = async (req, res) => {
  try {
    const expense = new ManualExpense({ ...req.body, userId: req.user._id });
    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add expense" });
  }
};

// Get expenses by month
const getExpensesByMonth = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const expenses = await ManualExpense.find({
      userId: req.user._id,
      date: { $gte: start, $lt: end },
    });

    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

module.exports = { addExpense, getExpensesByMonth };
