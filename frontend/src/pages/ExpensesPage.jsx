import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ExpenseOverview from "../components/Expenses/ExpenseOverview";
import ExpenseList from "../components/Expenses/ExpenseList";
import AddExpenseModal from "../components/Expenses/AddExpenseModal";
import { categories } from "../data/categories";
import { useAuth } from "../context/authContext"
import { useNavigate } from "react-router-dom";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("Expenses");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [categoryTotals, setCategoryTotals] = useState({});

   const { isAuthenticated, checkAuth } = useAuth();
           const navigate = useNavigate();
  
    useEffect(() => {
          
            // checkAuth();
            if (!isAuthenticated) {
                navigate("/");
            }
        }, [])

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

  // const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalSpent = Object.values(categoryTotals).reduce((acc, amt) => acc + amt, 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar selectedPage={selectedPage} setSelectedPage={setSelectedPage} />

      {/* Main Content */}
      <main className="flex-1 pt-16 px-6 ml-64 transition-all duration-300">
        {selectedPage === "Expenses" && (
          <>
            {/* Header + Add Button */}
            <header className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Expenses Dashboard
              </h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition font-semibold"
              >
                + Add Expense
              </button>
            </header>

            {/* Monthly Filter */}
            <div className="mb-6 flex items-center gap-4">
              <label className="font-medium text-gray-700">Select Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Top Summary Cards */}
            <div className="grid md:grid-cols-3 gap-5 mb-6">
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
                <p className="text-gray-400 uppercase text-sm font-medium">Total Spent</p>
                <p className="text-2xl md:text-3xl font-bold text-red-600 mt-2">
                  ₹{totalSpent}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
                <p className="text-gray-400 uppercase text-sm font-medium">Total Categories</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">
                  {categories.length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
                <p className="text-gray-400 uppercase text-sm font-medium">Expenses Count</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600 mt-2">
                  {/* {expenses.length} */}
                                    {Object.keys(categoryTotals).length}

                </p>
              </div>
            </div>

            {/* Middle Section: Overview */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition mb-6">
              <ExpenseOverview expenses={expenses} />
            </div>

            {/* Bottom Section: Expense List */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
              <ExpenseList expenses={expenses} />
            </div>

             {/* Bottom Section: Expense Breakdown by Category */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition">
              <h2 className="text-xl font-bold mb-4">Expense Breakdown</h2>
              <div className="divide-y divide-gray-200">
                {Object.entries(categoryTotals).map(([category, amount]) => (
                  <div key={category} className="flex justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-700">{category}</p>
                    </div>
                    <div>
                      <p className="font-bold text-red-600">₹{amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Expense Modal */}
            {isModalOpen && (
              <AddExpenseModal
               selectedMonth={selectedMonth} // pass selected month
                onClose={() => setIsModalOpen(false)}
                onExpenseAdded={() => {
                  triggerRefresh();
                  setIsModalOpen(false);
                }}
              />
            )}
          </>
        )}

        {selectedPage === "Dashboard" && <p className="text-gray-700">Dashboard content here</p>}
        {selectedPage === "Analytics" && <p className="text-gray-700">Analytics content here</p>}
      </main>
    </div>
  );
};

export default ExpensesPage;




