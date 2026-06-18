const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

const publicUrl = process.env.PUBLIC_URL || '/ci-cd-formulaire-inscription';
const normalizedPublicUrl = publicUrl.endsWith('/')
  ? publicUrl.slice(0, -1)
  : publicUrl;

const DEFAULT_API_URL = 'http://localhost:8000';

function readBakedApiBaseUrl() {
  const bakedPath = path.join(__dirname, 'build', '.cypress-api-base-url');
  if (!fs.existsSync(bakedPath)) {
    return '';
  }

  return fs.readFileSync(bakedPath, 'utf8').trim().replace(/\/$/, '');
}

function resolveApiBaseUrl() {
  const fromBuild = readBakedApiBaseUrl();
  if (fromBuild) {
    return fromBuild;
  }

  const fromEnv = process.env.REACT_APP_API_URL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim().replace(/\/$/, '');
  }

  return DEFAULT_API_URL;
}

const apiBaseUrl = resolveApiBaseUrl();

module.exports = defineConfig({
  allowCypressEnv: false,
  env: {
    REACT_APP_API_URL: apiBaseUrl
  },
  e2e: {
    baseUrl: `http://localhost:3000${normalizedPublicUrl}`,
    setupNodeEvents(on, config) {
      config.env.REACT_APP_API_URL = resolveApiBaseUrl();
      return config;
    }
  }
});
