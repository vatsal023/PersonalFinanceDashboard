const IncomeOverview = ({ totalIncome, totalSources, entryCount }) => {
  return (
    <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-6 shadow-sm">
      <div className="text-center flex-1">
        <p className="text-gray-600 text-sm">Total Income</p>
        <p className="text-xl font-bold text-green-700">₹{totalIncome}</p>
      </div>

      <div className="text-center flex-1 border-l border-gray-300">
        <p className="text-gray-600 text-sm">Total Categories</p>
        <p className="text-xl font-bold text-blue-700">{totalSources}</p>
      </div>

      <div className="text-center flex-1 border-l border-gray-300">
        <p className="text-gray-600 text-sm">Entries</p>
        <p className="text-xl font-bold text-yellow-700">{entryCount}</p>
      </div>
    </div>
  );
};

export default IncomeOverview;
