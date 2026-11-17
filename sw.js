const C = 'muscu-v115';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-v4-192.png', './icon-v4-512.png', './touch-v4.png', './splash-v2.png', './body-v5.png', './tab-train-white.png', './tab-prof-white.png', './tab-supp-white.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(FILES.map(u => new Request(u, {cache: 'reload'}))))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
// Réseau d'abord (pour recevoir les mises à jour), cache en secours.
// Si le réseau ne répond pas en 3 s (wifi de salle faible), on sert la version en cache.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  if (!same && !/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return;
  const net = fetch(same ? new Request(req, {cache: 'reload'}) : req).then(r => {
    if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(C).then(c => c.put(req, cp)); }
    return r;
  });
  const fallback = () => caches.match(req, {ignoreSearch: same}).then(m => m || (req.mode === 'navigate' ? caches.match('./index.html') : undefined));
  e.respondWith(new Promise(resolve => {
    let done = false;
    const finish = r => { if (!done && r) { done = true; resolve(r); } };
    const t = setTimeout(() => fallback().then(finish), 3000);
    net.then(r => { clearTimeout(t); finish(r); })
       .catch(() => { clearTimeout(t); fallback().then(m => { if (m) finish(m); else if (!done) { done = true; resolve(Response.error()); } }); });
  }));
});
