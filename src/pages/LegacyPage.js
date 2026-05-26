import { useEffect, useState } from 'react';
import NavLink from '../components/NavLink/NavLink';
import PageNavigation from '../components/PageNavigation/PageNavigation';
import RegistrationForm from '../components/RegistrationForm/RegistrationForm';
import RegistrationsList from '../components/RegistrationsList/RegistrationsList';
import Toast from '../components/Toast/Toast';
import { DOCS_URL } from '../constants/navigation';
import { useRegistrationForm } from '../hooks/useRegistrationForm';
import { useToast } from '../hooks/useToast';
import { getRegistrations, handleSubmit } from '../module/module';
import './LegacyPage.css';

function LegacyPage() {
  const {
    formValues,
    fieldErrors,
    setFieldErrors,
    onChange,
    resetForm,
    validateAllFields,
    isSubmitDisabled
  } = useRegistrationForm();
  const { toastMessage, toastType, showToast } = useToast();
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    try {
      setRegistrations(getRegistrations());
    } catch (error) {
      showToast(error.message || 'Une erreur est survenue', 'error');
    }
  }, [showToast]);

  const onSubmit = (e) => {
    const nextErrors = validateAllFields();
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      e.preventDefault();
      showToast('Veuillez corriger les erreurs du formulaire.', 'error');
      return;
    }

    try {
      const savedRegistration = handleSubmit(e);
      setRegistrations((previousRegistrations) => [
        ...previousRegistrations,
        savedRegistration
      ]);
      resetForm();
      showToast('Formulaire valide et enregistre.', 'success');
    } catch (error) {
      e.preventDefault();
      showToast(error.message || 'Une erreur est survenue', 'error');
    }
  };

  return (
    <div className="legacy-page" data-testid="legacy-page">
      <header className="legacy-page-header">
        <h1>Mode legacy</h1>
        <p>Formulaire et liste des inscrits sur une seule page (comportement initial).</p>
        <PageNavigation variant="on-dark" ariaLabel="Navigation legacy">
          <NavLink to="/" theme="dark" testId="go-to-home">
            Accueil
          </NavLink>
          <NavLink to="/register" theme="dark" variant="primary" testId="go-to-registration">
            Inscription
          </NavLink>
          <NavLink to="/list" theme="dark" testId="go-to-list">
            Liste
          </NavLink>
          <NavLink href={DOCS_URL} external theme="dark" testId="go-to-docs">
            Documentation
          </NavLink>
        </PageNavigation>
      </header>

      <RegistrationForm
        formValues={formValues}
        fieldErrors={fieldErrors}
        isSubmitDisabled={isSubmitDisabled}
        onChange={onChange}
        onSubmit={onSubmit}
      />

      <RegistrationsList
        registrations={registrations}
        title="Liste des inscrits"
        headingLevel="h2"
        testId="legacy-registrations-list"
      />

      <Toast message={toastMessage} type={toastType} />
    </div>
  );
}

export default LegacyPage;
