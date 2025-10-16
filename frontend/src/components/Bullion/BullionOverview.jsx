const BullionOverview = ({ totalInvested, totalCurrentValue, totalProfitLoss, entryCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <p className="text-gray-500 text-sm">Total Invested</p>
        <h3 className="text-xl font-semibold text-blue-600">₹{totalInvested}</h3>
      </div>
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <p className="text-gray-500 text-sm">Current Value</p>
        <h3 className="text-xl font-semibold text-green-600">₹{totalCurrentValue}</h3>
      </div>
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <p className="text-gray-500 text-sm">Profit / Loss</p>
        <h3 className={`text-xl font-semibold ${totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
          ₹{totalProfitLoss}
        </h3>
      </div>
      <div className="bg-white p-4 rounded-xl shadow text-center">
        <p className="text-gray-500 text-sm">Total Entries</p>
        <h3 className="text-xl font-semibold text-purple-600">{entryCount}</h3>
      </div>
    </div>
  );
};

export default BullionOverview;


