import { useState, useMemo } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { toast } from "react-hot-toast";

const MutualFundTable = ({ mutualFunds, setRefresh }) => {
  const [navValues, setNavValues] = useState({});
  const [soldNavValues, setSoldNavValues] = useState({});
  const [endDates, setEndDates] = useState({});
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

  // Handle End Date change
  const handleEndDateChange = (id, val) => {
    setEndDates({ ...endDates, [id]: val });
  };

  // Update current NAV
  const updateNAV = async (id, mf) => {
    try {
      await axios.put(`/api/mutualfunds/${id}`, {
        currNAV: Number(navValues[id] ?? mf.currNAV),
      });
      toast.success("NAV updated successfully!");
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error updating NAV", error);
      toast.error("Failed to update NAV");
    }
  };

  // Mark fund as sold
  const markAsSold = async (id, endDate, soldNav) => {
    if (!endDate || !soldNav) {
      toast.error("Please select an end date and enter sold NAV before marking as sold");
      return;
    }
    try {
      await axios.put(`/api/mutualfunds/${id}/sell`, {
        endDate,
        soldNAV: Number(soldNav),
      });
      toast.success("Fund marked as sold successfully!");
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error marking as sold", error);
      toast.error("Failed to mark as sold");
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
      toast.error("Failed to load fund details");
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary for active funds
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

  // Calculate summary for sold funds
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

  return (
    <>
      {/* Active Funds Table */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊</span> Active Mutual Funds
          </h3>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Fund Name
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Invested
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Units
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Current NAV
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  P/L
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeFunds.length > 0 ? (
                activeFunds.map((mf) => {
                  const totalInvested = mf.investments.reduce((sum, inv) => sum + inv.amount, 0);
                  const totalUnits = mf.investments.reduce((sum, inv) => sum + inv.units, 0);
                  const currNAV = Number(navValues[mf._id] ?? mf.currNAV ?? mf.investments[mf.investments.length - 1]?.nav ?? 0);
                  const currentValue = totalUnits * currNAV;
                  const profitLoss = currentValue - totalInvested;
                  const isProfit = profitLoss >= 0;
                  const roi = totalInvested > 0 ? ((profitLoss / totalInvested) * 100).toFixed(2) : "0.00";

                  return (
                    <tr key={mf._id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2">
                          <span onClick={() => viewDetails(mf._id)} className="hover:underline">
                            {mf.name}
                          </span>
                          <FaEye
                            onClick={() => viewDetails(mf._id)}
                            className="text-blue-500 hover:text-blue-700 cursor-pointer"
                            title="View transactions"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(mf.investments[0]?.date || mf.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        ₹{totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-gray-700">
                        {totalUnits.toFixed(4)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {mf.frequency || "monthly"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            value={currNAV.toFixed(2)}
                            onChange={(e) => handleNAVChange(mf._id, e.target.value)}
                            className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-24 text-right"
                            step="0.01"
                            min="0"
                          />
                          <button
                            onClick={() => updateNAV(mf._id, mf)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow"
                            title="Save NAV"
                          >
                            <FaCheck />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-gray-900">
                        ₹{currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-4 px-4 text-right font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
                        {isProfit ? "+" : ""}₹{Math.abs(profitLoss).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <div className="text-xs font-normal mt-1">
                          ({isProfit ? "+" : ""}{roi}%)
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="date"
                            value={endDates[mf._id] ?? ""}
                            onChange={(e) => handleEndDateChange(mf._id, e.target.value)}
                            className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="End Date"
                          />
                          <input
                            type="number"
                            placeholder="Sold NAV"
                            value={soldNavValues[mf._id] ?? ""}
                            onChange={(e) => handleSoldNAVChange(mf._id, e.target.value)}
                            className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                            step="0.01"
                            min="0"
                          />
                          <button
                            onClick={() => markAsSold(mf._id, endDates[mf._id], soldNavValues[mf._id])}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow w-full"
                            title="Mark as Sold"
                          >
                            <FaCheck className="inline mr-1" />
                            Mark Sold
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-500 text-lg">
                    No active mutual funds found
                  </td>
                </tr>
              )}

              {/* Totals Row */}
              {activeFunds.length > 0 && (
                <tr className="bg-gradient-to-r from-gray-50 to-emerald-50/30 font-bold border-t-2 border-gray-300">
                  <td className="py-4 px-4" colSpan="2">
                    <span className="text-gray-900">Total</span>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-900">
                    ₹{activeSummary.totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan="2" className="py-4 px-4"></td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 text-right text-gray-900">
                    ₹{activeSummary.totalCurrentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`py-4 px-4 text-right ${
                      activeSummary.totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {activeSummary.totalProfitLoss >= 0 ? "+" : ""}₹
                    {Math.abs(activeSummary.totalProfitLoss).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-4 px-4"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sold Funds Table */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span> Sold Mutual Funds
          </h3>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Fund Name
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Invested
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Units
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Sold NAV
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Total P/L
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Current NAV
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  End Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {soldFunds.length > 0 ? (
                soldFunds.map((mf) => {
                  const invested = mf.investments.reduce((s, i) => s + i.amount, 0);
                  const units = mf.investments.reduce((s, i) => s + i.units, 0);
                  const soldNAV = mf.soldNAV ?? 0;
                  const profitLoss = units * soldNAV - invested;
                  const isProfit = profitLoss >= 0;

                  return (
                    <tr key={mf._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2">
                          <span onClick={() => viewDetails(mf._id)} className="hover:underline">
                            {mf.name}
                          </span>
                          <FaEye
                            onClick={() => viewDetails(mf._id)}
                            className="text-blue-500 hover:text-blue-700 cursor-pointer"
                            title="View transactions"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(mf.investments[0]?.date || mf.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        ₹{invested.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-gray-700">
                        {units.toFixed(4)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                          {mf.frequency || "monthly"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-gray-900">
                        ₹{soldNAV.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-bold ${
                          isProfit ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isProfit ? "+" : ""}₹
                        {Math.abs(profitLoss).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-gray-600">
                        ₹{(mf.currNAV || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {mf.endDate ? new Date(mf.endDate).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-500 text-lg">
                    No sold mutual funds found
                  </td>
                </tr>
              )}

              {/* Totals Row */}
              {soldFunds.length > 0 && (
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 font-bold border-t-2 border-gray-300">
                  <td className="py-4 px-4" colSpan="6">
                    <span className="text-gray-900">Total Profit/Loss</span>
                  </td>
                  <td
                    className={`py-4 px-4 text-right ${
                      soldSummary.totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {soldSummary.totalProfitLoss >= 0 ? "+" : ""}₹
                    {Math.abs(soldSummary.totalProfitLoss).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td colSpan="2" className="py-4 px-4"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedFund && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📊</span> {selectedFund.name} — Transactions
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading details...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                        <th className="border px-4 py-3 text-right font-semibold text-gray-700">Amount (₹)</th>
                        <th className="border px-4 py-3 text-right font-semibold text-gray-700">NAV</th>
                        <th className="border px-4 py-3 text-right font-semibold text-gray-700">Units</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFund.investments && selectedFund.investments.length > 0 ? (
                        selectedFund.investments.map((inv, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="border px-4 py-3 text-gray-700">
                              {new Date(inv.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="border px-4 py-3 text-right font-semibold text-gray-900">
                              ₹{inv.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="border px-4 py-3 text-right font-medium text-gray-700">
                              ₹{inv.nav.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="border px-4 py-3 text-right font-medium text-gray-700">
                              {inv.units.toFixed(4)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="border px-4 py-8 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl transition-all font-semibold"
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

