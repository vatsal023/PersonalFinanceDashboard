// // routes/mutualFunds.js
// const express = require("express");
// const router = express.Router();
// const mutualFundController = require("../Controllers/mutualFundController");

// // GET all mutual funds
// router.get("/", mutualFundController.getAllMutualFunds);

// // POST add new mutual fund
// router.post("/", mutualFundController.addMutualFund);

// // PUT update current value
// router.put("/:id", mutualFundController.updateCurrValue);
// //Delete mutual fund
// router.delete("/:id", mutualFundController.deleteMutualFund);

// router.put("/:id/sell", mutualFundController.markAsSold);


// module.exports = router;



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

router.get("/", getAllFunds);
router.post("/", addFund);
router.put("/:id", updateFund);
router.put("/:id/sell", markAsSold);
router.get("/:id", getFundById);

router.get("/fetch-navs/update", fetchLiveNAVs);

module.exports = router;
