import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    specPattern: 'tests/cypress/e2e/**/*.cy.ts',
    supportFile: false,
    fixturesFolder: false,
  },
  viewportWidth: 1280,
  viewportHeight: 900,
  defaultCommandTimeout: 10_000,
  screenshotsFolder: 'tests/cypress/screenshots',
  videosFolder: 'tests/cypress/videos',
  downloadsFolder: 'tests/cypress/downloads',
  video: false,
});
