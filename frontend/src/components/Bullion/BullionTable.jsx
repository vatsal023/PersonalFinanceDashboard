import { useMemo, useState } from "react";
import axios from "axios";

const BullionTable = ({ bullions, setRefresh }) => {
  const [currentRates, setCurrentRates] = useState({});
  const [soldRates, setSoldRates] = useState({});
  const [selectedBullion, setSelectedBullion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeBullions = useMemo(() => bullions.filter((b) => b.status === "active"), [bullions]);
  const soldBullions = useMemo(() => bullions.filter((b) => b.status === "sold"), [bullions]);

  const handleRateChange = (id, val) => setCurrentRates({ ...currentRates, [id]: val });
  const handleSoldRateChange = (id, val) => setSoldRates({ ...soldRates, [id]: val });

  const updateCurrentRate = async (id, bullion) => {
    try {
      await axios.put(`/api/bullions/${id}`, { currentRate: Number(currentRates[id] ?? bullion.currentRate) });
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsSold = async (id, endDate, soldRate) => {
    if (!endDate || !soldRate) return alert("End date and sold price required.");
    try {
      await axios.put(`/api/bullions/${id}/sold`, { endDate, soldRate: Number(soldRate) });
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error(err);
    }
  };

  const viewDetails = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/bullions/${id}`);
      setSelectedBullion(res.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching bullion details", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to render a single row
  const renderRow = (b, isActive = true) => {
    const currentRate = Number(currentRates[b._id] ?? b.currentRate ?? b.rate)*(b.investments[0].purity / 24);
    const totalquantity = b.investments.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalinvested = b.investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
    const currentValue = totalquantity * currentRate;
    const profitLoss = currentValue - totalinvested;

    return (
      <tr key={b._id} className="text-center">
        <td
          className="border px-2 py-1 cursor-pointer text-blue-600 hover:underline"
          onClick={() => viewDetails(b._id)}
        >
          {b.name}
        </td>
        <td className="border px-2 py-1">{new Date(b.investments[0].date).toLocaleDateString()}</td>
        <td className="border px-2 py-1">{totalquantity}</td>
        <td className="border px-2 py-1">{b.investments[0].purity}</td>
        <td className="border px-2 py-1">₹{totalinvested.toFixed(2)}</td>

        {isActive ? (
          <>
            <td className="border px-2 py-1">
              <input
                type="number"
                value={currentRate.toFixed(2)}
                onChange={(e) => handleRateChange(b._id, e.target.value)}
                className="border p-1 w-20"
              />
              <button
                onClick={() => updateCurrentRate(b._id, b)}
                className="ml-1 px-2 py-1 bg-green-500 text-white rounded"
              >
                Save
              </button>
            </td>
            <td className="border px-2 py-1">₹{currentValue.toFixed(2)}</td>
            <td className={`border px-2 py-1 ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{profitLoss.toFixed(2)}
            </td>
            <td className="border px-2 py-1">
              <input type="date" onChange={(e) => (b.endDate = e.target.value)} className="border p-1 rounded" />
            </td>
            <td className="border px-2 py-1">
              <input
                type="number"
                placeholder="Sold Price"
                onChange={(e) => handleSoldRateChange(b._id, e.target.value)}
                className="border p-1 w-20"
              />
            </td>
            <td className="border px-2 py-1">
              <button
                onClick={() => markAsSold(b._id, b.endDate, soldRates[b._id])}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Mark Sold
              </button>
            </td>
          </>
        ) : (
          <td className="border px-2 py-1">₹{b.soldRate}</td>
        )}
      </tr>
    );
  };

  // 🧮 Totals for Active Bullions
  const totalActive = activeBullions.reduce(
    (acc, b) => {
      const currentRate = Number(currentRates[b._id] ?? b.currentRate ?? b.rate)* (b.investments[0].purity / 24);
      const totalquantity = b.investments.reduce((sum, inv) => sum + inv.quantity, 0);
      const totalinvested = b.investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
      const currentValue = totalquantity * currentRate;
      const profitLoss = currentValue - totalinvested;

      acc.invested += totalinvested;
      acc.currentValue += currentValue;
      acc.profitLoss += profitLoss;
      return acc;
    },
    { invested: 0, currentValue: 0, profitLoss: 0 }
  );

  // 🧮 Totals for Sold Bullions
  const totalSold = soldBullions.reduce(
    (acc, b) => {
    const currentRate = Number(currentRates[b._id] ?? b.currentRate ?? b.rate)* (b.investments[0].purity / 24);
      const totalquantity = b.investments.reduce((sum, inv) => sum + inv.quantity, 0);
      const totalinvested = b.investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
      const currentValue = totalquantity *currentRate;
      const profitLoss = currentValue - totalinvested;

      acc.invested += totalinvested;
      acc.currentValue += currentValue;
      acc.profitLoss += profitLoss;
      return acc;
    },
    { invested: 0, currentValue: 0, profitLoss: 0 }
  );

  return (
    <>
      {/* 🔶 Active Bullions Table */}
      <h2 className="text-xl font-semibold mt-4 text-green-700">Active Bullions</h2>
      <table className="w-full table-auto border-collapse border text-sm">
        <thead className="bg-gray-100 text-center">
          <tr>
            {[
              "Name",
              "Date",
              "Quantity",
              "Purity",
              "Invested",
              "Current Rate",
              "Current Value",
              "Profit/Loss",
              "End Date",
              "Sold Price",
              "Action",
            ].map((col) => (
              <th key={col} className="border px-2 py-1">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeBullions.map((b) => renderRow(b, true))}

          {/* 🟩 Total Row for Active */}
          <tr className="font-semibold bg-gray-50 text-center">
            <td colSpan="4" className="border px-2 py-1">
              Total
            </td>
            <td className="border px-2 py-1">₹{totalActive.invested.toFixed(2)}</td>
            <td className="border px-2 py-1">—</td>
            <td className="border px-2 py-1">₹{totalActive.currentValue.toFixed(2)}</td>
            <td className={`border px-2 py-1 ${totalActive.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{totalActive.profitLoss.toFixed(2)}
            </td>
            <td colSpan="3" className="border px-2 py-1">—</td>
          </tr>
        </tbody>
      </table>

      {/* 🔴 Sold Bullions Table */}
      <h2 className="text-xl font-semibold mt-6 text-red-700">Sold Bullions</h2>
      <table className="w-full table-auto border-collapse border text-sm">
        <thead className="bg-gray-100 text-center">
          <tr>
            {[
              "Name",
              "Start",
              "Quantity",
              "Purity",
              "Invested",
              "Sold Price",
              "Total Profit/Loss",
              "Current Rate",
              "End Date",
            ].map((col) => (
              <th key={col} className="border px-2 py-1">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {soldBullions.map((b) => {
              const currentRate = Number(currentRates[b._id] ?? b.currentRate ?? b.rate)* (b.investments[0].purity / 24);
            const totalquantity = b.investments.reduce((sum, inv) => sum + inv.quantity, 0);
            const totalinvested = b.investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
            const currentValue = totalquantity*currentRate;
            const profitLoss = currentValue - totalinvested;
            return (
              <tr key={b._id} className="text-center">
                <td
                  className="border px-2 py-1 cursor-pointer text-blue-600 hover:underline"
                  onClick={() => viewDetails(b._id)}
                >
                  {b.name}
                </td>
                <td className="border px-2 py-1">{new Date(b.investments[0].date).toLocaleDateString()}</td>
                <td className="border px-2 py-1">{totalquantity}</td>
                <td className="border px-2 py-1">{b.investments[0].purity}</td>
                <td className="border px-2 py-1">₹{totalinvested.toFixed(2)}</td>
                <td className="border px-2 py-1">₹{b.soldRate}</td>
                <td className={`border px-2 py-1 ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ₹{profitLoss.toFixed(2)}
                </td>
                <td className="border px-2 py-1">₹{currentRate.toFixed(2)}</td>
                <td className="border px-2 py-1">
                  {b.endDate ? new Date(b.endDate).toLocaleDateString() : "-"}
                </td>
              </tr>
            );
          })}

          {/* 🟦 Total Row for Sold */}
          <tr className="font-semibold bg-gray-50 text-center">
            <td colSpan="4" className="border px-2 py-1">
              Total
            </td>
            <td className="border px-2 py-1">₹{totalSold.invested.toFixed(2)}</td>
            <td className="border px-2 py-1">—</td>
            <td className={`border px-2 py-1 ${totalSold.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{totalSold.profitLoss.toFixed(2)}
            </td>
            <td colSpan="2" className="border px-2 py-1">—</td>
          </tr>
        </tbody>
      </table>


      {/* 🟢 Modal for Details */}
      {showModal && selectedBullion && (
  <div
    className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    onClick={() => setShowModal(false)}
  >
    <div
      className="bg-white p-6 rounded-2xl shadow-xl w-[600px] max-h-[80vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
        {selectedBullion.name} — Investments
      </h2>

      {loading ? (
        <p className="text-center py-4">Loading details...</p>
      ) : (
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Quantity (g)</th>
              <th className="border px-3 py-2">Purity</th>
              <th className="border px-3 py-2">Rate/g (₹)</th>
              <th className="border px-3 py-2">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {selectedBullion.investments.map((inv, idx) => (
              <tr key={idx} className="text-center hover:bg-gray-50">
                <td className="border px-3 py-2">
                  {new Date(inv.date).toLocaleDateString()}
                </td>
                <td className="border px-3 py-2">{inv.quantity}</td>
                <td className="border px-3 py-2">{inv.purity}</td>
                <td className="border px-3 py-2">₹{inv.rate.toFixed(2)}</td>
                <td className="border px-3 py-2">₹{inv.amountInvested.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="text-center mt-4">
        <button
          onClick={() => setShowModal(false)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default BullionTable;


