// Fichier: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './AuthContext';

// 1. Importer le Layout
import RootLayout from './components/RootLayout'; 

// 2. Importer les pages
import HomePage from './pages/HomePage';
import TreePage from './pages/TreePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyWorkTree from './pages/MyWorkTree';
import ProtectedRoute from './ProtectedRoute';
import AdminPage from './pages/AdminPage'; // <-- 1. IMPORTER
// 3. Définir le routeur
import AdminRoute from './AdminRoute'; // <-- 1. IMPORTER LE NOUVEAU GARDE

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />, 
    children: [
      {
        index: true, 
        element: <HomePage />,
      },
      {
        path: "tree",
        element: <TreePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignupPage />,
      },
      {
        path: "dashboard",
        element: <ProtectedRoute />, // Protège le dashboard (contributeurs)
        children: [
          { path: "", element: <MyWorkTree /> }
        ]
      },
      {
        path: "admin", // <-- NOUVELLE ROUTE SÉPARÉE
        element: <AdminRoute />, // <-- PROTÉGÉE PAR LE GARDE ADMIN
        children: [
          { path: "", element: <AdminPage /> }
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);