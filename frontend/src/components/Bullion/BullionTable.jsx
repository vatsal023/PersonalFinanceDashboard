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

  const renderRow = (b, isActive = true) => {
    const currentRate = Number(currentRates[b._id] ?? b.currentRate ?? b.rate)*(b.investments[0].purity / 24);
    const totalquantity = b.investments.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalinvested = b.investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
    const currentValue = totalquantity * currentRate;
    const profitLoss = currentValue - totalinvested;
    return (
      <tr
        key={b._id}
        className="text-center hover:bg-yellow-100/70 transition cursor-pointer group"
      >
        <td
          className="border px-2 py-2 text-primary font-semibold hover:underline"
          onClick={() => viewDetails(b._id)}
        >
          {b.name}
        </td>
        <td className="border px-2 py-2">{new Date(b.investments[0].date).toLocaleDateString()}</td>
        <td className="border px-2 py-2">{totalquantity}</td>
        <td className="border px-2 py-2">{b.investments[0].purity}</td>
        <td className="border px-2 py-2">₹{totalinvested.toFixed(2)}</td>
        {isActive ? (
          <>
            <td className="border px-2 py-2">
              <input
                type="number"
                value={currentRate.toFixed(2)}
                onChange={(e) => handleRateChange(b._id, e.target.value)}
                className="border p-1 w-20 rounded-lg focus:ring-2 focus:ring-yellow-300"
              />
              <button
                onClick={() => updateCurrentRate(b._id, b)}
                className="ml-2 px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg shadow font-bold hover:from-emerald-600 hover:to-emerald-700 transition"
              >
                Save
              </button>
            </td>
            <td className="border px-2 py-2 font-bold">₹{currentValue.toFixed(2)}</td>
            <td
              className={`border px-2 py-2 font-bold ${profitLoss >= 0 ? "text-green-700" : "text-red-600"}`}
            >
              ₹{profitLoss.toFixed(2)}
            </td>
            <td className="border px-2 py-2">
              <input
                type="date"
                onChange={(e) => (b.endDate = e.target.value)}
                className="border p-1 rounded-lg"
              />
            </td>
            <td className="border px-2 py-2">
              <input
                type="number"
                placeholder="Sold Price"
                onChange={(e) => handleSoldRateChange(b._id, e.target.value)}
                className="border p-1 w-20 rounded-lg"
              />
            </td>
            <td className="border px-2 py-2">
              <button
                onClick={() => markAsSold(b._id, b.endDate, soldRates[b._id])}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-xl shadow hover:from-rose-600 hover:to-orange-600 transition font-semibold"
              >
                Mark Sold
              </button>
            </td>
          </>
        ) : (
          <td className="border px-2 py-2">₹{b.soldRate}</td>
        )}
      </tr>
    );
  };

  // Totals for Active & Sold...
  const totalActive = activeBullions.reduce(
    (acc, b) => {
      const currentRate = Number(currentRates[b._id] ?? b.currentRate ?? b.rate) * (b.investments[0].purity / 24);
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

  const totalSold = soldBullions.reduce(
    (acc, b) => {
      const currentRate = Number(currentRates[b._id] ?? b.currentRate ?? b.rate) * (b.investments[0].purity / 24);
      const totalquantity = b.investments.reduce((sum, inv) => sum + inv.quantity, 0);
      const totalinvested = b.investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
      const currentValue = totalquantity * b.soldRate;
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
      {/* Active Bullions Table */}
      <h2 className="text-2xl font-extrabold mt-6 mb-2 text-emerald-700">Active Bullions</h2>
      <div className="overflow-hidden rounded-2xl shadow-xl mb-6 border border-gray-100">
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-gradient-to-r from-yellow-200 via-yellow-50 to-orange-100 text-center uppercase text-gray-700">
            <tr>
              {["Name", "Start Date", "Quantity(in gms)", "Purity", "Invested", "Current Rate(per gm)", "Current Value", "Profit/Loss", "End Date", "Sold Price(per gm)", "Action"].map((col) => (
                <th key={col} className="border px-2 py-3 font-semibold tracking-wide text-base">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeBullions.map((b) => renderRow(b, true))}
            <tr className="font-extrabold bg-yellow-50 text-center">
              <td colSpan="4" className="border px-2 py-3">Total</td>
              <td className="border px-2 py-3 bg-yellow-50">₹{totalActive.invested.toFixed(2)}</td>
              <td className="border px-2 py-3 bg-yellow-50">—</td>
              <td className="border px-2 py-3 bg-yellow-50">₹{totalActive.currentValue.toFixed(2)}</td>
              <td className={`border px-2 py-3 bg-yellow-50 ${totalActive.profitLoss >= 0 ? 'text-green-700':'text-red-700'}`}>₹{totalActive.profitLoss.toFixed(2)}</td>
              <td colSpan="3" className="border px-2 py-3 bg-yellow-50">—</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Sold Bullions Table */}
      <h2 className="text-2xl font-extrabold mt-8 mb-2 text-orange-700">Sold Bullions</h2>
      <div className="overflow-hidden rounded-2xl shadow-xl border border-gray-100">
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-gradient-to-r from-orange-100 via-yellow-50 to-yellow-200 text-center uppercase text-gray-700">
            <tr>
              {["Name", "Start Date", "Quantity(in gms)", "Purity", "Invested", "Sold Price(per gm)", "Total Profit/Loss", "Current Rate(per gm)", "End Date"].map((col) => (
                <th key={col} className="border px-2 py-3 font-semibold tracking-wide text-base">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {soldBullions.map((b) => {
              const currentRate = Number(currentRates[b._id] ?? b.currentRate ?? b.rate) * (b.investments[0].purity / 24);
              const totalquantity = b.investments.reduce((sum, inv) => sum + inv.quantity, 0);
              const totalinvested = b.investments.reduce((sum, inv) => sum + inv.amountInvested, 0);
              const currentValue = b.soldRate * totalquantity;
              const profitLoss = currentValue - totalinvested;
              return (
                <tr key={b._id} className="text-center hover:bg-orange-100/70 transition cursor-pointer group">
                  <td className="border px-2 py-2 text-primary font-semibold hover:underline" onClick={() => viewDetails(b._id)}>
                    {b.name}
                  </td>
                  <td className="border px-2 py-2">{new Date(b.investments[0].date).toLocaleDateString()}</td>
                  <td className="border px-2 py-2">{totalquantity}</td>
                  <td className="border px-2 py-2">{b.investments[0].purity}</td>
                  <td className="border px-2 py-2">₹{totalinvested.toFixed(2)}</td>
                  <td className="border px-2 py-2">₹{b.soldRate}</td>
                  <td className={`border px-2 py-2 font-bold ${profitLoss >= 0 ? 'text-green-700':'text-red-700'}`}>₹{profitLoss.toFixed(2)}</td>
                  <td className="border px-2 py-2">₹{currentRate.toFixed(2)}</td>
                  <td className="border px-2 py-2">{b.endDate ? new Date(b.endDate).toLocaleDateString() : '-'}</td>
                </tr>
              );
            })}
            <tr className="font-extrabold bg-orange-50 text-center">
              <td colSpan="4" className="border px-2 py-3">Total</td>
              <td className="border px-2 py-3 bg-orange-50">₹{totalSold.invested.toFixed(2)}</td>
              <td className="border px-2 py-3 bg-orange-50">—</td>
              <td className={`border px-2 py-3 bg-orange-50 ${totalSold.profitLoss >= 0 ? 'text-green-700':'text-red-700'}`}>₹{totalSold.profitLoss.toFixed(2)}</td>
              <td colSpan="2" className="border px-2 py-3 bg-orange-50">—</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Modal for Details */}
      {showModal && selectedBullion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white p-10 rounded-2xl shadow-2xl w-[min(94vw,600px)] max-h-[80vh] overflow-y-auto animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-center text-amber-800">
              {selectedBullion.name} <span className="font-normal text-gray-600">investments</span>
            </h2>
            {loading ? (
              <p className="text-center py-4">Loading details...</p>
            ) : (
              <table className="w-full border-collapse border text-base mb-2">
                <thead className="bg-yellow-50">
                  <tr>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Quantity (g)</th>
                    <th className="border px-4 py-2">Purity</th>
                    <th className="border px-4 py-2">Rate/g (₹)</th>
                    <th className="border px-4 py-2">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBullion.investments.map((inv, idx) => (
                    <tr key={idx} className="text-center hover:bg-yellow-100/60">
                      <td className="border px-4 py-2">{new Date(inv.date).toLocaleDateString()}</td>
                      <td className="border px-4 py-2">{inv.quantity}</td>
                      <td className="border px-4 py-2">{inv.purity}</td>
                      <td className="border px-4 py-2">₹{inv.rate.toFixed(2)}</td>
                      <td className="border px-4 py-2">₹{inv.amountInvested.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="text-center mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-amber-500 text-white px-7 py-2 rounded-xl hover:bg-amber-600 shadow font-semibold transition"
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
