import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaWallet, FaChartLine, FaMoneyBill, FaPercent, FaBalanceScale } from "react-icons/fa";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
const COLORS = ["#34D399", "#FB7185", "#6366F1", "#F59E42"];

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, totalInvestment: 0, totalProfit: 0, roi: 0, balance: 0, });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!isAuthenticated) { navigate("/"); } }, [isAuthenticated, navigate]);
 
  useEffect(() => { // identical fetch logic
    const fetchDashboardData = async () => {
      try {
        const [incomeRes, expenseRes, sharesRes, mfRes, bullionRes] = await Promise.all([
          axios.get("/api/income"), axios.get("/api/expenses"), axios.get("/api/shares/live"), axios.get("/api/mutualfunds"), axios.get("/api/bullions")
        ]);
        const incomes = incomeRes.data || [], expenses = expenseRes.data || [], shares = sharesRes.data || [], mutualFunds = mfRes.data || [], bullions = bullionRes.data || [];
        console.log("Fetched dashboard data:", { incomes, expenses, shares, mutualFunds, bullions });
        const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const activeShares = shares.filter((s) => s.status === "active");
        const shareInvested = activeShares.reduce((sum, s) => sum + (s.amount) * (s.numberOfShares), 0);
        const shareCurrValue = activeShares.reduce((sum, s) => sum + (s.price ?? s.currValue ?? 0) * s.numberOfShares, 0);
        const shareProfit = shareCurrValue - shareInvested;
        const activeFunds = mutualFunds.filter((f) => f.status === "active");
        const mfInvested = activeFunds.reduce((sum, f) => sum + f.investments.reduce((invSum, inv) => invSum + (inv.amount || 0), 0), 0);
        const mfCurrValue = activeFunds.reduce((sum, f) => { const units = f.investments.reduce((unitSum, inv) => unitSum + (inv.units || 0), 0); const currNAV = Number(f.currNAV || 0); return sum + currNAV * units; }, 0);
        const mfProfit = mfCurrValue - mfInvested;
        const activeBullions = bullions.filter((b) => b.status === "active");
        const bullionTotals = activeBullions.reduce((acc, b) => 
          { const currentRate = Number(b.currentRate ?? b.rate) * ((b.investments?.[0]?.purity || 24) / 24); 
            const totalQuantity = b.investments?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0; 
            const totalInvested = b.investments?.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0) || 0;
             const currentValue = totalQuantity * currentRate; const profitLoss = currentValue - totalInvested; 
             acc.invested += totalInvested; acc.currentValue += currentValue; acc.profitLoss += profitLoss; return acc; },
              { invested: 0, currentValue: 0, profitLoss: 0 });
        const bullionInvested = bullionTotals.invested, bullionCurrValue = bullionTotals.currentValue, bullionProfit = bullionTotals.profitLoss;
        const totalInvestment = shareInvested + mfInvested + bullionInvested;
        const totalProfit = shareProfit + mfProfit + bullionProfit;
        const roi = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : 0;
        const balance = totalIncome - (totalExpenses + totalInvestment);
        setSummary({ totalIncome, totalExpenses, totalInvestment, totalProfit, roi, balance });
        // recent: same as before
        const recentIncome = incomes.slice(0,5).map(i => ({ type: "Income", name: i.category || "Income", date: i.date, amount: i.amount }));

        const recentExpense = expenses.slice(0,5).map(e => ({ type: "Expense", name: e.category || "Expense", date: e.date, amount: e.amount }));
   
  const recentShares = shares.filter(s => s.startDate).sort((a, b) => new Date(b.startDate) - new Date(a.startDate)).slice(0, 5)
  .map(s => ({
    type: "Shares",
    name: s.companyName,
    date: s.startDate, 
    amount: s.amount * s.numberOfShares,
  }));

        const recentMFs = mutualFunds.slice(0,5).map(m => ({ type: "Mutual Fund", name: m.name, date: m.investments.at(-1)?.date, amount: m.investments.at(-1)?.amount || 0 }));
      
        const recentBullions = bullions.slice(0,5).map(b => ({ type: "Bullion", name: b.name, date: b.investments.at(-1)?.date, amount: b.investments.at(-1)?.amountInvested || 0 }));
       
        const merged = [...recentIncome, ...recentExpense, ...recentShares, ...recentMFs, ...recentBullions];
        const sorted = merged.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivities(sorted.slice(0, 10));
      } catch (error) { console.error("Error fetching dashboard data:", error); }
    };
    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const pieData = [
    { name: "Income", value: summary.totalIncome },
    { name: "Expenses", value: summary.totalExpenses },
    { name: "Investments", value: summary.totalInvestment },
    { name: "Balance", value: summary.balance < 0 ? 0 : summary.balance },
  ];
  const pieColors = summary.balance < 0 ? [...COLORS.slice(0, 3), "#f44336"] : COLORS;
  const iconMap = {
    Income: <FaMoneyBill className="h-6 w-6 text-green-400" />,
    Expenses: <FaWallet className="h-6 w-6 text-red-400" />,
    Investments: <FaChartLine className="h-6 w-6 text-indigo-500" />,
    ROI: <FaPercent className="h-6 w-6 text-orange-400" />,
    Balance: <FaBalanceScale className="h-6 w-6 text-blue-400" />,
  };
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-100/30">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`flex-1 p-7 transition-all duration-300 relative ${isSidebarOpen ? "ml-64" : "ml-16"}`} style={{ minWidth: 0 }}>
        {/* HEADER */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 gap-y-3 animate-fade-in-60">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">Overview</h1>
            <span className="block text-lg font-medium text-gray-500">My Personal Finance Dashboard</span>
          </div>
        </div>
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8 animate-fade-in-80">
          {[
            { title: "Income", value: summary.totalIncome, color: "bg-gradient-to-r from-green-100 to-green-200" },
            { title: "Expenses", value: summary.totalExpenses, color: "bg-gradient-to-r from-red-100 to-orange-100" },
            { title: "Investments", value: summary.totalInvestment, color: "bg-gradient-to-r from-indigo-100 to-indigo-200" },
            { title: "ROI", value: summary.roi+"%", color: "bg-gradient-to-r from-orange-100 to-yellow-100" },
            { title: "Balance", value: summary.balance, color: "bg-gradient-to-r from-blue-100 to-purple-100" },
          ].map(card => (
            <div className={`rounded-2xl shadow-xl flex flex-col items-center px-5 py-7 ${card.color}`} key={card.title}>
              <div className="mb-2">{iconMap[card.title]}</div>
              <div className="text-2xl font-bold text-gray-800">{card.title}</div>
              <div
                className={`text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-center ${
                  card.title === "Income" ? "text-green-700" : card.title === "Expenses" ? "text-red-600" : ""
                }`}
              >
                {card.title === "ROI"
                  ? card.value
                  : `₹${
                      typeof card.value === "number"
                        ? card.value.toLocaleString()
                        : card.value
                    }`}
              </div>
            </div>
          ))}
        </div>
        {/* CHART + ACTIVITY FEED (STACKED LIKE ORIGINAL DASHBOARD) */}
        <div className="space-y-7 animate-fade-in-90">
          {/* Financial Distribution Chart */}
          <div className="bg-white rounded-2xl p-7 shadow-xl flex flex-col animate-in zoom-in-95">
            <h2 className="text-xl font-extrabold mb-3 text-gray-900 tracking-wide">Financial Distribution</h2>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activities under the chart */}
          <div className="bg-gradient-to-br from-white to-blue-50/60 rounded-2xl p-7 shadow-xl animate-in zoom-in-95">
            <h2 className="text-xl font-extrabold mb-4 text-gray-900 tracking-wide">
              Recent Transactions / Activities
            </h2>
            <div className="divide-y divide-gray-100">
              {recentActivities.length === 0 && (
                <div className="text-gray-400 text-base py-10 text-center">No recent activity</div>
              )}
              {recentActivities.map((item, idx) => (
                <div key={idx} className="flex items-center py-4 gap-4 animate-fade-in-60">
                  <div className="flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 shadow h-11 w-11 flex items-center justify-center text-lg font-bold text-indigo-500">
                    {item.type?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{item.name}</div>
                    <div className="text-gray-500 text-sm">{item.type}</div>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <div
                      className={`font-bold text-lg ${
                        item.type === "Income"
                          ? "text-green-600"
                          : item.type === "Expense"
                          ? "text-red-500"
                          : item.type === "Share"
                          ? "text-indigo-600"
                          : item.type === "Mutual Fund"
                          ? "text-fuchsia-600"
                          : "text-yellow-600"
                      }`}
                    >
                      ₹{item.amount?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.date ? new Date(item.date).toLocaleDateString() : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
