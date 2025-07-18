const CACHE_NAME = 'freefanradio-v1';
const urlsToCache = [
  '/freefanradio/',
  '/freefanradio/index.html',
  '/freefanradio/sports/',
  '/freefanradio/hockey/',
  '/freefanradio/football/',
  '/freefanradio/about/',
  '/freefanradio/assets/css/main.css',
  '/freefanradio/assets/js/main.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and external URLs
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(error => {
          console.log('Fetch failed for:', event.request.url, error);
          // Return a fallback response or just let it fail gracefully
          return new Response('Resource not available', { 
            status: 503, 
            statusText: 'Service Unavailable' 
          });
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
