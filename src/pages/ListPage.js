import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ListPage.css';
import { getRegistrations } from '../module/module';

const TOAST_DURATION = 3000;

function ListPage() {
  const [toastMessage, setToastMessage] = useState('');
  const [registrations, setRegistrations] = useState([]);

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

  return (
    <section className="registrations-section" data-testid="list-page">
      <h1>Liste des inscrits</h1>
      {registrations.length === 0 ? (
        <p data-testid="no-registrations">Aucun inscrit pour le moment.</p>
      ) : (
        <ul data-testid="registrations-list">
          {registrations.map((registration, index) => (
            <li key={`${registration.email}-${index}`} data-testid="registration-item">
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
