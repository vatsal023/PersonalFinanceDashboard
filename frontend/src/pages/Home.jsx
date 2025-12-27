import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FaWallet, FaChartLine, FaShieldAlt, FaMagic, FaPiggyBank, FaChartPie } from "react-icons/fa";

const features = [
  { icon: <FaWallet className="h-8 w-8 text-green-500" />, title: "Income & Expense Analytics", desc: "Visualize monthly, yearly, and custom time range spending and income at a glance." },
  { icon: <FaChartLine className="h-8 w-8 text-indigo-500" />, title: "Real-Time Investments", desc: "Track mutual funds, shares, and bullion with live market stats and profit/loss insights." },
  { icon: <FaPiggyBank className="h-8 w-8 text-amber-600" />, title: "Smart Savings Goals", desc: "Set, adjust, and monitor your financial targets with AI-based suggestions and tracking." },
  { icon: <FaChartPie className="h-8 w-8 text-fuchsia-500" />, title: "Financial Visualization", desc: "Pie charts, trends, & personalized breakdowns for all your accounts." },
  { icon: <FaShieldAlt className="h-8 w-8 text-blue-400" />, title: "Best-In-Class Security", desc: "Bank-level encryption, device validation, secure-by-default; your privacy protected always." },
  { icon: <FaMagic className="h-8 w-8 text-purple-500" />, title: "Seamless Experience", desc: "Intuitive, stunning UI/UX — optimized for mobile, tablet, and desktop." },
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative">
      {/* Premium Navbar */}
      <nav className="backdrop-blur-xl bg-white/70 sticky top-0 z-30 w-full shadow flex justify-between items-center px-8 md:px-16 py-5 border-b border-blue-100 animate-fade-in-60">
        <div className="font-extrabold text-transparent text-2xl bg-clip-text bg-gradient-to-r from-indigo-800 via-blue-600 to-emerald-600 tracking-tight">PersonalFinance<span className="bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent">.Dashboard</span></div>
        <div>
          {isAuthenticated ? (
            <Link to="/dashboard" className="inline-block rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white px-7 py-2.5 font-bold shadow-lg hover:from-emerald-600 hover:to-green-700 transition-all">View Dashboard</Link>
          ) : (
            <Link to="/register" className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-7 py-2.5 font-bold shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all">Get Started</Link>
          )}
        </div>
      </nav>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center py-24 px-4 md:px-0 animate-in fade-in-0">
        <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none select-none z-[-1]">
          <div className="w-40 h-40 bg-gradient-to-br from-indigo-300 via-blue-300 to-blue-100 opacity-20 rounded-full md:w-80 md:h-80 blur-2xl" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-indigo-800 via-blue-700 to-emerald-600 bg-clip-text text-transparent drop-shadow mb-6 animate-in fade-in-0">Control Your <span className="text-blue-600">Money</span>, <span className="text-emerald-500">Own</span> Your Future</h1>
        <p className="text-lg md:text-2xl font-medium text-gray-600 max-w-2xl mx-auto mb-9 animate-in fade-in-20">A breathtaking new way to track, analyze, and grow your finances. Designed for clarity, built for privacy, and inspired by the best in SaaS design.</p>
        <div>
          {isAuthenticated ? (
            <Link to="/dashboard" className="rounded-2xl px-9 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold shadow-xl hover:from-emerald-600 hover:to-green-700 transition-all animate-pulse">View My Dashboard</Link>
          ) : (
            <Link to="/register" className="rounded-2xl px-9 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-lg font-bold shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all animate-pulse">Get Started Free</Link>
          )}
        </div>
      </section>
      {/* Features */}
      <section className="max-w-6xl mx-auto py-16 px-4 md:px-0 animate-in fade-in-40">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-14 tracking-tight leading-tight">Why Choose Our Dashboard?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={f.title} className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center text-center hover:scale-[1.03] hover:ring-2 hover:ring-blue-100 transition-transform duration-200 animate-in zoom-in-95">
              <div className="mb-3">{f.icon}</div>
              <div className="text-xl font-extrabold text-blue-900 mb-2">{f.title}</div>
              <div className="text-base text-gray-600">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
      {/* CTA Banner */}
      <div className="max-w-3xl mx-auto px-5">
        <div className="my-20 rounded-2xl shadow-2xl bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-yellow-300 text-white px-10 py-14 flex flex-col items-center text-center animate-in fade-in-20">
          <h3 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight leading-tight">Start managing your money like a pro.</h3>
          <p className="text-lg font-medium mb-8">Create your account in minutes. See why people love the modern way to personal finance.</p>
          {isAuthenticated ? (
            <Link to="/dashboard" className="rounded-xl bg-white text-indigo-700 text-lg font-bold px-12 py-4 shadow-md hover:bg-gray-100 transition">Go to Dashboard</Link>
          ) : (
            <Link to="/register" className="rounded-xl bg-white text-indigo-700 text-lg font-bold px-12 py-4 shadow-md hover:bg-gray-100 transition">Get Started Free</Link>
          )}
        </div>
      </div>
      {/* Footer */}
      <footer className="w-full py-5 text-center text-gray-400 font-medium text-base animate-in fade-in-90">
        &copy; {new Date().getFullYear()} PersonalFinance.Dashboard &mdash; All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
