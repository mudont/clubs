const CACHE_NAME = 'clubs-app-v1';
const STATIC_CACHE_NAME = 'clubs-static-v1';
const DYNAMIC_CACHE_NAME = 'clubs-dynamic-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https?:\/\/.*\/graphql$/,
  /^https?:\/\/.*\/health$/
];

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_API_CACHE_SIZE = 20;

// Cache first strategy for static assets
const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    throw error;
  }
};

// Network first strategy for API calls
const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      // Limit cache size
      const keys = await cache.keys();
      if (keys.length >= MAX_API_CACHE_SIZE) {
        await cache.delete(keys[0]);
      }
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Network request failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
};

// Stale while revalidate for other resources
const staleWhileRevalidate = async (request) => {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE_NAME);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(error => {
    console.error('Network request failed:', error);
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        self.clients.claim();
      })
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different request types
  if (STATIC_ASSETS.some(asset => url.pathname.includes(asset)) ||
      url.pathname.includes('/static/')) {
    // Cache first for static assets
    event.respondWith(cacheFirst(request));
  } else if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    // Network first for API calls
    event.respondWith(networkFirst(request));
  } else if (url.origin === location.origin) {
    // Stale while revalidate for same-origin requests
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'offline-actions') {
    event.waitUntil(processOfflineActions());
  }
});

// Push notifications
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/logo192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Process offline actions when back online
async function processOfflineActions() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('offline-action')) {
        try {
          await fetch(request);
          await cache.delete(request);
          console.log('Processed offline action:', request.url);
        } catch (error) {
          console.error('Failed to process offline action:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error processing offline actions:', error);
  }
}

// Error handling
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled promise rejection:', event.reason);
}); 