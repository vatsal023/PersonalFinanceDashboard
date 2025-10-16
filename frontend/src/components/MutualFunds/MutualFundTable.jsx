import { useState, useMemo } from "react";
import axios from "axios";

const MutualFundTable = ({ mutualFunds, setRefresh }) => {
  const [navValues, setNavValues] = useState({});
  const [soldNavValues, setSoldNavValues] = useState({});
  const [selectedFund, setSelectedFund] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Split funds into active and sold
  const activeFunds = useMemo(() => mutualFunds.filter((f) => f.status === "active"), [mutualFunds]);
  const soldFunds = useMemo(() => mutualFunds.filter((f) => f.status === "sold"), [mutualFunds]);

  // Handle NAV input changes
  const handleNAVChange = (id, val) => {
    setNavValues({ ...navValues, [id]: val });
  };

  // Handle Sold NAV input change
  const handleSoldNAVChange = (id, val) => {
    setSoldNavValues({ ...soldNavValues, [id]: val });
  };

  // Update current NAV
  const updateNAV = async (id, mf) => {
    try {
      await axios.put(`/api/mutualfunds/${id}`, {
        currNAV: Number(navValues[id] ?? mf.currNAV),
      });
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error updating NAV", error);
    }
  };

  // Mark fund as sold (requires sold NAV + end date)
  const markAsSold = async (id, endDate, soldNav) => {
    if (!endDate || !soldNav) {
      alert("Please select an end date and enter sold NAV before marking as sold");
      return;
    }
    try {
      await axios.put(`/api/mutualfunds/${id}/sell`, {
        endDate,
        soldNAV: Number(soldNav),
      });
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error marking as sold", error);
    }
  };

  // View fund transaction details
  const viewDetails = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/mutualfunds/${id}`);
      setSelectedFund(res.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching fund details", error);
    } finally {
      setLoading(false);
    }
  };

  // === CALCULATE SUMMARY for ACTIVE FUNDS ===
  const activeSummary = useMemo(() => {
    let totalInvested = 0,
      totalCurrentValue = 0;
    activeFunds.forEach((mf) => {
      const invested = mf.investments.reduce((s, i) => s + i.amount, 0);
      const units = mf.investments.reduce((s, i) => s + i.units, 0);
      const currNAV = Number(navValues[mf._id] ?? mf.currNAV ?? 0);
      const currentValue = currNAV * units;
      totalInvested += invested;
      totalCurrentValue += currentValue;
    });
    return {
      totalInvested,
      totalCurrentValue,
      totalProfitLoss: totalCurrentValue - totalInvested,
    };
  }, [activeFunds, navValues]);

  // === CALCULATE SUMMARY for SOLD FUNDS ===
  const soldSummary = useMemo(() => {
    let totalProfitLoss = 0;
    soldFunds.forEach((mf) => {
      const invested = mf.investments.reduce((s, i) => s + i.amount, 0);
      const units = mf.investments.reduce((s, i) => s + i.units, 0);
      const soldNAV = mf.soldNAV ?? 0;
      totalProfitLoss += units * soldNAV - invested;
    });
    return { totalProfitLoss };
  }, [soldFunds]);

  // === RENDER TABLE ROW ===
  const renderRow = (mf, isActive = true) => {
    const totalInvested = mf.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalUnits = mf.investments.reduce((sum, inv) => sum + inv.units, 0);
    const currNAV = Number(navValues[mf._id] ?? mf.currNAV ?? mf.investments[mf.investments.length - 1].nav);
    const currentValue = totalUnits * currNAV;
    const profitLoss = currentValue - totalInvested;

    return (
      <tr key={mf._id} className="text-center">
        <td
          className="border px-4 py-2 cursor-pointer text-blue-600 hover:underline"
          onClick={() => viewDetails(mf._id)}
        >
          {mf.name}
        </td>
        <td className="border px-4 py-2">{new Date(mf.investments[0].date).toLocaleDateString()}</td>
        <td className="border px-4 py-2">₹{totalInvested.toFixed(2)}</td>
        <td className="border px-4 py-2">{totalUnits.toFixed(4)}</td>
        <td className="border px-4 py-2">{mf.frequency}</td>
        {isActive ? (
          <>
            <td className="border px-4 py-2">
              <input
                type="number"
                value={currNAV}
                onChange={(e) => handleNAVChange(mf._id, e.target.value)}
                className="border p-1 w-24 text-center"
              />
              <button
                onClick={() => updateNAV(mf._id, mf)}
                className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
              >
                Save
              </button>
            </td>
            <td className="border px-4 py-2">₹{currentValue.toFixed(2)}</td>
            <td className={`border px-4 py-2 ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{profitLoss.toFixed(2)}
            </td>
            <td className="border px-4 py-2">
              <input
                type="date"
                value={mf.endDate ?? ""}
                onChange={(e) => (mf.endDate = e.target.value)}
                className="border p-1 rounded"
              />
            </td>
            <td className="border px-4 py-2">
              <input
                type="number"
                placeholder="Sold NAV"
                value={soldNavValues[mf._id] ?? ""}
                onChange={(e) => handleSoldNAVChange(mf._id, e.target.value)}
                className="border p-1 w-24 text-center"
              />
            </td>
            <td className="border px-4 py-2">
              <button
                onClick={() => markAsSold(mf._id, mf.endDate, soldNavValues[mf._id])}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Mark Sold
              </button>
            </td>
          </>
        ) : null}
      </tr>
    );
  };

  return (
    <>
      {/* ACTIVE FUNDS TABLE */}
      <h2 className="text-xl font-semibold my-4 text-green-700 ">Active Mutual Funds</h2>
      <table className="w-full table-auto border-collapse border">
        <thead className="bg-gray-100 text-center">
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Start Date</th>
            <th className="border px-4 py-2">Amount Invested</th>
            <th className="border px-4 py-2">Total Units</th>
            <th className="border px-4 py-2">Frequency</th>
            <th className="border px-4 py-2">Current NAV</th>
            <th className="border px-4 py-2">Current Value</th>
            <th className="border px-4 py-2">Profit / Loss</th>
            <th className="border px-4 py-2">End Date</th>
            <th className="border px-4 py-2">Sold NAV</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>{activeFunds.map((mf) => renderRow(mf, true))}</tbody>

        {/* Summary row for active funds */}
        <tfoot>
          <tr className="bg-gray-100 font-semibold text-center">
            <td className="border px-4 py-2" colSpan="2">Total</td>
            <td className="border px-4 py-2" >₹{activeSummary.totalInvested.toFixed(2)}</td>
            <td colSpan="2"></td>
            <td></td>
            <td className="border px-4 py-2" >₹{activeSummary.totalCurrentValue.toFixed(2)}</td>
            <td className={`border px-4 py-2 ${activeSummary.totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{activeSummary.totalProfitLoss.toFixed(2)}
            </td>
            <td colSpan="3"></td>
          </tr>
        </tfoot>
      </table>

      {/* SOLD FUNDS TABLE */}
      <h2 className="text-xl font-semibold my-6 text-red-700 ">Sold Mutual Funds</h2>
      <table className="w-full table-auto border-collapse border">
        <thead className="bg-gray-100 text-center">
          <tr>
            <th className="border px-4 py-2">Fund</th>
            <th className="border px-4 py-2">Start</th>
            <th className="border px-4 py-2">Amount Invested</th>
            <th className="border px-4 py-2">Total Units</th>
            <th className="border px-4 py-2">Frequency</th>
            <th className="border px-4 py-2">Sold NAV</th>
            <th className="border px-4 py-2">Total Profit/Loss</th>
            <th className="border px-4 py-2">Current NAV</th>
            <th className="border px-4 py-2">End Date</th>
          </tr>
        </thead>
        <tbody>
          {soldFunds.map((mf) => {
            const invested = mf.investments.reduce((s, i) => s + i.amount, 0);
            const units = mf.investments.reduce((s, i) => s + i.units, 0);
            const soldNAV = mf.soldNAV ?? 0;
            const profitLoss = units * soldNAV - invested;
            return (
              <tr key={mf._id} className="text-center">
                <td
                  className="border px-4 py-2 cursor-pointer text-blue-600 hover:underline"
                  onClick={() => viewDetails(mf._id)}
                >
                  {mf.name}
                </td>
                <td className="border px-4 py-2">{new Date(mf.investments[0].date).toLocaleDateString()}</td>
                <td className="border px-4 py-2">₹{invested.toFixed(2)}</td>
                <td className="border px-4 py-2">{units.toFixed(4)}</td>
                <td className="border px-4 py-2">{mf.frequency}</td>
                <td className="border px-4 py-2">{soldNAV.toFixed(2)}</td>
                <td className={`border px-4 py-2 ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ₹{profitLoss.toFixed(2)}
                </td>
                <td className="border px-4 py-2">{mf.currNAV}</td>
                <td className="border px-4 py-2">{new Date(mf.endDate).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
        {/* Sold Summary */}
        <tfoot>
          <tr className="bg-gray-100 font-semibold text-center">
            <td  className="border px-4 py-2" colSpan="6">Total Profit/Loss</td>
            <td className={`border px-4 py-2 ${soldSummary.totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{soldSummary.totalProfitLoss.toFixed(2)}
            </td>
            <td colSpan="2" className="border px-4 py-2"></td>
          </tr>
        </tfoot>
      </table>

      {/* MODAL for details (same as before) */}
      {showModal && selectedFund && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl w-[600px] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              {selectedFund.name} — Transactions
            </h2>

            {loading ? (
              <p className="text-center py-4">Loading details...</p>
            ) : (
              <table className="w-full border-collapse border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2">Date</th>
                    <th className="border px-3 py-2">Amount (₹)</th>
                    <th className="border px-3 py-2">NAV</th>
                    <th className="border px-3 py-2">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFund.investments.map((inv, idx) => (
                    <tr key={idx} className="text-center hover:bg-gray-50">
                      <td className="border px-3 py-2">{new Date(inv.date).toLocaleDateString()}</td>
                      <td className="border px-3 py-2">₹{inv.amount.toFixed(2)}</td>
                      <td className="border px-3 py-2">{inv.nav.toFixed(2)}</td>
                      <td className="border px-3 py-2">{inv.units.toFixed(4)}</td>
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

export default MutualFundTable;
