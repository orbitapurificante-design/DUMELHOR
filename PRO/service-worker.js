// Service Worker simples — permite instalar a app (PWA) e abrir offline
// os ficheiros base (o Excel/fotos continuam a ser carregados por si, dentro da app).

const CACHE_NAME = 'dumelhor-pro-cache-v2';
const FICHEIROS_BASE = [
    './DUMELHOR_PRO-VENDA.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Bibliotecas externas usadas pela app (Excel, PDF): guardadas para funcionar sem internet
const BIBLIOTECAS = [
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => Promise.all(
            FICHEIROS_BASE.concat(BIBLIOTECAS).map((u) => cache.add(u).catch(() => {}))
        ))
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
            .catch(() => caches.match(event.request, { ignoreSearch: true }).then((m) => m || (event.request.mode === 'navigate' ? caches.match('./DUMELHOR_PRO-VENDA.html') : undefined)))
    );
});
