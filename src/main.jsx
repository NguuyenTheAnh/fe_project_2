import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css';
import { notification } from 'antd';

// Configure antd notification globally
notification.config({
  placement: 'topRight',
  top: 50,
  duration: 4.5,
  rtl: false,
});

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import RegisterPage from './pages/register.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';
import ManagementPage from './pages/management.jsx';
import Dashboard from './Dashboard.jsx';
import MainDashboard from './pages/mainDashboard.jsx';
import TablesDashboard from './pages/tablesDashboard.jsx';
import DishesDashboard from './pages/dishesDashboard.jsx';
import OrdersDashboard from './pages/ordersDashboard.jsx';
import PaymentsDashboard from './pages/paymentsDashboard.jsx';
import ProfileSettings from './pages/profileSettings.jsx';
import Guest from './Guest.jsx';
import GuestMain from './pages/guest/guestMain.jsx';
import LoginGuestPage from './pages/loginGuest.jsx';
import { GuestAuthWrapper } from './components/context/guest.context.jsx';
import GuestCart from './pages/guest/guestCart.jsx';
import Wish from './pages/wish.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "managements",
        element: <ManagementPage />
      },
      {
        path: "profile-settings",
        element: <ProfileSettings />
      }
    ]
  },
  {
    path: "dashboard",
    element: <Dashboard />,
    children: [
      {
        index: true,
        element: <MainDashboard />
      },
      {
        path: "tables",
        element: <TablesDashboard />
      },
      {
        path: "dishes",
        element: <DishesDashboard />
      },
      {
        path: "orders",
        element: <OrdersDashboard />
      },
      {
        path: "payments",
        element: <PaymentsDashboard />
      }
    ]
  },
  {
    path: "register",
    element: <RegisterPage />
  },
  {
    path: "login",
    element: <LoginPage />
  },
  {
    path: "guest",
    element: <Guest />,
    children: [
      {
        index: true,
        element: <GuestMain />
      },
      {
        path: "cart",
        element: <GuestCart />
      }
    ]
  },
  {
    path: "login-guest",
    element: <LoginGuestPage />
  },
  {
    path: "wish",
    element: <Wish />
  }
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <AuthWrapper>
    <GuestAuthWrapper>
      <RouterProvider router={router} />
    </GuestAuthWrapper>
  </AuthWrapper>
  // </React.StrictMode>,
)
