const { defineConfig } = require("cypress");

const publicUrl = process.env.PUBLIC_URL || "/ci-cd-formulaire-inscription";
const normalizedPublicUrl = publicUrl.endsWith("/")
  ? publicUrl.slice(0, -1)
  : publicUrl;

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: `http://localhost:3000${normalizedPublicUrl}`,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
