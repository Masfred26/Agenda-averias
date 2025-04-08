const CACHE_NAME = 'agenda-averias-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/storage.js',
  '/ui.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Estrategia de caché: Cache First, falling back to Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // Si no está en caché, intentamos obtenerlo de la red
        return fetch(event.request).then(netResponse => {
          // Si la respuesta es válida, la añadimos a la caché
          if (netResponse && netResponse.status === 200 && netResponse.type === 'basic') {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, netResponse.clone());
              return netResponse;
            });
          }
          
          return netResponse;
        });
      })
      .catch(() => {
        // Si no hay conexión y el recurso no está en caché
        return new Response('La aplicación está funcionando sin conexión. Algunos recursos pueden no estar disponibles.');
      })
  );
});

