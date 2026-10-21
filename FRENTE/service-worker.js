// Service Worker simples — permite instalar a app (PWA) e abrir offline
// os ficheiros base (o Excel/fotos continuam a ser carregados por si, dentro da app).

const CACHE_NAME = 'dumelhor-pro-cache-v1';
const FICHEIROS_BASE = [
    './DUMELHOR_PRO-VENDA.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FICHEIROS_BASE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((nomes) =>
            Promise.all(
                nomes.filter((nome) => nome !== CACHE_NAME)
                     .map((nome) => caches.delete(nome))
            )
        )
    );
    self.clients.claim();
});

// Estratégia: tenta a rede primeiro (para ires sempre buscar a versão mais recente),
// e só usa o cache se estiveres offline.
self.addEventListener('fetch', (event) => {
    if(event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
            .then((resposta) => {
                const copia = resposta.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
                return resposta;
            })
            .catch(() => caches.match(event.request))
    );
});
