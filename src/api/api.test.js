import axios from 'axios';
import { countUsers, createRegistration, fetchRegistrations } from './api';

jest.mock('axios');

const mockGet = jest.fn();
const mockPost = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  process.env.REACT_APP_OFFLINE_MODE = 'false';
  process.env.REACT_APP_API_URL = 'https://jsonplaceholder.typicode.com';
  axios.create.mockReturnValue({ get: mockGet, post: mockPost });
});

describe('countUsers', () => {
  it('retourne le nombre d utilisateurs en cas de succes API', async () => {
    mockGet.mockImplementationOnce(() => Promise.resolve({ data: [{ id: 1 }, { id: 2 }] }));

    await expect(countUsers()).resolves.toBe(2);
    expect(axios.create).toHaveBeenCalledWith({ baseURL: 'https://jsonplaceholder.typicode.com' });
    expect(mockGet).toHaveBeenCalledWith('/users');
  });

  it('propage l erreur API', async () => {
    mockGet.mockImplementationOnce(() => Promise.reject(new Error('API indisponible')));

    await expect(countUsers()).rejects.toThrow('API indisponible');
  });

  it('utilise le localStorage en mode offline', async () => {
    process.env.REACT_APP_OFFLINE_MODE = 'true';
    localStorage.setItem(
      'registrations',
      JSON.stringify([{ nom: 'Dupont', prenom: 'Jean', email: 'a@b.com' }])
    );

    await expect(countUsers()).resolves.toBe(1);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('accepte une reponse API encapsulee dans users', async () => {
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({ data: { users: [{ id: 1 }, { id: 2 }] } })
    );

    await expect(countUsers()).resolves.toBe(2);
  });

  it('retourne 0 pour une reponse API invalide', async () => {
    mockGet.mockImplementationOnce(() => Promise.resolve({ data: { foo: 'bar' } }));

    await expect(countUsers()).resolves.toBe(0);
  });

  it('utilise l url API par defaut si REACT_APP_API_URL est absente', async () => {
    delete process.env.REACT_APP_API_URL;
    mockGet.mockImplementationOnce(() => Promise.resolve({ data: [] }));

    await expect(countUsers()).resolves.toBe(0);
    expect(axios.create).toHaveBeenCalledWith({ baseURL: 'https://jsonplaceholder.typicode.com' });
  });
});

describe('fetchRegistrations', () => {
  it('mappe les utilisateurs distants et fusionne le local', async () => {
    mockGet.mockImplementationOnce(() =>
      Promise.resolve({
        data: [
          {
            name: 'Jean Dupont',
            email: 'jean@email.com',
            address: { city: 'Paris', zipcode: '75001' }
          }
        ]
      })
    );

    localStorage.setItem(
      'registrations',
      JSON.stringify([
        {
          nom: 'Martin',
          prenom: 'Marie',
          email: 'marie@email.com',
          dateOfBirth: '1990-01-01',
          ville: 'Lyon',
          codePostal: '69001'
        }
      ])
    );

    const registrations = await fetchRegistrations();

    expect(registrations).toHaveLength(2);
    expect(registrations[1].prenom).toBe('Marie');
  });
});

describe('createRegistration', () => {
  it('envoie un POST puis met en cache localement', async () => {
    mockPost.mockImplementationOnce(() => Promise.resolve({ data: { id: 1 } }));

    const registration = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      dateOfBirth: '1990-01-01',
      ville: 'Paris',
      codePostal: '75001'
    };

    await expect(createRegistration(registration)).resolves.toEqual(registration);
    expect(mockPost).toHaveBeenCalledWith('/users', {
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      address: { city: 'Paris', zipcode: '75001' }
    });
    expect(JSON.parse(localStorage.getItem('registrations'))).toEqual([registration]);
  });

  it('propage l erreur API', async () => {
    mockPost.mockImplementationOnce(() => Promise.reject(new Error('Erreur POST')));

    await expect(
      createRegistration({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@email.com',
        dateOfBirth: '1990-01-01',
        ville: 'Paris',
        codePostal: '75001'
      })
    ).rejects.toThrow('Erreur POST');
  });
});
