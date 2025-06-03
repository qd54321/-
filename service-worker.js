// Define the name of your cache
const CACHE_NAME = 'custom-calculator-cache-v3'; // تم تغيير قيمة الإصدار هنا

// List all the assets you want to cache for offline use
const urlsToCache = [
  './', // Caches the current directory, which typically serves index.html
  './index.html',
  './manifest.json',
  './service-worker.js',
  // أضف مسارات الأيقونات هنا إذا قمت بإنشائها
  // './icons/icon-192x192.png',
  // './icons/icon-512x512.png',
  // أضف أي ملفات CSS أو JS أو خطوط خارجية أخرى ضرورية للعمل دون اتصال
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
          // Check if we received a valid response (200 OK)
          // تم إزالة شرط networkResponse.type !== 'basic' للسماح بتخزين الموارد الخارجية (CDNs) مؤقتاً
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // هام: استنساخ الاستجابة. الاستجابة هي تدفق (stream)
          // ولا يمكن استهلاكها إلا مرة واحدة. يجب استنساخها بحيث
          // يمكن استهلاك واحدة في ذاكرة التخزين المؤقت وواحدة في المتصفح.
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
