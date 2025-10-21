import { useState } from "react";
import axios from "axios";
import { categories } from "../../data/categories";

const AddExpenseModal = ({ onClose, onExpenseAdded, selectedMonth }) => {
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(selectedMonth + "-01"); // default to first day of selected month

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/expenses",
        { category, amount: parseFloat(amount), description, date },
        { withCredentials: true }
      );
      onExpenseAdded();
    } catch (err) {
      console.error("Failed to add expense:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-5 text-gray-900">Add New Expense</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded w-full hover:bg-blue-700 transition font-semibold"
          >
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
