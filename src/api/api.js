import axios from 'axios';
import { appendRegistration, getRegistrations } from '../module/module';

const DEFAULT_API_URL = 'http://localhost:8000';

function isOfflineMode() {
  return process.env.REACT_APP_OFFLINE_MODE === 'true';
}

function getApiClient() {
  const baseURL = process.env.REACT_APP_API_URL || DEFAULT_API_URL;
  return axios.create({ baseURL });
}

function mapApiUserToRegistration(user) {
  return {
    nom: user.nom || '',
    prenom: user.prenom || '',
    email: user.email || '',
    dateOfBirth: user.dateOfBirth || '1990-01-01',
    ville: user.ville || '',
    codePostal: user.codePostal || ''
  };
}

function mapRegistrationToApiPayload(registration) {
  return {
    prenom: registration.prenom,
    nom: registration.nom,
    email: registration.email,
    dateOfBirth: registration.dateOfBirth,
    ville: registration.ville,
    codePostal: registration.codePostal
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
 * Fetch registrations from the API or local storage in offline mode.
 *
 * @returns {Promise<Object[]>} Registrations list.
 */
async function fetchRegistrations() {
  if (isOfflineMode()) {
    return getRegistrations();
  }

  const response = await getApiClient().get('/users');
  return normalizeUsersResponse(response.data).map(mapApiUserToRegistration);
}

/**
 * Create a registration through the API or local storage in offline mode.
 *
 * @param {Object} registration - Validated registration data.
 * @returns {Promise<Object>} Saved registration.
 */
async function createRegistration(registration) {
  if (isOfflineMode()) {
    appendRegistration(registration);
    return registration;
  }

  const response = await getApiClient().post('/users', mapRegistrationToApiPayload(registration));
  return mapApiUserToRegistration(response.data);
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
