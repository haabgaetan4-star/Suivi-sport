const C = 'garage-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './touch.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(FILES.map(u => new Request(u, {cache: 'reload'}))))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith('garage-') && x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())));
// Réseau d'abord (mises à jour), cache en secours si pas de réseau ou réponse trop lente.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const net = fetch(new Request(req, {cache: 'reload'})).then(r => { if (r && r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(req, cp)); } return r; });
  const fallback = () => caches.match(req, {ignoreSearch: true}).then(m => m || (req.mode === 'navigate' ? caches.match('./index.html') : undefined));
  e.respondWith(new Promise(resolve => {
    let done = false; const finish = r => { if (!done && r) { done = true; resolve(r); } };
    const t = setTimeout(() => fallback().then(finish), 3000);
    net.then(r => { clearTimeout(t); finish(r); }).catch(() => { clearTimeout(t); fallback().then(m => { if (m) finish(m); else if (!done) { done = true; resolve(Response.error()); } }); });
  }));
});
