 const fs = require('fs');
 const path = require('path');
 
 const outDir = path.join(process.cwd(), 'out');
 const htaccessPath = path.join(outDir, '.htaccess');
const srcLogo = path.join(process.cwd(), 'src', 'imagens', 'logo.png');
const outFaviconPng = path.join(outDir, 'favicon.png');
const outAppleTouch = path.join(outDir, 'apple-touch-icon.png');
const outImagesDir = path.join(outDir, 'imagens');
const slides = [
  path.join(process.cwd(), 'src', 'imagens', 'SLIDE (1).png'),
  path.join(process.cwd(), 'src', 'imagens', 'SLIDE (2).png'),
  path.join(process.cwd(), 'src', 'imagens', 'SLIDE (3).png'),
];
const envJsPath = path.join(outDir, 'env.js');
const srcImagesDir = path.join(process.cwd(), 'src', 'imagens');
 
const content = `
RewriteEngine On
RewriteBase /

# Serve existing files
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Compression (requires mod_deflate)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json image/svg+xml
</IfModule>

# Caching (requires mod_expires)
<IfModule mod_expires.c>
  ExpiresActive On
  # Static Next chunks
  ExpiresByType application/javascript "access plus 30 days"
  ExpiresByType text/css "access plus 30 days"
  ExpiresByType image/svg+xml "access plus 30 days"
  ExpiresByType image/webp "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType font/woff2 "access plus 30 days"
</IfModule>

# Far-future cache for Next assets
<FilesMatch "^_next/.*\\.(js|css)$">
  Header set Cache-Control "public, max-age=2592000, immutable"
</FilesMatch>
<FilesMatch "^imagens/.*\\.(png|jpg|jpeg|webp|svg)$">
  Header set Cache-Control "public, max-age=2592000"
</FilesMatch>

# Map extensionless paths to their .html files if present
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !\\.[a-zA-Z0-9]{1,5}$
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.+)$ $1.html [L]

# SPA fallback to index.html
RewriteRule ^.*$ /index.html [L]
`;
 
 try {
   if (!fs.existsSync(outDir)) {
     console.error('Pasta "out" não encontrada. Execute "npm run build" primeiro.');
     process.exit(1);
   }
   fs.writeFileSync(htaccessPath, content.trim() + '\n', { encoding: 'utf8' });
   console.log('Arquivo .htaccess criado em:', htaccessPath);
  try {
    if (fs.existsSync(srcLogo)) {
      fs.copyFileSync(srcLogo, outFaviconPng);
      fs.copyFileSync(srcLogo, outAppleTouch);
      console.log('Favicon(s) copiados:', outFaviconPng, outAppleTouch);
    } else {
      console.warn('Logo não encontrada em', srcLogo, '— mantenho favicon existente.');
    }
  } catch (err) {
    console.warn('Falha ao copiar favicon(s):', err.message);
  }
  try {
    if (!fs.existsSync(outImagesDir)) fs.mkdirSync(outImagesDir, { recursive: true });
    slides.forEach((src, idx) => {
      if (fs.existsSync(src)) {
        const base = path.basename(src);
        const dest = path.join(outImagesDir, base);
        fs.copyFileSync(src, dest);
      }
    });
    console.log('Slides copiados para', outImagesDir);
  } catch (err) {
    console.warn('Falha ao copiar slides:', err.message);
  }
  try {
    if (fs.existsSync(srcImagesDir)) {
      if (!fs.existsSync(outImagesDir)) fs.mkdirSync(outImagesDir, { recursive: true });
      const entries = fs.readdirSync(srcImagesDir, { withFileTypes: true });
      entries.forEach((e) => {
        const src = path.join(srcImagesDir, e.name);
        const dest = path.join(outImagesDir, e.name);
        if (e.isDirectory()) {
          fs.mkdirSync(dest, { recursive: true });
          fs.readdirSync(src).forEach((name) => {
            const s = path.join(src, name);
            const d = path.join(dest, name);
            fs.copyFileSync(s, d);
          });
        } else if (e.isFile()) {
          fs.copyFileSync(src, dest);
        }
      });
      console.log('Imagens copiadas de src/imagens para', outImagesDir);
    }
  } catch (err) {
    console.warn('Falha ao copiar imagens:', err.message);
  }
  try {
    const envContent = `window.__NENEM_ENV={SUPABASE_URL:"${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}",SUPABASE_ANON_KEY:"${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}"};`;
    fs.writeFileSync(envJsPath, envContent, { encoding: 'utf8' });
    console.log('Env runtime criado em', envJsPath);
  } catch (err) {
    console.warn('Falha ao criar env runtime:', err.message);
  }
 } catch (e) {
   console.error('Falha ao criar .htaccess:', e);
   process.exit(1);
 }
