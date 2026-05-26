import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegistrationPage.css';
import {
  getRegistrations,
  handleSubmit,
  validateCodePostal,
  validateDateOfBirth,
  validateEmail,
  validateName,
  validatePrenom,
  validateVille
} from '../module/module';

const TOAST_DURATION = 3000;

function RegistrationPage() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formValues, setFormValues] = useState({
    nom: '',
    prenom: '',
    email: '',
    dateOfBirth: '',
    ville: '',
    codePostal: ''
  });

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setToastMessage('');
    }, TOAST_DURATION);

    return () => clearTimeout(timeoutId);
  }, [toastMessage]);

  const validateField = (name, value) => {
    try {
      switch (name) {
        case 'nom':
          validateName(value);
          break;
        case 'prenom':
          validatePrenom(value);
          break;
        case 'email':
          validateEmail(value);
          break;
        case 'dateOfBirth':
          validateDateOfBirth(value);
          break;
        case 'ville':
          validateVille(value);
          break;
        case 'codePostal':
          validateCodePostal(value);
          break;
        default:
          break;
      }
      return '';
    } catch (error) {
      return error.message;
    }
  };

  const validateAllFields = (values) => {
    const errors = {};
    Object.keys(values).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    });
    return errors;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => {
      const nextValues = {
        ...prevValues,
        [name]: value
      };
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        [name]: validateField(name, value)
      }));
      return nextValues;
    });
  };

  const onSubmit = (e) => {
    const nextErrors = validateAllFields(formValues);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      e.preventDefault();
      setToastMessage('Veuillez corriger les erreurs du formulaire.');
      return;
    }

    try {
      handleSubmit(e);
      const highlightIndex = getRegistrations().length - 1;
      navigate('/list', { state: { highlightIndex } });
    } catch (error) {
      e.preventDefault();
      setToastMessage(error.message || 'Une erreur est survenue');
    }
  };

  const isFormValid = () => {
    const hasEmptyField = Object.values(formValues).some((value) => !value.trim());
    if (hasEmptyField) {
      return false;
    }
    return Object.keys(validateAllFields(formValues)).length === 0;
  };

  const isSubmitDisabled = !isFormValid();

  return (
    <>
      <form className="register-form" onSubmit={onSubmit}>
        <h1>Inscription</h1>
        <p>Remplissez le formulaire pour enregistrer vos informations.</p>

        <div className="field-grid">
          <label>
            Nom
            <input type="text" data-testid="nom" name="nom" placeholder="Dupont" value={formValues.nom} onChange={onChange} />
            {fieldErrors.nom && <span className="field-error" data-testid="nom-error">{fieldErrors.nom}</span>}
          </label>

          <label>
            Prenom
            <input type="text" data-testid="prenom" name="prenom" placeholder="Jean" value={formValues.prenom} onChange={onChange} />
            {fieldErrors.prenom && <span className="field-error" data-testid="prenom-error">{fieldErrors.prenom}</span>}
          </label>

          <label>
            Email
            <input type="email" data-testid="email" name="email" placeholder="jean.dupont@email.com" value={formValues.email} onChange={onChange} />
            {fieldErrors.email && <span className="field-error" data-testid="email-error">{fieldErrors.email}</span>}
          </label>

          <label>
            Date de naissance
            <input type="text" data-testid="dateDeNaissance" name="dateOfBirth" placeholder="YYYY-MM-DD" value={formValues.dateOfBirth} onChange={onChange} />
            {fieldErrors.dateOfBirth && <span className="field-error" data-testid="dateOfBirth-error">{fieldErrors.dateOfBirth}</span>}
          </label>

          <label>
            Ville
            <input type="text" data-testid="ville" name="ville" placeholder="Paris" value={formValues.ville} onChange={onChange} />
            {fieldErrors.ville && <span className="field-error" data-testid="ville-error">{fieldErrors.ville}</span>}
          </label>

          <label>
            Code postal
            <input type="text" data-testid="codePostal" name="codePostal" placeholder="75001" value={formValues.codePostal} onChange={onChange} />
            {fieldErrors.codePostal && <span className="field-error" data-testid="codePostal-error">{fieldErrors.codePostal}</span>}
          </label>
        </div>

        <button type="submit" data-testid="submit" disabled={isSubmitDisabled}>Enregistrer</button>
        <Link to="/list" data-testid="go-to-list">Voir la liste des inscrits</Link>
      </form>

      {toastMessage && (
        <div className="toast toast-error" role="alert" data-testid="error-toast">
          {toastMessage}
        </div>
      )}
    </>
  );
}

export default RegistrationPage;
