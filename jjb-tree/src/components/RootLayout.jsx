import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // On utilise le contexte
import { supabase } from '../supabaseClient';
import './Navbar.css'; 

export default function RootLayout() {
  // On récupère le user ET le rôle (isAdmin) depuis le contexte !
  const { user, isAdmin, loading } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); 
  };

  // On n'affiche rien si le contexte est en chargement
  if (loading) {
    return <div style={{height: '60px', background: '#fff'}}></div>;
  }
  
  return (
    <div className="app-layout">
      <nav className="navbar">
        <Link to="/" className="nav-logo">
          Arbre JJB
        </Link>
        <div className="nav-links">
          <Link to="/tree">Voir l'Arbre</Link>
          
          {user ? (
            // --- Si l'utilisateur EST connecté ---
            <>
              {/* Le lien Admin ne s'affiche que si isAdmin est true */}
              {isAdmin && (
                <Link to="/admin" className="nav-button-secondary admin-link">
                  Admin
                </Link>
              )}
              
              <Link to="/dashboard" className="nav-button-primary">
                Mon Dashboard
              </Link>
              <button onClick={handleLogout} className="nav-button-secondary">
                Déconnexion
              </button>
            </>
          ) : (
            // --- Si l'utilisateur n'est PAS connecté ---
            <>
              <Link to="/login" className="nav-button-secondary">
                Connexion
              </Link>
              <Link to="/signup" className="nav-button-primary">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </nav>
      
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}