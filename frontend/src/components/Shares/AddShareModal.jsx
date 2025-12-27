import { useState } from "react";
import axios from "axios";
import { FaTimes, FaPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";

const AddShareModal = ({ setRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    exchange: "",
    startDate: "",
    amount: "",
    numberOfShares: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.companyName || !form.startDate || !form.amount || !form.numberOfShares) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/shares", form);
      toast.success("Share added successfully!");
      setShowModal(false);
      setForm({
        companyName: "",
        exchange: "",
        startDate: "",
        amount: "",
        numberOfShares: "",
      });
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error adding share:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Failed to add share. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setForm({
      companyName: "",
      exchange: "",
      startDate: "",
      amount: "",
      numberOfShares: "",
    });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center gap-2 transform hover:-translate-y-0.5"
      >
        <FaPlus />
        Add Share
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Add New Share</h3>
              <button
                onClick={handleClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                disabled={isSubmitting}
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="e.g., Reliance Industries"
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Exchange <span className="text-red-500">*</span>
                </label>
                <select
                  name="exchange"
                  value={form.exchange || ""}
                  onChange={(e) =>
                    setForm({ ...form, exchange: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Exchange</option>
                  <option value="NSE">NSE (National Stock Exchange)</option>
                  <option value="BSE">BSE (Bombay Stock Exchange)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Buying Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="₹0.00"
                    value={form.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    No. of Shares <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="numberOfShares"
                    placeholder="0"
                    value={form.numberOfShares}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Share
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

export default AddShareModal;

