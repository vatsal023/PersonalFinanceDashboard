import { useState, useEffect } from "react";
import axios from "axios";
import BudgetForm from "./BudgetForm";
import BudgetList from "./BudgetList";
import ManualExpenseForm from "./ManualExpenseForm";
import ManualExpenseList from "./ManualExpenseList";

const BudgetDashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const triggerRefresh = () => setRefresh(!refresh);
  // Fetch budgets from backend (for current month)
  const fetchBudgets = async () => {
    try {
      const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    //    const res = await axios.get(`/api/budgets/with-spending`, {
    //     withCredentials: true, // send cookies automatically
    //   });
      const res = await axios.get(`/api/budgets/with-spending?month=${month}`, {
        withCredentials: true, // send cookies automatically
      });
      setBudgets(res.data);
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // Callback when a new budget is added
  const handleBudgetAdded = () => {
    fetchBudgets(); // refresh the list after adding
  };

  return (
    <div className="p-4">
      <BudgetForm onBudgetAdded={handleBudgetAdded} />
      <BudgetList budgets={budgets} />
      <ManualExpenseForm onExpenseAdded={triggerRefresh} />
      <ManualExpenseList refresh={refresh} />
    </div>
  );
};

export default BudgetDashboard;
