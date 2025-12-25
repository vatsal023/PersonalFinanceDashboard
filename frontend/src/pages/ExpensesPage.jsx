import { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import Sidebar from "../components/Sidebar";
import ExpenseOverview from "../components/Expenses/ExpenseOverview";
import ExpenseList from "../components/Expenses/ExpenseList";
import AddExpenseModal from "../components/Expenses/AddExpenseModal";
import { categories } from "../data/categories";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaCalendarAlt, FaFilter, FaTimes, FaUpload } from "react-icons/fa";
import { toast } from "react-hot-toast";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("Expenses");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [categoryTotals, setCategoryTotals] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const triggerRefresh = () => setRefresh(!refresh);

  const fetchExpenses = async (month) => {
    try {
      const res = await axios.get(`/api/expenses?month=${month}`, { withCredentials: true });
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  };

  const fetchCategoryTotals = async (month) => {
    try {
      const res = await axios.get(`/api/expenses/overview?month=${month}`, { withCredentials: true });
      setCategoryTotals(res.data.perCategory || {});
    } catch (err) {
      console.error("Failed to fetch category totals:", err);
    }
  };

  useEffect(() => {
    if (selectedPage === "Expenses") {
      fetchExpenses(selectedMonth);
      fetchCategoryTotals(selectedMonth);
    }
  }, [refresh, selectedMonth, selectedPage]);

  // CSV Upload for bulk expenses
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
              category:
                row.category ||
                row.Category ||
                categories[0],
              amount: Number(row.amount || row.Amount || 0),
              description: row.description || row.notes || row.Description || "",
              date:
                row.date ||
                row.Date ||
                new Date().toISOString().slice(0, 10),
            };

            // Skip invalid / empty rows
            if (!payload.amount || isNaN(payload.amount)) continue;

            await axios.post(
              "/api/expenses",
              payload,
              { withCredentials: true }
            );
            successCount++;
          } catch (err) {
            console.error("Error adding expense from CSV:", err);
          }
        }
        if (successCount > 0) {
          toast.success(`Imported ${successCount} expense(s) from CSV`);
          triggerRefresh();
        } else {
          toast.error("No valid expense rows found in CSV");
        }
        // reset input
        event.target.value = "";
      },
      error: (error) => {
        console.error("CSV parse error:", error);
        toast.error("Failed to parse CSV file");
      },
    });
  };

  const totalSpent = Object.values(categoryTotals).reduce((acc, amt) => acc + amt, 0);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Sidebar selectedPage={selectedPage} setSelectedPage={setSelectedPage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 pt-6 px-6 transition-all duration-300 ${
        isSidebarOpen ? "ml-64" : "ml-16"
      }`}>
        {selectedPage === "Expenses" && (
          <>
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Expenses Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">Track and manage your expenses efficiently</p>
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

                  {/* Add Expense */}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <FaPlus />
                    Add Expense
                  </button>
                </div>
              </div>

              {/* Monthly Filter */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg flex items-center gap-4">
                <FaCalendarAlt className="text-blue-600 text-xl" />
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Month
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full max-w-xs px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-gray-900" 
                  />
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-red-600 uppercase text-xs font-bold tracking-wide mb-1">
                      Total Spent
                    </p>
                    <p className="text-3xl font-bold text-red-700">
                      ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <span className="text-2xl">💸</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-blue-600 uppercase text-xs font-bold tracking-wide mb-1">
                      Total Categories
                    </p>
                    <p className="text-3xl font-bold text-blue-700">{categories.length}</p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <span className="text-2xl">📁</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-emerald-600 uppercase text-xs font-bold tracking-wide mb-1">
                      Expenses Count
                    </p>
                    <p className="text-3xl font-bold text-emerald-700">
                      {Object.keys(categoryTotals).length}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Lists Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Overview Chart */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                <ExpenseOverview expenses={expenses} />
              </div>

              {/* Expense Breakdown by Category */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Category Breakdown</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(categoryTotals).length > 0 ? (
                    Object.entries(categoryTotals)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => {
                        const percentage = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0;
                        return (
                          <div key={category} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-semibold text-gray-900">{category}</p>
                              <p className="font-bold text-red-600 text-lg">
                                ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{percentage}% of total</p>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-gray-500 text-center py-8">No expenses found for this month</p>
                  )}
                </div>
              </div>
            </div>

            {/* Expense List */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Expenses</h2>
              <ExpenseList expenses={expenses} />
            </div>

            {/* Add Expense Modal */}
            {isModalOpen && (
              <AddExpenseModal
                selectedMonth={selectedMonth}
                onClose={() => setIsModalOpen(false)}
                onExpenseAdded={() => {
                  triggerRefresh();
                  setIsModalOpen(false);
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ExpensesPage;

