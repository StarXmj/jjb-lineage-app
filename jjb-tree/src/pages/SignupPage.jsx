import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import './AuthForm.css'; // On utilise le MÊME style

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      // Succès !
      setSuccess(true);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Inscription</h2>
      <p>Créez un compte pour rejoindre le projet.</p>

      {error && <div className="auth-error">{error}</div>}
      {success && (
        <div className="auth-success">
          Succès ! Veuillez vérifier vos emails pour confirmer votre compte.
        </div>
      )}

      <form className="auth-form" onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe (min 6 caractères)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Création...' : "S'inscrire"}
        </button>
      </form>
      <div className="auth-link">
        Déjà un compte ? <Link to="/login">Connectez-vous</Link>
      </div>
    </div>
  );
}