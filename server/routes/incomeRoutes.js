const express = require("express");
const router = express.Router();
const { addIncome, getIncomes, deleteIncome } = require("../Controllers/incomeController");
const auth = require("../middleware/auth");

router.post("/",auth,addIncome);
router.get("/",auth,getIncomes);
router.delete("/:id",auth,deleteIncome);

module.exports = router;
