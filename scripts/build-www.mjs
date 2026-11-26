// Copies the website into www/ for the iOS app (Capacitor). The app opens straight into app/.
//
// Capacitor serves any path without a file extension (such as "app/") as www/index.html, its SPA fallback.
// A link to a folder would therefore load the redirect page below again: "app/" looped forever and the app
// showed a blank white screen. Every link in www/ must name an actual file, so folder links get "index.html".
import { cpSync, rmSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const out = 'www';
rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const p of ['app', 'assets', 'iphone', 'privacy', 'manifest.webmanifest']) cpSync(p, `${out}/${p}`, { recursive: true });
writeFileSync(`${out}/index.html`, '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=app/index.html"><script>location.replace("app/index.html")</script>');

const htmlFiles = dir => readdirSync(dir).flatMap(name => {
  const p = join(dir, name);
  return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith('.html') ? [p] : [];
});
let fixed = 0;
for (const file of htmlFiles(out)) {
  const src = readFileSync(file, 'utf8');
  // Relative links ending in "/" (e.g. "../", "./", "../privacy/"); absolute URLs contain ":" and are left alone.
  const html = src.replace(/href="([^":#?]*\/)"/g, (_, path) => { fixed++; return `href="${path}index.html"`; });
  if (html !== src) writeFileSync(file, html);
}
const leftover = htmlFiles(out).filter(f => /href="[^":#?]*\/"/.test(readFileSync(f, 'utf8')));
if (leftover.length) { console.error('Folder links left in:', leftover); process.exit(1); }
console.log(`www/ ready (${fixed} folder links pointed at index.html)`);
