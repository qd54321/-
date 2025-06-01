// Define the name of your cache
const CACHE_NAME = 'custom-calculator-cache-v2'; // قم بتغيير رقم الإصدار هنا في كل مرة تحدث فيها الملفات المخزنة مؤقتًا

// List all the assets you want to cache for offline use
const urlsToCache = [
  './', // Caches the current directory, which typically serves index.html
  './index.html',
  './manifest.json',
  './service-worker.js',
  // Add paths to your icons if you created them (تأكد من وجود هذه الملفات في مجلد icons)
  // './icons/icon-192x192.png',
  // './icons/icon-512x512.png',
  // Add any other CSS, JS, or font files that are critical for offline functionality
  'https://cdn.tailwindcss.com', // Tailwind CSS CDN
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' // Google Fonts
];

// Install event: Caches all the assets defined in urlsToCache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache during install:', error);
      })
  );
});

// Fetch event: Intercepts network requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request).then((networkResponse) => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // IMPORTANT: Clone the response. A response is a stream
          // and can only be consumed once. We must clone it so that
          // we can consume one in the cache and one in the browser.
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        });
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        // يمكنك إرجاع صفحة احتياطية للعمل دون اتصال هنا إذا لزم الأمر
        // For example: return caches.match('/offline.html');
      })
  );
});

// Activate event: Cleans up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
