const Expense = require("../models/ManualExpenseModel");

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
exports.addExpense = async (req, res) => {
  try {

    const { category, amount, description, date } = req.body;

    const expense = new Expense({
      userId: req.user._id,
      category,
      amount,
      description,
      date: date ? new Date(date) : new Date(), // use provided date or default to today
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

// @desc    Get all expenses for user (optional month filter)
// @route   GET /api/expenses?month=YYYY-MM
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    
    const { month } = req.query; // e.g., "2025-10"
    const filter = { userId: req.user._id };

    if (month) {
      const startDate = new Date(`${month}-01T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      filter.date = { $gte: startDate, $lt: endDate }; // filter by 'date' field
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

// @desc    Get expense overview (total + per category) for optional month
// @route   GET /api/expenses/overview?month=YYYY-MM
// @access  Private
exports.getExpenseOverview = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { userId: req.user._id };
    

    if (month) {
      const startDate = new Date(`${month}-01T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      filter.date = { $gte: startDate, $lt: endDate }; // filter by 'date' field
    }

    const expenses = await Expense.find(filter);

    // total spent
    const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);

    // amount per category
    const perCategory = {};
    expenses.forEach((e) => {
      if (!perCategory[e.category]) perCategory[e.category] = 0;
      perCategory[e.category] += e.amount;
    });

    res.json({ totalSpent, perCategory });
  } catch (err) {
    console.error("Error fetching overview:", err);
    res.status(500).json({ message: "Failed to fetch expense overview" });
  }
};
