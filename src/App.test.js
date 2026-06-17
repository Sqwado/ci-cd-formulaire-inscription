import { screen } from '@testing-library/react';
import App from './App';
import { renderWithRouter } from './test/renderWithRouter';

const validRegistration = {
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@email.com',
  dateOfBirth: '1990-01-01',
  ville: 'Paris',
  codePostal: '75001'
};

beforeEach(() => {
  localStorage.clear();
});

test('affiche la page d accueil et 0 utilisateur sans inscription', () => {
  renderWithRouter(<App />);

  expect(screen.getByTestId('home-page')).toBeInTheDocument();
  expect(screen.getByTestId('users-count')).toHaveTextContent('0');
});

test('affiche le nombre d inscrits depuis le localStorage', () => {
  localStorage.setItem('registrations', JSON.stringify([validRegistration]));

  renderWithRouter(<App />);

  expect(screen.getByTestId('users-count')).toHaveTextContent('1');
});
