const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const budgetController = require("../Controllers/budgetController");

router.get("/with-spending", auth, budgetController.getBudgetsWithSpending);
// CRUD Routes
router.post("/", auth, budgetController.createBudget);
router.get("/", auth, budgetController.getBudgets);
router.put("/:id", auth, budgetController.updateBudget);
router.delete("/:id", auth, budgetController.deleteBudget);

// Get budgets with spending
// router.get("/with-spending", auth, budgetController.getBudgetsWithSpending);

module.exports = router;
