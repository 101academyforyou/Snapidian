// Copies the website into www/ for the iOS app (Capacitor). The app opens straight into app/.
import { cpSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
const out = 'www';
rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const p of ['app', 'assets', 'iphone', 'privacy', 'manifest.webmanifest']) cpSync(p, `${out}/${p}`, { recursive: true });
writeFileSync(`${out}/index.html`, '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=app/"><script>location.replace("app/")</script>');
console.log('www/ ready');
