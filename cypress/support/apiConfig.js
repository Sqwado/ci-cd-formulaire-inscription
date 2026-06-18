const DEFAULT_API_URL = 'http://localhost:8000';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

function apiPathRegex(apiPath = '') {
  const base = escapeRegex(getApiBaseUrl());
  const normalizedPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  const pathPart = escapeRegex(normalizedPath);
  return new RegExp(`^${base}${pathPart}/?$`);
}

module.exports = { getApiBaseUrl, apiUrl, apiPathRegex, DEFAULT_API_URL };
