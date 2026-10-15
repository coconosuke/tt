/* Triad Tactics — offline cache. The page itself is fetched fresh when online and served from the cache when not. */
const C = 'tt2-8bd83d0780';
const SHELL = ['./', 'index.html', 'apple-touch-icon.png', 'manifest.webmanifest?v=8bd83d0780', 'icon-180.png?v=8bd83d0780', 'icon-192.png?v=8bd83d0780', 'icon-512.png?v=8bd83d0780', 'icon-maskable-512.png?v=8bd83d0780'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('tt2-') === 0 && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url), own = u.origin === location.origin;
  if (r.mode === 'navigate' || (own && /(\/|index\.html)$/.test(u.pathname))) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put('index.html', cp)); } return res; }).catch(() => caches.match('index.html').then(m => m || caches.match('./'))));
    return;
  }
  if (own || /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); } return res; })));
  }
});
