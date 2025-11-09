import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // NOUVEAU : pour stocker le rôle
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Tente de récupérer la session au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // S'il y a une session, on fetch le profil
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Écoute les changements (Login, Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        // Si l'utilisateur se connecte, on fetch le profil
        if (session) {
          fetchUserProfile(session.user.id);
        } else {
          // Si l'utilisateur se déconnecte, on vide le profil
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // NOUVELLE FONCTION : Fetch le profil pour connaître le rôle
  const fetchUserProfile = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('role') // On ne prend que le rôle
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Erreur fetch profil:", error.message);
    }
    setProfile(data);
    setLoading(false);
  };

  const value = {
    session,
    user: session?.user,
    profile, // On rend le profil (et le rôle) disponible
    isAdmin: profile?.role === 'admin', // Un boolean pratique
    loading,
  };

  // Ne rend l'application que lorsque la session ET le profil sont chargés
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Le hook 'useAuth' n'a pas besoin de changer
export function useAuth() {
  return useContext(AuthContext);
}