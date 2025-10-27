///this code also correct just pie chart difference in both,can check later which one to choose after updating entries
// import { useEffect, useState } from "react";
// import axios from "axios";
// import Sidebar from "./Sidebar"; // Make sure path is correct
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// const COLORS = ["#4CAF50", "#FF5722", "#2196F3","#FFC107"]; // green, orange, blue,yellow

// export default function Dashboard() {
//   const [summary, setSummary] = useState({
//     totalIncome: 0,
//     totalExpenses: 0,
//     totalInvestment: 0,
//     totalProfit: 0,
//     roi: 0,
//     balance: 0,
//   });
//   const [recentActivities, setRecentActivities] = useState([]);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const [incomeRes, expenseRes, sharesRes, mfRes, bullionRes] = await Promise.all([
//           axios.get("/api/income"),
//           axios.get("/api/expenses"),
//           axios.get("/api/shares/live"),
//           axios.get("/api/mutualfunds"),
//           axios.get("/api/bullions")
//         ]);

//         const incomes = incomeRes.data || [];
//         const expenses = expenseRes.data || [];
//         const shares = sharesRes.data || [];
//         console.log(shares);
//         const mutualFunds = mfRes.data || [];
//         const bullions = bullionRes.data || [];

//         // ---------- SUMMARIES ----------
//         const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
//         const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
//         console.log("TotalIncome:", totalIncome);
//         console.log("TotalExpense", totalExpenses);

//         // Shares totals
//         const activeShares = shares.filter((s) => s.status === "active");
//         console.log("Active Shares:", activeShares);
//         const shareInvested = activeShares.reduce((sum, s) => sum + (s.amount) * (s.numberOfShares), 0);
//         console.log("Shares invested value:", shareInvested);
//         const shareCurrValue = activeShares.reduce(
//           (sum, s) => sum + (s.price ?? s.currValue ?? 0) * s.numberOfShares,
//           0
//         );
//         console.log("Share curr value:", shareCurrValue);
//         const shareProfit = shareCurrValue - shareInvested;
//         console.log("shareprofit", shareProfit);

//         // Mutual Fund totals
//         const activeFunds = mutualFunds.filter((f) => f.status === "active");
//         console.log("Active Mutual Funds", activeFunds);

//         const mfInvested = activeFunds.reduce(
//           (sum, f) => sum + f.investments.reduce((invSum, inv) => invSum + (inv.amount || 0), 0),
//           0
//         );

//         console.log("Mutual Fund Active Invested", mfInvested);

//         // Calculate current value using NAV × total units
//         const mfCurrValue = activeFunds.reduce((sum, f) => {
//           const units = f.investments.reduce((unitSum, inv) => unitSum + (inv.units || 0), 0);
//           const currNAV = Number(f.currNAV || 0);
//           return sum + currNAV * units;
//         }, 0);

//         console.log("Mutual Fund Active Curr Value", mfCurrValue);

//         const mfProfit = mfCurrValue - mfInvested;
//         console.log("Mutual Fund Profit", mfProfit);

//         // Bullion totals

//         const activeBullions = bullions.filter((b) => b.status === "active");
//         console.log("Active Bullions", activeBullions);

//         const bullionTotals = activeBullions.reduce(
//           (acc, b) => {
//             // Current rate adjusted by purity (fallbacks: currentRates → b.currentRate → b.rate)
//             const currentRate =
//               Number(b.currentRate ?? b.rate) *
//               ((b.investments?.[0]?.purity || 24) / 24);

//             // Total quantity (sum of all investments’ quantities)
//             const totalQuantity = b.investments?.reduce(
//               (sum, inv) => sum + (inv.quantity || 0),
//               0
//             ) || 0;

//             // Total invested amount
//             const totalInvested = b.investments?.reduce(
//               (sum, inv) => sum + (inv.amountInvested || 0),
//               0
//             ) || 0;

//             // Current market value
//             const currentValue = totalQuantity * currentRate;

//             // Profit or loss
//             const profitLoss = currentValue - totalInvested;

//             // Aggregate totals
//             acc.invested += totalInvested;
//             acc.currentValue += currentValue;
//             acc.profitLoss += profitLoss;

//             return acc;
//           },
//           { invested: 0, currentValue: 0, profitLoss: 0 }
//         );

//         // Extract the results
//         const bullionInvested = bullionTotals.invested;
//         const bullionCurrValue = bullionTotals.currentValue;
//         const bullionProfit = bullionTotals.profitLoss;

//         console.log("Bullion Invested:", bullionInvested);
//         console.log("Bullion Current Value:", bullionCurrValue);
//         console.log("Bullion Profit:", bullionProfit);

//         // Combined investment
//         const totalInvestment = shareInvested + mfInvested + bullionInvested;
//         console.log("TotalInvested:", totalInvestment);
//         const totalProfit = shareProfit + mfProfit + bullionProfit;
//         console.log("Total Profit", totalProfit);

//         const roi = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : 0;
//         const balance = totalIncome - (totalExpenses + totalInvestment);
//         console.log("Balance", balance);
//         setSummary({ totalIncome, totalExpenses, totalInvestment, totalProfit, roi, balance });

//         // ---------- RECENT TRANSACTIONS ----------
//         const recentIncome = incomes.slice(-5).map(i => ({ type: "Income", name: i.source || "Income", date: i.date, amount: i.amount }));
//         console.log(recentIncome);
//         const recentExpense = expenses.slice(-5).map(e => ({ type: "Expense", name: e.category || "Expense", date: e.date, amount: e.amount }));
//         console.log(recentExpense);
//         const recentShares = shares.slice(-5).map(s => ({
//           type: "Share",
//           name: s.companyName,
//           date: s.startDate,
//           amount: s.amount * s.numberOfShares,
//         }));
//         console.log(recentShares);
//         const recentMFs = mutualFunds.slice(-5).map(m => ({
//           type: "Mutual Fund",
//           name: m.name,
//           date: m.investments.at(-1)?.date,
//           amount: m.investments.at(-1)?.amount || 0,
//         }));
//         console.log(recentMFs);
//         const recentBullions = bullions.slice(-5).map(b => ({
//           type: "Bullion",
//           name: b.name,
//           date: b.investments.at(-1)?.date,
//           amount: b.investments.at(-1)?.amountInvested || 0,
//         }));
//         console.log(recentBullions);
        
//         const merged = [...recentIncome, ...recentExpense, ...recentShares, ...recentMFs, ...recentBullions];
//         const sorted = merged.sort((a, b) => new Date(b.date) - new Date(a.date));
//         setRecentActivities(sorted.slice(0, 10));
//         console.log(sorted);
//       } catch (error) {
//         console.error("Error fetching dashboard data:", error);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   // ---------- PIE CHART ----------
//   const pieData = [
//     { name: "Income", value: summary.totalIncome },
//     { name: "Expenses", value: summary.totalExpenses },
//     { name: "Investments", value: summary.totalInvestment },
//     { name: "Balance", value: summary.balance }, // Added Balance
//   ];

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
//       <div className={`flex-1 p-6 transition-all duration-300 relative ${isSidebarOpen ? "ml-64" : "ml-0"}`} style={{ minWidth: 0 }}>

//         {/* ---------- Dashboard Content ---------- */}
//         <div className="space-y-6">
//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//             <Card><CardHeader><CardTitle>Total Income</CardTitle></CardHeader><CardContent>₹{summary.totalIncome.toLocaleString()}</CardContent></Card>
//             <Card><CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader><CardContent>₹{summary.totalExpenses.toLocaleString()}</CardContent></Card>
//             <Card><CardHeader><CardTitle>Total Investment</CardTitle></CardHeader><CardContent>₹{summary.totalInvestment.toLocaleString()}</CardContent></Card>
//             <Card><CardHeader><CardTitle>ROI</CardTitle></CardHeader><CardContent>{summary.roi}%</CardContent></Card>
//             <Card><CardHeader><CardTitle>Balance</CardTitle></CardHeader><CardContent>₹{summary.balance.toLocaleString()}</CardContent></Card>
//           </div>

//           {/* Pie Chart */}
//           <Card>
//             <CardHeader><CardTitle>Financial Distribution</CardTitle></CardHeader>
//             <CardContent className="h-64">
//               <ResponsiveContainer width="100%" height={250}>
//                 <PieChart>
//                   <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
//                     {pieData.map((entry, index) => (
//                       <Cell key={index} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           {/* Recent Transactions */}
//           <Card>
//             <CardHeader><CardTitle>Recent Transactions / Activities</CardTitle></CardHeader>
//             <CardContent>
//               <table className="min-w-full text-sm text-left border">
//                 <thead>
//                   <tr className="bg-gray-100">
//                     <th className="p-2 border">Type</th>
//                     <th className="p-2 border">Name</th>
//                     <th className="p-2 border">Date</th>
//                     <th className="p-2 border">Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {recentActivities.map((item, idx) => (
//                     <tr key={idx} className="hover:bg-gray-50">
//                       <td className="p-2 border">{item.type}</td>
//                       <td className="p-2 border">{item.name}</td>
//                       <td className="p-2 border">{new Date(item.date).toLocaleDateString()}</td>
//                       <td className="p-2 border">₹{item.amount?.toLocaleString()}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar"; // Make sure path is correct
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/authContext"
import { useNavigate } from "react-router-dom";
// Colors for Pie slices: green, orange, blue, yellow (Balance)
const COLORS = ["#4CAF50", "#FF5722", "#2196F3", "#FFC107"]; 

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalInvestment: 0,
    totalProfit: 0,
    roi: 0,
    balance: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const { isAuthenticated, checkAuth } = useAuth();
         const navigate = useNavigate();

  useEffect(() => {
         
          // checkAuth();
          if (!isAuthenticated) {
              navigate("/");
          }
      }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [incomeRes, expenseRes, sharesRes, mfRes, bullionRes] = await Promise.all([
          axios.get("/api/income"),
          axios.get("/api/expenses"),
          axios.get("/api/shares/live"),
          axios.get("/api/mutualfunds"),
          axios.get("/api/bullions")
        ]);

        const incomes = incomeRes.data || [];
        const expenses = expenseRes.data || [];
        const shares = sharesRes.data || [];
        const mutualFunds = mfRes.data || [];
        const bullions = bullionRes.data || [];

        // ---------- SUMMARIES ----------
        const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

        // Shares totals
        const activeShares = shares.filter((s) => s.status === "active");
        const shareInvested = activeShares.reduce((sum, s) => sum + (s.amount) * (s.numberOfShares), 0);
        const shareCurrValue = activeShares.reduce((sum, s) => sum + (s.price ?? s.currValue ?? 0) * s.numberOfShares, 0);
        const shareProfit = shareCurrValue - shareInvested;

        // Mutual Fund totals
        const activeFunds = mutualFunds.filter((f) => f.status === "active");
        const mfInvested = activeFunds.reduce(
          (sum, f) => sum + f.investments.reduce((invSum, inv) => invSum + (inv.amount || 0), 0),
          0
        );
        const mfCurrValue = activeFunds.reduce((sum, f) => {
          const units = f.investments.reduce((unitSum, inv) => unitSum + (inv.units || 0), 0);
          const currNAV = Number(f.currNAV || 0);
          return sum + currNAV * units;
        }, 0);
        const mfProfit = mfCurrValue - mfInvested;

        // Bullion totals
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

        // Combined investment
        const totalInvestment = shareInvested + mfInvested + bullionInvested;
        const totalProfit = shareProfit + mfProfit + bullionProfit;
        const roi = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100).toFixed(2) : 0;
        const balance = totalIncome - (totalExpenses + totalInvestment);

        setSummary({ totalIncome, totalExpenses, totalInvestment, totalProfit, roi, balance });

        // ---------- RECENT TRANSACTIONS ----------
        const recentIncome = incomes.slice(-5).map(i => ({ type: "Income", name: i.source || "Income", date: i.date, amount: i.amount }));
        const recentExpense = expenses.slice(-5).map(e => ({ type: "Expense", name: e.category || "Expense", date: e.date, amount: e.amount }));
        const recentShares = shares.slice(-5).map(s => ({ type: "Share", name: s.companyName, date: s.startDate, amount: s.amount * s.numberOfShares }));
        const recentMFs = mutualFunds.slice(-5).map(m => ({ type: "Mutual Fund", name: m.name, date: m.investments.at(-1)?.date, amount: m.investments.at(-1)?.amount || 0 }));
        const recentBullions = bullions.slice(-5).map(b => ({ type: "Bullion", name: b.name, date: b.investments.at(-1)?.date, amount: b.investments.at(-1)?.amountInvested || 0 }));
        
        const merged = [...recentIncome, ...recentExpense, ...recentShares, ...recentMFs, ...recentBullions];
        const sorted = merged.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivities(sorted.slice(0, 10));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // ---------- PIE CHART ----------
  const pieData = [
    { name: "Income", value: summary.totalIncome },
    { name: "Expenses", value: summary.totalExpenses },
    { name: "Investments", value: summary.totalInvestment },
    { name: "Balance", value: summary.balance < 0 ? 0 : summary.balance }, // Negative balance shown as 0
  ];

  const pieColors = summary.balance < 0 ? [...COLORS.slice(0, 3), "#f44336"] : COLORS; // Red for negative balance

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`flex-1 p-6 transition-all duration-300 relative ${isSidebarOpen ? "ml-64" : "ml-0"}`} style={{ minWidth: 0 }}>

        {/* ---------- Dashboard Content ---------- */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card><CardHeader><CardTitle>Total Income</CardTitle></CardHeader><CardContent>₹{summary.totalIncome.toLocaleString()}</CardContent></Card>
            <Card><CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader><CardContent>₹{summary.totalExpenses.toLocaleString()}</CardContent></Card>
            <Card><CardHeader><CardTitle>Total Investment</CardTitle></CardHeader><CardContent>₹{summary.totalInvestment.toLocaleString()}</CardContent></Card>
            <Card><CardHeader><CardTitle>ROI</CardTitle></CardHeader><CardContent>{summary.roi}%</CardContent></Card>
            <Card><CardHeader><CardTitle>Balance</CardTitle></CardHeader><CardContent>₹{summary.balance.toLocaleString()}</CardContent></Card>
          </div>

          {/* Pie Chart */}
          <Card>
            <CardHeader><CardTitle>Financial Distribution</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader><CardTitle>Recent Transactions / Activities</CardTitle></CardHeader>
            <CardContent>
              <table className="min-w-full text-sm text-left border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2 border">{item.type}</td>
                      <td className="p-2 border">{item.name}</td>
                      <td className="p-2 border">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="p-2 border">₹{item.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

