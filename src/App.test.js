import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { getFormData, handleSubmit } from './module/module';

jest.mock('./module/module', () => {
  const actualModule = jest.requireActual('./module/module');

  return {
    ...actualModule,
    getFormData: jest.fn(() => null),
    handleSubmit: jest.fn((e) => {
      e.preventDefault();
    }),
  };
});

const realModule = jest.requireActual('./module/module');

beforeEach(() => {
  localStorage.clear();
  getFormData.mockReset();
  getFormData.mockReturnValue(null);
  handleSubmit.mockReset();
  handleSubmit.mockImplementation((e) => {
    e.preventDefault();
  });
});

afterEach(() => {
  jest.useRealTimers();
});

test('check form submission', () => {
  render(<App />);
  const nomInput = screen.getByTestId('nom');
  const prenomInput = screen.getByTestId('prenom');
  const emailInput = screen.getByTestId('email');
  const dateDeNaissanceInput = screen.getByTestId('dateDeNaissance');
  const villeInput = screen.getByTestId('ville');
  const codePostalInput = screen.getByTestId('codePostal');
  fireEvent.change(nomInput, { target: { value: 'John' } });
  fireEvent.change(prenomInput, { target: { value: 'Doe' } });
  fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
  fireEvent.change(dateDeNaissanceInput, { target: { value: '1990-01-01' } });
  fireEvent.change(villeInput, { target: { value: 'Paris' } });
  fireEvent.change(codePostalInput, { target: { value: '75001' } });
  expect(screen.getByTestId('submit')).toBeEnabled();
  fireEvent.click(screen.getByTestId('submit'));
  expect(handleSubmit).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('success-toast')).toHaveTextContent('Formulaire valide et enregistre.');
});

test('disable submit button while form fields are invalid', () => {
  render(<App />);

  expect(screen.getByTestId('submit')).toBeDisabled();

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean' } });
  fireEvent.change(screen.getByTestId('email'), { target: { value: 'invalid-email' } });
  fireEvent.change(screen.getByTestId('dateDeNaissance'), { target: { value: '1990-01-01' } });
  fireEvent.change(screen.getByTestId('ville'), { target: { value: 'Paris' } });
  fireEvent.change(screen.getByTestId('codePostal'), { target: { value: '75001' } });

  expect(screen.getByTestId('submit')).toBeDisabled();
});

test('hide success toast after timeout', () => {
  jest.useFakeTimers();

  render(<App />);

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean' } });
  fireEvent.change(screen.getByTestId('email'), { target: { value: 'jean.dupont@email.com' } });
  fireEvent.change(screen.getByTestId('dateDeNaissance'), { target: { value: '1990-01-01' } });
  fireEvent.change(screen.getByTestId('ville'), { target: { value: 'Paris' } });
  fireEvent.change(screen.getByTestId('codePostal'), { target: { value: '75001' } });

  fireEvent.click(screen.getByTestId('submit'));
  expect(screen.getByTestId('success-toast')).toHaveTextContent('Formulaire valide et enregistre.');

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(screen.queryByTestId('success-toast')).not.toBeInTheDocument();
});

test('show error toast when submission fails', () => {
  handleSubmit.mockImplementationOnce(() => {
    throw new Error('Erreur de validation');
  });

  render(<App />);
  const form = screen.getByTestId('submit').closest('form');

  fireEvent.submit(form);

  expect(screen.getByTestId('error-toast')).toHaveTextContent('Erreur de validation');
});

test('prefill form from localStorage data on load', () => {
  getFormData.mockReturnValueOnce({
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.com',
    dateOfBirth: '1990-01-01',
    ville: 'Paris',
    codePostal: '75001'
  });

  render(<App />);

  expect(screen.getByTestId('nom')).toHaveValue('Dupont');
  expect(screen.getByTestId('prenom')).toHaveValue('Jean');
  expect(screen.getByTestId('email')).toHaveValue('jean.dupont@email.com');
  expect(screen.getByTestId('dateDeNaissance')).toHaveValue('1990-01-01');
  expect(screen.getByTestId('ville')).toHaveValue('Paris');
  expect(screen.getByTestId('codePostal')).toHaveValue('75001');
});

test('fallback to empty string for missing saved fields', () => {
  getFormData.mockReturnValueOnce({
    nom: 'Dupont'
  });

  render(<App />);

  expect(screen.getByTestId('nom')).toHaveValue('Dupont');
  expect(screen.getByTestId('prenom')).toHaveValue('');
  expect(screen.getByTestId('email')).toHaveValue('');
  expect(screen.getByTestId('dateDeNaissance')).toHaveValue('');
  expect(screen.getByTestId('ville')).toHaveValue('');
  expect(screen.getByTestId('codePostal')).toHaveValue('');
});

test('show fallback error toast message when error has no message', () => {
  handleSubmit.mockImplementationOnce(() => {
    throw {};
  });

  render(<App />);
  const form = screen.getByTestId('submit').closest('form');

  fireEvent.submit(form);

  expect(screen.getByTestId('error-toast')).toHaveTextContent('Une erreur est survenue');
});

test('fallback to empty string for missing saved nom', () => {
  getFormData.mockReturnValueOnce({
    prenom: 'Jean'
  });

  render(<App />);

  expect(screen.getByTestId('nom')).toHaveValue('');
  expect(screen.getByTestId('prenom')).toHaveValue('Jean');
});

test('submits a valid registration form and saves data in localStorage', () => {
  getFormData.mockImplementation(realModule.getFormData);
  handleSubmit.mockImplementation(realModule.handleSubmit);

  render(<App />);

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean' } });
  fireEvent.change(screen.getByTestId('email'), { target: { value: 'jean.dupont@email.com' } });
  fireEvent.change(screen.getByTestId('dateDeNaissance'), { target: { value: '1990-01-01' } });
  fireEvent.change(screen.getByTestId('ville'), { target: { value: 'Paris' } });
  fireEvent.change(screen.getByTestId('codePostal'), { target: { value: '75001' } });

  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('success-toast')).toHaveTextContent('Formulaire valide et enregistre.');
  expect(JSON.parse(localStorage.getItem('formData'))).toEqual({
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.com',
    dateOfBirth: '1990-01-01',
    ville: 'Paris',
    codePostal: '75001'
  });
});

test('rejects a minor user and does not save data in localStorage', () => {
  const today = new Date();
  const minorBirthDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
  const formattedMinorBirthDate = minorBirthDate.toISOString().split('T')[0];

  getFormData.mockImplementation(realModule.getFormData);
  handleSubmit.mockImplementation(realModule.handleSubmit);

  render(<App />);

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean' } });
  fireEvent.change(screen.getByTestId('email'), { target: { value: 'jean.dupont@email.com' } });
  fireEvent.change(screen.getByTestId('dateDeNaissance'), { target: { value: formattedMinorBirthDate } });
  fireEvent.change(screen.getByTestId('ville'), { target: { value: 'Paris' } });
  fireEvent.change(screen.getByTestId('codePostal'), { target: { value: '75001' } });

  expect(screen.getByTestId('submit')).toBeDisabled();
  expect(localStorage.getItem('formData')).toBeNull();
});