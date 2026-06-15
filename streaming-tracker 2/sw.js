const CACHE_NAME = 'datasphere-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './css/styles.css',
  './js/config.js',
  './js/api.js',
  './js/app.js',
  './js/pwa.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f4c8.svg'
];

// Installation event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching static assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheKeys => {
      return Promise.all(
        cacheKeys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - cache-first strategy for assets, network fallback for navigation
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Skip caching for Google Sheet APIs or Published CSVs to let js/api.js handle cache TTL
  if (requestUrl.hostname.includes('google.com') || requestUrl.hostname.includes('googleapis.com')) {
    return; // Fallback to normal browser network retrieval
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {
            // Check if valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Cache new dynamic resources if they match our same-origin
            if (event.request.method === 'GET' && requestUrl.origin === self.location.origin) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }

            return networkResponse;
          })
          .catch(error => {
            // Serve offline page for document navigation requests if offline
            if (event.request.mode === 'navigate') {
              return caches.match('./offline.html');
            }
            throw error;
          });
      })
  );
});
