// Fichier: src/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const { user } = useAuth(); // On récupère l'utilisateur

  // Si pas d'utilisateur, on redirige vers la page de connexion
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est connecté, on affiche la page demandée
  return <Outlet />;
}