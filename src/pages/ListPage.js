import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ListPage.css';
import { getRegistrations } from '../module/module';

const TOAST_DURATION = 3000;
const HIGHLIGHT_DURATION = 4000;

function ListPage() {
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [highlightedEmail, setHighlightedEmail] = useState(
    () => location.state?.highlightEmail ?? null
  );

  useEffect(() => {
    try {
      setRegistrations(getRegistrations());
    } catch (error) {
      setToastMessage(error.message || 'Une erreur est survenue');
    }
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setToastMessage('');
    }, TOAST_DURATION);

    return () => clearTimeout(timeoutId);
  }, [toastMessage]);

  useEffect(() => {
    if (!highlightedEmail) {
      return undefined;
    }

    const highlightedElement = document.querySelector(
      `[data-highlight-email="${highlightedEmail}"]`
    );
    if (typeof highlightedElement?.scrollIntoView === 'function') {
      highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const timeoutId = setTimeout(() => {
      setHighlightedEmail(null);
    }, HIGHLIGHT_DURATION);

    return () => clearTimeout(timeoutId);
  }, [highlightedEmail, registrations]);

  return (
    <section className="registrations-section" data-testid="list-page">
      <h1>Liste des inscrits</h1>
      {registrations.length === 0 ? (
        <p data-testid="no-registrations">Aucun inscrit pour le moment.</p>
      ) : (
        <ul data-testid="registrations-list">
          {registrations.map((registration, index) => (
            <li
              key={`${registration.email}-${index}`}
              data-testid="registration-item"
              data-highlight-email={registration.email}
              className={
                registration.email === highlightedEmail ? 'registration-item-highlight' : undefined
              }
            >
              {registration.prenom} {registration.nom} - {registration.email} - {registration.dateOfBirth} - {registration.ville} ({registration.codePostal})
            </li>
          ))}
        </ul>
      )}
      <Link to="/register" data-testid="go-to-registration">
        Nouvelle inscription
      </Link>

      {toastMessage && (
        <div className="toast toast-error" role="alert" data-testid="error-toast">
          {toastMessage}
        </div>
      )}
    </section>
  );
}

export default ListPage;
