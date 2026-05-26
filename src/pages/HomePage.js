import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <section className="home-page" data-testid="home-page">
      <h1>Bienvenue</h1>
      <p>
        Inscrivez-vous en quelques clics. Renseignez vos informations personnelles
        et consultez la liste des inscrits.
      </p>
      <div className="home-actions">
        <Link to="/register" className="home-link-button" data-testid="go-to-registration">
          Commencer l&apos;inscription
        </Link>
        <Link to="/list" className="home-link-button home-link-button-secondary" data-testid="go-to-list">
          Voir la liste des inscrits
        </Link>
      </div>
    </section>
  );
}

export default HomePage;
