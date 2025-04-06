// Service Worker v1 (Versión Limpia)

const CACHE_NAME = 'agenda-averias-cache-v1';
// Archivos esenciales para que la app funcione offline (App Shell)
const urlsToCache = [
  '/', // La ruta raíz (equivale a index.html en muchos servidores)
  'index.html',
  'main.js',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
  // NO incluyas el propio service-worker.js en la lista
];

// Evento 'install': Se dispara cuando el SW se instala por primera vez.
self.addEventListener('install', event => {
  console.log('SW: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME) // Abre (o crea) la caché especificada
      .then(cache => {
        console.log('SW: Cache abierta, añadiendo App Shell...');
        return cache.addAll(urlsToCache); // Descarga y guarda los archivos
      })
      .then(() => {
        console.log('SW: App Shell cacheado con éxito.');
        // Forza la activación del nuevo SW inmediatamente
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Falló el cacheo del App Shell durante la instalación.', error);
      })
  );
});

// Evento 'activate': Se dispara después de 'install' cuando el SW toma control.
// Limpia caches antiguas.
self.addEventListener('activate', event => {
  console.log('SW: Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Si el nombre de la caché no es el actual, bórrala
          if (cache !== CACHE_NAME) {
            console.log('SW: Limpiando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('SW: Cache limpiada. Listo para tomar control.');
      // Toma control de las páginas abiertas inmediatamente
      return self.clients.claim();
    })
  );
});

// Evento 'fetch': Intercepta peticiones GET. Estrategia: Cache First.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return; // Ignorar otras peticiones
  }

  event.respondWith(
    caches.match(event.request) // Busca en caché
      .then(response => {
        // Si está en caché, devolverla
        if (response) {
          // console.log('SW: Sirviendo desde caché:', event.request.url);
          return response;
        }

        // Si no está en caché, ir a la red
        // console.log('SW: No en caché, obteniendo desde red:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // (Opcional: podríamos cachear aquí la respuesta de red si quisiéramos)
            return networkResponse; // Devolver respuesta de red
          })
          .catch(error => {
            // Falló la red y no estaba en caché
            console.warn('SW: Fallo al obtener de red y no estaba en caché:', event.request.url, error);
            // Podríamos devolver una página offline aquí
          });
      })
  );
});

console.log("SW: Script cargado y listeners añadidos."); // Log final
