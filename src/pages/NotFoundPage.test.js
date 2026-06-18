import { fireEvent, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';
import { renderWithRouter } from '../test/renderWithRouter';

test('affiche le message 404 et un lien vers l accueil', () => {
  renderWithRouter(<NotFoundPage />, { route: '/inconnue' });

  expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  expect(screen.getByText('Page introuvable')).toBeInTheDocument();
  expect(screen.getByText('404')).toBeInTheDocument();
  expect(screen.getByTestId('go-to-home-from-404')).toHaveAttribute('href', '/');
});

test('permet de revenir a l accueil', () => {
  renderWithRouter(
    <Routes>
      <Route path="/" element={<div data-testid="home-page">accueil</div>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>,
    { route: '/route-inconnue' }
  );

  fireEvent.click(screen.getByTestId('go-to-home-from-404'));

  expect(screen.getByTestId('home-page')).toBeInTheDocument();
});
