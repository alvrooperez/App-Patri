/**
 * Build script simple: copia la webapp de app-novia/ a dist/
 * Sustituye a Vite/Rollup porque la app es HTML estatico sin build step.
 *
 * Excluye archivos de dev, el proyecto Android generado, previews, etc.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname);
const DEST = path.resolve(__dirname, 'dist');

const EXCLUDE = new Set([
  'dist',
  'node_modules',
  '.git',
  '.github',
  '_optimize.py',
  '_server.py',
  '_check.js',
  '.gitignore',
  'package.json',
  'package-lock.json',
  'build.js',
  'capacitor.config.json',
]);

const EXCLUDE_EXT = new Set(['.pyc']);
const EXCLUDE_PREFIX = new Set(['_', 'v1-', 'v2-', 'v3-', 'v4-', 'v5-', 'v6-', 'v7-', 'v8-', 'tmp_']);

function shouldExclude(name) {
  if (EXCLUDE.has(name)) return true;
  if (EXCLUDE_PREFIX.has(name.slice(0, name.includes('.') ? name.indexOf('.') : name.length))) return true;
  for (const p of EXCLUDE_PREFIX) {
    if (name.startsWith(p)) return true;
  }
  return false;
}

function shouldExcludeExt(ext) {
  return EXCLUDE_EXT.has(ext);
}

function copyRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of entries) {
    if (shouldExclude(entry.name)) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      if (shouldExcludeExt(path.extname(entry.name))) continue;
      fs.copyFileSync(srcPath, destPath);
      process.stdout.write('.');
    }
  }
}

console.log('Limpiando dist/...');
if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true, force: true });
}
fs.mkdirSync(DEST, { recursive: true });

console.log('Copiando de app-novia/ a dist/...');
copyRecursive(SRC, DEST);

console.log('\nListo. Contenido de dist/:');
const items = fs.readdirSync(DEST);
for (const item of items) {
  const stat = fs.statSync(path.join(DEST, item));
  console.log(`  ${stat.isDirectory() ? '[D]' : '   '} ${item}`);
}
