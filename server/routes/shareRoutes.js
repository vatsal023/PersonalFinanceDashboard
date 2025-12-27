const express = require("express");
const {
  getShares,
  addShare,
  updateCurrentValue,
  markAsSold,
  deleteShare,
  fetchLivePrices,
  getSoldShares,
} = require("../Controllers/shareController");  
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/",auth,getShares);
router.get("/sold",auth,getSoldShares);
router.post("/", auth,addShare);
router.put("/:id", auth,updateCurrentValue);
router.put("/:id/sell",auth, markAsSold);
router.delete("/:id",auth,deleteShare);

// route for live price tracking
router.get("/live",auth,fetchLivePrices);

module.exports = router;

