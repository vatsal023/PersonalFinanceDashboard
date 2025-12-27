import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function Analytics() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [investmentSummary, setInvestmentSummary] = useState([]);
  const [totals, setTotals] = useState({ invested: 0, currentValue: 0, profitLoss: 0 });
  const [totalReturnPercent, setTotalReturnPercent] = useState("0");
  const [trendData, setTrendData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        const [sharesRes, mfRes, bullionRes] = await Promise.all([
          axios.get("/api/shares/live"),
          axios.get("/api/mutualfunds"),
          axios.get("/api/bullions")
        ]);

        const shares = sharesRes.data || [];
        const mutualFunds = mfRes.data || [];
        const bullions = bullionRes.data || [];

        // Shares
        const activeShares = shares.filter((s) => s.status === "active");
        const shareInvested = activeShares.reduce(
          (sum, s) => sum + s.amount * s.numberOfShares, 0
        );
        const shareCurrValue = activeShares.reduce(
          (sum, s) => sum + (s.price ?? s.currValue ?? 0) * s.numberOfShares, 0
        );
        const shareProfit = shareCurrValue - shareInvested;
        const shareReturn = shareInvested > 0 ? (shareProfit / shareInvested) * 100 : 0;

        // Mutual Funds
        const activeFunds = mutualFunds.filter((f) => f.status === "active");
        const mfInvested = activeFunds.reduce(
          (sum, f) => sum + f.investments.reduce((invSum, inv) => invSum + (inv.amount || 0), 0), 0
        );
        const mfCurrValue = activeFunds.reduce((sum, f) => {
          const units = f.investments.reduce((unitSum, inv) => unitSum + (inv.units || 0), 0);
          const currNAV = Number(f.currNAV || 0);
          return sum + currNAV * units;
        }, 0);
        const mfProfit = mfCurrValue - mfInvested;
        const mfReturn = mfInvested > 0 ? (mfProfit / mfInvested) * 100 : 0;

        // Bullion
        const activeBullions = bullions.filter((b) => b.status === "active");
        const bullionTotals = activeBullions.reduce(
          (acc, b) => {
            const currentRate = Number(b.currentRate ?? b.rate) * ((b.investments?.[0]?.purity || 24) / 24);
            const totalQuantity = b.investments?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0;
            const totalInvested = b.investments?.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0) || 0;
            const currentValue = totalQuantity * currentRate;
            const profitLoss = currentValue - totalInvested;
            acc.invested += totalInvested;
            acc.currentValue += currentValue;
            acc.profitLoss += profitLoss;
            return acc;
          },
          { invested: 0, currentValue: 0, profitLoss: 0 }
        );
        const bullionInvested = bullionTotals.invested;
        const bullionCurrValue = bullionTotals.currentValue;
        const bullionProfit = bullionTotals.profitLoss;
        const bullionReturn = bullionInvested > 0 ? (bullionProfit / bullionInvested) * 100 : 0;

        const summary = [
          {
            assetType: "Shares",
            invested: shareInvested,
            currentValue: shareCurrValue,
            profitLoss: shareProfit,
            returnPercent: Number(shareReturn.toFixed(2))
          },
          {
            assetType: "Mutual Funds",
            invested: mfInvested,
            currentValue: mfCurrValue,
            profitLoss: mfProfit,
            returnPercent: Number(mfReturn.toFixed(2))
          },
          {
            assetType: "Bullion",
            invested: bullionInvested,
            currentValue: bullionCurrValue,
            profitLoss: bullionProfit,
            returnPercent: Number(bullionReturn.toFixed(2))
          },
        ];

        setInvestmentSummary(summary);

        const calculatedTotals = summary.reduce(
          (acc, item) => ({
            invested: acc.invested + item.invested,
            currentValue: acc.currentValue + item.currentValue,
            profitLoss: acc.profitLoss + item.profitLoss,
          }),
          { invested: 0, currentValue: 0, profitLoss: 0 }
        );
        setTotals(calculatedTotals);

        const returnPercent = calculatedTotals.invested > 0
          ? ((calculatedTotals.profitLoss / calculatedTotals.invested) * 100).toFixed(2)
          : "0";
        setTotalReturnPercent(returnPercent);

      } catch (error) {
        console.error("Error fetching investment data:", error);
      }
    };

    const fetchTrendData = async () => {
      try {
        const incomeRes = await axios.get("/api/income", {
          params: selectedMonth ? { month: selectedMonth } : {}
        });
        const expenseRes = await axios.get("/api/expenses", {
          params: selectedMonth ? { month: selectedMonth } : {}
        });

        const monthMap = {};
        incomeRes.data.forEach((i) => {
          const month = i.date.slice(0, 7);
          monthMap[month] = monthMap[month] || { income: 0, expense: 0 };
          monthMap[month].income += i.amount;
        });
        expenseRes.data.forEach((e) => {
          const month = e.date.slice(0, 7);
          monthMap[month] = monthMap[month] || { income: 0, expense: 0 };
          monthMap[month].expense += e.amount;
        });
        
        console.log("MonthMap:", Object.entries(monthMap));
        const trendArr = Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, values]) => ({ month, ...values }));
        console.log("TrendArr:", trendArr);
        setTrendData(trendArr);
      } catch (err) {
        console.error(err);
      }
    };

    fetchInvestmentData();
    fetchTrendData();
  }, [selectedMonth]);

  const allocationData = investmentSummary.map((item) => ({
    name: item.assetType,
    value: item.currentValue
  }));

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "md:ml-16"}`}>
        <div className="p-6 md:p-8 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">Deep dive into your investments and financial trends.</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-blue-600 uppercase text-xs font-bold tracking-wide mb-1">
                    Total Invested
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    ₹{totals.invested.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Across all assets</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <span className="text-xl">💵</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-emerald-600 uppercase text-xs font-bold tracking-wide mb-1">
                    Current Value
                  </p>
                  <p className="text-2xl font-bold text-emerald-700">
                    ₹{totals.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">+{totalReturnPercent}% return</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-xl">📈</span>
                </div>
              </div>
            </div>

            <div
              className={`${
                totals.profitLoss >= 0
                  ? "bg-gradient-to-br from-green-50 to-green-100/50 border-green-200"
                  : "bg-gradient-to-br from-red-50 to-red-100/50 border-red-200"
              } border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p
                    className={`${
                      totals.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                    } uppercase text-xs font-bold tracking-wide mb-1`}
                  >
                    Total P/L
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      totals.profitLoss >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {totals.profitLoss >= 0 ? "+" : ""}₹
                    {Math.abs(totals.profitLoss).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className={`text-xs mt-1 ${totals.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {totals.profitLoss >= 0 ? "Profit" : "Loss"}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl ${
                    totals.profitLoss >= 0 ? "bg-green-500/20" : "bg-red-500/20"
                  } flex items-center justify-center`}
                >
                  <span className="text-xl">{totals.profitLoss >= 0 ? "💰" : "📉"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Summary Table */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Investment Summary</h2>
            <p className="text-sm text-gray-600 mb-6">Detailed breakdown of your investment portfolio</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Asset Type</th>
                    <th className="text-right py-4 px-4 font-bold text-gray-700">Invested</th>
                    <th className="text-right py-4 px-4 font-bold text-gray-700">Current Value</th>
                    <th className="text-right py-4 px-4 font-bold text-gray-700">P/L</th>
                    <th className="text-right py-4 px-4 font-bold text-gray-700">Return %</th>
                  </tr>
                </thead>
                <tbody>
                  {investmentSummary.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-gray-900">{item.assetType}</td>
                      <td className="py-4 px-4 text-right text-gray-700">
                        ₹{item.invested.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        ₹{item.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-bold ${
                          item.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {item.profitLoss >= 0 ? "+" : ""}₹
                        {Math.abs(item.profitLoss).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-bold ${
                          item.returnPercent >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {item.returnPercent >= 0 ? "+" : ""}
                        {item.returnPercent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50/30 font-bold border-t-2 border-gray-300">
                    <td className="py-4 px-4 text-gray-900">Total</td>
                    <td className="py-4 px-4 text-right text-gray-900">
                      ₹{totals.invested.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900">
                      ₹{totals.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td
                      className={`py-4 px-4 text-right ${
                        totals.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {totals.profitLoss >= 0 ? "+" : ""}₹
                      {Math.abs(totals.profitLoss).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className={`py-4 px-4 text-right ${
                        Number(totalReturnPercent) >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {Number(totalReturnPercent) >= 0 ? "+" : ""}
                      {totalReturnPercent}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Allocation Pie Chart */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Asset Allocation</h2>
              <p className="text-sm text-gray-600 mb-4">Current value distribution across assets</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.name}: ₹${entry.value.toLocaleString()}`}
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Return Comparison Bar Chart */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Return Comparison</h2>
              <p className="text-sm text-gray-600 mb-4">Return percentage by asset type</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={investmentSummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="assetType" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      formatter={(value) => `${Number(value).toFixed(2)}%`}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="returnPercent" fill="#3B82F6" name="Return %" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Income vs Expense Trend Chart */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Income vs Expense Trend</h2>
                <p className="text-sm text-gray-600 mt-1">Monthly comparison of income and expenses</p>
              </div>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filter by month"
              />
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" name="Income" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" fill="#EF4444" name="Expense" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

