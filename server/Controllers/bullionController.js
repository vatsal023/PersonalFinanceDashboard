const Bullion = require("../models/BullionModel");
const axios = require("axios");
const yahooFinance = require("yahoo-finance2").default;

const fetchSymbolFromName = async (name) => {
  try {
    const result = await yahooFinance.search(name);
    if (!result.quotes || result.quotes.length === 0) return null;

    // Try to find futures symbols (like GC=F, SI=F)
    const match = result.quotes.find(q => q.symbol && q.symbol.includes("=F"));

    // If not found, take the first valid symbol (fallback)
    return match ? match.symbol : result.quotes[0].symbol;
  } catch (err) {
    console.error(`❌ Error fetching symbol for ${name}:`, err.message);
    return null;
  }
};

const fetchLiveRates = async (req, res) => {
  try {
    const bullions = await Bullion.find({userId: req.user._id});
    console.log("Bullions",bullions);
    const USD_TO_INR = 87.97;
    const OUNCE_TO_GRAM = 31.1035;

    const updatedBullions = [];

    for (const b of bullions) {
      let symbol = b.symbol;

      // Auto-detect symbol if not stored
      if (!symbol) {
        symbol = await fetchSymbolFromName(b.name);
        if (symbol) {
          b.symbol = symbol;
          await b.save(); // cache it for next time
          console.log(`🔍 Found and saved symbol for ${b.name}: ${symbol}`);
        } else {
          console.warn(`⚠️ No symbol found for ${b.name}`);
          continue;
        }
      }

      try {
        const quote = await yahooFinance.quote(symbol);
        const latestPriceUSD = quote.regularMarketPrice;
        const pricePerGramINR = (latestPriceUSD / OUNCE_TO_GRAM) * USD_TO_INR;

        b.currentRate = pricePerGramINR;
        await b.save();

        updatedBullions.push({
          name: b.name,
          symbol,
          rateINR: pricePerGramINR.toFixed(2),
          lastUpdated: new Date(quote.regularMarketTime * 1000).toLocaleString(),
        });
      } catch (err) {
        console.warn(`⚠️ Failed to fetch quote for ${b.name} (${symbol}): ${err.message}`);
      }
    }

    res.json({
      success: true,
      updated: updatedBullions.length,
      data: updatedBullions,
    });
  } catch (err) {
    console.error("❌ Error fetching live prices:", err);
    res.status(500).json({ success: false, message: "Failed to fetch live prices" });
  }
};

// Get all bullions
const getAllBullions = async (req, res) => {
  try {
    const bullions = await Bullion.find({userId: req.user._id }).sort({createdAt:-1});
    res.json(bullions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bullions", error: err });
  }
};

// Add new bullion or merge investments
const addBullion = async (req, res) => {
  try {
    const { name, investments, status, currentRate } = req.body;

    let bullion = await Bullion.findOne({ 
         name,
        "investments.purity": investments[0].purity,
        status: "active",
         userId: req.user._id, // ✅ filter by logged-in user
    });

    if (bullion) {
      // Merge investments
      bullion.investments.push(...investments);
      if (currentRate) bullion.currentRate = currentRate;
      await bullion.save();
    } else {
      bullion = new Bullion({
        name,
        // symbol,
        status: status || "active",
        investments,
        currentRate: currentRate || 0,
         userId: req.user._id, // ✅ associate user
      });
      await bullion.save();
    }

    res.status(201).json(bullion);
  } catch (err) {
    res.status(400).json({ message: "Error adding bullion", error: err });
  }
};

// Update bullion (fields like investments array or currentRate)
const updateBullion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

     const updatedBullion = await Bullion.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true }
    );
    // const updatedBullion = await Bullion.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedBullion) return res.status(404).json({ message: "Bullion not found" });

    res.json(updatedBullion);
  } catch (err) {
    res.status(400).json({ message: "Error updating bullion", error: err });
  }
};

// Mark bullion as sold
const markAsSold = async (req, res) => {
  try {
    const { id } = req.params;
    const { endDate, soldRate } = req.body;

      const bullion = await Bullion.findOne({ _id: id, userId: req.user._id });
    // const bullion = await Bullion.findById(id);
    if (!bullion) return res.status(404).json({ message: "Bullion not found" });

    bullion.status = "sold";
    bullion.endDate = endDate;
    bullion.soldRate = soldRate;

    await bullion.save();
    res.json({ message: "Bullion marked as sold", bullion });
  } catch (err) {
    res.status(400).json({ message: "Error marking as sold", error: err });
  }
};

// Get bullion by ID
const getBullionById = async (req, res) => {
  try {
    const bullion = await Bullion.findOne({ _id: req.params.id, userId: req.user._id });
    // const bullion = await Bullion.findById(req.params.id);
    if (!bullion) return res.status(404).json({ message: "Bullion not found" });
    res.json(bullion);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bullion details", error: err });
  }
};

module.exports = {
  getAllBullions,
  addBullion,
  updateBullion,
  markAsSold,
  getBullionById,
  fetchLiveRates,
};
