/**
 * Build script: copia la webapp de app-novia/ a dist/
 * Ademas EMBEBE las imagenes del pool en manifest.json como base64
 * para que la app pueda usarlas sin hacer fetch() (importante en
 * Capacitor WebView donde fetch() no funciona con assets locales).
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
  'scripts',  // no incluir los scripts auxiliares
]);

const EXCLUDE_EXT = new Set(['.pyc']);

function shouldExclude(name) {
  if (EXCLUDE.has(name)) return true;
  for (const p of ['_', 'v1-', 'v2-', 'v3-', 'v4-', 'v5-', 'v6-', 'v7-', 'v8-', 'tmp_']) {
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

/* ========== EMBED POOL IMAGES INTO MANIFEST ========== */
// Lee manifest.json y reemplaza cada src por base64
function embedPoolImages() {
  const manifestPath = path.join(DEST, 'assets', 'pool', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.log('No hay manifest.json del pool, saltando embed');
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  if (!manifest.photos || !manifest.photos.length) return;

  let totalBytes = 0;
  for (const photo of manifest.photos) {
    // La ruta en manifest.json apunta a "assets/pool/_opt/<id>.jpg" que ahora
    // esta en dist/assets/pool/_opt/<id>.jpg (porque el copy recursivo la puso ahi)
    const imgPath = path.join(DEST, photo.src);
    if (!fs.existsSync(imgPath)) {
      console.log(`No encuentro imagen: ${imgPath}`);
      continue;
    }
    const buf = fs.readFileSync(imgPath);
    const b64 = buf.toString('base64');
    const dataUri = `data:image/jpeg;base64,${b64}`;
    photo.src = dataUri;
    photo.thumb = dataUri;  // mismo para thumb (es pequeño)
    photo.dataUri = true;   // flag para que la app sepa
    totalBytes += buf.length;
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nPool embebido: ${manifest.photos.length} imagenes, ${(totalBytes / 1024).toFixed(0)} KB total`);
}

/* ========== MAIN ========== */
console.log('Limpiando dist/...');
if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true, force: true });
}
fs.mkdirSync(DEST, { recursive: true });

console.log('Copiando de app-novia/ a dist/...');
copyRecursive(SRC, DEST);

console.log('\nEmbebiendo imagenes del pool en manifest.json...');
embedPoolImages();

console.log('\nListo. Contenido de dist/:');
const items = fs.readdirSync(DEST);
for (const item of items) {
  const stat = fs.statSync(path.join(DEST, item));
  console.log(`  ${stat.isDirectory() ? '[D]' : '   '} ${item}`);
}
