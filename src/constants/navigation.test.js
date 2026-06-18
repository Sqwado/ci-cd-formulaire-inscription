import { DOCS_URL } from './navigation';

test('construit l url de documentation a partir de PUBLIC_URL', () => {
  const originalPublicUrl = process.env.PUBLIC_URL;
  process.env.PUBLIC_URL = '/ci-cd-formulaire-inscription';

  jest.resetModules();
  const { DOCS_URL: docsUrl } = require('./navigation');

  expect(docsUrl).toBe('/ci-cd-formulaire-inscription/docs/index.html');

  process.env.PUBLIC_URL = originalPublicUrl;
});

test('utilise une chaine vide si PUBLIC_URL est absent', () => {
  const originalPublicUrl = process.env.PUBLIC_URL;
  delete process.env.PUBLIC_URL;

  jest.resetModules();
  const { DOCS_URL: docsUrl } = require('./navigation');

  expect(docsUrl).toBe('/docs/index.html');

  process.env.PUBLIC_URL = originalPublicUrl;
});

test('exporte DOCS_URL', () => {
  expect(DOCS_URL).toContain('/docs/index.html');
});
