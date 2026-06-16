import { screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';
import { renderWithRouter } from './test/renderWithRouter';

jest.mock('axios');

const mockGet = jest.fn();
const mockUsers = [
  ['Jean', 'Dupont'],
  ['Marie', 'Martin'],
];

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue({ data: { users: mockUsers } });
  axios.create.mockReturnValue({ get: mockGet });
});

test('affiche la page d accueil et le nombre d utilisateurs retourne par l api', async () => {
  renderWithRouter(<App />);

  expect(screen.getByTestId('home-page')).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByTestId('users-count')).toHaveTextContent(String(mockUsers.length));
  });
});

test('appelle l api sur le port configure', async () => {
  renderWithRouter(<App />);
  await waitFor(() => {
    expect(axios.create).toHaveBeenCalledWith({ baseURL: 'http://localhost:8000' });
    expect(mockGet).toHaveBeenCalledWith('/users');
  });
});

test('utilise le port defini dans REACT_APP_SERVER_PORT', async () => {
  const previousPort = process.env.REACT_APP_SERVER_PORT;
  process.env.REACT_APP_SERVER_PORT = '9000';

  renderWithRouter(<App />);
  await waitFor(() => {
    expect(axios.create).toHaveBeenCalledWith({ baseURL: 'http://localhost:9000' });
  });

  process.env.REACT_APP_SERVER_PORT = previousPort;
});

test('affiche 0 utilisateur et log l erreur si l api echoue', async () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockGet.mockRejectedValueOnce(new Error('API indisponible'));

  renderWithRouter(<App />);

  await waitFor(() => {
    expect(screen.getByTestId('users-count')).toHaveTextContent('0');
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
  });

  consoleSpy.mockRestore();
});
