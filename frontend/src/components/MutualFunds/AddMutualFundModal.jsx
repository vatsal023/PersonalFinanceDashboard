import { useState } from "react";
import axios from "axios";
import { FaTimes, FaPlus, FaFileAlt, FaCalendarAlt, FaRupeeSign, FaChartLine, FaClock } from "react-icons/fa";
import { toast } from "react-hot-toast";

const AddMutualFundModal = ({ setRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    amount: "",
    nav: "",
    frequency: "monthly",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.startDate || !form.amount || !form.nav) {
      toast.error("Please fill all required fields");
      return;
    }

    if (parseFloat(form.amount) <= 0 || parseFloat(form.nav) <= 0) {
      toast.error("Amount and NAV must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const investment = {
        date: form.startDate,
        amount: Number(form.amount),
        nav: Number(form.nav),
        units: Number(form.amount) / Number(form.nav),
      };

      // Check if fund already exists
      setIsChecking(true);
      const res = await axios.get("/api/mutualfunds");
      const existingFund = res.data.find(
        (mf) => mf.name.toLowerCase() === form.name.toLowerCase() && mf.status === "active"
      );

      if (existingFund) {
        // Merge investments
        existingFund.investments.push(investment);
        await axios.put(`/api/mutualfunds/${existingFund._id}`, {
          investments: existingFund.investments,
        });
        toast.success(`Investment added to existing fund: ${form.name}`);
      } else {
        // Create new fund
        await axios.post("/api/mutualfunds", {
          name: form.name,
          frequency: form.frequency,
          investments: [investment],
          status: "active",
        });
        toast.success("Mutual fund added successfully!");
      }

      setRefresh((prev) => !prev);
      setIsOpen(false);
      setForm({ name: "", startDate: "", amount: "", nav: "", frequency: "monthly" });
    } catch (error) {
      console.error("Error adding mutual fund:", error);
      toast.error(error.response?.data?.message || "Failed to add mutual fund. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsChecking(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setForm({ name: "", startDate: "", amount: "", nav: "", frequency: "monthly" });
  };

  // Calculate units automatically
  const calculatedUnits = form.amount && form.nav
    ? (Number(form.amount) / Number(form.nav)).toFixed(4)
    : "0.0000";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center gap-2 transform hover:-translate-y-0.5"
      >
        <FaPlus />
        Add Mutual Fund
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaPlus />
                Add New Mutual Fund
              </h3>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaFileAlt className="inline mr-2 text-blue-600" />
                  Fund Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., SBI Bluechip Fund"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  If the fund exists, the investment will be added to it
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaCalendarAlt className="inline mr-2 text-purple-600" />
                  Investment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaRupeeSign className="inline mr-2 text-green-600" />
                    Investment Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="₹0.00"
                    value={form.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaChartLine className="inline mr-2 text-blue-600" />
                    NAV per Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="nav"
                    placeholder="0.00"
                    value={form.nav}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Calculated Units Display */}
              {form.amount && form.nav && Number(form.amount) > 0 && Number(form.nav) > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Units to be allocated:</span>{" "}
                    <span className="font-bold text-lg">{calculatedUnits}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaClock className="inline mr-2 text-orange-600" />
                  Investment Frequency
                </label>
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                  disabled={isSubmitting}
                >
                  <option value="monthly">Monthly SIP</option>
                  <option value="yearly">Yearly SIP</option>
                  <option value="one-time">One-Time Lump Sum</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isChecking}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting || isChecking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isChecking ? "Checking..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Fund
                    </>
                  )}
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

