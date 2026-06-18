const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

const publicUrl = process.env.PUBLIC_URL || '/ci-cd-formulaire-inscription';
const normalizedPublicUrl = publicUrl.endsWith('/')
  ? publicUrl.slice(0, -1)
  : publicUrl;

const DEFAULT_API_URL = 'http://localhost:8000';

function resolveApiBaseUrl() {
  const fromEnv = process.env.REACT_APP_API_URL;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim().replace(/\/$/, '');
  }

  const bakedPath = path.join(__dirname, 'build', '.cypress-api-base-url');
  if (fs.existsSync(bakedPath)) {
    const fromBuild = fs.readFileSync(bakedPath, 'utf8').trim();
    if (fromBuild) {
      return fromBuild.replace(/\/$/, '');
    }
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
