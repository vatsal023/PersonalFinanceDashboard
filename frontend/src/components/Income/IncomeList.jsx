import axios from "axios";
import { FaTrash, FaCalendarAlt, FaTag, FaRupeeSign, FaFileAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";

const IncomeList = ({ incomes, setRefresh }) => {
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income entry?")) {
      return;
    }

    try {
      await axios.delete(`/api/income/${id}`);
      toast.success("Income entry deleted successfully!");
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error("Failed to delete income entry. Please try again.");
    }
  };

  if (!incomes || incomes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No income entries found.</p>
        <p className="text-gray-400 text-sm mt-2">Add income entries to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incomes
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        .map((income) => (
          <div
            key={income._id}
            className="bg-gradient-to-r from-emerald-50 to-green-50/50 border border-emerald-200 rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start">
              {/* Left: Category + Date + Notes */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FaTag className="text-emerald-600" />
                  <p className="font-bold text-gray-900 text-lg">{income.category || "—"}</p>
                </div>
                <div className="flex items-center gap-4 text-gray-600 text-sm mb-2">
                  <div className="flex items-center gap-1">
                    <FaCalendarAlt />
                    <span>
                      {income.date
                        ? new Date(income.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                </div>
                {income.notes?.trim() && (
                  <div className="flex items-start gap-2 text-gray-600 text-sm mt-2">
                    <FaFileAlt className="mt-0.5" />
                    <p className="italic">"{income.notes}"</p>
                  </div>
                )}
              </div>

              {/* Right: Amount + Delete */}
              <div className="text-right flex flex-col items-end gap-2">
                <p className="font-bold text-emerald-600 text-2xl">
                  <FaRupeeSign className="inline text-lg" />
                  {income.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <button
                  onClick={() => handleDelete(income._id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all text-sm font-semibold flex items-center gap-1"
                  title="Delete income entry"
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default IncomeList;

