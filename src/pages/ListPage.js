import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavLink from '../components/NavLink/NavLink';
import PageNavigation from '../components/PageNavigation/PageNavigation';
import RegistrationsList from '../components/RegistrationsList/RegistrationsList';
import Toast from '../components/Toast/Toast';
import { DOCS_URL } from '../constants/navigation';
import { useToast } from '../hooks/useToast';
import { getRegistrations } from '../module/module';
import './ListPage.css';

const HIGHLIGHT_DURATION = 4000;

function ListPage() {
  const location = useLocation();
  const { toastMessage, toastType, showToast } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(
    () => (typeof location.state?.highlightIndex === 'number' ? location.state.highlightIndex : null)
  );

  useEffect(() => {
    try {
      setRegistrations(getRegistrations());
    } catch (error) {
      showToast(error.message || 'Une erreur est survenue', 'error');
    }
  }, [location, showToast]);

  useEffect(() => {
    if (highlightedIndex === null || registrations.length === 0) {
      return undefined;
    }

    const highlightedElement = document.querySelector(
      `[data-highlight-index="${highlightedIndex}"]`
    );
    if (typeof highlightedElement?.scrollIntoView === 'function') {
      highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const timeoutId = setTimeout(() => {
      setHighlightedIndex(null);
    }, HIGHLIGHT_DURATION);

    return () => clearTimeout(timeoutId);
  }, [highlightedIndex, registrations]);

  return (
    <>
      <div className="list-page" data-testid="list-page">
        <RegistrationsList
          registrations={registrations}
          title="Liste des inscrits"
          headingLevel="h1"
          highlightedIndex={highlightedIndex}
          testId="list-registrations-section"
        />

        <PageNavigation variant="card" ariaLabel="Navigation liste">
          <NavLink to="/" testId="go-to-home">
            Accueil
          </NavLink>
          <NavLink to="/register" variant="primary" testId="go-to-registration">
            Nouvelle inscription
          </NavLink>
          <NavLink href={DOCS_URL} external testId="go-to-docs">
            Documentation
          </NavLink>
        </PageNavigation>
      </div>

      <Toast message={toastMessage} type={toastType} />
    </>
  );
}

export default ListPage;
