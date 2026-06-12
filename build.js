/**
 * Build script:
 *  1. Copia la webapp de app-novia/ a dist/
 *  2. EMBEBE las imagenes del pool como base64 en una variable global JS
 *     inyectada en <head> del index.html (window.__POOL_PHOTOS__)
 *     Esto evita que la app tenga que hacer fetch() del manifest, lo cual
 *     falla en WebViews de Capacitor/PWABuilder por restricciones CORS.
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
  'scripts',
]);

const EXCLUDE_EXT = new Set(['.pyc']);
const EXCLUDE_PREFIX = ['_', 'v1-', 'v2-', 'v3-', 'v4-', 'v5-', 'v6-', 'v7-', 'v8-', 'tmp_'];

function shouldExclude(name) {
  if (EXCLUDE.has(name)) return true;
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

/* ========== EMBED POOL INTO INDEX.HTML ========== */
function embedPoolIntoHtml() {
  const manifestPath = path.join(SRC, 'assets', 'pool', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.log('No hay manifest.json del pool, saltando embed');
    injectEmpty();
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  if (!manifest.photos || !manifest.photos.length) {
    injectEmpty();
    return;
  }

  // Leer cada imagen y convertirla a data URI base64
  const photos = [];
  for (const p of manifest.photos) {
    const imgPath = path.join(SRC, p.src);
    if (!fs.existsSync(imgPath)) continue;
    const buf = fs.readFileSync(imgPath);
    const b64 = buf.toString('base64');
    const dataUri = `data:image/jpeg;base64,${b64}`;
    photos.push({
      id: p.id,
      name: p.name,
      src: dataUri,
      width: p.width,
      height: p.height,
    });
  }

  // Leer index.html, inyectar el script con window.__POOL_PHOTOS__ antes de </head>
  const htmlPath = path.join(DEST, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.log('No hay index.html en dist/');
    return;
  }
  let html = fs.readFileSync(htmlPath, 'utf-8');
  // Eliminar un embed anterior si existe
  html = html.replace(/<script>window\.__POOL_PHOTOS__[\s\S]*?<\/script>/g, '');
  // Inyectar el nuevo antes de </head>
  const inject = `<script>window.__POOL_PHOTOS__ = ${JSON.stringify(photos)};</script>`;
  html = html.replace('</head>', `  ${inject}\n</head>`);
  fs.writeFileSync(htmlPath, html);

  const totalBytes = photos.reduce((a, p) => a + p.src.length, 0);
  console.log(`\nPool embebido en index.html: ${photos.length} imagenes, ${(totalBytes / 1024 / 1024).toFixed(2)} MB total`);
}

function injectEmpty() {
  const htmlPath = path.join(DEST, 'index.html');
  if (!fs.existsSync(htmlPath)) return;
  let html = fs.readFileSync(htmlPath, 'utf-8');
  html = html.replace(/<script>window\.__POOL_PHOTOS__[\s\S]*?<\/script>/g, '');
  const inject = `<script>window.__POOL_PHOTOS__ = [];</script>`;
  html = html.replace('</head>', `  ${inject}\n</head>`);
  fs.writeFileSync(htmlPath, html);
  console.log('Pool vacio inyectado');
}

/* ========== EMBED MESSAGES INTO INDEX.HTML ========== */
function embedMessagesIntoHtml() {
  const messagesPath = path.join(SRC, 'mensajes.json');
  if (!fs.existsSync(messagesPath)) {
    console.log('No hay mensajes.json, saltando embed');
    return;
  }
  const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));

  const htmlPath = path.join(DEST, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.log('No hay index.html en dist/');
    return;
  }
  let html = fs.readFileSync(htmlPath, 'utf-8');
  // Eliminar inyeccion anterior
  html = html.replace(/<script>window\.__MESSAGES__[\s\S]*?<\/script>/g, '');
  // Inyectar antes de </head>, justo despues del pool si existe
  const inject = `<script>window.__MESSAGES__ = ${JSON.stringify(messages)};</script>`;
  if (html.includes('</head>')) {
    html = html.replace('</head>', `  ${inject}\n</head>`);
  }
  fs.writeFileSync(htmlPath, html);
  console.log(`Mensajes embebidos: ${Object.keys(messages).length} categorias`);
}

/* ========== MAIN ========== */
console.log('Limpiando dist/...');
if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true, force: true });
}
fs.mkdirSync(DEST, { recursive: true });

console.log('Copiando de app-novia/ a dist/...');
copyRecursive(SRC, DEST);

console.log('\nEmbebiendo pool en index.html...');
embedPoolIntoHtml();

console.log('\nEmbebiendo mensajes en index.html...');
embedMessagesIntoHtml();

console.log('\nListo. Contenido de dist/:');
const items = fs.readdirSync(DEST);
for (const item of items) {
  const stat = fs.statSync(path.join(DEST, item));
  console.log(`  ${stat.isDirectory() ? '[D]' : '   '} ${item}`);
}
