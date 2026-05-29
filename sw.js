// sw.js — DUMELHOR Shop Service Worker
const VERSAO = 'dumelhor-v3';

// Ficheiros essenciais para cache
const CACHE_FIXO = [
    './',
    './index.html',
    './manifest.json',
    './images/icon-192.png',
    './images/icon-512.png'
];

// INSTALAR — cache ficheiros essenciais
self.addEventListener('install', evento => {
    evento.waitUntil(
        caches.open(VERSAO)
            .then(cache => cache.addAll(CACHE_FIXO))
            .then(() => self.skipWaiting())
    );
});

// ATIVAR — limpar caches antigas
self.addEventListener('activate', evento => {
    evento.waitUntil(
        caches.keys().then(chaves =>
            Promise.all(
                chaves
                    .filter(chave => chave !== VERSAO)
                    .map(chave => caches.delete(chave))
            )
        ).then(() => self.clients.claim())
    );
});

// FETCH — responder pedidos
self.addEventListener('fetch', evento => {
    // Só tratar pedidos GET
    if (evento.request.method !== 'GET') return;

    const url = evento.request.url;

    // produtos.json — sempre rede primeiro (dados frescos), fallback cache
    if (url.includes('produtos.json')) {
        evento.respondWith(
            fetch(evento.request)
                .then(resposta => {
                    const copia = resposta.clone();
                    caches.open(VERSAO).then(cache => cache.put(evento.request, copia));
                    return resposta;
                })
                .catch(() => caches.match(evento.request))
        );
        return;
    }

    // Tudo o resto — cache primeiro, rede como fallback
    evento.respondWith(
        caches.match(evento.request).then(emCache => {
            if (emCache) return emCache;
            return fetch(evento.request).then(resposta => {
                // Guardar em cache só respostas válidas
                if (resposta && resposta.status === 200 && resposta.type === 'basic') {
                    const copia = resposta.clone();
                    caches.open(VERSAO).then(cache => cache.put(evento.request, copia));
                }
                return resposta;
            }).catch(() => {
                // Offline e não está em cache — retorna página principal
                if (evento.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
