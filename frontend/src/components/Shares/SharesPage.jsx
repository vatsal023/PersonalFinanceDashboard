import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Sidebar";
import Papa from "papaparse";
import AddShareModal from "./AddShareModal";
import SharesOverview from "./SharesOverview";
import SharesTable from "./SharesTable";

const SharesPage = () => {
  const [shares, setShares] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

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
      setShares(res.data); // merge live prices with table
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

  // Date range filter
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
                 exchange: row.exchange || "", // Added exchange
              startDate: row.startDate || row.date || new Date(),
              amount: Number(row.amount) || 0,
              numberOfShares: Number(row.numberOfShares || row.quantity) || 0,
            };
            await axios.post("/api/shares", shareData);
          } catch (error) {
            console.error("Error adding share from CSV:", error);
          }
        }
        setRefresh((prev) => !prev); // Refresh list after upload
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

  
  // Split active & sold shares
  const activeShares = filteredShares.filter((s) => s.status === "active");
  const soldShares = filteredShares.filter((s) => s.status === "sold");

  const totalInvested = activeShares.reduce((sum, s) => sum + (s.amount)*(s.numberOfShares), 0);
  const totalCurrentValue = activeShares.reduce(
  (sum, s) => sum + (s.price ?? s.currValue ?? 0)*s.numberOfShares,
  0
);

const totalProfitLoss = activeShares.reduce(
  (sum, s) => sum + ((s.price ?? s.currValue ?? 0) - s.amount) * s.numberOfShares,
  0
);


//   const totalInvested = filteredShares.reduce(
//     (sum, s) => sum + s.amount,
//     0
//   );
//   const totalCurrentValue = filteredShares.reduce(
//     (sum, s) => sum + (s.currValue || 0),
//     0
//   );
// //   const totalProfitLoss = totalCurrentValue - totalInvested;
// const totalProfitLoss = filteredShares.reduce(
//     (sum, s) => sum + ((s.currValue || 0) - s.amount) * s.numberOfShares,
//     0
//   );
  const entryCount = activeShares.length;


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
          <h2 className="text-2xl font-semibold">Shares Overview</h2>
          <div className="flex items-center gap-4">
            {/* CSV Upload */}
            <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700">
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>

            {/* Add Share Modal */}
            <AddShareModal setRefresh={setRefresh} />
          </div>
          {/* <AddShareModal setRefresh={setRefresh} /> */}
        </div>

        {/* Overview */}
        <SharesOverview
          totalInvested={totalInvested.toFixed(2)}
          totalCurrentValue={totalCurrentValue.toFixed(2)}
          totalProfitLoss={totalProfitLoss.toFixed(2)}
          entryCount={entryCount}
        />

        {/* Filter */}
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

        {/* Table */}
        <div className="mt-6 text-left bg-white p-6 rounded-xl shadow hover:shadow-xl transition overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4">Share Details</h3>
          <div className="min-w-max">
            <SharesTable shares={filteredShares} setRefresh={setRefresh} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharesPage;

