import { renderHook, act } from '@testing-library/react';
import {
  useRegistrationForm,
  validateRegistrationField,
  validateAllRegistrationFields
} from './useRegistrationForm';
import { EMPTY_FORM_VALUES } from '../constants/formFields';

test('validateRegistrationField retourne une erreur pour un email invalide', () => {
  expect(validateRegistrationField('email', 'invalide')).toMatch(/valid email/i);
});

test('validateAllRegistrationFields retourne toutes les erreurs', () => {
  const errors = validateAllRegistrationFields({
    ...EMPTY_FORM_VALUES,
    nom: 'Dupont1',
    email: 'bad'
  });

  expect(errors.nom).toBeTruthy();
  expect(errors.email).toBeTruthy();
});

test('desactive la soumission tant que le formulaire est incomplet', () => {
  const { result } = renderHook(() => useRegistrationForm());

  expect(result.current.isSubmitDisabled).toBe(true);

  act(() => {
    result.current.onChange({ target: { name: 'nom', value: 'Dupont' } });
  });

  expect(result.current.isSubmitDisabled).toBe(true);
});

test('resetForm remet les valeurs et erreurs a zero', () => {
  const { result } = renderHook(() => useRegistrationForm());

  act(() => {
    result.current.onChange({ target: { name: 'nom', value: 'Dupont1' } });
    result.current.resetForm();
  });

  expect(result.current.formValues).toEqual(EMPTY_FORM_VALUES);
  expect(result.current.fieldErrors).toEqual({});
});
