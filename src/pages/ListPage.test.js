import { screen, act } from '@testing-library/react';
import ListPage from './ListPage';
import * as moduleApi from '../module/module';
import { renderWithRouter } from '../test/renderWithRouter';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

test('affiche les inscriptions deja enregistrees', () => {
  localStorage.setItem(
    'registrations',
    JSON.stringify([
      {
        nom: 'Martin',
        prenom: 'Alice',
        email: 'alice.martin@email.com',
        dateOfBirth: '1991-04-20',
        ville: 'Lyon',
        codePostal: '69001'
      }
    ])
  );

  renderWithRouter(<ListPage />);

  expect(screen.queryByTestId('no-registrations')).not.toBeInTheDocument();
  expect(screen.getByTestId('registration-item')).toHaveTextContent('Alice Martin');
});

test('affiche un message quand aucune inscription n existe', () => {
  renderWithRouter(<ListPage />);
  expect(screen.getByTestId('no-registrations')).toBeInTheDocument();
});

test('affiche un toast d erreur quand le parsing localStorage echoue', () => {
  localStorage.setItem('registrations', '{invalid json');
  renderWithRouter(<ListPage />);
  expect(screen.getByTestId('error-toast')).toHaveTextContent('unable to parse saved registrations');
});

test('affiche un toast d erreur generique quand getRegistrations leve sans message', () => {
  const registrationsSpy = jest.spyOn(moduleApi, 'getRegistrations').mockImplementation(() => {
    throw {};
  });

  renderWithRouter(<ListPage />);
  expect(screen.getByTestId('error-toast')).toHaveTextContent('Une erreur est survenue');
  registrationsSpy.mockRestore();
});

test('masque le toast d erreur apres le delai', () => {
  jest.useFakeTimers();
  localStorage.setItem('registrations', '{invalid json');
  renderWithRouter(<ListPage />);

  expect(screen.getByTestId('error-toast')).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(screen.queryByTestId('error-toast')).not.toBeInTheDocument();
});

test('annule le delai du toast au demontage du composant', () => {
  jest.useFakeTimers();
  localStorage.setItem('registrations', '{invalid json');
  const { unmount } = renderWithRouter(<ListPage />);

  expect(screen.getByTestId('error-toast')).toBeInTheDocument();
  unmount();

  expect(() => {
    act(() => {
      jest.advanceTimersByTime(3000);
    });
  }).not.toThrow();
});
