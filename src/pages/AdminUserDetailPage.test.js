import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import AdminUserDetailPage from './AdminUserDetailPage';
import { renderWithRouter } from '../test/renderWithRouter';
import * as api from '../api/api';

const sampleUser = {
  id: 1,
  prenom: 'Jean',
  nom: 'Dupont',
  email: 'jean.dupont@email.com',
  dateOfBirth: '1990-01-01',
  ville: 'Paris',
  codePostal: '75001'
};

const renderDetailPage = () =>
  renderWithRouter(
    <Routes>
      <Route path="/admin/users/:userId" element={<AdminUserDetailPage />} />
      <Route path="/admin/users" element={<div data-testid="admin-users-list-page">liste</div>} />
    </Routes>,
    { route: '/admin/users/1' }
  );

beforeEach(() => {
  jest.restoreAllMocks();
});

test('affiche le chargement puis les informations privees', async () => {
  jest.spyOn(api, 'fetchUserDetail').mockResolvedValue(sampleUser);

  renderDetailPage();

  expect(screen.getByTestId('admin-user-loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByTestId('admin-user-email')).toHaveTextContent(sampleUser.email);
    expect(screen.getByTestId('admin-user-birthdate')).toHaveTextContent(sampleUser.dateOfBirth);
    expect(screen.getByTestId('admin-user-city')).toHaveTextContent(sampleUser.ville);
    expect(screen.getByTestId('admin-user-postal')).toHaveTextContent(sampleUser.codePostal);
  });
});

test('affiche une erreur si le chargement echoue', async () => {
  jest.spyOn(api, 'fetchUserDetail').mockRejectedValue({
    response: { data: { detail: 'Utilisateur introuvable' } }
  });

  renderDetailPage();

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Utilisateur introuvable');
  });
});

test('affiche une erreur generique si le chargement echoue sans detail', async () => {
  jest.spyOn(api, 'fetchUserDetail').mockRejectedValue(new Error('Erreur API'));

  renderDetailPage();

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Erreur API');
  });
});

test('affiche une erreur generique si le chargement echoue sans message', async () => {
  jest.spyOn(api, 'fetchUserDetail').mockRejectedValue({});

  renderDetailPage();

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Chargement impossible');
  });
});

test('supprime un inscrit et retourne a la liste admin', async () => {
  jest.spyOn(api, 'fetchUserDetail').mockResolvedValue(sampleUser);
  jest.spyOn(api, 'deleteUser').mockResolvedValue();

  renderDetailPage();

  await waitFor(() => {
    expect(screen.getByTestId('admin-delete-user')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('admin-delete-user'));

  await waitFor(() => {
    expect(api.deleteUser).toHaveBeenCalledWith('1');
    expect(screen.getByTestId('admin-users-list-page')).toBeInTheDocument();
  });
});

test('affiche une erreur si la suppression echoue', async () => {
  jest.spyOn(api, 'fetchUserDetail').mockResolvedValue(sampleUser);
  jest.spyOn(api, 'deleteUser').mockRejectedValue({
    response: { data: { detail: 'Suppression impossible' } }
  });

  renderDetailPage();

  await waitFor(() => {
    expect(screen.getByTestId('admin-delete-user')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('admin-delete-user'));

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Suppression impossible');
  });
});

test('affiche une erreur generique si la suppression echoue sans detail', async () => {
  jest.spyOn(api, 'fetchUserDetail').mockResolvedValue(sampleUser);
  jest.spyOn(api, 'deleteUser').mockRejectedValue(new Error('Erreur suppression'));

  renderDetailPage();

  await waitFor(() => {
    expect(screen.getByTestId('admin-delete-user')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('admin-delete-user'));

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Erreur suppression');
  });
});

test('affiche une erreur generique si la suppression echoue sans detail ni message', async () => {
  jest.spyOn(api, 'fetchUserDetail').mockResolvedValue(sampleUser);
  jest.spyOn(api, 'deleteUser').mockRejectedValue({});

  renderDetailPage();

  await waitFor(() => {
    expect(screen.getByTestId('admin-delete-user')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('admin-delete-user'));

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Suppression impossible');
  });
});

test('n affiche pas le toast d erreur apres demontage', async () => {
  let rejectDetail;
  jest.spyOn(api, 'fetchUserDetail').mockImplementation(
    () =>
      new Promise((_, reject) => {
        rejectDetail = reject;
      })
  );

  const { unmount } = renderDetailPage();
  unmount();

  await act(async () => {
    rejectDetail({ response: { data: { detail: 'Trop tard' } } });
  });

  expect(screen.queryByTestId('error-toast')).not.toBeInTheDocument();
});

test('n applique pas l etat apres demontage', async () => {
  let resolveDetail;
  jest.spyOn(api, 'fetchUserDetail').mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveDetail = resolve;
      })
  );

  const { unmount } = renderDetailPage();
  unmount();

  await act(async () => {
    resolveDetail(sampleUser);
  });

  expect(screen.queryByTestId('admin-user-email')).not.toBeInTheDocument();
});
