import { screen, act, waitFor, fireEvent } from '@testing-library/react';
import ListPage from './ListPage';
import * as api from '../api/api';
import { renderWithRouter } from '../test/renderWithRouter';

const sampleRegistrations = [
  {
    nom: 'Martin',
    prenom: 'Alice',
    email: 'alice.martin@email.com',
    dateOfBirth: '1991-04-20',
    ville: 'Lyon',
    codePostal: '69001'
  },
  {
    nom: 'Martin',
    prenom: 'Alice',
    email: 'alice.martin2@email.com',
    dateOfBirth: '1992-05-21',
    ville: 'Lyon',
    codePostal: '69002'
  }
];

beforeEach(() => {
  api.clearPendingRegistrations();
  process.env.REACT_APP_OFFLINE_MODE = 'false';
});

afterEach(() => {
  jest.useRealTimers();
});

test('met en evidence uniquement la ligne a l index highlightIndex', async () => {
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockResolvedValue(sampleRegistrations);

  renderWithRouter(<ListPage />, {
    route: '/list',
    state: { highlightIndex: 1 }
  });

  await waitFor(() => {
    expect(screen.getAllByTestId('registration-item')).toHaveLength(2);
  });

  const items = screen.getAllByTestId('registration-item');
  expect(items[0]).not.toHaveClass('registration-item-highlight');
  expect(items[1]).toHaveClass('registration-item-highlight');
  fetchSpy.mockRestore();
});

test('fait defiler vers la ligne mise en evidence quand scrollIntoView est disponible', async () => {
  const scrollIntoViewMock = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleRegistrations[0]]);

  renderWithRouter(<ListPage />, {
    route: '/list',
    state: { highlightIndex: 0 }
  });

  await waitFor(() => {
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest' });
  });

  delete window.HTMLElement.prototype.scrollIntoView;
  fetchSpy.mockRestore();
});

test('retire la mise en evidence apres le delai', async () => {
  jest.useFakeTimers();
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleRegistrations[0]]);

  renderWithRouter(<ListPage />, {
    route: '/list',
    state: { highlightIndex: 0 }
  });

  await waitFor(() => {
    expect(screen.getByTestId('registration-item')).toHaveClass('registration-item-highlight');
  });

  act(() => {
    jest.advanceTimersByTime(4000);
  });

  expect(screen.getByTestId('registration-item')).not.toHaveClass('registration-item-highlight');
  fetchSpy.mockRestore();
});

test('affiche les inscriptions deja enregistrees', async () => {
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleRegistrations[0]]);

  renderWithRouter(<ListPage />);

  await waitFor(() => {
    expect(screen.queryByTestId('no-registrations')).not.toBeInTheDocument();
    expect(screen.getByTestId('registration-item')).toHaveTextContent('Alice Martin');
  });
  fetchSpy.mockRestore();
});

test('affiche un message quand aucune inscription n existe', async () => {
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([]);
  renderWithRouter(<ListPage />);
  await waitFor(() => {
    expect(screen.getByTestId('no-registrations')).toBeInTheDocument();
  });
  fetchSpy.mockRestore();
});

test('affiche un toast d erreur quand fetchRegistrations echoue', async () => {
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockRejectedValue(new Error('API indisponible'));

  renderWithRouter(<ListPage />);

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('API indisponible');
  });
  fetchSpy.mockRestore();
});

test('affiche un toast d erreur generique quand fetchRegistrations leve sans message', async () => {
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockRejectedValue({});

  renderWithRouter(<ListPage />);
  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Une erreur est survenue');
  });
  fetchSpy.mockRestore();
});

test('masque le toast d erreur apres le delai', async () => {
  jest.useFakeTimers();
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockRejectedValue(new Error('API indisponible'));

  renderWithRouter(<ListPage />);

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toBeInTheDocument();
  });

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(screen.queryByTestId('error-toast')).not.toBeInTheDocument();
  fetchSpy.mockRestore();
});

test('annule le delai de mise en evidence au demontage du composant', async () => {
  jest.useFakeTimers();
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleRegistrations[0]]);

  const { unmount } = renderWithRouter(<ListPage />, {
    route: '/list',
    state: { highlightIndex: 0 }
  });

  await waitFor(() => {
    expect(screen.getByTestId('registration-item')).toBeInTheDocument();
  });

  unmount();

  expect(() => {
    act(() => {
      jest.advanceTimersByTime(4000);
    });
  }).not.toThrow();
  fetchSpy.mockRestore();
});

test('annule le delai du toast au demontage du composant', async () => {
  jest.useFakeTimers();
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockRejectedValue(new Error('API indisponible'));
  const { unmount } = renderWithRouter(<ListPage />);

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toBeInTheDocument();
  });
  unmount();

  expect(() => {
    act(() => {
      jest.advanceTimersByTime(3000);
    });
  }).not.toThrow();
  fetchSpy.mockRestore();
});

test('n met pas a jour la liste apres demontage en cas de succes', async () => {
  let resolveFetch;
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
  );

  const { unmount } = renderWithRouter(<ListPage />);
  unmount();
  resolveFetch([
    {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      dateOfBirth: '1990-01-01',
      ville: 'Paris',
      codePostal: '75001'
    }
  ]);

  await waitFor(() => {
    expect(fetchSpy).toHaveBeenCalled();
  });
  fetchSpy.mockRestore();
});

test('n affiche pas de toast apres demontage en cas d erreur', async () => {
  let rejectFetch;
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockImplementation(
    () =>
      new Promise((_, reject) => {
        rejectFetch = reject;
      })
  );

  const { unmount } = renderWithRouter(<ListPage />);
  unmount();
  rejectFetch(new Error('API indisponible'));

  await waitFor(() => {
    expect(fetchSpy).toHaveBeenCalled();
  });
  expect(screen.queryByTestId('error-toast')).not.toBeInTheDocument();
  fetchSpy.mockRestore();
});

test('n appelle pas scrollIntoView quand la methode est absente', async () => {
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleRegistrations[0]]);
  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
  delete window.HTMLElement.prototype.scrollIntoView;

  renderWithRouter(<ListPage />, {
    route: '/list',
    state: { highlightIndex: 0 }
  });

  await waitFor(() => {
    expect(screen.getByTestId('registration-item')).toBeInTheDocument();
  });

  window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  fetchSpy.mockRestore();
});

test('synchronise les inscriptions en mode offline et affiche un toast de succes', async () => {
  process.env.REACT_APP_OFFLINE_MODE = 'true';
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleRegistrations[0]]);
  const syncSpy = jest.spyOn(api, 'syncRegistrations').mockResolvedValue([sampleRegistrations[0]]);

  renderWithRouter(<ListPage />);

  await waitFor(() => {
    expect(screen.getByTestId('registration-item')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: 'Synchroniser' }));

  await waitFor(() => {
    expect(screen.getByTestId('success-toast')).toHaveTextContent('Synchronisation réussie.');
  });
  expect(syncSpy).toHaveBeenCalled();

  fetchSpy.mockRestore();
  syncSpy.mockRestore();
});

test('affiche un toast d erreur quand la synchronisation echoue avec un message', async () => {
  process.env.REACT_APP_OFFLINE_MODE = 'true';
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleRegistrations[0]]);
  const syncSpy = jest
    .spyOn(api, 'syncRegistrations')
    .mockRejectedValue(new Error('Erreur de synchronisation'));

  renderWithRouter(<ListPage />);

  await waitFor(() => {
    expect(screen.getByTestId('registration-item')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: 'Synchroniser' }));

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Erreur de synchronisation');
  });

  fetchSpy.mockRestore();
  syncSpy.mockRestore();
});

test('affiche le detail de l erreur API quand la synchronisation echoue', async () => {
  process.env.REACT_APP_OFFLINE_MODE = 'true';
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleRegistrations[0]]);
  const syncSpy = jest.spyOn(api, 'syncRegistrations').mockRejectedValue({
    response: { data: { detail: 'Erreur serveur' } }
  });

  renderWithRouter(<ListPage />);

  await waitFor(() => {
    expect(screen.getByTestId('registration-item')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: 'Synchroniser' }));

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Erreur serveur');
  });

  fetchSpy.mockRestore();
  syncSpy.mockRestore();
});

test('affiche un message d erreur generique quand la synchronisation echoue sans detail', async () => {
  process.env.REACT_APP_OFFLINE_MODE = 'true';
  const fetchSpy = jest.spyOn(api, 'fetchRegistrations').mockResolvedValue([sampleRegistrations[0]]);
  const syncSpy = jest.spyOn(api, 'syncRegistrations').mockRejectedValue({});

  renderWithRouter(<ListPage />);

  await waitFor(() => {
    expect(screen.getByTestId('registration-item')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole('button', { name: 'Synchroniser' }));

  await waitFor(() => {
    expect(screen.getByTestId('error-toast')).toHaveTextContent('Erreur de synchronisation');
  });

  fetchSpy.mockRestore();
  syncSpy.mockRestore();
});
