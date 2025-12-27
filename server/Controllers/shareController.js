const Share = require("../models/shareModel");
const yf = require("yahoo-finance2").default;

// Get all shares
const getShares = async (req, res) => {
  try {
    const shares = await Share.find({userId: req.user._id }).sort({ createdAt: -1 });
    res.json(shares);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shares", error });
  }
};

// Add new share
const addShare = async (req, res) => {
  try {
    const {companyName, exchange, startDate, amount, numberOfShares} = req.body;

    // Normalize exchange for Yahoo Finance
    const yahooExchange = exchange === "NSE" ? "NSI" : "BSE";

    let symbol = "";
    try {
      const searchResults = await yf.search(companyName);
      const result = searchResults.quotes.find(
        (q) => q.exchange === yahooExchange
      );
      symbol = result ? result.symbol : "";
    } catch (err) {
      console.error("Symbol search failed:", err);
    }

    console.log("Resolved symbol:", symbol, "for", companyName);

    const newShare = new Share({
       userId: req.user._id,
      companyName,
      exchange,
      symbol,
      startDate,
      amount,
      numberOfShares,
      currValue: amount, // default current value = invested
      
    });

    const saved = await newShare.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error adding share:", error);
    res.status(500).json({ message: "Error adding share", error });
  }
};


// Update current value
const updateCurrentValue = async (req, res) => {
  try {
    const { currValue } = req.body;
     const updated = await Share.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { currValue },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Share not found or unauthorized" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating current value", error });
  }
};

// Mark as sold
const markAsSold = async (req, res) => {
  try {
    const { endDate,soldPrice } = req.body;
    // const share = await Share.findById(req.params.id);
const share = await Share.findOne({ _id: req.params.id, userId: req.user._id });
    if (!share) return res.status(404).json({ message: "Share not found or unauthorized" });

    // Use current value as sold price
     const priceToSet = soldPrice ?? share.currValue ?? 0;
    // const profitOrLoss = (soldPrice - share.amount) * share.numberOfShares;

    const sold = await Share.findByIdAndUpdate(
      req.params.id,
      { status: "sold", endDate, soldPrice: priceToSet },
      { new: true }
    );

    res.json(sold);
  } catch (error) {
    res.status(500).json({ message: "Error marking as sold", error });
  }
};


const getSoldShares = async (req, res) => {
  try {
    const soldShares = await Share.find({userId: req.user._id, status: "sold" }).sort({ endDate: -1 });
    res.json(soldShares);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sold shares", error });
  }
};
// Delete share
const deleteShare = async (req, res) => {
  try {
    const deleted = await Share.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
     if (!deleted) return res.status(404).json({ message: "Share not found or unauthorized" });
    // await Share.findByIdAndDelete(req.params.id);
    res.json({ message: "Share deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting share", error });
  }
};

// Fetch live prices for all active shares
const fetchLivePrices = async (req, res) => {
  try {
    const shares = await Share.find({ userId: req.user._id});
    const results = await Promise.all(
      shares.map(async (s) => {
        try {
          if (!s.symbol) return { ...s.toObject(), price: null };
          const quote = await yf.quote(s.symbol);
       
          return {
            ...s.toObject(),
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            percentChange: quote.regularMarketChangePercent,
          };
        } catch (err) {
          return { ...s.toObject(), price: null };
        }
      })
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Error fetching live prices", error });
  }
};




module.exports = {
  getShares,
  addShare,
  updateCurrentValue,
  markAsSold,
  deleteShare,
  fetchLivePrices,
  getSoldShares,
};
