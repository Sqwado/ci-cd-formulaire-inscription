const { defineConfig } = require("cypress");

const publicUrl = process.env.PUBLIC_URL || "/ci-cd-formulaire-inscription";
const normalizedPublicUrl = publicUrl.endsWith("/")
  ? publicUrl.slice(0, -1)
  : publicUrl;

module.exports = defineConfig({
  e2e: {
    baseUrl: `http://localhost:3000${normalizedPublicUrl}`,
    excludeSpecPattern: [
      "**/docker-integration.cy.js",
      "**/offline.cy.js",
    ],
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
