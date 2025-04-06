const CACHE_NAME = 'agenda-averias-cache-v1';
// Añadir aquí todos los archivos que componen el "App Shell"
const urlsToCache = [
    '/', // Cachea la ruta raíz (importante)
    '/index.html',
    '/main.js',
    '/manifest.json',
    '/icons/icon-192x192.png', // Cachear los iconos también
    '/icons/icon-512x512.png'
    // Si añades un archivo CSS externo, inclúyelo aquí: '/style.css'
];

// Instalación del Service Worker: abrir cache y añadir los archivos del App Shell
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Archivos cacheados con éxito.');
                return self.skipWaiting(); // Forzar activación inmediata
            })
            .catch(error => {
                console.error('Service Worker: Falló el cacheo inicial', error);
            })
    );
});

// Activación del Service Worker: limpiar caches antiguas (opcional pero recomendado)
self.addEventListener('activate', event => {
    console.log('Service Worker: Activando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Limpiando cache antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
             console.log('Service Worker: Cache limpio, listo para controlar la página.');
             return self.clients.claim(); // Tomar control inmediato de las páginas abiertas
        })
    );
});

// Interceptar peticiones (Fetch): servir desde cache primero (Cache First Strategy)
self.addEventListener('fetch', event => {
    // Solo interceptar peticiones GET
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si la respuesta está en cache, devolverla
                if (response) {
                    // console.log('Service Worker: Sirviendo desde cache:', event.request.url);
                    return response;
                }

                // Si no está en cache, intentar obtenerla de la red
                // console.log('Service Worker: Obteniendo desde red:', event.request.url);
                return fetch(event.request).then(
                    networkResponse => {
                        // Comprobar si la respuesta es válida
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                           return networkResponse;
                        }

                         // Importante: Clonar la respuesta. Una respuesta es un stream y
                        // solo puede ser consumida una vez. Necesitamos una para el navegador
                        // y otra para guardarla en cache.
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // cache.put(event.request, responseToCache); // Opcional: guardar en cache nuevas peticiones
                            });

                        return networkResponse;
                    }
                ).catch(error => {
                    console.warn('Service Worker: Fallo al obtener de la red.', error);
                    // Podrías devolver una página offline genérica aquí si la tienes cacheada
                    // return caches.match('/offline.html');
                });
            })
    );
});
