const BudgetList = ({ budgets }) => {
  if (!budgets || budgets.length === 0) {
    return <p className="mt-4 text-gray-600">No budgets set yet.</p>;
  }

  return (
    <div className="mt-6 w-full max-w-lg">
      <h2 className="text-lg font-semibold mb-4">Budgets</h2>
      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = Math.min((budget.spent / budget.budget) * 100, 100);

          return (
            <div key={budget.category} className="bg-white p-4 rounded shadow-md">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{budget.category}</span>
                <span className="text-sm text-gray-600">
                  ₹{budget.spent} / ₹{budget.budget}
                </span>
              </div>

              <div className="w-full bg-gray-200 h-4 rounded">
                <div
                  className={`h-4 rounded ${
                    budget.spent > budget.budget ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              {budget.spent > budget.budget && (
                <p className="text-red-500 text-sm mt-1">Over budget!</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetList;
