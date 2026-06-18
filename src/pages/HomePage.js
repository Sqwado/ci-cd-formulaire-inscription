import NavLink from '../components/NavLink/NavLink';
import PageNavigation from '../components/PageNavigation/PageNavigation';
import { DOCS_URL } from '../constants/navigation';
import './HomePage.css';

function HomePage() {
  return (
    <section className="home-page" data-testid="home-page">
      <h1>Bienvenue</h1>
      <p>
        Inscrivez-vous en quelques clics. Renseignez vos informations personnelles
        et consultez la liste des inscrits.
      </p>
      <PageNavigation variant="inline" ariaLabel="Navigation accueil">
        <NavLink to="/register" variant="primary" testId="go-to-registration">
          Commencer l&apos;inscription
        </NavLink>
        <NavLink to="/list" testId="go-to-list">
          Voir la liste des inscrits
        </NavLink>
        <NavLink to="/admin/login" testId="go-to-admin-login">
          Espace admin
        </NavLink>
        <NavLink href={DOCS_URL} external testId="go-to-docs">
          Documentation
        </NavLink>
      </PageNavigation>
    </section>
  );
}

export default HomePage;
