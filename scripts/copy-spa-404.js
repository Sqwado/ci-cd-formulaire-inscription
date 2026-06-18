const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const indexFile = path.join(buildDir, 'index.html');
const notFoundFile = path.join(buildDir, '404.html');

if (!fs.existsSync(indexFile)) {
  console.error('copy-spa-404: build/index.html introuvable. Executez npm run build.');
  process.exit(1);
}

fs.copyFileSync(indexFile, notFoundFile);
console.log('copy-spa-404: build/404.html cree (routage SPA GitHub Pages).');
