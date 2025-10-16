const MutualFund = require("../models/MutualFundModel");
const axios = require('axios');
// ✅ Get all mutual funds

//not working for all
// const fetchLiveNAVs = async (req, res) => {
//   try {
//     const response = await axios.get("https://www.amfiindia.com/spages/NAVAll.txt");
//     const navData = response.data;

//     const lines = navData.split("\n");
//     const updates = [];

//     // Fetch all funds from DB
//     const funds = await MutualFund.find();

//     for (const fund of funds) {
//       // Match line containing fund name (case-insensitive)
//       const line = lines.find((l) =>
//         l.toLowerCase().includes(fund.name.toLowerCase())
//       );
//        console.log(fund.name, line ? "FOUND" : "NOT FOUND");

//       if (line) {
//         const parts = line.split(";");
//         const latestNAV = parseFloat(parts[4]); // 5th field is NAV
//         if (!isNaN(latestNAV)) {
//           fund.currNAV = latestNAV;
//           await fund.save();
//           updates.push({ name: fund.name, currNAV: latestNAV });
//         }
//       }
//     }

//     res.json({
//       message: `Updated NAVs for ${updates.length} funds`,
//       updatedFunds: updates,
//     });
//   } catch (error) {
//     console.error("Error fetching NAVs:", error);
//     res.status(500).json({ message: "Failed to fetch NAVs", error });
//   }
// };

///this one working
// const fetchLiveNAVs = async (req, res) => {
//   try {
//     const response = await axios.get("https://www.amfiindia.com/spages/NAVAll.txt");
//     const navData = response.data;

//     const lines = navData.split("\n");
//     const updates = [];

//     // Helper: normalize fund names
//     const normalize = (str) =>
//       str
//         .replace(/[-\/]/g, " ")       // replace hyphens and slashes with space
//         .replace(/\s+/g, " ")         // collapse multiple spaces
//         .trim()
//         .toLowerCase();

//     // Fetch all funds from DB
//     const funds = await MutualFund.find();

//     for (const fund of funds) {
//       const fundNameNorm = normalize(fund.name);

//       // Find line that contains normalized fund name
//       const line = lines.find((l) => normalize(l).includes(fundNameNorm));

//       console.log(fund.name, line ? "FOUND" : "NOT FOUND");

//       if (line) {
//         const parts = line.split(";");
//         const latestNAV = parseFloat(parts[4]); // 5th field is NAV
//         if (!isNaN(latestNAV)) {
//           fund.currNAV = latestNAV;
//           await fund.save();
//           updates.push({ name: fund.name, currNAV: latestNAV });
//         }
//       }
//     }

//     res.json({
//       message: `Updated NAVs for ${updates.length} funds`,
//       updatedFunds: updates,
//     });
//   } catch (error) {
//     console.error("Error fetching NAVs:", error);
//     res.status(500).json({ message: "Failed to fetch NAVs", error });
//   }
// };

///this one also working
const fetchLiveNAVs = async (req, res) => {
  try {
    const response = await axios.get("https://www.amfiindia.com/spages/NAVAll.txt", {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const navData = response.data;

    // Split lines and skip metadata if needed
    const lines = navData.split("\n").filter(line => line.trim() && !line.startsWith('Scheme Code'));
    const updates = [];

    // Helper: normalize fund names
    const normalize = (str) =>
      str
        .replace(/[-\/]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    // Fetch all funds from DB
    const funds = await MutualFund.find();

    for (const fund of funds) {
      const fundNameNorm = normalize(fund.name);

      // Find line where the 4th field (fundName) matches
      const line = lines.find((l) => {
        const parts = l.split(";");
        const amfiFundName = parts[3] || "";
        return normalize(amfiFundName).includes(fundNameNorm);
      });

      console.log(fund.name, line ? "FOUND" : "NOT FOUND");

      if (line) {
        const parts = line.split(";");
        const latestNAV = parseFloat(parts[4]);
        if (!isNaN(latestNAV)) {
          fund.currNAV = latestNAV;
          await fund.save();
          updates.push({ name: fund.name, currNAV: latestNAV });
        }
      }
    }

    res.json({
      message: `Updated NAVs for ${updates.length} funds`,
      updatedFunds: updates,
    });
  } catch (error) {
    console.error("Error fetching NAVs:", error);
    res.status(500).json({ message: "Failed to fetch NAVs", error });
  }
};

const getAllFunds = async (req, res) => {
  try {
    const funds = await MutualFund.find();
    res.json(funds);
  } catch (error) {
    res.status(500).json({ message: "Error fetching mutual funds", error });
  }
};

// ✅ Add a new mutual fund
const addFund = async (req, res) => {
  try {
    const { name, frequency, investments, status, currNAV } = req.body;
    const newFund = new MutualFund({ name, frequency, investments, status, currNAV });
    await newFund.save();
    res.status(201).json(newFund);
  } catch (error) {
    res.status(400).json({ message: "Error adding mutual fund", error });
  }
};

// ✅ Update a fund (for example, NAV or new investments)
const updateFund = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedFund = await MutualFund.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedFund) return res.status(404).json({ message: "Fund not found" });
    res.json(updatedFund);
  } catch (error) {
    res.status(400).json({ message: "Error updating fund", error });
  }
};

// ✅ Mark fund as sold
const markAsSold = async (req, res) => {
  try {
    const { id } = req.params;
    const { endDate,soldNAV } = req.body;    ///also accept sold nav

    const fund = await MutualFund.findById(id);
    if (!fund) return res.status(404).json({ message: "Fund not found" });

    fund.status = "sold";
    fund.endDate = endDate;
     fund.soldNAV = soldNAV; // ✅ save sold NAV

    await fund.save();

    res.json({ message: "Fund marked as sold", fund });
  } catch (error) {
    res.status(400).json({ message: "Error marking as sold", error });
  }
};

const getFundById = async (req, res) => {
  try {
    const fund = await MutualFund.findById(req.params.id);
    if (!fund) return res.status(404).json({ message: "Fund not found" });
    res.json(fund);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fund details", error });
  }
};

module.exports = {
  getAllFunds,
  addFund,
  updateFund,
  markAsSold,
  getFundById,
  fetchLiveNAVs,
};
