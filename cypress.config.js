const { defineConfig } = require("cypress");

const publicUrl = process.env.PUBLIC_URL || "/ci-cd-formulaire-inscription";
const normalizedPublicUrl = publicUrl.endsWith("/")
  ? publicUrl.slice(0, -1)
  : publicUrl;

module.exports = defineConfig({
  allowCypressEnv: false,
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000'
  },
  e2e: {
    baseUrl: `http://localhost:3000${normalizedPublicUrl}`,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
