import { useState } from "react";
import axios from "axios";

const AddShareModal = ({ setRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
     exchange: "",
    startDate: "",
    amount: "",
    numberOfShares: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.companyName || !form.startDate || !form.amount || !form.numberOfShares) {
      alert("Please fill all fields");
      return;
    }

    try {
      // send the form as is; mongoose will handle numbers and dates
      await axios.post("/api/shares", form);

      setShowModal(false);
      setForm({ companyName: "", startDate: "", amount: "", numberOfShares: "" });
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error adding share:", error.response?.data || error);
      alert("Failed to add share. Check console for details.");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
      >
        Add Share
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Add New Share</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={form.companyName}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />

              <select
                name="exchange"
                value={form.exchange || ""}
                onChange={(e) => setForm({ ...form, exchange: e.target.value })}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Exchange</option>
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>

              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                name="amount"
                placeholder="Buying Price"
                value={form.amount}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                name="numberOfShares"
                placeholder="No. of Shares"
                value={form.numberOfShares}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddShareModal;
