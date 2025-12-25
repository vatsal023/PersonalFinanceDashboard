import { useState } from "react";
import axios from "axios";
import { FaTimes, FaPlus, FaTag, FaRupeeSign, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";

const AddIncomeModal = ({ setRefresh }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    date: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/income", formData);
      toast.success("Income added successfully!");
      setFormData({ category: "", amount: "", date: "", notes: "" });
      setShow(false);
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error adding income:", error);
      toast.error(error.response?.data?.message || "Failed to add income. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    setFormData({ category: "", amount: "", date: "", notes: "" });
  };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-green-700 transition-all font-semibold flex items-center gap-2 transform hover:-translate-y-0.5"
      >
        <FaPlus />
        Add Income
      </button>

      {show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FaPlus />
                Add New Income
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
                  <FaTag className="inline mr-2 text-blue-600" />
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Salary, Freelance, Investment"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaRupeeSign className="inline mr-2 text-green-600" />
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaCalendarAlt className="inline mr-2 text-purple-600" />
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaFileAlt className="inline mr-2 text-gray-600" />
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                  disabled={isSubmitting}
                />
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
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Income
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

export default AddIncomeModal;

