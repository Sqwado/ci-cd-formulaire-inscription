import { screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import AdminLoginPage from './AdminLoginPage';
import { renderWithRouter } from '../test/renderWithRouter';
import * as api from '../api/api';

jest.mock('axios');

const mockPost = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  api.clearAdminToken();
  axios.create.mockReturnValue({ post: mockPost, get: jest.fn(), delete: jest.fn() });
});

test('connecte un administrateur et redirige vers la liste admin', async () => {
  const loginSpy = jest.spyOn(api, 'loginAdmin').mockResolvedValue({
    token: 'admin-token',
    email: 'loise.fenoll@ynov.com'
  });

  renderWithRouter(<AdminLoginPage />, { route: '/admin/login' });

  fireEvent.change(screen.getByTestId('admin-email'), {
    target: { value: 'loise.fenoll@ynov.com' }
  });
  fireEvent.change(screen.getByTestId('admin-password'), {
    target: { value: 'PvdrTAzTeR247sDnAZBr' }
  });
  fireEvent.click(screen.getByTestId('admin-login-submit'));

  await waitFor(() => {
    expect(loginSpy).toHaveBeenCalledWith('loise.fenoll@ynov.com', 'PvdrTAzTeR247sDnAZBr');
  });

  loginSpy.mockRestore();
});

test('affiche un toast en cas d echec de connexion', async () => {
  jest.spyOn(api, 'loginAdmin').mockRejectedValue({
    response: { data: { detail: 'Invalid credentials' } }
  });

  renderWithRouter(<AdminLoginPage />);

  fireEvent.change(screen.getByTestId('admin-email'), {
    target: { value: 'wrong@ynov.com' }
  });
  fireEvent.change(screen.getByTestId('admin-password'), {
    target: { value: 'wrong-password' }
  });
  fireEvent.click(screen.getByTestId('admin-login-submit'));

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Invalid credentials');
  });
});

test('affiche le message d erreur brut si aucun detail api', async () => {
  jest.spyOn(api, 'loginAdmin').mockRejectedValue(new Error('Erreur reseau'));

  renderWithRouter(<AdminLoginPage />);

  fireEvent.change(screen.getByTestId('admin-email'), {
    target: { value: 'admin@ynov.com' }
  });
  fireEvent.change(screen.getByTestId('admin-password'), {
    target: { value: 'password' }
  });
  fireEvent.click(screen.getByTestId('admin-login-submit'));

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Erreur reseau');
  });
});

test('affiche un message generique si la connexion echoue sans message', async () => {
  jest.spyOn(api, 'loginAdmin').mockRejectedValue({});

  renderWithRouter(<AdminLoginPage />);

  fireEvent.change(screen.getByTestId('admin-email'), {
    target: { value: 'admin@ynov.com' }
  });
  fireEvent.change(screen.getByTestId('admin-password'), {
    target: { value: 'password' }
  });
  fireEvent.click(screen.getByTestId('admin-login-submit'));

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Connexion impossible');
  });
});
