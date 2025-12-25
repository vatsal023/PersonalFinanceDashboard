import { FaCalendarAlt, FaTag } from "react-icons/fa";

const ExpenseList = ({ expenses }) => {
  if (!expenses.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No expenses added yet.</p>
        <p className="text-gray-400 text-sm mt-2">Start tracking your expenses to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .map((exp) => (
          <div
            key={exp._id}
            className="bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-center">
              {/* Left: Category + Date */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FaTag className="text-blue-600" />
                  <p className="font-bold text-gray-900 text-lg">{exp.category}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <FaCalendarAlt />
                  <p>
                    {new Date(exp.createdAt || exp.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {exp.description && (
                  <p className="text-gray-500 text-sm mt-1 italic">"{exp.description}"</p>
                )}
              </div>

              {/* Right: Amount */}
              <div className="text-right">
                <p className="font-bold text-red-600 text-2xl">
                  ₹{exp.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ExpenseList;

