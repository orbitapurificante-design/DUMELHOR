const CACHE_NAME = "dumelhor-v2";
const FILES_TO_CACHE = ["./DUMELHOR.html"];

// Instalar e fazer cache do HTML principal
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

// Activar e limpar caches antigos
self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Servir do cache se offline, rede se online
self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(cached => {
            return fetch(e.request)
                .then(response => {
                    // Actualizar cache com versão mais recente
                    if(response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                    }
                    return response;
                })
                .catch(() => cached); // offline: usar cache
        })
    );
});
