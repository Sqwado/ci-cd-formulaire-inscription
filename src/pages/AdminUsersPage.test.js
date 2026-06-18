import { screen, fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import AdminUsersPage from './AdminUsersPage';
import { renderWithRouter } from '../test/renderWithRouter';
import * as api from '../api/api';

const sampleUser = { id: 1, prenom: 'Jean', nom: 'Dupont' };

beforeEach(() => {
  jest.restoreAllMocks();
});

test('affiche un message quand aucun inscrit', async () => {
  jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([]);

  renderWithRouter(<AdminUsersPage />);

  await waitFor(() => {
    expect(screen.getByTestId('admin-no-users')).toHaveTextContent('Aucun inscrit.');
  });
});

test('affiche la liste des inscrits', async () => {
  jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleUser]);

  renderWithRouter(<AdminUsersPage />);

  await waitFor(() => {
    expect(screen.getByTestId('admin-users-list')).toBeInTheDocument();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });
});

test('supprime un inscrit et recharge la liste', async () => {
  jest
    .spyOn(api, 'fetchRegistrations')
    .mockResolvedValueOnce([sampleUser])
    .mockResolvedValueOnce([]);
  jest.spyOn(api, 'deleteUser').mockResolvedValue();

  renderWithRouter(<AdminUsersPage />);

  await waitFor(() => {
    expect(screen.getByTestId('admin-delete-user-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('admin-delete-user-1'));

  await waitFor(() => {
    expect(api.deleteUser).toHaveBeenCalledWith(1);
    expect(screen.getByTestId('success-toast')).toHaveTextContent('Inscrit supprimé.');
    expect(screen.getByTestId('admin-no-users')).toBeInTheDocument();
  });
});

test('affiche une erreur si le chargement echoue', async () => {
  jest.spyOn(api, 'fetchRegistrations').mockRejectedValue(new Error('Erreur reseau'));

  renderWithRouter(<AdminUsersPage />);

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Erreur reseau');
  });
});

test('affiche une erreur generique si le chargement echoue sans message', async () => {
  jest.spyOn(api, 'fetchRegistrations').mockRejectedValue({});

  renderWithRouter(<AdminUsersPage />);

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Impossible de charger les inscrits');
  });
});

test('affiche une erreur si la suppression echoue', async () => {
  jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleUser]);
  jest.spyOn(api, 'deleteUser').mockRejectedValue({
    response: { data: { detail: 'Suppression refusee' } }
  });

  renderWithRouter(<AdminUsersPage />);

  await waitFor(() => {
    expect(screen.getByTestId('admin-delete-user-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('admin-delete-user-1'));

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Suppression refusee');
  });
});

test('affiche une erreur generique si la suppression echoue sans detail', async () => {
  jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleUser]);
  jest.spyOn(api, 'deleteUser').mockRejectedValue(new Error('Erreur delete'));

  renderWithRouter(<AdminUsersPage />);

  await waitFor(() => {
    expect(screen.getByTestId('admin-delete-user-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('admin-delete-user-1'));

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Erreur delete');
  });
});

test('affiche une erreur generique si la suppression echoue sans detail ni message', async () => {
  jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleUser]);
  jest.spyOn(api, 'deleteUser').mockRejectedValue({});

  renderWithRouter(<AdminUsersPage />);

  await waitFor(() => {
    expect(screen.getByTestId('admin-delete-user-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('admin-delete-user-1'));

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Suppression impossible');
  });
});

test('deconnecte l administrateur', async () => {
  jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([]);
  const clearSpy = jest.spyOn(api, 'clearAdminToken').mockImplementation(() => {});

  renderWithRouter(
    <Routes>
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/login" element={<div data-testid="admin-login-page">login</div>} />
    </Routes>,
    { route: '/admin/users' }
  );

  await waitFor(() => {
    expect(screen.getByTestId('admin-logout')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('admin-logout'));

  expect(clearSpy).toHaveBeenCalled();
  expect(screen.getByTestId('admin-login-page')).toBeInTheDocument();
});
