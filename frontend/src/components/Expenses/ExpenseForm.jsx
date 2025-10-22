import { useState } from "react";
import { categories } from "../../data/categories";
import axios from "axios";

const ExpenseForm = ({ onExpenseAdded }) => {
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/expenses",
        { category, amount: parseFloat(amount), description },
        { withCredentials: true }
      );
      setAmount("");
      setDescription("");
      onExpenseAdded();
    } catch (err) {
      console.error("Failed to add expense:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Add New Expense</h2>
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded flex-1"
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
          className="border p-2 rounded flex-1"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
