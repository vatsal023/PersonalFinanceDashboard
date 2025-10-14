const SharesOverview = ({ totalInvested, totalCurrentValue, totalProfitLoss, entryCount }) => {
  const card = "bg-white rounded-xl p-4 shadow flex flex-col items-center justify-center text-center hover:shadow-lg transition";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className={card}>
        <h3 className="text-sm font-medium text-gray-600">Total Invested</h3>
        <p className="text-lg font-semibold text-blue-600">₹{totalInvested}</p>
      </div>
      <div className={card}>
        <h3 className="text-sm font-medium text-gray-600">Current Value</h3>
        <p className="text-lg font-semibold text-green-600">₹{totalCurrentValue}</p>
      </div>
      <div className={card}>
        <h3 className="text-sm font-medium text-gray-600">Profit / Loss</h3>
        <p className={`text-lg font-semibold ${totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
          ₹{totalProfitLoss}
        </p>
      </div>
      <div className={card}>
        <h3 className="text-sm font-medium text-gray-600">Total Entries</h3>
        <p className="text-lg font-semibold text-purple-600">{entryCount}</p>
      </div>
    </div>
  );
};

export default SharesOverview;
