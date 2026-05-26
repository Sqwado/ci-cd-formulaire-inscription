import { screen, fireEvent, act } from '@testing-library/react';
import RegistrationPage from './RegistrationPage';
import * as moduleApi from '../module/module';
import { renderWithRouter } from '../test/renderWithRouter';

const fillValidForm = () => {
  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean' } });
  fireEvent.change(screen.getByTestId('email'), { target: { value: 'jean.dupont@email.com' } });
  fireEvent.change(screen.getByTestId('dateDeNaissance'), { target: { value: '1990-01-01' } });
  fireEvent.change(screen.getByTestId('ville'), { target: { value: 'Paris' } });
  fireEvent.change(screen.getByTestId('codePostal'), { target: { value: '75001' } });
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

test('desactive le bouton tant que les champs requis ne sont pas valides', () => {
  renderWithRouter(<RegistrationPage />);
  expect(screen.getByTestId('submit')).toBeDisabled();

  fillValidForm();
  expect(screen.getByTestId('submit')).toBeEnabled();

  fireEvent.change(screen.getByTestId('email'), { target: { value: '' } });
  expect(screen.getByTestId('submit')).toBeDisabled();
});

test('affiche les erreurs de champs et un toast global lors d une soumission invalide', () => {
  renderWithRouter(<RegistrationPage />);

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean' } });
  fireEvent.change(screen.getByTestId('email'), { target: { value: 'email-invalide' } });
  fireEvent.change(screen.getByTestId('dateDeNaissance'), { target: { value: '2009-01-01' } });
  fireEvent.change(screen.getByTestId('ville'), { target: { value: 'Paris9' } });
  fireEvent.change(screen.getByTestId('codePostal'), { target: { value: '7500' } });

  const form = screen.getByTestId('submit').closest('form');
  fireEvent.submit(form);

  expect(screen.getByTestId('email-error')).toBeInTheDocument();
  expect(screen.getByTestId('dateOfBirth-error')).toBeInTheDocument();
  expect(screen.getByTestId('ville-error')).toBeInTheDocument();
  expect(screen.getByTestId('codePostal-error')).toBeInTheDocument();
  expect(screen.getByTestId('error-toast')).toHaveTextContent('Veuillez corriger les erreurs du formulaire.');
  expect(localStorage.getItem('registrations')).toBeNull();
});

test('soumet un formulaire valide, affiche un toast de succes et enregistre dans localStorage', () => {
  renderWithRouter(<RegistrationPage />);
  fillValidForm();

  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('success-toast')).toHaveTextContent('Formulaire valide et enregistre.');
  expect(screen.getByTestId('nom')).toHaveValue('');
  expect(screen.getByTestId('prenom')).toHaveValue('');
  expect(screen.getByTestId('email')).toHaveValue('');
  expect(screen.getByTestId('dateDeNaissance')).toHaveValue('');
  expect(screen.getByTestId('ville')).toHaveValue('');
  expect(screen.getByTestId('codePostal')).toHaveValue('');

  expect(JSON.parse(localStorage.getItem('registrations'))).toEqual([
    {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      dateOfBirth: '1990-01-01',
      ville: 'Paris',
      codePostal: '75001'
    }
  ]);
});

test('masque le toast de succes apres le delai', () => {
  jest.useFakeTimers();
  renderWithRouter(<RegistrationPage />);
  fillValidForm();

  fireEvent.click(screen.getByTestId('submit'));
  expect(screen.getByTestId('success-toast')).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(screen.queryByTestId('success-toast')).not.toBeInTheDocument();
});

test('gere un changement de champ inconnu sans planter', () => {
  renderWithRouter(<RegistrationPage />);
  fireEvent.change(screen.getByTestId('nom'), { target: { name: 'unknownField', value: 'foo' } });
  expect(screen.getByTestId('submit')).toBeDisabled();
});

test('affiche un toast d erreur quand handleSubmit leve une erreur avec message', () => {
  const submitSpy = jest.spyOn(moduleApi, 'handleSubmit').mockImplementation(() => {
    throw new Error('Erreur de sauvegarde');
  });

  renderWithRouter(<RegistrationPage />);
  fillValidForm();
  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('error-toast')).toHaveTextContent('Erreur de sauvegarde');
  submitSpy.mockRestore();
});

test('affiche un toast d erreur generique quand handleSubmit leve sans message', () => {
  const submitSpy = jest.spyOn(moduleApi, 'handleSubmit').mockImplementation(() => {
    throw {};
  });

  renderWithRouter(<RegistrationPage />);
  fillValidForm();
  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('error-toast')).toHaveTextContent('Une erreur est survenue');
  submitSpy.mockRestore();
});

test('affiche les erreurs nom et prenom pour des valeurs invalides', () => {
  renderWithRouter(<RegistrationPage />);

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont1' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean2' } });

  expect(screen.getByTestId('nom-error')).toBeInTheDocument();
  expect(screen.getByTestId('prenom-error')).toBeInTheDocument();
});
