import { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import Sidebar from "../components/Sidebar";
import AddBullionModal from "../components/Bullion/AddBullionModal";
import BullionTable from "../components/Bullion/BullionTable";
import BullionOverview from "../components/Bullion/BullionOverview";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaFilter, FaSync, FaTimes } from "react-icons/fa";

const BullionPage = () => {
  const [bullions, setBullions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {                                                           
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchBullions();
  }, [refresh]);

  // Fetch all bullions
  const fetchBullions = async () => {
    try {
      const res = await axios.get("/api/bullions");
      setBullions(res.data);
    } catch (err) {
      console.error("Error fetching bullions:", err);
    }
  };

  // CSV Upload
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        for (const row of rows) {
          try {
            const bullionName = row.name || "Unknown";
            const purity = Number(row.purity) || 24;
            const quantity = Number(row.quantity) || 0;
            const rate = Number(row.rate) || 0;
            const date = row.date || new Date();
            const investment = {
              date,
              quantity,
              purity,
              rate,
              amountInvested: quantity * rate * (purity / 24),
            };
            // Check if exists by name & purity
            const existing = bullions.find((b) => b.status === "active" && b.name?.toLowerCase() === bullionName.toLowerCase() && b.investments[0]?.purity === purity);
            if (existing) {
              existing.investments.push(investment);
              await axios.put(`/api/bullions/${existing._id}`, { investments: existing.investments });
            } else {
              await axios.post("/api/bullions", { name: bullionName, investments: [investment], status: "active" });
            }
          } catch (error) {
            console.error("Error adding bullion from CSV:", error);
          }
        }
        setRefresh((prev) => !prev);
      },
    });
  };

  // Fetch Live Prices
  const handleFetchLiveRates = async () => {
    try {
      setLoading(true);
      setMessage("");
      await axios.get("/api/bullions/live/rates");
      setMessage("✅ Prices updated successfully");
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error updating bullion prices:", error);
      setMessage("❌ Failed to update prices.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage("") , 4000);
    }
  };

  // Filters
  const filteredBullions = bullions.filter((b) => {
    const firstDate = b.investments?.[0]?.date;
    const bullionDate = new Date(firstDate);
    const start = filterStartDate ? new Date(filterStartDate) : null;
    const end = filterEndDate ? new Date(filterEndDate) : null;
    if (start && end) return bullionDate >= start && bullionDate <= end;
    if (start) return bullionDate >= start;
    if (end) return bullionDate <= end;
    return true;
  });

  const activeBullions = filteredBullions.filter(b => b.status === "active");

  // Overview calculations
  const totalInvested = activeBullions.reduce(
    (sum, b) => sum + b.investments.reduce((s, inv) => s + (inv.amountInvested || 0), 0), 0);
  const totalCurrentValue = activeBullions.reduce((sum, b) => {
    const currentRate = b.currentRate || b.rate || 0;
    const totalQty = b.investments.reduce((s, inv) => s + inv.quantity, 0);
    const purity = b.investments?.[0]?.purity || 24;
    return sum + totalQty * currentRate * (purity / 24);
  }, 0);

  const totalProfitLoss = totalCurrentValue - totalInvested;
  const entryCount = activeBullions.length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50/30 to-orange-50/20">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div
        className={`flex-1 p-6 transition-all duration-300 relative ${isSidebarOpen ? "ml-64" : "ml-16"}`}
        style={{ minWidth: 0 }}
      >
        {/* Header  */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <FaSync className="text-yellow-500 text-xl" />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bullion Portfolio</h1>
          </div>
          <p className="text-gray-600 mt-1 mb-3">Track and manage your bullion (gold/silver/metal) investments</p>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={handleFetchLiveRates}
              disabled={loading}
              className={`${loading ? "bg-blue-400 cursor-not-allowed" : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-orange-400"} text-white px-5 py-2.5 rounded-xl shadow-lg transition-all font-semibold flex items-center gap-2 transform hover:-translate-y-0.5`}
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              {loading ? "Updating..." : "Refresh Bullion Prices"}
            </button>
            <label className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all cursor-pointer font-semibold flex items-center gap-2 transform hover:-translate-y-0.5">
              <FaUpload />
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="bg-white text-gray-700 px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 hover:bg-gray-50 transition-all font-semibold flex items-center gap-2"
            >
              <FaFilter />
              Filters
            </button>
            <AddBullionModal setRefresh={setRefresh} />
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg mb-6 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filter by Date Range</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none bg-white"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none bg-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterStartDate("");
                      setFilterEndDate("");
                    }}
                    className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-all font-semibold"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toast Message */}
        {message && (
          <div className={`mb-4 text-sm px-4 py-2 rounded ${message.includes("✅") ? "bg-green-100 text-green-700 border border-green-400" : "bg-red-100 text-red-700 border border-red-400"}`}>
            {message}
          </div>
        )}

        {/* Overview Cards */}
        <BullionOverview
          totalInvested={totalInvested.toFixed(2)}
          totalCurrentValue={totalCurrentValue.toFixed(2)}
          totalProfitLoss={totalProfitLoss.toFixed(2)}
          entryCount={entryCount}
        />

        {/* Table Section */}
        <div className="mt-6 text-left bg-white p-6 rounded-xl shadow hover:shadow-xl transition overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4">Bullion Details</h3>
          <div className="min-w-max">
            <BullionTable bullions={filteredBullions} setRefresh={setRefresh} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BullionPage;
