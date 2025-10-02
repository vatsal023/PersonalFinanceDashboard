import { useState } from "react";
import axios from "axios";

const categories = [
  "Food & Dining",
  "Bills & Utilities",
  "Entertainment",
  "Transport",
  "Shopping",
  "Health",
  "Miscellaneous",
];

const BudgetForm = ({ onBudgetAdded }) => {
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7); // YYYY-MM
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Send request with credentials (cookies)
      const res = await axios.post(
        "/api/budgets",
        { category, amount: Number(amount), month },
        { withCredentials: true }
      );

      onBudgetAdded(res.data); // callback to refresh list
      setAmount(""); // reset form
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to add budget. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow-md w-full max-w-md"
    >
      <h2 className="text-lg font-semibold mb-4">Add Budget</h2>

      <label className="block mb-2">
        Category:
        <select
          className="w-full border p-2 rounded mt-1"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </label>

      <label className="block mb-2">
        Amount:
        <input
          type="number"
          className="w-full border p-2 rounded mt-1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>

      <label className="block mb-4">
        Month:
        <input
          type="month"
          className="w-full border p-2 rounded mt-1"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
        />
      </label>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Saving..." : "Add Budget"}
      </button>
    </form>
  );
};

export default BudgetForm;
