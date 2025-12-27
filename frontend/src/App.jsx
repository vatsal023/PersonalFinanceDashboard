import { useState,useEffect } from 'react'
import './App.css'
import { baseUrl } from '../apiconfig';
import Login from './pages/Login';
import Register from './pages/Register';
import ConnectBank from './components/others/ConnectBank';
import TransactionsTable from './components/others/TransactionsTable';
import { Toaster } from 'react-hot-toast';
import { createBrowserRouter, RouterProvider,Outlet, ScrollRestoration} from 'react-router-dom';
import axios from 'axios';
import BudgetDashboard from './components/others/BudgetDashboard';
import ExpensesPage from './pages/ExpensesPage';
import IncomePage from './pages/IncomePage';
import MutualFundsPage from './pages/MutualFundsPage';
import UploadCSV from './components/others/UploadCSV';
import LivePrices from './components/others/LivePrices';
import Investments from './components/others/Investment';
import SharesPage from './pages/SharesPage';
import StockDashboard from './components/others/StockDashboard';
import MetalPriceCalculator from './components/others/MetalPriceCalculator';
import MutualFundTracker from './components/others/MutualFundTracker';
import BullionPage from './pages/BullionPage';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import HomePage from './pages/Home';
import { AuthProvider, useAuth } from "./context/authContext";

const Layout = () => {
  const { isAuthenticated, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
    console.log("Layout effect")
  }, [isAuthenticated]);

  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />
      },
      {
        path: "/register",
        element: <Register />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/expenses",
        element: <ExpensesPage />
      },
      {
        path: "/income",
        element: <IncomePage />
      },
      {
        path: "/mutualfunds",
        element: <MutualFundsPage />
      },
      {
        path: "/shares",
        element: <SharesPage />
      },
      {
        path: "/bullion",
        element: <BullionPage />
      },
      {
        path: "/dashboard",
        element: <Dashboard />
      },
      {
        path: "/analytics",
        element: <Analytics />
      },
      // {
      //   path: "/connect-bank",
      //   element: <ConnectBank />
      // },
      // {
      //   path: "/transactions",
      //   element: <TransactionsTable />
      // },
      // {
      //   path: "/BudgetDashboard",
      //   element: <BudgetDashboard />
      // },
      // {
      //   path: "/upload-csv",
      //   element: <UploadCSV />
      // },
      // {
      //   path: "/live-prices",
      //   element: <LivePrices />
      // },
      // {
      //   path: "/investments",
      //   element: <Investments />
      // },
      // {
      //   path: "/stocks",
      //   element: <StockDashboard />
      // },
      // {
      //   path: "/mutual-fund-tracker",
      //   element: <MutualFundTracker />
      // },
      // {
      //   path: "/metal-prices",
      //   element: <MetalPriceCalculator />
      // },
  
    ]
  }
])

function App() {
  axios.defaults.baseURL = baseUrl;
  axios.defaults.withCredentials = true;

  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>

    </>
  )
}

export default App
