const Income = require("../models/IncomeModel");

// Add income
exports.addIncome = async (req, res) => {
  try {
    const { category, amount, date, notes } = req.body;

    if (!category || !amount || !date) {
      return res.status(400).json({ message: "Category, amount, and date are required" });
    }

    const income = new Income({ userId:req.user._id,category, amount, date, notes });
    await income.save();

    res.status(201).json(income);
  } catch (error) {
    console.error("Error adding income:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get incomes (optional month filter)
exports.getIncomes = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = {userId: req.user._id };// 👈 fetch only logged-in user's data

    if (month) {
      const start = new Date(`${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const incomes = await Income.find(filter).sort({ date: -1 });
    res.status(200).json(incomes);
  } catch (error) {
    console.error("Error fetching incomes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete income
exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
     const income = await Income.findOne({ _id: id, userId: req.user._id }); // 👈 user-level protection
    if (!income) return res.status(404).json({ message: "Income not found or unauthorized" });

    await Income.findByIdAndDelete(id);
    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error("Error deleting income:", error);
    res.status(500).json({ message: "Server error" });
  }
};
