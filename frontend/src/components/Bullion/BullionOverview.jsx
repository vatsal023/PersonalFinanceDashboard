const BullionOverview = ({ totalInvested, totalCurrentValue, totalProfitLoss, entryCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 mb-7">
      <div className="bg-gradient-to-br from-yellow-100 via-yellow-300 to-orange-50 p-7 rounded-2xl shadow-xl flex flex-col items-center justify-center ring-1 ring-yellow-200">
        <p className="text-yellow-800 font-semibold text-sm mb-1 tracking-wide">Total Invested</p>
        <h3 className="text-3xl font-extrabold text-yellow-900 tracking-tight">₹{totalInvested}</h3>
      </div>
      <div className="bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-200 p-7 rounded-2xl shadow-xl flex flex-col items-center justify-center ring-1 ring-emerald-100">
        <p className="text-emerald-800 font-semibold text-sm mb-1 tracking-wide">Current Value</p>
        <h3 className="text-3xl font-extrabold text-emerald-900 tracking-tight">₹{totalCurrentValue}</h3>
      </div>
      <div className="bg-gradient-to-br from-orange-50 via-slate-50 to-red-50 p-7 rounded-2xl shadow-xl flex flex-col items-center justify-center ring-1 ring-orange-100">
        <p className="text-orange-800 font-semibold text-sm mb-1 tracking-wide">Profit / Loss</p>
        <h3 className={`text-3xl font-extrabold ${totalProfitLoss >= 0 ? 'text-green-700':'text-red-700'}`}>₹{totalProfitLoss}</h3>
      </div>
      <div className="bg-gradient-to-br from-gray-50 via-indigo-100 to-purple-100 p-7 rounded-2xl shadow-xl flex flex-col items-center justify-center ring-1 ring-purple-100">
        <p className="text-purple-800 font-semibold text-sm mb-1 tracking-wide">Total Entries</p>
        <h3 className="text-3xl font-extrabold text-purple-900 tracking-tight">{entryCount}</h3>
      </div>
    </div>
  );
};

export default BullionOverview;
