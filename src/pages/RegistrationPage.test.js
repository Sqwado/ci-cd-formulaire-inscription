import { screen, fireEvent, act } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import RegistrationPage from './RegistrationPage';
import ListPage from './ListPage';
import * as moduleApi from '../module/module';
import { renderWithRouter } from '../test/renderWithRouter';

const renderRegistrationWithRoutes = (route = '/register') => {
  return renderWithRouter(
    <Routes>
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/list" element={<ListPage />} />
    </Routes>,
    { route }
  );
};

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

test('soumet un formulaire valide, redirige vers la liste et met en evidence la nouvelle ligne', () => {
  renderRegistrationWithRoutes();
  fillValidForm();

  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('list-page')).toBeInTheDocument();
  expect(screen.getByTestId('registration-item')).toHaveTextContent('Jean Dupont');
  expect(screen.getByTestId('registration-item')).toHaveClass('registration-item-highlight');

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

test('masque le toast d erreur apres le delai', () => {
  jest.useFakeTimers();
  renderWithRouter(<RegistrationPage />);

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean' } });
  fireEvent.change(screen.getByTestId('email'), { target: { value: 'email-invalide' } });
  fireEvent.change(screen.getByTestId('dateDeNaissance'), { target: { value: '1990-01-01' } });
  fireEvent.change(screen.getByTestId('ville'), { target: { value: 'Paris' } });
  fireEvent.change(screen.getByTestId('codePostal'), { target: { value: '75001' } });

  fireEvent.submit(screen.getByTestId('submit').closest('form'));

  expect(screen.getByTestId('error-toast')).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(screen.queryByTestId('error-toast')).not.toBeInTheDocument();
});

test('annule le delai du toast au demontage du composant', () => {
  jest.useFakeTimers();
  const { unmount } = renderWithRouter(<RegistrationPage />);

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean' } });
  fireEvent.change(screen.getByTestId('email'), { target: { value: 'email-invalide' } });
  fireEvent.change(screen.getByTestId('dateDeNaissance'), { target: { value: '1990-01-01' } });
  fireEvent.change(screen.getByTestId('ville'), { target: { value: 'Paris' } });
  fireEvent.change(screen.getByTestId('codePostal'), { target: { value: '75001' } });

  fireEvent.submit(screen.getByTestId('submit').closest('form'));
  expect(screen.getByTestId('error-toast')).toBeInTheDocument();

  unmount();

  expect(() => {
    act(() => {
      jest.advanceTimersByTime(3000);
    });
  }).not.toThrow();
});

test('affiche les erreurs nom et prenom pour des valeurs invalides', () => {
  renderWithRouter(<RegistrationPage />);

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont1' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean2' } });

  expect(screen.getByTestId('nom-error')).toBeInTheDocument();
  expect(screen.getByTestId('prenom-error')).toBeInTheDocument();
});
