/* Astro service worker — makes the app work offline */
const VERSION = 'astro-v2';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'astro.js', 'data.js', 'cities.js', 'sprites.js', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Pixel fonts: cache after first load so they work offline
  if (url.host.includes('fonts.googleapis.com') || url.host.includes('fonts.gstatic.com')) {
    e.respondWith(caches.open(VERSION).then(async (c) => { const hit = await c.match(e.request); const net = fetch(e.request).then((r) => { c.put(e.request, r.clone()).catch(() => {}); return r; }).catch(() => hit); return hit || net; }));
    return;
  }
  if (url.origin !== location.origin) return; // horoscope/geocoding APIs: network only (app caches results itself)
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => {
    const net = fetch(e.request).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
