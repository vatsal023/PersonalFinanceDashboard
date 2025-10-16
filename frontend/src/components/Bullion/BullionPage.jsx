

import { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import Sidebar from "../Sidebar";
import AddBullionModal from "./AddBullionModal";
import BullionTable from "./BullionTable";
import BullionOverview from "./BullionOverview"; // ➕ Create this like MutualFundOverview

const BullionPage = () => {
  const [bullions, setBullions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch all bullions
  const fetchBullions = async () => {
    try {
      const res = await axios.get("/api/bullions");
      setBullions(res.data);
    } catch (err) {
      console.error("Error fetching bullions:", err);
    }
  };

  useEffect(() => {
    fetchBullions();
  }, [refresh]);

  // ✅ Handle CSV Upload
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

            // Check if bullion already exists
            const existing = bullions.find(
              (b) => b.name.toLowerCase() === bullionName.toLowerCase()
              && b.investments[0].purity === Number(form.purity)  // check purity
            );

            if (existing) {
              existing.investments.push(investment);
              await axios.put(`/api/bullions/${existing._id}`, {
                investments: existing.investments,
              });
            } else {
              await axios.post("/api/bullions", {
                name: bullionName,
                investments: [investment],
                 status: "active",
              });
            }
          } catch (error) {
            console.error("Error adding bullion from CSV:", error);
          }
        }
        setRefresh((prev) => !prev);
      },
    });
  };

  // ✅ Fetch Live Prices
  const handleFetchLiveRates = async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.get("/api/bullions/live/rates");
      setMessage("✅ Prices updated successfully");
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error updating bullion prices:", error);
      setMessage("❌ Failed to update prices.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  // ✅ Filter bullions by date range
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

  // ✅ Overview Calculations
  const totalInvested = filteredBullions.reduce(
    (sum, b) =>
      sum +
      b.investments.reduce((s, inv) => s + (inv.amountInvested || 0), 0),
    0
  );

  const totalCurrentValue = filteredBullions.reduce((sum, b) => {
    const currentRate = b.currentRate || b.rate || 0;
    const totalQty = b.investments.reduce((s, inv) => s + inv.quantity, 0);
    const purity = b.investments?.[0]?.purity || 24;
    return sum + totalQty * currentRate * (purity / 24);
  }, 0);

  const totalProfitLoss = totalCurrentValue - totalInvested;
  const entryCount = filteredBullions.length;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div
        className={`flex-1 p-6 transition-all duration-300 relative ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
        style={{ minWidth: 0 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Bullion Overview</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleFetchLiveRates}
              disabled={loading}
              className={`${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-4 py-2 rounded transition`}
            >
              {loading ? "Updating..." : "Refresh Prices"}
            </button>

            <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700">
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>

            <AddBullionModal setRefresh={setRefresh} />
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 text-sm px-4 py-2 rounded ${
              message.includes("✅")
                ? "bg-green-100 text-green-700 border border-green-400"
                : "bg-red-100 text-red-700 border border-red-400"
            }`}
          >
            {message}
          </div>
        )}

        {/* Overview Section */}
        <BullionOverview
          totalInvested={totalInvested.toFixed(2)}
          totalCurrentValue={totalCurrentValue.toFixed(2)}
          totalProfitLoss={totalProfitLoss.toFixed(2)}
          entryCount={entryCount}
        />

        {/* Filter Section */}
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2">
            Start Date:
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="border p-2 rounded"
            />
          </label>
          <label className="flex items-center gap-2">
            End Date:
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="border p-2 rounded"
            />
          </label>
          <button
            onClick={() => {
              setFilterStartDate("");
              setFilterEndDate("");
            }}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            Clear Filter
          </button>
        </div>

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

