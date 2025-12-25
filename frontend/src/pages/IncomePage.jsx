import { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import Sidebar from "../components/Sidebar";
import IncomeOverview from "../components/Income/IncomeOverview";
import IncomeList from "../components/Income/IncomeList";
import AddIncomeModal from "../components/Income/AddIncomeModal";
import IncomeChart from "../components/Income/IncomeChart";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaCalendarAlt, FaUpload } from "react-icons/fa";
import { toast } from "react-hot-toast";

const IncomePage = () => {
  const [incomes, setIncomes] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const fetchIncomes = async () => {
    try {
      const res = await axios.get("/api/income", {
        params: selectedMonth ? { month: selectedMonth } : {},
      });
      setIncomes(res.data);
    } catch (error) {
      console.error("Error fetching incomes:", error);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [refresh, selectedMonth]);

  // CSV Upload for bulk incomes
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        let successCount = 0;
        for (const row of rows) {
          try {
            const payload = {
              category: row.category || row.Category || "Income",
              amount: Number(row.amount || row.Amount || 0),
              date:
                row.date ||
                row.Date ||
                new Date().toISOString().slice(0, 10),
              notes: row.notes || row.description || row.Notes || "",
            };

            if (!payload.amount || isNaN(payload.amount)) continue;

            await axios.post("/api/income", payload);
            successCount++;
          } catch (err) {
            console.error("Error adding income from CSV:", err);
          }
        }

        if (successCount > 0) {
          toast.success(`Imported ${successCount} income record(s) from CSV`);
          setRefresh((prev) => !prev);
        } else {
          toast.error("No valid income rows found in CSV");
        }
        event.target.value = "";
      },
      error: (error) => {
        console.error("CSV parse error:", error);
        toast.error("Failed to parse CSV file");
      },
    });
  };

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalSources = new Set(incomes.map((i) => i.category?.trim().toLowerCase())).size;
  const entryCount = incomes.length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Income Overview
              </h1>
              <p className="text-gray-600 mt-1">Track and manage your income sources</p>
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

              {/* Add Income */}
              <AddIncomeModal setRefresh={setRefresh} />
            </div>
          </div>

          {/* Month Filter */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <FaCalendarAlt className="text-emerald-600 text-xl" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Month (Optional)
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full max-w-xs px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                />
                {selectedMonth && (
                  <button
                    onClick={() => setSelectedMonth("")}
                    className="ml-3 text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-emerald-600 uppercase text-xs font-bold tracking-wide mb-1">
                  Total Income
                </p>
                <p className="text-3xl font-bold text-emerald-700">
                  ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-blue-600 uppercase text-xs font-bold tracking-wide mb-1">
                  Income Sources
                </p>
                <p className="text-3xl font-bold text-blue-700">{totalSources}</p>
                <p className="text-sm text-blue-600 mt-1">Unique categories</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-purple-600 uppercase text-xs font-bold tracking-wide mb-1">
                  Total Entries
                </p>
                <p className="text-3xl font-bold text-purple-700">{entryCount}</p>
                <p className="text-sm text-purple-600 mt-1">Records logged</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>
        </div>

                {/* Income List */}
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">  
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Income Sources</h2>
                    <IncomeList incomes={incomes} setRefresh={setRefresh} />
                </div>
      </div>
    </div>
  );
};

export default IncomePage;

