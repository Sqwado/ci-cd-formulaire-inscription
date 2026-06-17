import axios from 'axios';
import { appendRegistration, getRegistrations } from '../module/module';

const DEFAULT_API_URL = 'https://jsonplaceholder.typicode.com';

function isOfflineMode() {
  return process.env.REACT_APP_OFFLINE_MODE === 'true';
}

function getApiClient() {
  const baseURL = process.env.REACT_APP_API_URL || DEFAULT_API_URL;
  return axios.create({ baseURL });
}

function mapApiUserToRegistration(user) {
  const nameParts = (user.name || '').trim().split(/\s+/);
  const prenom = nameParts[0] || '';
  const nom = nameParts.slice(1).join(' ') || prenom;

  return {
    nom,
    prenom,
    email: user.email || '',
    dateOfBirth: user.dateOfBirth || '1990-01-01',
    ville: user.address?.city || '',
    codePostal: user.address?.zipcode || ''
  };
}

function mapRegistrationToApiPayload(registration) {
  return {
    name: `${registration.prenom} ${registration.nom}`,
    email: registration.email,
    address: {
      city: registration.ville,
      zipcode: registration.codePostal
    }
  };
}

function normalizeUsersResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.users)) {
    return data.users;
  }
  return [];
}

/**
 * Count users from the remote API or local storage in offline mode.
 *
 * @returns {Promise<number>} Number of registered users.
 */
async function countUsers() {
  if (isOfflineMode()) {
    return getRegistrations().length;
  }

  const registrations = await fetchRegistrations();
  return registrations.length;
}

/**
 * Fetch registrations from the API merged with local session data.
 *
 * @returns {Promise<Object[]>} Registrations list.
 */
async function fetchRegistrations() {
  if (isOfflineMode()) {
    return getRegistrations();
  }

  const response = await getApiClient().get('/users');
  const remoteRegistrations = normalizeUsersResponse(response.data).map(mapApiUserToRegistration);
  const localRegistrations = getRegistrations();
  const localEmails = new Set(localRegistrations.map((registration) => registration.email));

  const uniqueRemoteRegistrations = remoteRegistrations.filter(
    (registration) => !localEmails.has(registration.email)
  );

  return [...uniqueRemoteRegistrations, ...localRegistrations];
}

/**
 * Create a registration through the API and cache it locally.
 *
 * @param {Object} registration - Validated registration data.
 * @returns {Promise<Object>} Saved registration.
 */
async function createRegistration(registration) {
  if (isOfflineMode()) {
    appendRegistration(registration);
    return registration;
  }

  await getApiClient().post('/users', mapRegistrationToApiPayload(registration));
  appendRegistration(registration);
  return registration;
}

export {
  countUsers,
  fetchRegistrations,
  createRegistration,
  getApiClient,
  isOfflineMode,
  mapApiUserToRegistration,
  mapRegistrationToApiPayload
};
