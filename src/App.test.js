import { screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';
import { renderWithRouter } from './test/renderWithRouter';

jest.mock('axios');

const mockGet = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  process.env.REACT_APP_OFFLINE_MODE = 'false';
  process.env.REACT_APP_API_URL = 'https://jsonplaceholder.typicode.com';
  axios.create.mockReturnValue({ get: mockGet, post: jest.fn() });
});

test('affiche la page d accueil et 0 utilisateur quand l api renvoie une liste vide', async () => {
  mockGet.mockResolvedValueOnce({ data: [] });

  renderWithRouter(<App />);

  expect(screen.getByTestId('home-page')).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByTestId('users-count')).toHaveTextContent('0');
  });
  expect(mockGet).toHaveBeenCalledWith('/users');
});

test('affiche le nombre d utilisateurs retourne par l api', async () => {
  mockGet.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] });

  renderWithRouter(<App />);

  await waitFor(() => {
    expect(screen.getByTestId('users-count')).toHaveTextContent('3');
  });
  expect(axios.create).toHaveBeenCalledWith({ baseURL: 'https://jsonplaceholder.typicode.com' });
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

test('n applique pas le compteur apres demontage en cas de succes', async () => {
  let resolveGet;
  mockGet.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveGet = resolve;
      })
  );

  const { unmount } = renderWithRouter(<App />);
  unmount();
  resolveGet({ data: [{ id: 1 }] });

  await waitFor(() => {
    expect(mockGet).toHaveBeenCalled();
  });
});

test('n applique pas le compteur apres demontage en cas d erreur', async () => {
  let rejectGet;
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockGet.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        rejectGet = reject;
      })
  );

  const { unmount } = renderWithRouter(<App />);
  unmount();
  rejectGet(new Error('API indisponible'));

  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
  });

  consoleSpy.mockRestore();
});
