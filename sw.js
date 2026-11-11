const C = 'muscu-v37';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-v4-192.png', './icon-v4-512.png', './touch-v4.png', './body-v5.png', './body-v3.png', './tab-train-red-v2.png', './tab-train-white.png', './tab-prof-red-v2.png', './tab-prof-white.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(FILES.map(u => new Request(u, {cache: 'reload'}))))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
// Réseau d'abord (pour recevoir les mises à jour), cache en secours (hors connexion).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, {cache: 'reload'}).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request).then(m => m || caches.match('./index.html'))));
});
