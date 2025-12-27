import { useState } from "react";
import {
  FaHome,
  FaWallet,
  FaChartPie,
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaSignOutAlt,
  FaGem,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Sidebar = ({ selectedPage, isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;
  const highlightBar = "absolute left-0 top-0 h-full w-1 rounded-r bg-gradient-to-b from-blue-500 via-indigo-400 to-emerald-400 shadow";

  const pages = [
    { name: "Dashboard", icon: <FaHome className="text-blue-500" />, path: "/dashboard" },
     { name: "Income", icon: <FaWallet className="text-green-500" />, path: "/income" },
    { name: "Expenses", icon: <FaWallet className="text-orange-500" />, path: "/expenses" },
    {
      name: "Investments",
      icon: <FaChartLine className="text-indigo-600" />,
      subpages: [
        { name: "Shares", path: "/shares" },
        { name: "Mutual Funds", path: "/mutualfunds" },
        { name: "Bullion", path: "/bullion" },
      ],
    },
    { name: "Analytics", icon: <FaChartPie className="text-fuchsia-600" />, path: "/analytics" },
  ];

  const toggleExpand = (name) => setExpanded(expanded === name ? null : name);
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <aside
      className={`fixed top-0 left-0 h-full border-r shadow-xl z-50 transition-all duration-300 backdrop-blur-xl ${isOpen ? "w-64 bg-gradient-to-b from-white/90 via-blue-50/80 to-indigo-50/70" : "w-16 bg-white/80"}`}
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {/* Logo + Toggle */}
      <div className={`flex items-center ${isOpen ? "pl-7 pr-4" : "justify-center"} h-20 border-b border-blue-100`}> 
        <span className="inline-block mr-3">
          <FaGem className="text-3xl text-indigo-500 drop-shadow-xl"/>
        </span>
        {isOpen && <span className="bg-clip-text text-xl font-extrabold bg-gradient-to-r from-blue-700 to-emerald-500 text-transparent tracking-tight select-none">FinDash</span>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto p-2 bg-gradient-to-r from-indigo-500 to-blue-400 text-white rounded-full shadow hover:from-blue-600 hover:to-indigo-700 transition"
        >
          {isOpen ? <FaChevronLeft /> : <FaChevronDown />}
        </button>
      </div>
      {/* Nav */}
      <nav className="mt-5 flex flex-col h-[calc(100%-6rem)] justify-between animate-fade-in-50">
        <div>
          {pages.map((page) => (
            <div key={page.name} className="relative">
              {/* Main Page Button */}
              <button
                onClick={() => page.subpages ? toggleExpand(page.name) : navigate(page.path)}
                className={`relative flex items-center gap-4 w-full px-7 py-2.5 group text-base font-semibold rounded-lg transition-all mb-1 ${selectedPage === page.name ? "bg-gradient-to-r from-blue-50 via-blue-100 to-emerald-50 text-blue-700 shadow-inner" : "text-gray-800 hover:bg-blue-50/70"}`}
              >
                {selectedPage === page.name && <span className={highlightBar} />}
                <span className="text-xl drop-shadow-md">{page.icon}</span>
                {isOpen && <span>{page.name}</span>}
                {isOpen && page.subpages && (
                  <span className="ml-auto">
                    {expanded === page.name ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
                  </span>
                )}
              </button>
              {/* Subpages */}
              {page.subpages && expanded === page.name && isOpen && (
                <ul className="ml-9 py-1 transition-all animate-fade-in-60">
                  {page.subpages.map((sub) => (
                    <li key={sub.name}>
                      <button
                        onClick={() => navigate(sub.path)}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left ${selectedPage === sub.name ? "text-indigo-600 font-bold bg-indigo-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"}`}
                      >
                        <span className="w-2 h-2 mr-3 rounded-full bg-gradient-to-tr from-indigo-400 to-emerald-400 shadow-md" />
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        {/* Logout Button Bottom */}
        <div className="mb-7">
          <button onClick={handleLogout} className="flex items-center gap-3 px-8 py-2 text-red-600 bg-gradient-to-r from-red-50 to-white font-semibold rounded-lg hover:from-red-100 hover:to-white shadow-lg w-full transition-all">
            <FaSignOutAlt className="text-xl" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
