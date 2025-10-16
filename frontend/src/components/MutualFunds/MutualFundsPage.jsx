import { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import Sidebar from "../Sidebar";
import AddMutualFundModal from "./AddMutualFundModal";
import MutualFundOverview from "./MutualFundOverview";
import MutualFundTable from "./MutualFundTable";

const MutualFundsPage = () => {
  const [mutualFunds, setMutualFunds] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch all mutual funds
  const fetchMutualFunds = async () => {
    try {
      const res = await axios.get("/api/mutualfunds");
      setMutualFunds(res.data);
    } catch (error) {
      console.error("Error fetching mutual funds:", error);
    }
  };

  useEffect(() => {
    fetchMutualFunds();
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
            const investment = {
              date: row.date || new Date(),
              amount: Number(row.amount) || 0,
              nav: Number(row.nav) || 0,
            };

            const fundName = row.name || "Unknown Fund";
            const frequency = row.frequency || "monthly";

            const existingFund = mutualFunds.find(
              (mf) => mf.name.toLowerCase() === fundName.toLowerCase()
            );

            if (existingFund) {
              // Append SIP investment
              existingFund.investments.push({
                ...investment,
                units: investment.amount / investment.nav,
              });
              await axios.put(`/api/mutualfunds/${existingFund._id}`, {
                investments: existingFund.investments,
              });
            } else {
              // Create new fund
              const newFund = {
                name: fundName,
                frequency,
                investments: [{ ...investment, units: investment.amount / investment.nav }],
                status: "active",
              };
              await axios.post("/api/mutualfunds", newFund);
            }
          } catch (error) {
            console.error("Error adding fund from CSV:", error);
          }
        }
        setRefresh((prev) => !prev);
      },
    });
  };

  // ✅ Fetch Live NAVs from AMC/AMFI API
  const handleFetchLiveNAVs = async () => {
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.get("/api/mutualfunds/fetch-navs/update");
      setMessage(`✅ ${res.data.message}`);
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error fetching live NAVs:", error);
      setMessage("❌ Failed to update NAVs. Please try again later.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  // ✅ Filter funds by date range
  const filteredFunds = mutualFunds.filter((mf) => {
    const firstDate = mf.investments?.[0]?.date || mf.startDate;
    const mfDate = new Date(firstDate);
    const start = filterStartDate ? new Date(filterStartDate) : null;
    const end = filterEndDate ? new Date(filterEndDate) : null;

    if (start && end) return mfDate >= start && mfDate <= end;
    if (start) return mfDate >= start;
    if (end) return mfDate <= end;
    return true;
  });

  // ✅ Totals
  const totalInvested = filteredFunds.reduce(
    (sum, mf) => sum + mf.investments.reduce((s, inv) => s + inv.amount, 0),
    0
  );

  const totalUnits = filteredFunds.reduce(
    (sum, mf) => sum + mf.investments.reduce((s, inv) => s + inv.units, 0),
    0
  );

  const totalCurrentValue = filteredFunds.reduce((sum, mf) => {
    const currNAV = mf.currNAV || mf.investments[mf.investments.length - 1].nav;
    const totalUnits = mf.investments.reduce((s, inv) => s + inv.units, 0);
    return sum + totalUnits * currNAV;
  }, 0);

  const totalProfitLoss = totalCurrentValue - totalInvested;
  const entryCount = filteredFunds.length;

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
          <h2 className="text-2xl font-semibold">Mutual Funds Overview</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleFetchLiveNAVs}
              disabled={loading}
              className={`${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-4 py-2 rounded transition`}
            >
              {loading ? "Updating..." : "Refresh NAVs"}
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

            <AddMutualFundModal setRefresh={setRefresh} />
          </div>
        </div>

        {/* ✅ Success / Error Message */}
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

        {/* Overview Cards */}
        <MutualFundOverview
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
          <h3 className="text-xl font-semibold mb-4">Mutual Fund Details</h3>
          <div className="min-w-max">
            <MutualFundTable mutualFunds={filteredFunds} setRefresh={setRefresh} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MutualFundsPage;
