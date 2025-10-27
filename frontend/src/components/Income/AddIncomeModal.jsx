import { useState } from "react";
import axios from "axios";

const AddIncomeModal = ({ setRefresh }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    date: "",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/income", formData);
      setFormData({ category: "", amount: "", date: "", notes: "" });
      setShow(false);
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="bg-green-500 text-white px-4 py-2 rounded-md"
      >
        + Add Income
      </button>

      {show && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md w-96"
          >
            <h3 className="text-lg font-semibold mb-4">Add Income</h3>

            <label className="block mb-2">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="border p-2 rounded-md w-full mb-3"
            />

            <label className="block mb-2">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="border p-2 rounded-md w-full mb-3"
            />

            <label className="block mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="border p-2 rounded-md w-full mb-3"
            />

            <label className="block mb-2">Notes (optional)</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border p-2 rounded-md w-full mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShow(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AddIncomeModal;
