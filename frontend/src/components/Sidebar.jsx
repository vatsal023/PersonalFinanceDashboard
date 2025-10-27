// import { useState } from "react";
// import {
//   FaHome,
//   FaWallet,
//   FaChartPie,
//   FaChartLine,
//   FaTimes,
//   FaChevronDown,
//   FaChevronUp,
// } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// const Sidebar = ({ selectedPage }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const [expanded, setExpanded] = useState(null); // to handle dropdowns
//   const navigate = useNavigate();

//   const pages = [
//     { name: "Dashboard", icon: <FaHome />, path: "/Dashboard" },
//     { name: "Expenses", icon: <FaWallet />, path: "/expenses" },
//     {
//       name: "Investments",
//       icon: <FaChartLine />,
//       subpages: [
//         { name: "Shares", path: "/shares" },
//         { name: "Mutual Funds", path: "/mutualfunds" },
//         { name: "Bullion", path: "/bullion" },
//       ],
//     },
//     { name: "Income", icon: <FaWallet />, path: "/income" },
//     { name: "Analytics", icon: <FaChartPie />, path: "/analytics" },
//   ];

//   const toggleExpand = (name) => {
//     setExpanded(expanded === name ? null : name);
//   };

//   return (
//     <div
//       className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-50 ${
//         isOpen ? "w-64" : "w-16"
//       }`}
//     >
//       {/* Toggle Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="absolute top-4 right-[-20px] bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition"
//       >
//         {isOpen ? <FaTimes /> : "☰"}
//       </button>

//       {/* Menu Items */}
//       <nav className="mt-16 flex flex-col">
//         {pages.map((page) => (
//           <div key={page.name}>
//             <button
//               onClick={() =>
//                 page.subpages ? toggleExpand(page.name) : navigate(page.path)
//               }
//               className={`flex items-center justify-between p-4 hover:bg-gray-100 transition w-full ${
//                 selectedPage === page.name ? "bg-gray-100 font-bold" : ""
//               }`}
//             >
//               <div className="flex items-center gap-4">
//                 <span className="text-xl">{page.icon}</span>
//                 {isOpen && <span className="text-gray-800">{page.name}</span>}
//               </div>
//               {isOpen && page.subpages && (
//                 <>
//                   {expanded === page.name ? (
//                     <FaChevronUp className="text-gray-500" />
//                   ) : (
//                     <FaChevronDown className="text-gray-500" />
//                   )}
//                 </>
//               )}
//             </button>

//             {/* Subpages (like Shares, Mutual Funds, Bullion) */}
//             {page.subpages && expanded === page.name && isOpen && (
//               <div className="ml-10 flex flex-col">
//                 {page.subpages.map((sub) => (
//                   <button
//                     key={sub.name}
//                     onClick={() => navigate(sub.path)}
//                     className={`text-left text-gray-700 py-2 hover:text-blue-600 ${
//                       selectedPage === sub.name ? "font-bold text-blue-600" : ""
//                     }`}
//                   >
//                     {sub.name}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;




import { useState } from "react";
import {
  FaHome,
  FaWallet,
  FaChartPie,
  FaChartLine,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext"; // ✅ Import the auth hook

const Sidebar = ({ selectedPage }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth(); // ✅ Get logout from context

  const pages = [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "Expenses", icon: <FaWallet />, path: "/expenses" },
    {
      name: "Investments",
      icon: <FaChartLine />,
      subpages: [
        { name: "Shares", path: "/shares" },
        { name: "Mutual Funds", path: "/mutualfunds" },
        { name: "Bullion", path: "/bullion" },
      ],
    },
    { name: "Income", icon: <FaWallet />, path: "/income" },
    { name: "Analytics", icon: <FaChartPie />, path: "/analytics" },
  ];

  const toggleExpand = (name) => {
    setExpanded(expanded === name ? null : name);
  };

  // ✅ Handle logout click
  const handleLogout = () => {
    logout();          // Removes cookie + updates state
    navigate("/login"); // Redirect to login
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-50 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-[-20px] bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        {isOpen ? <FaTimes /> : "☰"}
      </button>

      {/* Menu Items */}
      <nav className="mt-16 flex flex-col justify-between h-[90%]">
        <div>
          {pages.map((page) => (
            <div key={page.name}>
              <button
                onClick={() =>
                  page.subpages ? toggleExpand(page.name) : navigate(page.path)
                }
                className={`flex items-center justify-between p-4 hover:bg-gray-100 transition w-full ${
                  selectedPage === page.name ? "bg-gray-100 font-bold" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">{page.icon}</span>
                  {isOpen && <span className="text-gray-800">{page.name}</span>}
                </div>
                {isOpen && page.subpages && (
                  <>
                    {expanded === page.name ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </>
                )}
              </button>

              {/* Subpages */}
              {page.subpages && expanded === page.name && isOpen && (
                <div className="ml-10 flex flex-col">
                  {page.subpages.map((sub) => (
                    <button
                      key={sub.name}
                      onClick={() => navigate(sub.path)}
                      className={`text-left text-gray-700 py-2 hover:text-blue-600 ${
                        selectedPage === sub.name
                          ? "font-bold text-blue-600"
                          : ""
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ✅ Logout button at bottom */}
        <div className="mb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 p-4 w-full text-red-600 hover:bg-red-50 transition"
          >
            <FaSignOutAlt className="text-xl" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
