import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Papa from "papaparse";
import AddShareModal from "../components/Shares/AddShareModal";
import SharesOverview from "../components/Shares/SharesOverview";
import SharesTable from "../components/Shares/SharesTable";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaFilter, FaTimes } from "react-icons/fa";

const SharesPage = () => {
  const [shares, setShares] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const fetchShares = async () => {
    try {
      const res = await axios.get("/api/shares");
      setShares(res.data);
    } catch (error) {
      console.error("Error fetching shares:", error);
    }
  };

  const fetchLivePrices = async () => {
    try {
      const res = await axios.get("/api/shares/live");
      setShares(res.data);
    } catch (err) {
      console.error("Error fetching live prices:", err);
    }
  };

  useEffect(() => {
    fetchShares();
  }, [refresh]);

  useEffect(() => {
    const interval = setInterval(fetchLivePrices, 30000);
    return () => clearInterval(interval);
  }, []);

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
            const shareData = {
              companyName: row.companyName || row.name || "",
              exchange: row.exchange || "",
              startDate: row.startDate || row.date || new Date(),
              amount: Number(row.amount) || 0,
              numberOfShares: Number(row.numberOfShares || row.quantity) || 0,
            };
            await axios.post("/api/shares", shareData);
          } catch (error) {
            console.error("Error adding share from CSV:", error);
          }
        }
        setRefresh((prev) => !prev);
      },
    });
  };

  const filteredShares = shares.filter((s) => {
    const sDate = new Date(s.startDate);
    const start = filterStartDate ? new Date(filterStartDate) : null;
    const end = filterEndDate ? new Date(filterEndDate) : null;

    if (start && end) return sDate >= start && sDate <= end;
    if (start) return sDate >= start;
    if (end) return sDate <= end;
    return true;
  });

  const activeShares = filteredShares.filter((s) => s.status === "active");
  const soldShares = filteredShares.filter((s) => s.status === "sold");

  const totalInvested = activeShares.reduce(
    (sum, s) => sum + s.amount * s.numberOfShares,
    0
  );
  const totalCurrentValue = activeShares.reduce(
    (sum, s) => sum + (s.price ?? s.currValue ?? 0) * s.numberOfShares,
    0
  );

  const totalProfitLoss = activeShares.reduce(
    (sum, s) => sum + ((s.price ?? s.currValue ?? 0) - s.amount) * s.numberOfShares,
    0
  );

  const entryCount = activeShares.length;

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
                Shares Portfolio
              </h1>
              <p className="text-gray-600 mt-1">
                Track and manage your stock investments with live prices
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* CSV Upload */}
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

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white text-gray-700 px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 hover:bg-gray-50 transition-all font-semibold flex items-center gap-2"
              >
                <FaFilter />
                Filters
              </button>

              {/* Add Share Modal */}
              <AddShareModal setRefresh={setRefresh} />
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
        <SharesOverview
          totalInvested={totalInvested.toFixed(2)}
          totalCurrentValue={totalCurrentValue.toFixed(2)}
          totalProfitLoss={totalProfitLoss.toFixed(2)}
          entryCount={entryCount}
        />

        {/* Tables */}
        <SharesTable shares={filteredShares} setRefresh={setRefresh} />
      </div>
    </div>
  );
};

export default SharesPage;

