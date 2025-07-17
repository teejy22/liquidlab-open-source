const CACHE_NAME = 'liquidlab-v1';
const STATIC_CACHE = 'liquidlab-static-v1';
// SECURITY: Removed DYNAMIC_CACHE to prevent caching sensitive API data

// Assets to cache immediately - ONLY public static assets
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// SECURITY: Sensitive endpoints that should NEVER be cached
const SENSITIVE_ENDPOINTS = [
  '/api/auth/',
  '/api/trades/',
  '/api/hyperliquid/',
  '/api/platforms/',
  '/api/moonpay/',
  '/api/fees/',
  '/api/payouts/',
  '/api/admin/',
  '/api/deposit/',
  '/api/privy/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS.filter(asset => asset !== '/offline.html'));
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // SECURITY: Clear ALL caches on activation to prevent data leakage
          if (cacheName !== STATIC_CACHE) {
            console.log('[Service Worker] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// SECURITY: Listen for logout events to clear all caches
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[Service Worker] Clearing all caches on logout');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip WebSocket connections
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return;

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) return;

  // SECURITY: Check if URL contains sensitive endpoints
  const isSensitive = SENSITIVE_ENDPOINTS.some(endpoint => 
    url.pathname.includes(endpoint)
  );

  // API requests - NEVER cache sensitive endpoints
  if (url.pathname.startsWith('/api/')) {
    if (isSensitive) {
      // SECURITY: Always fetch sensitive data fresh, never cache
      event.respondWith(fetch(request));
      return;
    }
    
    // For non-sensitive API endpoints (e.g., market prices), use network-only
    // SECURITY: Removed caching of API responses to prevent data leakage
    event.respondWith(fetch(request));
    return;
  }

  // Static assets - cache first, fallback to network
  // SECURITY: Only cache static assets like JS, CSS, images - never user data
  const isStaticAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ttf|eot)$/i) ||
                       url.pathname === '/' ||
                       url.pathname === '/manifest.json';

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Update cache in background for static assets only
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, response);
              });
            }
          });
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
    );
  } else {
    // SECURITY: For all other requests (HTML pages with dynamic content), always fetch fresh
    event.respondWith(
      fetch(request).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
    );
  }
});

// SECURITY: Implement cache expiration
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_EXPIRATION_CHECK') {
    // Clear caches older than 24 hours
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.open(cacheName).then((cache) => {
          cache.keys().then((requests) => {
            requests.forEach((request) => {
              cache.match(request).then((response) => {
                if (response) {
                  const fetchDate = new Date(response.headers.get('date') || 0);
                  if (Date.now() - fetchDate.getTime() > maxAge) {
                    cache.delete(request);
                  }
                }
              });
            });
          });
        });
      });
    });
  }
});

// Background sync for offline trades
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-trades') {
    event.waitUntil(syncOfflineTrades());
  }
});

async function syncOfflineTrades() {
  try {
    const cache = await caches.open('offline-trades');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync trade:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Push notifications for price alerts
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'liquidlab-notification',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'LiquidLab Trading', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if needed
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});