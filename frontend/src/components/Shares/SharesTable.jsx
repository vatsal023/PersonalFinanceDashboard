import { useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

const SharesTable = ({ shares, setRefresh }) => {
  const [values, setValues] = useState({});
  const [endDates, setEndDates] = useState({});

  // const handleCurrValueChange = (id, val) => {
  //   setValues({ ...values, [id]: val });
  // };

  const handleEndDateChange = (id, val) => {
    setEndDates({ ...endDates, [id]: val });
  };

  // const updateCurrValue = async (id, share) => {
  //   try {
  //     await axios.put(`/api/shares/${id}`, {
  //       currValue: Number(values[id] ?? share.currValue),
  //     });
  //     setRefresh((prev) => !prev);
  //   } catch (error) {
  //     console.error("Error updating current value", error);
  //   }
  // };

  const markAsSold = async (id, livePrice) => {
    const endDate = endDates[id];
    if (!endDate) {
      alert("Please select an end date to mark as sold");
      return;
    }

    try {
      await axios.put(`/api/shares/${id}/sell`, {
        endDate,
        soldPrice: livePrice,
      });
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error marking as sold", error);
    }
  };

  const activeShares = shares.filter((s) => s.status === "active");
  const soldShares = shares.filter((s) => s.status === "sold");

  const activeTotalInvested = activeShares.reduce(
    (sum, s) => sum + s.amount * s.numberOfShares,
    0
  );
  const activeTotalCurrValue = activeShares.reduce(
    (sum, s) => sum + (s.price ?? s.currValue ?? 0) * s.numberOfShares,
    0
  );

  const activeTotalProfitLoss = activeTotalCurrValue - activeTotalInvested;

  const soldTotalProfitLoss = soldShares.reduce(
    (sum, s) => sum + ((s.soldPrice ?? s.price ?? 0) - s.amount) * s.numberOfShares,
    0
  );

  return (
    <div className="space-y-6">
      {/* Active Shares Table */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊</span> Active Shares
          </h3>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Company
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Exchange
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Buy Price
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Shares
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase">
                  Total Invested
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Live Price
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase">
                  Current Value
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  P/L
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeShares.length > 0 ? (
                activeShares.map((s) => {
                  const livePrice = s.price ?? s.currValue ?? 0;

                  const Invested = s.amount * s.numberOfShares;
                  const currValue = livePrice * s.numberOfShares;
                  const profitLoss = currValue - Invested;
                  const isProfit = profitLoss >= 0;

                  return (
                    <tr
                      key={s._id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900">
                          {s.companyName}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                          {s.exchange || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(s.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        ₹{s.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-gray-700">
                        {s.numberOfShares}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        ₹{Invested.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-gray-900">
                        ₹{livePrice ? livePrice.toFixed(2) : "—"}
                      </td>
                    
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        ₹{currValue.toFixed(2)}
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-bold ${isProfit ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {isProfit ? "+" : ""}₹{profitLoss.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="date"
                            value={endDates[s._id] ?? ""}
                            onChange={(e) =>
                              handleEndDateChange(s._id, e.target.value)
                            }
                            className="border border-gray-300 px-3 py-1.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="End Date"
                          />
                          <button
                            onClick={() => markAsSold(s._id, livePrice)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow"
                            title="Mark as Sold"
                          >
                            <FaCheck />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="py-12 text-center text-gray-500 text-lg"
                  >
                    No active shares found
                  </td>
                </tr>
              )}

              {/* Totals Row */}
              {activeShares.length > 0 && (
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50/30 font-bold border-t-2 border-gray-300">
                  <td className="py-4 px-4" colSpan="5">
                    <span className="text-gray-900">Total</span>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-900">
                    ₹{activeTotalInvested.toFixed(2)}
                  </td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 text-right text-gray-900">
                    ₹{activeTotalCurrValue.toFixed(2)}
                  </td>
          
                  <td
                    className={`py-4 px-4 text-right ${activeTotalProfitLoss >= 0
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {activeTotalProfitLoss >= 0 ? "+" : ""}
                    ₹{activeTotalProfitLoss.toFixed(2)}
                  </td>
                  <td colSpan="2" className="py-4 px-4"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sold Shares Table */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span> Sold Shares
          </h3>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Company
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Exchange
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Buy Price
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Shares
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Sold Price
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Total P/L
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Live Price
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  End Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {soldShares.length > 0 ? (
                soldShares.map((s) => {
                  const livePrice = s.price ?? s.currValue ?? 0;
                  const profitLoss = (s.soldPrice - s.amount) * s.numberOfShares;
                  const isProfit = profitLoss >= 0;

                  return (
                    <tr
                      key={s._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900">
                          {s.companyName}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                          {s.exchange || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(s.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        ₹{s.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-gray-700">
                        {s.numberOfShares}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-gray-900">
                        ₹{s.soldPrice?.toFixed(2) || "—"}
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-bold ${isProfit ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {isProfit ? "+" : ""}₹{profitLoss.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-gray-600">
                        ₹{livePrice.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {s.endDate
                          ? new Date(s.endDate).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="py-12 text-center text-gray-500 text-lg"
                  >
                    No sold shares found
                  </td>
                </tr>
              )}

              {/* Totals Row */}
              {soldShares.length > 0 && (
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 font-bold border-t-2 border-gray-300">
                  <td className="py-4 px-4" colSpan="6">
                    <span className="text-gray-900">Total Profit/Loss</span>
                  </td>
                  <td
                    className={`py-4 px-4 text-right ${soldTotalProfitLoss >= 0
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {soldTotalProfitLoss >= 0 ? "+" : ""}
                    ₹{soldTotalProfitLoss.toFixed(2)}
                  </td>
                  <td colSpan="2" className="py-4 px-4"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SharesTable;

