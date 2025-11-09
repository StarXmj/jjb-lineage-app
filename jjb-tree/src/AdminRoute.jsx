import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

export default function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    // Affiche un spinner si on vérifie encore la session
    return (
      <div style={{width: '100vw', height: '100vh', display: 'grid', placeItems: 'center'}}>
        <h1><FaSpinner className="spin" /> Vérification...</h1>
      </div>
    );
  }

  // 1. Si pas d'utilisateur, direction login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si l'utilisateur est connecté MAIS PAS admin, direction le dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Si l'utilisateur est connecté ET admin, on affiche la page
  return <Outlet />;
}