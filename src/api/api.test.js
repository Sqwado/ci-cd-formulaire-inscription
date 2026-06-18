import axios from 'axios';
import {
  clearPendingRegistrations,
  countUsers,
  createRegistration,
  fetchRegistrations,
  syncRegistrations
} from './api';

jest.mock('axios');

const mockGet = jest.fn();
const mockPost = jest.fn();

const sampleUser = {
  id: 1,
  prenom: 'Jean',
  nom: 'Dupont',
  email: 'jean@email.com',
  dateOfBirth: '1990-01-01',
  ville: 'Paris',
  codePostal: '75001'
};

const sampleRegistration = {
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@email.com',
  dateOfBirth: '1990-01-01',
  ville: 'Paris',
  codePostal: '75001'
};

beforeEach(() => {
  jest.clearAllMocks();
  clearPendingRegistrations();
  process.env.REACT_APP_OFFLINE_MODE = 'false';
  process.env.REACT_APP_API_URL = 'http://localhost:8000';
  axios.create.mockReturnValue({ get: mockGet, post: mockPost });
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

    await expect(createRegistration(sampleRegistration)).resolves.toEqual(sampleRegistration);
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

    await expect(syncRegistrations()).resolves.toEqual([sampleRegistration]);
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
