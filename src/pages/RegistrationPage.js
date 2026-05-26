import { useNavigate } from 'react-router-dom';
import NavLink from '../components/NavLink/NavLink';
import PageNavigation from '../components/PageNavigation/PageNavigation';
import RegistrationForm from '../components/RegistrationForm/RegistrationForm';
import Toast from '../components/Toast/Toast';
import { DOCS_URL } from '../constants/navigation';
import { useRegistrationForm } from '../hooks/useRegistrationForm';
import { useToast } from '../hooks/useToast';
import { getRegistrations, handleSubmit } from '../module/module';
import './RegistrationPage.css';

function RegistrationPage() {
  const navigate = useNavigate();
  const {
    formValues,
    fieldErrors,
    setFieldErrors,
    onChange,
    validateAllFields,
    isSubmitDisabled
  } = useRegistrationForm();
  const { toastMessage, toastType, showToast } = useToast();

  const onSubmit = (e) => {
    const nextErrors = validateAllFields();
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      e.preventDefault();
      showToast('Veuillez corriger les erreurs du formulaire.', 'error');
      return;
    }

    try {
      handleSubmit(e);
      const highlightIndex = getRegistrations().length - 1;
      navigate('/list', { state: { highlightIndex } });
    } catch (error) {
      e.preventDefault();
      showToast(error.message || 'Une erreur est survenue', 'error');
    }
  };

  return (
    <div className="registration-page" data-testid="registration-page">
      <RegistrationForm
        formValues={formValues}
        fieldErrors={fieldErrors}
        isSubmitDisabled={isSubmitDisabled}
        onChange={onChange}
        onSubmit={onSubmit}
      />

      <PageNavigation variant="below-form" ariaLabel="Navigation inscription">
        <NavLink to="/" testId="go-to-home">
          Accueil
        </NavLink>
        <NavLink to="/list" testId="go-to-list">
          Liste des inscrits
        </NavLink>
        <NavLink to="/legacy" testId="go-to-legacy">
          Mode legacy
        </NavLink>
        <NavLink href={DOCS_URL} external testId="go-to-docs">
          Documentation
        </NavLink>
      </PageNavigation>

      <Toast message={toastMessage} type={toastType} />
    </div>
  );
}

export default RegistrationPage;
