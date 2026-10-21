// Service worker mínimo: torna a app instalável. Não guarda nada em cache.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => new Response('Sem ligação', {status: 503})));
});
