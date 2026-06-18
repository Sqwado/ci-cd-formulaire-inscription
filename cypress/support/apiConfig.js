const DEFAULT_API_URL = 'http://localhost:8000';

function getApiBaseUrl() {
  const configuredUrl = Cypress.config('env')?.REACT_APP_API_URL;
  const url =
    configuredUrl && String(configuredUrl).trim()
      ? String(configuredUrl)
      : DEFAULT_API_URL;

  return url.replace(/\/$/, '');
}

function apiUrl(path = '') {
  return `${getApiBaseUrl()}${path}`;
}

module.exports = { getApiBaseUrl, apiUrl, DEFAULT_API_URL };
