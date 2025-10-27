import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import IncomeOverview from "../components/Income/IncomeOverview";
import IncomeList from "../components/Income/IncomeList";
import AddIncomeModal from "../components/Income/AddIncomeModal";
import IncomeChart from "../components/Income/IncomeChart";
import { useAuth } from "../context/authContext"
import { useNavigate } from "react-router-dom";


const IncomePage = () => {
    const [incomes, setIncomes] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // track sidebar visibility
      const { isAuthenticated, checkAuth } = useAuth();
       const navigate = useNavigate();

    useEffect(() => {
        console.log(isAuthenticated);
        // checkAuth();
        if (!isAuthenticated) {
            navigate("/");
        }
    }, [])

    const fetchIncomes = async () => {
        try {
            const res = await axios.get("/api/income", {
                params: selectedMonth ? { month: selectedMonth } : {},
            });
            setIncomes(res.data);
        } catch (error) {
            console.error("Error fetching incomes:", error);
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, [refresh, selectedMonth]);

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    //   const totalSources = new Set(incomes.map((i) => i.category)).size;
    const totalSources = new Set(incomes.map(i => i.category?.trim().toLowerCase())).size;

    const entryCount = incomes.length;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <div
                className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"
                    }`}
            >
                {/* Header with Add Income button on top-right */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Income Overview</h2>
                    <AddIncomeModal setRefresh={setRefresh} /> {/* Keeps your original working button */}
                </div>

                {/* Month Filter */}
                <div className="mb-4 text-left">
                    <label className="font-medium mr-2">Select Month:</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border p-2 rounded-md"
                    />
                </div>

                {/* Income Summary */}
                <IncomeOverview
                    totalIncome={totalIncome}
                    totalSources={totalSources}
                    entryCount={entryCount}
                />


                {/* Monthly Income Chart */}
                {/* <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition mt-6">
                    <IncomeChart incomes={incomes} />
                </div> */}

                {/* Income List */}
                <div className="mt-6 text-left">
                    <h3 className="text-xl font-semibold mb-2 text-left">Income Sources</h3>
                    <IncomeList incomes={incomes} setRefresh={setRefresh} />
                </div>

            </div>
        </div>
    );
};

export default IncomePage;
