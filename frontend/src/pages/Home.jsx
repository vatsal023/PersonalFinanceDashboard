// // HomePage.jsx
// import React from "react";
// import { Link } from "react-router-dom";

// const HomePage = () => {
//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Navbar */}
//       <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
//         <div className="text-xl font-bold text-green-600">
//           Personal Finance Dashboard
//         </div>
//         <div>
//           <Link
//             to="/register"
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//           >
//             Register
//           </Link>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="text-center py-20 px-4">
//         <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
//           Take Control of Your Finances
//         </h1>
//         <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
//           Our Personal Finance Dashboard helps you track and analyze your income, expenses, and investments in real-time. 
//           Get actionable insights, visualize your spending patterns, and make informed financial decisions with ease.
//         </p>
//         <Link
//           to="/register"
//           className="bg-blue-600 text-white px-6 py-3 rounded text-lg hover:bg-blue-700 transition"
//         >
//           Get Started
//         </Link>
//       </section>

//       {/* Features Section */}
//       <section className="py-16 px-4 bg-white">
//         <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800">
//           Features
//         </h2>
//         <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
//           <div className="p-6 shadow-lg rounded-lg bg-gray-50">
//             <h3 className="text-xl font-bold mb-4">Income & Expense Tracking</h3>
//             <p>Visualize your monthly income and expenses to manage your budget effectively.</p>
//           </div>
//           <div className="p-6 shadow-lg rounded-lg bg-gray-50">
//             <h3 className="text-xl font-bold mb-4">Investments Overview</h3>
//             <p>Track your mutual funds, shares, and bullion with real-time updates and profit/loss analysis.</p>
//           </div>
//           <div className="p-6 shadow-lg rounded-lg bg-gray-50">
//             <h3 className="text-xl font-bold mb-4">Secure & Easy</h3>
//             <p>All your data is safely stored and easily accessible anytime, anywhere.</p>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default HomePage;



// HomePage.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

const HomePage = () => {
  const { isAuthenticated, checkAuth } = useAuth();

  // Check authentication status on page load
  // useEffect(() => {
  //   checkAuth();
  // }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-green-600">
          Personal Finance Dashboard
        </div>
        <div>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              View Dashboard
            </Link>
          ) : (
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Register
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
          Take Control of Your Finances
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Our Personal Finance Dashboard helps you track and analyze your income, expenses, and investments in real-time. 
          Get actionable insights, visualize your spending patterns, and make informed financial decisions with ease.
        </p>
        {!isAuthenticated && (
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded text-lg hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        )}
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800">
          Features
        </h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 shadow-lg rounded-lg bg-gray-50">
            <h3 className="text-xl font-bold mb-4">Income & Expense Tracking</h3>
            <p>Visualize your monthly income and expenses to manage your budget effectively.</p>
          </div>
          <div className="p-6 shadow-lg rounded-lg bg-gray-50">
            <h3 className="text-xl font-bold mb-4">Investments Overview</h3>
            <p>Track your mutual funds, shares, and bullion with real-time updates and profit/loss analysis.</p>
          </div>
          <div className="p-6 shadow-lg rounded-lg bg-gray-50">
            <h3 className="text-xl font-bold mb-4">Secure & Easy</h3>
            <p>All your data is safely stored and easily accessible anytime, anywhere.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
