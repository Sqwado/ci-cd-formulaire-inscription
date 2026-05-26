import { REGISTRATION_FIELDS } from '../../constants/formFields';
import FormField from '../FormField/FormField';
import './RegistrationForm.css';

function RegistrationForm({
  title = 'Inscription',
  description = 'Remplissez le formulaire pour enregistrer vos informations.',
  formValues,
  fieldErrors,
  isSubmitDisabled,
  onChange,
  onSubmit
}) {
  return (
    <form className="register-form" onSubmit={onSubmit}>
      <h1>{title}</h1>
      <p>{description}</p>

      <div className="field-grid">
        {REGISTRATION_FIELDS.map((field) => (
          <FormField
            key={field.name}
            label={field.label}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            testId={field.testId}
            errorTestId={field.errorTestId}
            value={formValues[field.name]}
            error={fieldErrors[field.name]}
            onChange={onChange}
          />
        ))}
      </div>

      <button type="submit" data-testid="submit" disabled={isSubmitDisabled}>
        Enregistrer
      </button>
    </form>
  );
}

export default RegistrationForm;
