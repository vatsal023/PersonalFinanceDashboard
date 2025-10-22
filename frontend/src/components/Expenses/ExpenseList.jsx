const ExpenseList = ({ expenses }) => {
  if (!expenses.length)
    return <p className="text-gray-500 text-lg">No expenses added yet.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800 tracking-tight">Recent Expenses</h2>
      <div className="space-y-3">
        {expenses
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((exp) => (
            <div
              key={exp._id}
              className="bg-gray-50 flex justify-between items-center p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              {/* Left: Category + Date */}
              <div>
                <p className="font-semibold text-gray-900 text-lg">{exp.category}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(exp.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Right: Amount with color */}
              <div className="font-bold text-red-600 text-lg md:text-xl">
                ₹{exp.amount}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ExpenseList;
