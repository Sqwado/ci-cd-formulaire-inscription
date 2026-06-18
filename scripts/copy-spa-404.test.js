const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { copySpa404 } = require('./copy-spa-404');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copy-spa-404-'));

try {
  const buildDir = path.join(tmpDir, 'build');
  fs.mkdirSync(buildDir);

  assert.throws(() => copySpa404(buildDir), /index.html introuvable/);

  const indexContent = '<!doctype html><html><body>app</body></html>';
  fs.writeFileSync(path.join(buildDir, 'index.html'), indexContent);

  const notFoundFile = copySpa404(buildDir);
  assert.strictEqual(notFoundFile, path.join(buildDir, '404.html'));
  assert.strictEqual(fs.readFileSync(notFoundFile, 'utf8'), indexContent);

  console.log('copy-spa-404.test.js: OK');
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
