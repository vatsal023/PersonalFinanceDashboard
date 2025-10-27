// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const IncomeChart = ({ incomes }) => {
//   // Aggregate income per month
//   const monthlyTotals = incomes.reduce((acc, income) => {
//     const month = income.date.slice(0, 7); // YYYY-MM
//     acc[month] = (acc[month] || 0) + income.amount;
//     return acc;
//   }, {});

//   const labels = Object.keys(monthlyTotals);
//   const data = Object.values(monthlyTotals);

//   const chartData = {
//     labels,
//     datasets: [
//       {
//         label: "Income Earned",
//         data,
//         backgroundColor: "#3b82f6",
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: { display: false },
//       title: { display: true, text: "Monthly Income", font: { size: 18 } },
//     },
//     scales: {
//       y: { beginAtZero: true },
//     },
//   };

//   return <Bar data={chartData} options={options} />;
// };

// export default IncomeChart;


import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IncomeChart = ({ incomes }) => {
  // Aggregate income by month
  const monthlyTotals = incomes.reduce((acc, income) => {
    const month = new Date(income.date).toLocaleString("default", { month: "short", year: "numeric" });
    acc[month] = (acc[month] || 0) + income.amount;
    return acc;
  }, {});

  const labels = Object.keys(monthlyTotals); // e.g., ["Jan 2025", "Feb 2025"]
  const data = Object.values(monthlyTotals); // income values

  const chartData = {
    labels,
    datasets: [
      {
        label: "Salary",
        data,
        backgroundColor: "#3b82f6", // blue bars like your screenshot
        borderRadius: 8, // rounded top corners
        barThickness: 20, // adjust bar width for mobile
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
      title: { display: true, text: "Monthly Salary", font: { size: 16 } },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { drawBorder: false } },
    },
  };

  return <div style={{ height: "250px" }}><Bar data={chartData} options={options} /></div>;
};

export default IncomeChart;
