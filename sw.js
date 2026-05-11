// DUMELHOR PRO - Service Worker
// Versão: mude este número sempre que fizer upload de novo ficheiro HTML
const CACHE_VERSION = 'dumelhor-v1';
const CACHE_FILES = [
    './DUMELHOR.html',
    './manifest.json'
];

// ── INSTALL: guarda o HTML e manifest em cache ──
self.addEventListener('install', event => {
    console.log('[SW] Install v' + CACHE_VERSION);
    event.waitUntil(
        caches.open(CACHE_VERSION).then(cache => {
            return cache.addAll(CACHE_FILES);
        }).then(() => self.skipWaiting())
    );
});

// ── ACTIVATE: limpa caches antigas ──
self.addEventListener('activate', event => {
    console.log('[SW] Activate v' + CACHE_VERSION);
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(k => k !== CACHE_VERSION).map(k => {
                    console.log('[SW] Apagar cache antiga:', k);
                    return caches.delete(k);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// ── FETCH: serve da cache, actualiza em background se online ──
self.addEventListener('fetch', event => {
    // Ignorar requests que não sejam GET
    if(event.request.method !== 'GET') return;

    // Ignorar requests externos (CDNs, APIs)
    const url = new URL(event.request.url);
    if(url.origin !== self.location.origin) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            // Tentar buscar versão actualizada em background
            const fetchPromise = fetch(event.request).then(response => {
                if(response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => null);

            // Retorna cache imediatamente se existir, senão espera pelo fetch
            return cached || fetchPromise;
        })
    );
});

// ── MENSAGEM: forçar actualização quando há nova versão ──
self.addEventListener('message', event => {
    if(event.data === 'skipWaiting') self.skipWaiting();
});
