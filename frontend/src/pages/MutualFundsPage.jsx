import { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import Sidebar from "../components/Sidebar";
import AddMutualFundModal from "../components/MutualFunds/AddMutualFundModal";
import MutualFundOverview from "../components/MutualFunds/MutualFundOverview";
import MutualFundTable from "../components/MutualFunds/MutualFundTable";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaSync, FaFilter, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";

const MutualFundsPage = () => {
  const [mutualFunds, setMutualFunds] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const fetchMutualFunds = async () => {
    try {
      const res = await axios.get("/api/mutualfunds");
      console.log(res.data);
      setMutualFunds(res.data);
    } catch (error) {
      console.error("Error fetching mutual funds:", error);
    }
  };

  useEffect(() => {
    fetchMutualFunds();
  }, [refresh]);

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
                &&
    mf.status === "active"
            );

            if (existingFund) {
              existingFund.investments.push({
                ...investment,
                units: investment.amount / investment.nav,
              });
              await axios.put(`/api/mutualfunds/${existingFund._id}`, {
                investments: existingFund.investments,
              });
            } else {
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
        toast.success("CSV uploaded successfully!");
        setRefresh((prev) => !prev);
      },
    });
  };

  const handleFetchLiveNAVs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/mutualfunds/fetch-navs/update");
      toast.success(res.data.message || "NAVs updated successfully!");
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error fetching live NAVs:", error);
      toast.error("Failed to update NAVs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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

  console.log("Filtered Funds:", filteredFunds);
   
  const activeFunds = filteredFunds.filter(
  (mf) => mf.status === "active"
);
  
  const totalInvested = activeFunds.reduce(
    (sum, mf) => sum + mf.investments.reduce((s, inv) => s + inv.amount, 0),
    0
  );

  const totalCurrentValue = activeFunds.reduce((sum, mf) => {
    const currNAV = mf.currNAV || mf.investments[mf.investments.length - 1]?.nav || 0;
    const totalUnits = mf.investments.reduce((s, inv) => s + inv.units, 0);
    return sum + totalUnits * currNAV;
  }, 0);
  
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const entryCount = activeFunds.length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div
        className={`flex-1 p-6 transition-all duration-300 relative ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
        style={{ minWidth: 0 }}
      >
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Mutual Funds Portfolio
              </h1>
              <p className="text-gray-600 mt-1">Track and manage your mutual fund investments</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleFetchLiveNAVs}
                disabled={loading}
                className={`${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                } text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2 transform hover:-translate-y-0.5`}
              >
                <FaSync className={loading ? "animate-spin" : ""} />
                {loading ? "Updating..." : "Refresh NAVs"}
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
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white text-gray-700 px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 hover:bg-gray-50 transition-all font-semibold flex items-center gap-2"
              >
                <FaFilter />
                Filters
              </button>

              <AddMutualFundModal setRefresh={setRefresh} />
            </div>
          </div>

          {/* Filter Section */}
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
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

        {/* Overview Cards */}
        <MutualFundOverview
          totalInvested={totalInvested.toFixed(2)}
          totalCurrentValue={totalCurrentValue.toFixed(2)}
          totalProfitLoss={totalProfitLoss.toFixed(2)}
          entryCount={entryCount}
        />

        {/* Table Section */}
        <div className="mt-6">
          <MutualFundTable mutualFunds={filteredFunds} setRefresh={setRefresh} />
        </div>
      </div>
    </div>
  );
};

export default MutualFundsPage;

