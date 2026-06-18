import axios from 'axios';

const DEFAULT_API_URL = 'http://localhost:8000';

let pendingRegistrations = [];

function isOfflineMode() {
  return process.env.REACT_APP_OFFLINE_MODE === 'true';
}

function clearPendingRegistrations() {
  pendingRegistrations = [];
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
 * Count users from the remote API or pending queue in offline mode.
 *
 * @returns {Promise<number>} Number of registered users.
 */
async function countUsers() {
  if (isOfflineMode()) {
    return pendingRegistrations.length;
  }

  const registrations = await fetchRegistrations();
  return registrations.length;
}

/**
 * Fetch registrations from the API or pending queue in offline mode.
 *
 * @returns {Promise<Object[]>} Registrations list.
 */
async function fetchRegistrations() {
  if (isOfflineMode()) {
    return [...pendingRegistrations];
  }

  const response = await getApiClient().get('/users');
  return normalizeUsersResponse(response.data).map(mapApiUserToRegistration);
}

/**
 * Create a registration through the API or pending queue in offline mode.
 *
 * @param {Object} registration - Validated registration data.
 * @returns {Promise<Object>} Saved registration.
 */
async function createRegistration(registration) {
  if (isOfflineMode()) {
    pendingRegistrations.push(registration);
    return registration;
  }

  const response = await getApiClient().post('/users', mapRegistrationToApiPayload(registration));
  return mapApiUserToRegistration(response.data);
}

/**
 * Sync pending registrations to the remote API in offline mode.
 *
 * @returns {Promise<Object[]>} Synced registrations from the API.
 */
async function syncRegistrations() {
  const client = getApiClient();
  const syncedRegistrations = [];

  for (const registration of pendingRegistrations) {
    const response = await client.post('/users', mapRegistrationToApiPayload(registration));
    syncedRegistrations.push(mapApiUserToRegistration(response.data));
  }

  pendingRegistrations = [];
  return syncedRegistrations;
}

export {
  countUsers,
  fetchRegistrations,
  createRegistration,
  syncRegistrations,
  clearPendingRegistrations,
  getApiClient,
  isOfflineMode,
  mapApiUserToRegistration,
  mapRegistrationToApiPayload
};
