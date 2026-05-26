import { useState } from 'react';
import {
  validateCodePostal,
  validateDateOfBirth,
  validateEmail,
  validateName,
  validatePrenom,
  validateVille
} from '../module/module';
import { EMPTY_FORM_VALUES } from '../constants/formFields';

export function validateRegistrationField(name, value) {
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
}

export function validateAllRegistrationFields(values) {
  const errors = {};
  Object.keys(values).forEach((fieldName) => {
    const error = validateRegistrationField(fieldName, values[fieldName]);
    if (error) {
      errors[fieldName] = error;
    }
  });
  return errors;
}

export function useRegistrationForm(initialValues = EMPTY_FORM_VALUES) {
  const [formValues, setFormValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => {
      const nextValues = {
        ...prevValues,
        [name]: value
      };
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        [name]: validateRegistrationField(name, value)
      }));
      return nextValues;
    });
  };

  const resetForm = () => {
    setFormValues({ ...EMPTY_FORM_VALUES });
    setFieldErrors({});
  };

  const isFormValid = () => {
    const hasEmptyField = Object.values(formValues).some((value) => !value.trim());
    if (hasEmptyField) {
      return false;
    }
    return Object.keys(validateAllRegistrationFields(formValues)).length === 0;
  };

  return {
    formValues,
    fieldErrors,
    setFormValues,
    setFieldErrors,
    onChange,
    resetForm,
    validateAllFields: () => validateAllRegistrationFields(formValues),
    isSubmitDisabled: !isFormValid()
  };
}
