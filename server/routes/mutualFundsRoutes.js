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
const auth = require("../middleware/auth");

router.get("/",auth,getAllFunds);
router.post("/",auth,addFund);
router.put("/:id",auth,updateFund);
router.put("/:id/sell",auth,markAsSold);
router.get("/:id",auth,getFundById);

router.get("/fetch-navs/update",auth,fetchLiveNAVs);

module.exports = router;
