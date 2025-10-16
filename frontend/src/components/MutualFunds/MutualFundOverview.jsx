const MutualFundOverview = ({ totalInvested, totalCurrentValue, totalProfitLoss,totalUnits, entryCount }) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow">
        <h4 className="font-medium">Total Invested</h4>
        <p className="text-xl font-semibold">₹{totalInvested}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h4 className="font-medium">Current Value</h4>
        <p className="text-xl font-semibold">₹{totalCurrentValue}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h4 className="font-medium">Profit / Loss</h4>
        <p
          className={`text-xl font-semibold ${
            totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ₹{totalProfitLoss}
        </p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h4 className="font-medium">Entries</h4>
        <p className="text-xl font-semibold">{entryCount}</p>
      </div>
    </div>
  );
};

export default MutualFundOverview;
