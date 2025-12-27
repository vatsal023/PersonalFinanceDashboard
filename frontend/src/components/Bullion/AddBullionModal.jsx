import { useState } from "react";
import axios from "axios";

const AddBullionModal = ({ setRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    date: "",
    quantity: "",
    purity: "",
    rate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const investment = {
        date: new Date(form.date),
        quantity: Number(form.quantity),
        purity: Number(form.purity),
        rate: Number(form.rate),
        amountInvested: Number(form.quantity) * Number(form.rate) * (Number(form.purity) / 24),
      };
      const res = await axios.get("/api/bullions");
      const existing = res.data.find(
        (b) => b.status === "active" && b.name.toLowerCase() === form.name.toLowerCase() && b.investments[0].purity === Number(form.purity)
      );
      if (existing) {
        existing.investments.push(investment);
        await axios.put(`/api/bullions/${existing._id}`, { investments: existing.investments });
      } else {
        await axios.post("/api/bullions", { name: form.name, investments: [investment], status: "active" });
      }
      setRefresh((prev) => !prev);
      setIsOpen(false);
      setForm({ name: "", date: "", quantity: "", purity: "", rate: "" });
    } catch (error) {
      setError("Could not add bullion. Please check values.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition font-semibold"
      >
        Add Bullion
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-in fade-in-0">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-8 relative animate-in zoom-in-95">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Add New Bullion</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Bullion Name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white"
                required
              />
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white"
                required
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity (grams)"
                value={form.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white"
                required
              />
              <input
                type="number"
                name="purity"
                placeholder="Purity (24 = pure gold)"
                value={form.purity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white"
                required
              />
              <input
                type="number"
                name="rate"
                placeholder="Rate per gram (INR)"
                value={form.rate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white"
                required
              />
              {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg text-center">{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-semibold text-gray-600 shadow-sm"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Bullion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddBullionModal;
