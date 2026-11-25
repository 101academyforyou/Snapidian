/* Snapidian service worker: offline shell + Web Share Target */
importScripts('app/db.js');
const CACHE = 'snapidian-v23';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'assets/site.css', 'assets/guide.css', 'assets/i18n.js', 'assets/icon.svg', 'assets/icon-192.png', 'assets/icon-512.png',
  'iphone/', 'iphone/index.html', 'app/', 'app/index.html', 'app/app.css', 'app/app.js', 'app/db.js', 'app/zip.js', 'app/meta.js', 'app/ai.js', 'app/vendor/anthropic-sdk.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method === 'POST' && url.pathname.endsWith('/app/share-target')) {
    e.respondWith((async () => {
      const form = await e.request.formData();
      const files = form.getAll('screenshots').filter(f => f && f.type && f.type.startsWith('image/'));
      for (const f of files) await SnapDB.put(SnapDB.newCapture(f, f.name));
      const title = form.get('title') || form.get('text') || '';
      return Response.redirect(new URL(`app/?shared=${files.length}${title ? '&t=' + encodeURIComponent(title) : ''}`, self.registration.scope).href, 303);
    })());
    return;
  }
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // network-first for same-origin so updates land quickly; cache as offline fallback
  e.respondWith(
    // 'no-cache' revalidates with the server (a cheap 304 when nothing changed), so a new deploy shows up at once
    // instead of after the HTTP cache (10 minutes on GitHub Pages) expires.
    fetch(e.request, { cache: 'no-cache' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
