import { screen } from '@testing-library/react';
import App from './App';
import { renderWithRouter } from './test/renderWithRouter';

test('affiche la page d accueil sur la route racine', () => {
  renderWithRouter(<App />);
  expect(screen.getByTestId('home-page')).toBeInTheDocument();
});
