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

// Get all bullions
router.get("/", getAllBullions);

// Get bullion by ID
router.get("/:id", getBullionById);

// Add new bullion or merge investments
router.post("/", addBullion);

// Update bullion
router.put("/:id", updateBullion);

// Mark bullion as sold
router.put("/:id/sold", markAsSold);

// Fetch live rates for active bullions
router.get("/live/rates", fetchLiveRates);

module.exports = router;
