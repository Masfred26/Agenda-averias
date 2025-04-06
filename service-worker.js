self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('agenda-cache').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './main.js',
        './style.css',
        './manifest.json',
        './icons/icon-192x192.png',
        './icons/icon-512x512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});