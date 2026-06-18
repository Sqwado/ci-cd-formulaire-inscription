const fs = require('fs');
const path = require('path');

function copySpa404(buildDir) {
  const indexFile = path.join(buildDir, 'index.html');
  const notFoundFile = path.join(buildDir, '404.html');

  if (!fs.existsSync(indexFile)) {
    throw new Error('copy-spa-404: build/index.html introuvable. Executez npm run build.');
  }

  fs.copyFileSync(indexFile, notFoundFile);
  return notFoundFile;
}

if (require.main === module) {
  const buildDir = path.join(__dirname, '..', 'build');
  copySpa404(buildDir);
  console.log('copy-spa-404: build/404.html cree (routage SPA GitHub Pages).');
}

module.exports = { copySpa404 };
