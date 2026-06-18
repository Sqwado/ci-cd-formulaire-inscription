import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import { renderWithRouter } from '../../test/renderWithRouter';
import * as api from '../../api/api';

beforeEach(() => {
  jest.restoreAllMocks();
});

test('redirige vers la page de connexion sans token admin', () => {
  jest.spyOn(api, 'getAdminToken').mockReturnValue(null);

  renderWithRouter(
    <Routes>
      <Route path="/admin/login" element={<div data-testid="admin-login-redirect">login</div>} />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <div data-testid="protected-content">protege</div>
          </AdminRoute>
        }
      />
    </Routes>,
    { route: '/admin/users' }
  );

  expect(screen.getByTestId('admin-login-redirect')).toBeInTheDocument();
  expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
});

test('affiche le contenu protege avec un token admin', () => {
  jest.spyOn(api, 'getAdminToken').mockReturnValue('admin-token');

  renderWithRouter(
    <Routes>
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <div data-testid="protected-content">protege</div>
          </AdminRoute>
        }
      />
    </Routes>,
    { route: '/admin/users' }
  );

  expect(screen.getByTestId('protected-content')).toBeInTheDocument();
});
