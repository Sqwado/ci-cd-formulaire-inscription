
import { useEffect, useState } from 'react';
import './App.css';
import {
  getRegistrations,
  handleSubmit,
  validateCodePostal,
  validateDateOfBirth,
  validateEmail,
  validateName,
  validatePrenom,
  validateVille
} from './module/module';

const TOAST_DURATION = 3000;

function App() {
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [registrations, setRegistrations] = useState([]);
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
    try {
      setRegistrations(getRegistrations());
    } catch (error) {
      setToastType('error');
      setToastMessage(error.message || 'Une erreur est survenue');
    }
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setToastMessage('');
      setToastType('');
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
      setToastType('error');
      setToastMessage('Veuillez corriger les erreurs du formulaire.');
      return;
    }

    try {
      const savedRegistration = handleSubmit(e);
      setRegistrations((prevRegistrations) => [...prevRegistrations, savedRegistration]);
      setFormValues({
        nom: '',
        prenom: '',
        email: '',
        dateOfBirth: '',
        ville: '',
        codePostal: ''
      });
      setFieldErrors({});
      setToastType('success');
      setToastMessage('Formulaire valide et enregistre.');
    } catch (error) {
      e.preventDefault();
      setToastType('error');
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
    <div className="App">
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
      </form>

      {toastMessage && (
        <div
          className={`toast ${toastType === 'success' ? 'toast-success' : 'toast-error'}`}
          role="alert"
          data-testid={toastType === 'success' ? 'success-toast' : 'error-toast'}
        >
          {toastMessage}
        </div>
      )}

      <section className="registrations-section">
        <h2>Liste des inscrits</h2>
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
      </section>
    </div>
  );
}

export default App;
