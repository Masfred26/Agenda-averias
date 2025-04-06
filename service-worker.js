// Service Worker v1

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
  // Si tuvieras un style.css externo, añádelo aquí.
];

// Evento 'install': Se dispara cuando el SW se instala por primera vez.
self.addEventListener('install', event => {
  console.log('SW: Instalando...');
  // Espera hasta que la promesa se resuelva
  event.waitUntil(
    caches.open(CACHE_NAME) // Abre (o crea) la caché especificada
      .then(cache => {
        console.log('SW: Cache abierta, añadiendo App Shell...');
        return cache.addAll(urlsToCache); // Descarga y guarda los archivos
      })
      .then(() => {
        console.log('SW: App Shell cacheado con éxito.');
        // Forza la activación del nuevo SW inmediatamente sin esperar a que
        // las pestañas antiguas se cierren (útil para actualizaciones rápidas)
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Falló el cacheo del App Shell durante la instalación.', error);
      })
  );
});

// Evento 'activate': Se dispara después de 'install' cuando el SW toma control.
// Es un buen lugar para limpiar caches antiguas.
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

// Evento 'fetch': Se dispara cada vez que la página (o el propio SW)
// realiza una petición de red (GET, POST, etc.).
self.addEventListener('fetch', event => {
  // Solo nos interesan las peticiones GET para cachear el App Shell
  if (event.request.method !== 'GET') {
    return; // Deja pasar otras peticiones (POST, etc.) sin interceptar
  }

  // Estrategia: Cache First (para el App Shell)
  // Intenta responder desde la caché primero.
  event.respondWith(
    caches.match(event.request) // Busca la petición en la caché
      .then(response => {
        // Si se encuentra en caché, devuelve la respuesta cacheada
        if (response) {
          // console.log('SW: Sirviendo desde caché:', event.request.url); // Log opcional
          return response;
        }

        // Si no está en caché, intenta obtenerla de la red
        // console.log('SW: No en caché, obteniendo desde red:', event.request.url); // Log opcional
        return fetch(event.request)
          .then(networkResponse => {
            // (Opcional) Podrías añadir aquí lógica para cachear nuevas
            // peticiones que no sean del App Shell si quisieras, pero
            // para esta app simple no es estrictamente necesario.
            // Ejemplo: cachear imágenes o fuentes bajo demanda.
            // IMPORTANTE: Clona la respuesta si vas a guardarla Y devolverla.
            // const responseToCache = networkResponse.clone();
            // caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));

            return networkResponse; // Devolver la respuesta de red al navegador
          })
          .catch(error => {
            // Falló la red y no estaba en caché.
            console.warn('SW: Fallo al obtener de red y no estaba en caché:', event.request.url, error);
            // Podrías devolver una página offline genérica aquí si la tuvieras cacheada:
            // return caches.match('/offline.html');
            // O simplemente dejar que falle la petición.
          });
      })
  );
});
