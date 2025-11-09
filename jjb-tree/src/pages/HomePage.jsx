import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Nous allons créer ce fichier

export default function HomePage() {
  return (
    <div className="home-container">
      {/* Section 1: Hero */}
      <header className="home-hero">
        <div className="hero-content">
          <h1>L'Arbre du Lignage du Jiu-Jitsu Brésilien</h1>
          <p>
            Un projet collaboratif pour tracer, préserver et explorer 
            l'histoire et les connexions de notre art.
          </p>
          <Link to="/tree" className="hero-button">
            Explorer l'Arbre
          </Link>
        </div>
      </header>

      {/* Section 2: Présentation */}
      <section className="home-section">
        <h2>Comment ça marche ?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <h3>Explorer</h3>
            <p>Naviguez sur l'arbre public pour découvrir les maîtres et leurs élèves.</p>
          </div>
          <div className="feature-item">
            <h3>Contribuer</h3>
            <p>Créez un compte et soumettez vos propres ajouts à l'arbre.</p>
          </div>
          <div className="feature-item">
            <h3>Valider</h3>
            <p>Chaque soumission est vérifiée par un administrateur pour garantir la qualité.</p>
          </div>
        </div>
      </section>
    </div>
  );
}