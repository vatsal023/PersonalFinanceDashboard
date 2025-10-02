const Budget = require("../models/BudgetModel");
const Transaction = require("../models/TransactionModel");
const ManualExpense = require("../models/ManualExpenseModel");
// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    const { category, amount, month } = req.body;
    console.log(req.user._id);
    const budget = new Budget({ userId: req.user._id, category, amount, month });
    await budget.save();
    res.status(201).json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create budget" });
  }
};

// Get all budgets for logged-in user
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update budget" });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Budget deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete budget" });
  }
};

// Get budgets with spending
// exports.getBudgetsWithSpending = async (req, res) => {
//   try {
//     const { month } = req.query;
//     if (!month) return res.status(400).json({ error: "Month (YYYY-MM) is required" });

//     const budgets = await Budget.find({ userId: req.user.id, month });

//     const startDate = new Date(`${month}-01`);
//     const endDate = new Date(startDate);
//     endDate.setMonth(endDate.getMonth() + 1);

//     const transactions = await Transaction.find({
//       userId: req.user.id,
//       date: { $gte: startDate, $lt: endDate },
//     });

//     const spendingByCategory = {};
//     transactions.forEach((txn) => {
//       spendingByCategory[txn.category] = (spendingByCategory[txn.category] || 0) + txn.amount;
//     });

//     const results = budgets.map((budget) => {
//       const spent = spendingByCategory[budget.category] || 0;
//       return {
//         category: budget.category,
//         budget: budget.amount,
//         spent,
//         remaining: budget.amount - spent,
//         month: budget.month,
//       };
//     });

//     res.json(results);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to calculate budgets with spending" });
//   }
// };


//Get Budgets with spending without using aggregate on both Plaid and manual expenses,using find + foreach 
// exports.getBudgetsWithSpending = async (req, res) => {
//   try {
//     const { month } = req.query;
//     if (!month)
//       return res.status(400).json({ error: "Month (YYYY-MM) is required" });

//     const userId = req.user.id;

//     // Fetch budgets
//     const budgets = await Budget.find({ userId, month });

//     const startDate = new Date(`${month}-01`);
//     const endDate = new Date(startDate);
//     endDate.setMonth(endDate.getMonth() + 1);

//     // 1️⃣ Fetch Plaid transactions
//     const transactions = await Transaction.find({
//       userId,
//       date: { $gte: startDate, $lt: endDate },
//     });

//     // 2️⃣ Fetch manual expenses
//     const manualExpenses = await ManualExpense.find({
//       userId,
//       date: { $gte: startDate, $lt: endDate },
//     });

//     // 3️⃣ Combine spending by category
//     const spendingByCategory = {};

//     transactions.forEach((txn) => {
//       spendingByCategory[txn.category] =
//         (spendingByCategory[txn.category] || 0) + txn.amount;
//     });

//     manualExpenses.forEach((exp) => {
//       spendingByCategory[exp.category] =
//         (spendingByCategory[exp.category] || 0) + exp.amount;
//     });

//     // 4️⃣ Map budgets to include spent + remaining
//     const results = budgets.map((budget) => {
//       const spent = spendingByCategory[budget.category] || 0;
//       return {
//         category: budget.category,
//         budget: budget.amount,
//         spent,
//         remaining: budget.amount - spent,
//         month: budget.month,
//       };
//     });

//     res.json(results);
//   } catch (err) {
//     console.error(err);
//     res
//       .status(500)
//       .json({ error: "Failed to calculate budgets with spending" });
//   }
// };

// Get budgets with spending using aggregate on both Plaid and manual expenses
exports.getBudgetsWithSpending = async (req, res) => {
    console.log("Incoming month:", req.query.month);
  try {
    const { month } = req.query;
    if (!month)
      return res.status(400).json({ error: "Month (YYYY-MM) is required" });

    const userId = req.user._id;

    // 1️⃣ Fetch budgets
    const budgets = await Budget.find({ userId, month });

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // 2️⃣ Aggregate Plaid transactions
    const plaidTotals = await Transaction.aggregate([
      { $match: { userId, date: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);

    // 3️⃣ Aggregate manual expenses
    const manualTotals = await ManualExpense.aggregate([
      { $match: { userId, date: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);

    // 4️⃣ Merge totals
    const combinedTotals = {};
    [...plaidTotals, ...manualTotals].forEach((item) => {
      combinedTotals[item._id] = (combinedTotals[item._id] || 0) + item.total;
    });

    // 5️⃣ Map budgets to include spent + remaining
    const results = budgets.map((budget) => {
      const spent = combinedTotals[budget.category] || 0;
      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        remaining: budget.amount - spent,
        month: budget.month,
      };
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to calculate budgets with spending" });
  }
};
