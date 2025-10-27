import axios from "axios";

const IncomeList = ({ incomes, setRefresh }) => {
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/income/${id}`);
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error deleting income:", error);
    }
  };

  if (!incomes || incomes.length === 0) {
    return <p className="text-gray-500 mt-6">No income entries found.</p>;
  }

  return (
    <div className="mt-6 divide-y divide-gray-200 bg-white rounded-xl shadow">
      {incomes.map((income) => (
        <div
          key={income._id}
          className="flex flex-wrap justify-between items-center py-4 px-4 hover:bg-gray-50 transition-all duration-150"
        >
          {/* Left section: Category + Date */}
          <div className="flex flex-col text-left min-w-[150px]">
            <p className="font-semibold text-gray-800 text-base">
              {income.category || "—"}
            </p>
            <p className="text-sm text-gray-500">
              {income.date
                ? new Date(income.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : ""}
            </p>
          </div>

          {/* Middle section: Notes */}
          <div className="flex-1 text-center text-gray-600 text-sm break-words">
            {income.notes?.trim() ? income.notes : "-"}
          </div>

          {/* Right section: Amount + Delete */}
          <div className="flex flex-col items-end min-w-[100px]">
            <p className="font-semibold text-green-600 text-lg">
              ₹{income.amount}
            </p>
            <button
              onClick={() => handleDelete(income._id)}
              className="text-red-500 text-xs hover:underline mt-1"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IncomeList;
