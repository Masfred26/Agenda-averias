// Service Worker - Agenda de Averías (Reconstrucción)
const CACHE_NAME = 'agenda-averias-cache-v1.1'; // Incrementar versión si cambias archivos cacheados
const urlsToCache = [
    '/', // Ruta raíz (index.html)
    'index.html',
    'main.js',
    'manifest.json',
    'icons/icon-192x192.png',
    'icons/icon-512x512.png'
    // Añadir aquí otros assets si los hubiera (CSS externo, otras imágenes, fuentes)
];

// Instalación: Cachear los archivos base de la aplicación
self.addEventListener('install', event => {
    console.log('[Service Worker] Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Cache abierto. Cacheando archivos base...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[Service Worker] Archivos base cacheados correctamente.');
                return self.skipWaiting(); // Activar SW inmediatamente
            })
            .catch(error => {
                console.error('[Service Worker] Fallo al cachear archivos base:', error);
            })
    );
});

// Activación: Limpiar caches antiguas
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando cache antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Cache limpia. Listo para controlar clientes.');
            return self.clients.claim(); // Tomar control de las pestañas abiertas
        })
    );
});

// Fetch: Estrategia Cache First (primero cache, luego red)
self.addEventListener('fetch', event => {
    // Solo interceptar peticiones GET
    if (event.request.method !== 'GET') {
        // console.log('[Service Worker] Ignorando petición no-GET:', event.request.method, event.request.url);
        return;
    }

    // Ignorar peticiones de extensiones de Chrome (pueden dar problemas)
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Si está en cache, devolverla
                if (cachedResponse) {
                    // console.log('[Service Worker] Sirviendo desde Cache:', event.request.url);
                    return cachedResponse;
                }

                // Si no está en cache, ir a la red
                // console.log('[Service Worker] Recurso no en cache. Pidiendo a la red:', event.request.url);
                return fetch(event.request).then(
                    networkResponse => {
                        // Comprobar si la respuesta de red es válida
                        if (!networkResponse || networkResponse.status !== 200 /*|| networkResponse.type !== 'basic'*/) {
                            // No cachear respuestas inválidas o de otros orígenes si type basic está comentado
                            // console.log('[Service Worker] Respuesta de red inválida. No se cachea:', networkResponse);
                            return networkResponse;
                        }

                         // Importante: Clonar la respuesta para poder usarla y cachearla
                        const responseToCache = networkResponse.clone();

                        // Cachear la nueva respuesta obtenida de la red
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // console.log('[Service Worker] Cacheando nueva respuesta:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });

                        // Devolver la respuesta de red original
                        return networkResponse;
                    }
                ).catch(error => {
                     console.warn('[Service Worker] Error al obtener de la red:', event.request.url, error);
                     // Aquí se podría devolver una página offline genérica si estuviera cacheada
                     // Ejemplo: return caches.match('/offline.html');
                     // O simplemente dejar que falle la petición (el navegador mostrará su error offline)
                 });
            })
    );
});
