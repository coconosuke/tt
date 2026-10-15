/* Triad Tactics — offline cache. The page itself is fetched fresh when online and served from the cache when not. */
const C = 'tt2-6788139fb9';
const SHELL = ['./', 'index.html', 'manifest.webmanifest?v=6788139fb9'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('tt2-') === 0 && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url), own = u.origin === location.origin;
  /* the icons always come from the network, untouched: whoever asks for them (the Home Screen) gets the file itself */
  if (own && /\.png$/.test(u.pathname)) return;
  /* only the game's own page is kept as 'index.html'; another page (the iPhone's add-to-Home-Screen page) is kept as itself */
  const main = own && /(\/|index\.html)$/.test(u.pathname);
  if (r.mode === 'navigate' || main) {
    const key = main ? 'index.html' : r;
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(key, cp)); } return res; }).catch(() => caches.match(key).then(m => m || caches.match('index.html')).then(m => m || caches.match('./'))));
    return;
  }
  if (own || /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); } return res; })));
  }
});
