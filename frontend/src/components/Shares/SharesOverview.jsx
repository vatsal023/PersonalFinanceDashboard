const SharesOverview = ({
  totalInvested,
  totalCurrentValue,
  totalProfitLoss,
  entryCount,
}) => {
  const profitLossNum = parseFloat(totalProfitLoss);
  const isProfit = profitLossNum >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Invested Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-blue-600 uppercase text-xs font-bold tracking-wide mb-1">
              Total Invested
            </p>
            <p className="text-2xl font-bold text-blue-700">
              ₹{parseFloat(totalInvested).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <span className="text-2xl">💵</span>
          </div>
        </div>
      </div>

      {/* Current Value Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-emerald-600 uppercase text-xs font-bold tracking-wide mb-1">
              Current Value
            </p>
            <p className="text-2xl font-bold text-emerald-700">
              ₹{parseFloat(totalCurrentValue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <span className="text-2xl">📈</span>
          </div>
        </div>
      </div>

      {/* Profit/Loss Card */}
      <div
        className={`${
          isProfit
            ? "bg-gradient-to-br from-green-50 to-green-100/50 border-green-200"
            : "bg-gradient-to-br from-red-50 to-red-100/50 border-red-200"
        } border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1`}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p
              className={`${
                isProfit ? "text-green-600" : "text-red-600"
              } uppercase text-xs font-bold tracking-wide mb-1`}
            >
              Profit / Loss
            </p>
            <p
              className={`text-2xl font-bold ${
                isProfit ? "text-green-700" : "text-red-700"
              }`}
            >
              {isProfit ? "+" : ""}₹
              {Math.abs(profitLossNum).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            {totalInvested > 0 && (
              <p className={`text-sm mt-1 ${isProfit ? "text-green-600" : "text-red-600"}`}>
                {((profitLossNum / parseFloat(totalInvested)) * 100).toFixed(2)}% ROI
              </p>
            )}
          </div>
          <div
            className={`w-14 h-14 rounded-xl ${
              isProfit ? "bg-green-500/20" : "bg-red-500/20"
            } flex items-center justify-center`}
          >
            <span className="text-2xl">{isProfit ? "💰" : "📉"}</span>
          </div>
        </div>
      </div>

      {/* Total Entries Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-purple-600 uppercase text-xs font-bold tracking-wide mb-1">
              Total Entries
            </p>
            <p className="text-2xl font-bold text-purple-700">{entryCount}</p>
            <p className="text-sm text-purple-600 mt-1">Active holdings</p>
          </div>
          <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharesOverview;

