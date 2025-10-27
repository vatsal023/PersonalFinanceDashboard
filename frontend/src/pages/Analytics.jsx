///this one made at start by loveable not includes income vs expense trend
// import { useState, useEffect } from "react";
// import axios from "axios";
// import Sidebar from "./Sidebar";
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
// import { TrendingUp, TrendingDown, Activity } from "lucide-react";

// const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

// export default function Analytics() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [investmentSummary, setInvestmentSummary] = useState([]);
//   const [totals, setTotals] = useState({ invested: 0, currentValue: 0, profitLoss: 0 });
//   const [totalReturnPercent, setTotalReturnPercent] = useState("0");

//   useEffect(() => {
//     const fetchInvestmentData = async () => {
//       try {
//         const [sharesRes, mfRes, bullionRes] = await Promise.all([
//           axios.get("/api/shares/live"),
//           axios.get("/api/mutualfunds"),
//           axios.get("/api/bullions")
//         ]);

//         const shares = sharesRes.data || [];
//         const mutualFunds = mfRes.data || [];
//         const bullions = bullionRes.data || [];

//         // Shares calculation
//         const activeShares = shares.filter((s) => s.status === "active");
//         const shareInvested = activeShares.reduce((sum, s) => sum + (s.amount) * (s.numberOfShares), 0);
//         const shareCurrValue = activeShares.reduce((sum, s) => sum + (s.price ?? s.currValue ?? 0) * s.numberOfShares, 0);
//         const shareProfit = shareCurrValue - shareInvested;
//         const shareReturn = shareInvested > 0 ? ((shareProfit / shareInvested) * 100) : 0;

//         // Mutual Funds calculation
//         const activeFunds = mutualFunds.filter((f) => f.status === "active");
//         const mfInvested = activeFunds.reduce(
//           (sum, f) => sum + f.investments.reduce((invSum, inv) => invSum + (inv.amount || 0), 0),
//           0
//         );
//         const mfCurrValue = activeFunds.reduce((sum, f) => {
//           const units = f.investments.reduce((unitSum, inv) => unitSum + (inv.units || 0), 0);
//           const currNAV = Number(f.currNAV || 0);
//           return sum + currNAV * units;
//         }, 0);
//         const mfProfit = mfCurrValue - mfInvested;
//         const mfReturn = mfInvested > 0 ? ((mfProfit / mfInvested) * 100) : 0;

//         // Bullion calculation
//         const activeBullions = bullions.filter((b) => b.status === "active");
//         const bullionTotals = activeBullions.reduce(
//           (acc, b) => {
//             const currentRate = Number(b.currentRate ?? b.rate) * ((b.investments?.[0]?.purity || 24) / 24);
//             const totalQuantity = b.investments?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0;
//             const totalInvested = b.investments?.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0) || 0;
//             const currentValue = totalQuantity * currentRate;
//             const profitLoss = currentValue - totalInvested;
//             acc.invested += totalInvested;
//             acc.currentValue += currentValue;
//             acc.profitLoss += profitLoss;
//             return acc;
//           },
//           { invested: 0, currentValue: 0, profitLoss: 0 }
//         );
//         const bullionInvested = bullionTotals.invested;
//         const bullionCurrValue = bullionTotals.currentValue;
//         const bullionProfit = bullionTotals.profitLoss;
//         const bullionReturn = bullionInvested > 0 ? ((bullionProfit / bullionInvested) * 100) : 0;

//         const summary = [
//           { assetType: "Shares", invested: shareInvested, currentValue: shareCurrValue, profitLoss: shareProfit, returnPercent: Number(shareReturn.toFixed(2)) },
//           { assetType: "Mutual Funds", invested: mfInvested, currentValue: mfCurrValue, profitLoss: mfProfit, returnPercent: Number(mfReturn.toFixed(2)) },
//           { assetType: "Bullion", invested: bullionInvested, currentValue: bullionCurrValue, profitLoss: bullionProfit, returnPercent: Number(bullionReturn.toFixed(2)) },
//         ];

//         setInvestmentSummary(summary);
        
//         const calculatedTotals = summary.reduce(
//           (acc, item) => ({
//             invested: acc.invested + item.invested,
//             currentValue: acc.currentValue + item.currentValue,
//             profitLoss: acc.profitLoss + item.profitLoss,
//           }),
//           { invested: 0, currentValue: 0, profitLoss: 0 }
//         );
        
//         setTotals(calculatedTotals);
        
//         const returnPercent = calculatedTotals.invested > 0 
//           ? ((calculatedTotals.profitLoss / calculatedTotals.invested) * 100).toFixed(2) 
//           : "0";
//         setTotalReturnPercent(returnPercent);

//       } catch (error) {
//         console.error("Error fetching investment data:", error);
//       }
//     };

//     fetchInvestmentData();
//   }, []);

//   // Asset allocation data for pie chart
//   const allocationData = investmentSummary.map(item => ({
//     name: item.assetType,
//     value: item.currentValue,
//   }));

//   return (
//     <div className="flex min-h-screen bg-background">
//       <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
//       <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
//         <div className="p-4 md:p-8 space-y-8">
//           {/* Header */}
//           <div>
//             <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
//             <p className="text-muted-foreground mt-2">Deep dive into your investment performance and allocation.</p>
//           </div>

//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Card className="hover:shadow-lg transition-shadow">
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
//                 <Activity className="h-4 w-4 text-primary" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">₹{totals.invested.toLocaleString()}</div>
//                 <p className="text-xs text-muted-foreground mt-1">Across all assets</p>
//               </CardContent>
//             </Card>

//             <Card className="hover:shadow-lg transition-shadow">
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium">Current Value</CardTitle>
//                 <TrendingUp className="h-4 w-4 text-success" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">₹{totals.currentValue.toLocaleString()}</div>
//                 <p className="text-xs text-success mt-1">+{totalReturnPercent}%</p>
//               </CardContent>
//             </Card>

//             <Card className="hover:shadow-lg transition-shadow">
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium">Total P/L</CardTitle>
//                 {totals.profitLoss >= 0 ? (
//                   <TrendingUp className="h-4 w-4 text-success" />
//                 ) : (
//                   <TrendingDown className="h-4 w-4 text-destructive" />
//                 )}
//               </CardHeader>
//               <CardContent>
//                 <div className={`text-2xl font-bold ${totals.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
//                   ₹{Math.abs(totals.profitLoss).toLocaleString()}
//                 </div>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   {totals.profitLoss >= 0 ? 'Profit' : 'Loss'}
//                 </p>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Investment Summary Table */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Investment Summary</CardTitle>
//               <p className="text-sm text-muted-foreground">Detailed breakdown of your investment portfolio</p>
//             </CardHeader>
//             <CardContent>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="border-b bg-muted/50">
//                       <th className="text-left py-4 px-4 font-semibold">Asset Type</th>
//                       <th className="text-right py-4 px-4 font-semibold">Invested</th>
//                       <th className="text-right py-4 px-4 font-semibold">Current Value</th>
//                       <th className="text-right py-4 px-4 font-semibold">P/L</th>
//                       <th className="text-right py-4 px-4 font-semibold">Return %</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {investmentSummary.map((item, idx) => (
//                       <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
//                         <td className="py-4 px-4 font-medium">{item.assetType}</td>
//                         <td className="py-4 px-4 text-right">₹{item.invested.toLocaleString()}</td>
//                         <td className="py-4 px-4 text-right font-medium">₹{item.currentValue.toLocaleString()}</td>
//                         <td className={`py-4 px-4 text-right font-semibold ${
//                           item.profitLoss >= 0 ? 'text-success' : 'text-destructive'
//                         }`}>
//                           {item.profitLoss >= 0 ? '+' : ''}₹{item.profitLoss.toLocaleString()}
//                         </td>
//                         <td className={`py-4 px-4 text-right font-semibold ${
//                           item.returnPercent >= 0 ? 'text-success' : 'text-destructive'
//                         }`}>
//                           {item.returnPercent >= 0 ? '+' : ''}{item.returnPercent.toFixed(2)}%
//                         </td>
//                       </tr>
//                     ))}
//                     {/* Totals Row */}
//                     <tr className="bg-muted/50 font-bold">
//                       <td className="py-4 px-4">Total</td>
//                       <td className="py-4 px-4 text-right">₹{totals.invested.toLocaleString()}</td>
//                       <td className="py-4 px-4 text-right">₹{totals.currentValue.toLocaleString()}</td>
//                       <td className={`py-4 px-4 text-right ${
//                         totals.profitLoss >= 0 ? 'text-success' : 'text-destructive'
//                       }`}>
//                         {totals.profitLoss >= 0 ? '+' : ''}₹{totals.profitLoss.toLocaleString()}
//                       </td>
//                       <td className={`py-4 px-4 text-right ${
//                         Number(totalReturnPercent) >= 0 ? 'text-success' : 'text-destructive'
//                       }`}>
//                         {Number(totalReturnPercent) >= 0 ? '+' : ''}{totalReturnPercent}%
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Charts Row */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Asset Allocation Pie Chart */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Asset Allocation</CardTitle>
//                 <p className="text-sm text-muted-foreground">Current value distribution across assets</p>
//               </CardHeader>
//               <CardContent className="h-80">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={allocationData}
//                       dataKey="value"
//                       nameKey="name"
//                       cx="50%"
//                       cy="50%"
//                       outerRadius={100}
//                       label={(entry) => `${entry.name}: ₹${entry.value.toLocaleString()}`}
//                     >
//                       {allocationData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>

//             {/* Performance Bar Chart */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Return Comparison</CardTitle>
//                 <p className="text-sm text-muted-foreground">Return percentage by asset type</p>
//               </CardHeader>
//               <CardContent className="h-80">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={investmentSummary}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="assetType" />
//                     <YAxis />
//                     <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
//                     <Legend />
//                     <Bar dataKey="returnPercent" fill="hsl(var(--primary))" name="Return %" radius={[8, 8, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


///includes everything
import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useAuth } from "../context/authContext"
import { useNavigate } from "react-router-dom";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))"
];

export default function Analytics() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [investmentSummary, setInvestmentSummary] = useState([]);
  const [totals, setTotals] = useState({ invested: 0, currentValue: 0, profitLoss: 0 });
  const [totalReturnPercent, setTotalReturnPercent] = useState("0");

  const [trendData, setTrendData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // Optional month filter
   const { isAuthenticated, checkAuth } = useAuth();
           const navigate = useNavigate();
  
    useEffect(() => {
            // checkAuth();
            if (!isAuthenticated) {
                navigate("/");
            }
        }, [])

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
          { assetType: "Shares", invested: shareInvested, currentValue: shareCurrValue, profitLoss: shareProfit, returnPercent: Number(shareReturn.toFixed(2)) },
          { assetType: "Mutual Funds", invested: mfInvested, currentValue: mfCurrValue, profitLoss: mfProfit, returnPercent: Number(mfReturn.toFixed(2)) },
          { assetType: "Bullion", invested: bullionInvested, currentValue: bullionCurrValue, profitLoss: bullionProfit, returnPercent: Number(bullionReturn.toFixed(2)) },
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
        const incomeRes = await axios.get("/api/income", { params: selectedMonth ? { month: selectedMonth } : {} });
        const expenseRes = await axios.get("/api/expenses", { params: selectedMonth ? { month: selectedMonth } : {} });

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

        const trendArr = Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, values]) => ({ month, ...values }));

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
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
        <div className="p-4 md:p-8 space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-2">Deep dive into your investments and financial trends.</p>
          </div>

          {/* Summary Cards */}
          {/* (You can keep your Total Invested / Current Value / P/L cards here) */}

          {/* Investment Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Summary</CardTitle>
              <p className="text-sm text-muted-foreground">Detailed breakdown of your investment portfolio</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-4 px-4 font-semibold">Asset Type</th>
                      <th className="text-right py-4 px-4 font-semibold">Invested</th>
                      <th className="text-right py-4 px-4 font-semibold">Current Value</th>
                      <th className="text-right py-4 px-4 font-semibold">P/L</th>
                      <th className="text-right py-4 px-4 font-semibold">Return %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investmentSummary.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4 font-medium">{item.assetType}</td>
                        <td className="py-4 px-4 text-right">₹{item.invested.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right font-medium">₹{item.currentValue.toLocaleString()}</td>
                        <td className={`py-4 px-4 text-right font-semibold ${item.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {item.profitLoss >= 0 ? '+' : ''}₹{item.profitLoss.toLocaleString()}
                        </td>
                        <td className={`py-4 px-4 text-right font-semibold ${item.returnPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {item.returnPercent >= 0 ? '+' : ''}{item.returnPercent.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/50 font-bold">
                      <td className="py-4 px-4">Total</td>
                      <td className="py-4 px-4 text-right">₹{totals.invested.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">₹{totals.currentValue.toLocaleString()}</td>
                      <td className={`py-4 px-4 text-right ${totals.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {totals.profitLoss >= 0 ? '+' : ''}₹{totals.profitLoss.toLocaleString()}
                      </td>
                      <td className={`py-4 px-4 text-right ${Number(totalReturnPercent) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {Number(totalReturnPercent) >= 0 ? '+' : ''}{totalReturnPercent}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Allocation Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <p className="text-sm text-muted-foreground">Current value distribution across assets</p>
              </CardHeader>
              <CardContent className="h-80">
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
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Return Comparison Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Return Comparison</CardTitle>
                <p className="text-sm text-muted-foreground">Return percentage by asset type</p>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={investmentSummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="assetType" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                    <Legend />
                    <Bar dataKey="returnPercent" fill="hsl(var(--primary))" name="Return %" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Income vs Expense Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expense Trend</CardTitle>
              <p className="text-sm text-muted-foreground">Monthly comparison of income and expenses</p>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="income" fill="hsl(var(--chart-1))" name="Income" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" fill="hsl(var(--chart-2))" name="Expense" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
