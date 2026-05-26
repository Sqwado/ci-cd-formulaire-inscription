import { screen, fireEvent, act } from '@testing-library/react';
import LegacyPage from './LegacyPage';
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

test('affiche le formulaire et la liste sur la meme page', () => {
  renderWithRouter(<LegacyPage />);
  expect(screen.getByTestId('legacy-page')).toBeInTheDocument();
  expect(screen.getByTestId('submit')).toBeInTheDocument();
  expect(screen.getByTestId('legacy-registrations-list')).toBeInTheDocument();
  expect(screen.getByTestId('no-registrations')).toBeInTheDocument();
});

test('desactive le bouton tant que les champs requis ne sont pas valides', () => {
  renderWithRouter(<LegacyPage />);
  expect(screen.getByTestId('submit')).toBeDisabled();

  fillValidForm();
  expect(screen.getByTestId('submit')).toBeEnabled();
});

test('affiche les erreurs de champs et un toast global lors d une soumission invalide', () => {
  renderWithRouter(<LegacyPage />);

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean' } });
  fireEvent.change(screen.getByTestId('email'), { target: { value: 'email-invalide' } });
  fireEvent.change(screen.getByTestId('dateDeNaissance'), { target: { value: '2009-01-01' } });
  fireEvent.change(screen.getByTestId('ville'), { target: { value: 'Paris9' } });
  fireEvent.change(screen.getByTestId('codePostal'), { target: { value: '7500' } });

  fireEvent.submit(screen.getByTestId('submit').closest('form'));

  expect(screen.getByTestId('email-error')).toBeInTheDocument();
  expect(screen.getByTestId('dateOfBirth-error')).toBeInTheDocument();
  expect(screen.getByTestId('ville-error')).toBeInTheDocument();
  expect(screen.getByTestId('codePostal-error')).toBeInTheDocument();
  expect(screen.getByTestId('error-toast')).toHaveTextContent('Veuillez corriger les erreurs du formulaire.');
  expect(localStorage.getItem('registrations')).toBeNull();
});

test('soumet un formulaire valide, affiche un toast de succes, vide les champs et met a jour la liste', () => {
  renderWithRouter(<LegacyPage />);
  fillValidForm();

  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('success-toast')).toHaveTextContent('Formulaire valide et enregistre.');
  expect(screen.getByTestId('nom')).toHaveValue('');
  expect(screen.getByTestId('prenom')).toHaveValue('');
  expect(screen.getByTestId('email')).toHaveValue('');
  expect(screen.getByTestId('dateDeNaissance')).toHaveValue('');
  expect(screen.getByTestId('ville')).toHaveValue('');
  expect(screen.getByTestId('codePostal')).toHaveValue('');
  expect(screen.getByTestId('registration-item')).toHaveTextContent('Jean Dupont');

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

test('accepte les noms avec accents et tirets dans le mode legacy', () => {
  renderWithRouter(<LegacyPage />);

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'François' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean-Pierre' } });
  fireEvent.change(screen.getByTestId('email'), { target: { value: 'jean.pierre@email.com' } });
  fireEvent.change(screen.getByTestId('dateDeNaissance'), { target: { value: '1990-01-01' } });
  fireEvent.change(screen.getByTestId('ville'), { target: { value: "L'Haÿ-les-Roses" } });
  fireEvent.change(screen.getByTestId('codePostal'), { target: { value: '94240' } });

  expect(screen.getByTestId('submit')).toBeEnabled();
  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('success-toast')).toBeInTheDocument();
  expect(screen.getByTestId('registration-item')).toHaveTextContent('Jean-Pierre François');
});

test('masque le toast de succes apres le delai', () => {
  jest.useFakeTimers();
  renderWithRouter(<LegacyPage />);
  fillValidForm();
  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('success-toast')).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(screen.queryByTestId('success-toast')).not.toBeInTheDocument();
});

test('affiche un toast d erreur quand handleSubmit leve une erreur', () => {
  const submitSpy = jest.spyOn(moduleApi, 'handleSubmit').mockImplementation(() => {
    throw new Error('Erreur de sauvegarde');
  });

  renderWithRouter(<LegacyPage />);
  fillValidForm();
  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('error-toast')).toHaveTextContent('Erreur de sauvegarde');
  submitSpy.mockRestore();
});

test('affiche un toast d erreur generique quand handleSubmit leve sans message', () => {
  const submitSpy = jest.spyOn(moduleApi, 'handleSubmit').mockImplementation(() => {
    throw {};
  });

  renderWithRouter(<LegacyPage />);
  fillValidForm();
  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('error-toast')).toHaveTextContent('Une erreur est survenue');
  submitSpy.mockRestore();
});

test('affiche un toast d erreur generique quand le chargement des inscriptions echoue', () => {
  const registrationsSpy = jest.spyOn(moduleApi, 'getRegistrations').mockImplementation(() => {
    throw {};
  });

  renderWithRouter(<LegacyPage />);
  expect(screen.getByTestId('error-toast')).toHaveTextContent('Une erreur est survenue');
  registrationsSpy.mockRestore();
});

test('affiche les erreurs nom et prenom en rouge pour des valeurs invalides', () => {
  renderWithRouter(<LegacyPage />);

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont1' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean2' } });

  const nomError = screen.getByTestId('nom-error');
  const prenomError = screen.getByTestId('prenom-error');

  expect(nomError).toBeInTheDocument();
  expect(prenomError).toBeInTheDocument();
  expect(nomError).toHaveClass('field-error');
  expect(prenomError).toHaveClass('field-error');
});
