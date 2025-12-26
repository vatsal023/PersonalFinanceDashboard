const express = require("express");
const router = express.Router();

const {
  getAllFunds,
  addFund,
  updateFund,
  markAsSold,
  getFundById,
  fetchLiveNAVs,
} = require("../Controllers/mutualFundController");
const auth = require("../middleware/auth");

router.get("/",auth,getAllFunds);
router.post("/",auth,addFund);
router.put("/:id",auth,updateFund);
router.put("/:id/sell",auth,markAsSold);
router.get("/:id",auth,getFundById);

router.get("/fetch-navs/update",auth,fetchLiveNAVs);

module.exports = router;
