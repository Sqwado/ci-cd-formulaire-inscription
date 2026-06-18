import NavLink from '../components/NavLink/NavLink';
import PageNavigation from '../components/PageNavigation/PageNavigation';
import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <section className="not-found-page" data-testid="not-found-page">
      <p className="not-found-page__code" aria-hidden="true">
        404
      </p>
      <h1>Page introuvable</h1>
      <p>L&apos;adresse demandée n&apos;existe pas ou n&apos;est plus disponible.</p>
      <PageNavigation variant="inline" ariaLabel="Navigation page 404">
        <NavLink to="/" variant="primary" testId="go-to-home-from-404">
          Retour à l&apos;accueil
        </NavLink>
      </PageNavigation>
    </section>
  );
}

export default NotFoundPage;
