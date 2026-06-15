/**
 * sw.js — DataSheet Service Worker
 * Provides offline fallback and caches static assets.
 */

const CACHE_NAME = 'datasheet-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/config.js',
  './js/app.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;500;600;700;800&display=swap'
];

/* ── Install: pre-cache static assets ───────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ── Activate: clean up old caches ──────────────────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── Fetch: network-first for sheet data, cache-first for assets ─────────── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Sheets requests: network-only (never cache)
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('google.com')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Static assets: cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
