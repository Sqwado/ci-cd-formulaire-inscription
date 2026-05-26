import { screen, fireEvent } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import RegistrationPage from './RegistrationPage';
import { renderWithRouter } from '../test/renderWithRouter';

const renderHomeWithRoutes = (initialRoute = '/') => {
  return renderWithRouter(
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegistrationPage />} />
    </Routes>,
    { route: initialRoute }
  );
};

test('affiche la page d accueil', () => {
  renderHomeWithRoutes('/');
  expect(screen.getByTestId('home-page')).toBeInTheDocument();
  expect(screen.queryByTestId('submit')).not.toBeInTheDocument();
});

test('navigue vers le formulaire d inscription', () => {
  renderHomeWithRoutes('/');
  fireEvent.click(screen.getByTestId('go-to-registration'));
  expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
  expect(screen.getByTestId('submit')).toBeInTheDocument();
});
