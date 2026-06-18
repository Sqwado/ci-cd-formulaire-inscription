import axios from 'axios';
import {
  clearPendingRegistrations,
  clearAdminToken,
  countUsers,
  createRegistration,
  deleteUser,
  fetchRegistrations,
  fetchUserDetail,
  getAdminToken,
  loginAdmin,
  syncRegistrations
} from './api';

jest.mock('axios');

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockDelete = jest.fn();

const sampleUser = {
  id: 1,
  prenom: 'Jean',
  nom: 'Dupont'
};

const sampleRegistration = {
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@email.com',
  dateOfBirth: '1990-01-01',
  ville: 'Paris',
  codePostal: '75001'
};

const sampleApiResponse = {
  id: 1,
  ...sampleRegistration
};

beforeEach(() => {
  jest.clearAllMocks();
  clearPendingRegistrations();
  clearAdminToken();
  sessionStorage.clear();
  process.env.REACT_APP_OFFLINE_MODE = 'false';
  process.env.REACT_APP_API_URL = 'http://localhost:8000';
  axios.create.mockReturnValue({ get: mockGet, post: mockPost, delete: mockDelete });
});

describe('countUsers', () => {
  it('retourne le nombre d utilisateurs en cas de succes API', async () => {
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({ data: { users: [sampleUser, { ...sampleUser, id: 2 }] } })
    );

    await expect(countUsers()).resolves.toBe(2);
    expect(axios.create).toHaveBeenCalledWith({ baseURL: 'http://localhost:8000' });
    expect(mockGet).toHaveBeenCalledWith('/users');
  });

  it('propage l erreur API', async () => {
    mockGet.mockImplementationOnce(() => Promise.reject(new Error('API indisponible')));

    await expect(countUsers()).rejects.toThrow('API indisponible');
  });

  it('utilise la file d attente en mode offline', async () => {
    process.env.REACT_APP_OFFLINE_MODE = 'true';
    await createRegistration(sampleRegistration);

    await expect(countUsers()).resolves.toBe(1);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('accepte une reponse API encapsulee dans users', async () => {
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({ data: { users: [sampleUser, { ...sampleUser, id: 2 }] } })
    );

    await expect(countUsers()).resolves.toBe(2);
  });

  it('accepte une reponse API sous forme de tableau', async () => {
    mockGet.mockImplementationOnce(() => Promise.resolve({ data: [sampleUser] }));

    await expect(countUsers()).resolves.toBe(1);
  });

  it('retourne 0 pour une reponse API invalide', async () => {
    mockGet.mockImplementationOnce(() => Promise.resolve({ data: { foo: 'bar' } }));

    await expect(countUsers()).resolves.toBe(0);
  });

  it('utilise l url API par defaut si REACT_APP_API_URL est absente', async () => {
    delete process.env.REACT_APP_API_URL;
    mockGet.mockImplementationOnce(() => Promise.resolve({ data: { users: [] } }));

    await expect(countUsers()).resolves.toBe(0);
    expect(axios.create).toHaveBeenCalledWith({ baseURL: 'http://localhost:8000' });
  });
});

describe('fetchRegistrations', () => {
  it('retourne les inscriptions depuis l api', async () => {
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          users: [sampleUser]
        }
      })
    );

    const registrations = await fetchRegistrations();

    expect(registrations).toHaveLength(1);
    expect(registrations[0].prenom).toBe('Jean');
    expect(registrations[0].nom).toBe('Dupont');
  });

  it('retourne les inscriptions en attente en mode offline', async () => {
    process.env.REACT_APP_OFFLINE_MODE = 'true';
    await createRegistration(sampleRegistration);

    await expect(fetchRegistrations()).resolves.toEqual([sampleRegistration]);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('propage l erreur API', async () => {
    mockGet.mockRejectedValueOnce(new Error('GET indisponible'));

    await expect(fetchRegistrations()).rejects.toThrow('GET indisponible');
  });

  it('accepte une reponse API sous forme de tableau', async () => {
    mockGet.mockResolvedValueOnce({ data: [sampleUser] });

    const registrations = await fetchRegistrations();

    expect(registrations).toHaveLength(1);
    expect(registrations[0].prenom).toBe('Jean');
  });

  it('mappe les champs manquants avec des valeurs par defaut', async () => {
    mockGet.mockResolvedValueOnce({
      data: { users: [{ id: 5 }] }
    });

    await expect(fetchRegistrations()).resolves.toEqual([
      {
        id: 5,
        nom: '',
        prenom: '',
        email: '',
        dateOfBirth: '',
        ville: '',
        codePostal: ''
      }
    ]);
  });
});

describe('createRegistration', () => {
  it('envoie un POST en mode online', async () => {
    mockPost.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          id: 1,
          ...sampleRegistration
        }
      })
    );

    await expect(createRegistration(sampleRegistration)).resolves.toEqual({
      id: 1,
      ...sampleRegistration
    });
    expect(mockPost).toHaveBeenCalledWith('/users', sampleRegistration);
  });

  it('met en file d attente en mode offline', async () => {
    process.env.REACT_APP_OFFLINE_MODE = 'true';

    await expect(createRegistration(sampleRegistration)).resolves.toEqual(sampleRegistration);
    expect(mockPost).not.toHaveBeenCalled();
    await expect(fetchRegistrations()).resolves.toEqual([sampleRegistration]);
  });

  it('propage l erreur API', async () => {
    mockPost.mockImplementationOnce(() => Promise.reject(new Error('Erreur POST')));

    await expect(createRegistration(sampleRegistration)).rejects.toThrow('Erreur POST');
  });
});

describe('syncRegistrations', () => {
  it('envoie les inscriptions en attente vers l api', async () => {
    process.env.REACT_APP_OFFLINE_MODE = 'true';
    await createRegistration(sampleRegistration);

    mockPost.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          id: 1,
          ...sampleRegistration
        }
      })
    );

    await expect(syncRegistrations()).resolves.toEqual([
      {
        id: 1,
        ...sampleRegistration
      }
    ]);
    expect(mockPost).toHaveBeenCalledWith('/users', sampleRegistration);
    await expect(fetchRegistrations()).resolves.toEqual([]);
  });

  it('propage l erreur API', async () => {
    process.env.REACT_APP_OFFLINE_MODE = 'true';
    await createRegistration(sampleRegistration);
    mockPost.mockImplementationOnce(() => Promise.reject(new Error('Erreur sync')));

    await expect(syncRegistrations()).rejects.toThrow('Erreur sync');
  });
});

describe('loginAdmin', () => {
  it('stocke le token admin apres connexion', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'admin-token', email: 'loise.fenoll@ynov.com' }
    });

    await expect(
      loginAdmin('loise.fenoll@ynov.com', 'PvdrTAzTeR247sDnAZBr')
    ).resolves.toEqual({
      token: 'admin-token',
      email: 'loise.fenoll@ynov.com'
    });
    expect(getAdminToken()).toBe('admin-token');
  });

  it('propage l erreur API', async () => {
    mockPost.mockRejectedValueOnce(new Error('Login impossible'));

    await expect(loginAdmin('admin@test.com', 'wrong')).rejects.toThrow('Login impossible');
  });
});

describe('fetchUserDetail', () => {
  it('recupere les informations privees avec le token admin', async () => {
    sessionStorage.setItem('adminToken', 'admin-token');
    mockGet.mockResolvedValueOnce({ data: sampleApiResponse });

    await expect(fetchUserDetail(1)).resolves.toEqual({
      id: 1,
      ...sampleRegistration
    });
    expect(mockGet).toHaveBeenCalledWith('/users/1', {
      headers: { Authorization: 'Bearer admin-token' }
    });
  });

  it('envoie la requete sans header si aucun token admin', async () => {
    mockGet.mockResolvedValueOnce({ data: sampleApiResponse });

    await fetchUserDetail(1);

    expect(mockGet).toHaveBeenCalledWith('/users/1', { headers: {} });
  });
});

describe('deleteUser', () => {
  it('supprime un utilisateur avec le token admin', async () => {
    sessionStorage.setItem('adminToken', 'admin-token');
    mockDelete.mockResolvedValueOnce({ status: 204 });

    await expect(deleteUser(1)).resolves.toBeUndefined();
    expect(mockDelete).toHaveBeenCalledWith('/users/1', {
      headers: { Authorization: 'Bearer admin-token' }
    });
  });

  it('supprime sans header si aucun token admin', async () => {
    mockDelete.mockResolvedValueOnce({ status: 204 });

    await deleteUser(2);

    expect(mockDelete).toHaveBeenCalledWith('/users/2', { headers: {} });
  });
});
