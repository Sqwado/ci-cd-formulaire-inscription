import axios from 'axios';

const DEFAULT_API_URL = 'http://localhost:8000';
const ADMIN_TOKEN_KEY = 'adminToken';

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

function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

function setAdminToken(token) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

function getAuthHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function mapApiUserToRegistration(user) {
  return {
    id: user.id,
    nom: user.nom || '',
    prenom: user.prenom || '',
    email: user.email || '',
    dateOfBirth: user.dateOfBirth || '',
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

async function countUsers() {
  if (isOfflineMode()) {
    return pendingRegistrations.length;
  }

  const registrations = await fetchRegistrations();
  return registrations.length;
}

async function fetchRegistrations() {
  if (isOfflineMode()) {
    return [...pendingRegistrations];
  }

  const response = await getApiClient().get('/users');
  return normalizeUsersResponse(response.data).map(mapApiUserToRegistration);
}

async function fetchUserDetail(userId) {
  const response = await getApiClient().get(`/users/${userId}`, {
    headers: getAuthHeaders()
  });
  return mapApiUserToRegistration(response.data);
}

async function createRegistration(registration) {
  if (isOfflineMode()) {
    pendingRegistrations.push(registration);
    return registration;
  }

  const response = await getApiClient().post('/users', mapRegistrationToApiPayload(registration));
  return mapApiUserToRegistration(response.data);
}

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

async function loginAdmin(email, password) {
  const response = await getApiClient().post('/auth/login', { email, password });
  setAdminToken(response.data.token);
  return response.data;
}

async function deleteUser(userId) {
  await getApiClient().delete(`/users/${userId}`, {
    headers: getAuthHeaders()
  });
}

export {
  countUsers,
  fetchRegistrations,
  fetchUserDetail,
  createRegistration,
  syncRegistrations,
  loginAdmin,
  deleteUser,
  clearPendingRegistrations,
  getApiClient,
  getAdminToken,
  clearAdminToken,
  isOfflineMode,
  mapApiUserToRegistration,
  mapRegistrationToApiPayload
};
