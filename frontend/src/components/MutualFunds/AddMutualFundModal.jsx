import { useState } from "react";
import axios from "axios";

const AddMutualFundModal = ({ setRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    amount: "",
    nav: "",
    frequency: "monthly",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const investment = {
        date: new Date(form.startDate),
        amount: Number(form.amount),
        nav: Number(form.nav),
        units: Number(form.amount) / Number(form.nav),
      };

      // Check if fund already exists
      const res = await axios.get("/api/mutualfunds");
      const existingFund = res.data.find(
        (mf) => mf.name.toLowerCase() === form.name.toLowerCase()
      );

      if (existingFund) {
        // Merge investments
        existingFund.investments.push(investment);
        await axios.put(`/api/mutualfunds/${existingFund._id}`, { investments: existingFund.investments });
      } else {
        // Create new fund
        await axios.post("/api/mutualfunds", {
          name: form.name,
          frequency: form.frequency,
          investments: [investment],
          status: "active",
        });
      }

      setRefresh((prev) => !prev);
      setIsOpen(false);
      setForm({ name: "", startDate: "", amount: "", nav: "", frequency: "monthly" });
    } catch (error) {
      console.error("Error adding mutual fund:", error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Add Mutual Fund
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-xl font-semibold mb-4">Add Mutual Fund</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Fund Name"
                value={form.name}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <input
                type="number"
                name="amount"
                placeholder="Investment Amount"
                value={form.amount}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <input
                type="number"
                name="nav"
                placeholder="NAV per unit"
                value={form.nav}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <select
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              >
                <option value="monthly">Monthly SIP</option>
                <option value="yearly">Yearly SIP</option>
                <option value="one-time">One-Time Lump Sum</option>
              </select>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
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

export default AddMutualFundModal;
