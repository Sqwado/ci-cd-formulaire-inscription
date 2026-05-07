
import { useEffect, useState } from 'react';
import './App.css';
import {
  getFormData,
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
  const [formValues, setFormValues] = useState({
    nom: '',
    prenom: '',
    email: '',
    dateOfBirth: '',
    ville: '',
    codePostal: ''
  });

  useEffect(() => {
    const savedData = getFormData();
    if (!savedData) {
      return;
    }

    setFormValues({
      nom: savedData.nom || '',
      prenom: savedData.prenom || '',
      email: savedData.email || '',
      dateOfBirth: savedData.dateOfBirth || '',
      ville: savedData.ville || '',
      codePostal: savedData.codePostal || ''
    });
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

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value
    }));
  };

  const onSubmit = (e) => {
    try {
      handleSubmit(e);
      setToastType('success');
      setToastMessage('Formulaire valide et enregistre.');
    } catch (error) {
      e.preventDefault();
      setToastType('error');
      setToastMessage(error.message || 'Une erreur est survenue');
    }
  };

  const isFormValid = () => {
    try {
      validateName(formValues.nom);
      validatePrenom(formValues.prenom);
      validateEmail(formValues.email);
      validateDateOfBirth(formValues.dateOfBirth);
      validateVille(formValues.ville);
      validateCodePostal(formValues.codePostal);
      return true;
    } catch (error) {
      return false;
    }
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
          </label>

          <label>
            Prenom
            <input type="text" data-testid="prenom" name="prenom" placeholder="Jean" value={formValues.prenom} onChange={onChange} />
          </label>

          <label>
            Email
            <input type="email" data-testid="email" name="email" placeholder="jean.dupont@email.com" value={formValues.email} onChange={onChange} />
          </label>

          <label>
            Date de naissance
            <input type="text" data-testid="dateDeNaissance" name="dateOfBirth" placeholder="YYYY-MM-DD" value={formValues.dateOfBirth} onChange={onChange} />
          </label>

          <label>
            Ville
            <input type="text" data-testid="ville" name="ville" placeholder="Paris" value={formValues.ville} onChange={onChange} />
          </label>

          <label>
            Code postal
            <input type="text" data-testid="codePostal" name="codePostal" placeholder="75001" value={formValues.codePostal} onChange={onChange} />
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
    </div>
  );
}

export default App;
