import { useState } from "react";
import axios from "axios";

const SharesTable = ({ shares, setRefresh }) => {
  const [values, setValues] = useState({});
  const [endDates, setEndDates] = useState({});

  const handleCurrValueChange = (id, val) => {
    setValues({ ...values, [id]: val });
  };

  const handleEndDateChange = (id, val) => {
    setEndDates({ ...endDates, [id]: val });
  };

  const updateCurrValue = async (id, share) => {
    try {
      await axios.put(`/api/shares/${id}`, {
        currValue: Number(values[id] ?? share.currValue),
      });
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error updating current value", error);
    }
  };

  const markAsSold = async (id, livePrice) => {
    const endDate = endDates[id];
    if (!endDate) {
      alert("Please select an end date to mark as sold");
      return;
    }


    try {
      await axios.put(`/api/shares/${id}/sell`, { endDate, soldPrice: livePrice });
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error marking as sold", error);
    }
  };

  const activeShares = shares.filter((s) => s.status === "active");
  const soldShares = shares.filter((s) => s.status === "sold");

  const activeTotalInvested = activeShares.reduce((sum, s) => sum + (s.amount) * (s.numberOfShares), 0);
  const activeTotalCurrValue = activeShares.reduce(
    (sum, s) => sum + (s.price ?? s.currValue ?? 0) * s.numberOfShares,
    0
  );

  const activeTotalProfitLoss = activeShares.reduce(
    (sum, s) => sum + ((s.price ?? s.currValue ?? 0) - s.amount) * s.numberOfShares,
    0
  );

  const soldTotalProfitLoss = soldShares.reduce(
    (sum, s) => sum + ((s.soldPrice ?? s.price ?? 0) - s.amount) * s.numberOfShares,
    0
  );
  // const totalCurrValue = shares.reduce(
  //   (sum, s) => sum + (s.currValue || 0),
  //   0
  // );
  // const totalProfitLoss = shares.reduce(
  //   (sum, s) => sum + ((s.currValue || 0) - s.amount) * s.numberOfShares,
  //   0
  // );

  return (
     <div className="space-y-12">
       {/* Active Shares Table */}
    <div className="text-left bg-white p-6 rounded-xl shadow hover:shadow-xl transition overflow-x-auto">
       <h3 className="text-xl font-semibold mb-4">Active Shares</h3>
      <table className="w-full table-auto border-collapse border">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border px-4 py-2 w-56">Company Name</th>
             <th className="border px-4 py-2">Exchange</th>  {/* New Column */}
            <th className="border px-4 py-2">Start Date</th>
            <th className="border px-4 py-2">Buying Price</th>
            <th className="border px-4 py-2">No. of Shares</th>
            <th className="border px-4 py-2">Live Price</th>
            <th className="border px-4 py-2">Change</th>
            <th className="border px-4 py-2">% Change</th>
            <th className="border px-4 py-2">Profit / Loss</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">End Date</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {activeShares.map((s) => {
            const livePrice = s.price ?? s.currValue ?? 0;
            const profitLoss = (livePrice - s.amount) * s.numberOfShares;
            return (
              <tr key={s._id} className="text-center">
                <td className="border px-4 py-2">{s.companyName}</td>
                <td className="border px-4 py-2">{s.exchange}</td> {/* Display exchange */}
                <td className="border px-4 py-2">
                  {new Date(s.startDate).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">₹{s.amount}</td>
                <td className="border px-4 py-2">{s.numberOfShares}</td>

                {/* 🔥 Live Price */}
                <td className="border px-4 py-2">
                  ₹{livePrice ? livePrice.toFixed(2) : "—"}
                </td>

                {/* 🔥 Daily Change */}
                <td
                  className={`border px-4 py-2 ${s.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {s.change ? s.change.toFixed(2) : "—"}
                </td>

                {/* 🔥 Percent Change */}
                <td
                  className={`border px-4 py-2 ${s.percentChange >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {s.percentChange ? s.percentChange.toFixed(2) + "%" : "—"}
                </td>

                {/* 🔥 Profit/Loss */}
                <td
                  className={`border px-4 py-2 ${profitLoss >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                >
                  ₹{profitLoss.toFixed(2)}
                </td>

                {/* Status */}
                <td className="border px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-white ${s.status === "active" ? "bg-green-500" : "bg-red-500"
                      }`}
                  >
                    {s.status.toUpperCase()}
                  </span>
                </td>

                {/* End Date */}
                <td className="border px-4 py-2">
                  {s.status === "active" ? (
                    <input
                      type="date"
                      value={endDates[s._id] ?? ""}
                      onChange={(e) =>
                        handleEndDateChange(s._id, e.target.value)
                      }
                      className="border p-1 rounded"
                    />
                  ) : s.endDate ? (
                    new Date(s.endDate).toLocaleDateString()
                  ) : (
                    "-"
                  )}
                </td>

                {/* Mark Sold Button */}
                <td className="border px-4 py-2">
                  {s.status === "active" && (
                    <button
                      onClick={() => markAsSold(s._id, s.price ?? s.currValue ?? 0)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Mark Sold
                    </button>
                  )}
                </td>
              </tr>
            );
          })}

          {/* Totals */}
          <tr className="font-semibold bg-gray-50 text-center">
            <td className="border px-4 py-2" colSpan="3">
              Total
            </td>
            <td className="border px-4 py-2">₹{activeTotalInvested.toFixed(2)}</td>
            <td className="border px-4 py-2"></td>


            <td className="border px-4 py-2">₹{activeTotalCurrValue.toFixed(2)}</td>
            <td colSpan="2" className="border px-4 py-2"></td>
            <td
              className={`border px-4 py-2 ${activeTotalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
                }`}
            >
              ₹{activeTotalProfitLoss.toFixed(2)}
            </td>
            <td colSpan="3" className="border px-4 py-2"></td>
          </tr>
        </tbody>
      </table>
    </div>

      {/* Sold Shares Table */}
      <div className="text-left bg-white p-6 rounded-xl shadow hover:shadow-xl transition overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4">Sold Shares</h3>
            <table className="w-full table-auto border-collapse border">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border px-4 py-2">Company Name</th>
              <th className="border px-4 py-2">Exchange</th>  {/* New Column */}
              <th className="border px-4 py-2">Start Date</th>
              <th className="border px-4 py-2">Buying Price</th>
              <th className="border px-4 py-2">No. of Shares</th>
              <th className="border px-4 py-2">Sold Price</th>
              <th className="border px-4 py-2">Total Profit/Loss</th>
              <th className="border px-4 py-2">Live Price</th>
              <th className="border px-4 py-2">End Date</th>
            </tr>
          </thead>
          <tbody>
            {soldShares.map((s) => {
              const livePrice = s.price ?? s.currValue ?? 0;
              const profitLoss = (s.soldPrice - s.amount) * s.numberOfShares;
              return (
                <tr key={s._id} className="text-center">
                  <td className="border px-4 py-2">{s.companyName}</td>
                  <td className="border px-4 py-2">{s.exchange}</td> {/* Display exchange */}
                  <td className="border px-4 py-2">{new Date(s.startDate).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">₹{s.amount}</td>
                  <td className="border px-4 py-2">{s.numberOfShares}</td>
                  <td className="border px-4 py-2">₹{s.soldPrice?.toFixed(2)}</td>
                  <td className={`border px-4 py-2 ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{profitLoss.toFixed(2)}
                  </td>
                  <td className="border px-4 py-2">₹{livePrice.toFixed(2)}</td>
                  <td className="border px-4 py-2">{new Date(s.endDate).toLocaleDateString()}</td>
                </tr>
              );
            })}
            <tr className="font-semibold bg-gray-50 text-center">
              <td className="border px-4 py-2" colSpan="6">Total Profit/Loss</td>
              <td className={`border px-4 py-2 ${soldTotalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                ₹{soldTotalProfitLoss.toFixed(2)}
              </td>
              <td colSpan="2" className="border px-4 py-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
  );
};

export default SharesTable;
