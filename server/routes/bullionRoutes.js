const express = require("express");
const router = express.Router();
const {
  getAllBullions,
  addBullion,
  updateBullion,
  markAsSold,
  getBullionById,
  fetchLiveRates,
} = require("../Controllers/bullionController");

const auth = require("../middleware/auth");

// Get all bullions
router.get("/",auth, getAllBullions);

// Get bullion by ID
router.get("/:id", auth,getBullionById);

// Add new bullion or merge investments
router.post("/",auth, addBullion);

// Update bullion
router.put("/:id", auth,updateBullion);

// Mark bullion as sold
router.put("/:id/sold", auth,markAsSold);

// Fetch live rates for active bullions
router.get("/live/rates",auth,fetchLiveRates);

module.exports = router;
