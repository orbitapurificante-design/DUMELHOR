// Service worker mínimo — só existe para o navegador considerar a app "instalável"
// (ecrã inteiro, sem barra de endereço, ícone próprio no atalho).
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', e => {
  // Sem cache especial: vai sempre buscar à rede/ficheiro local normalmente.
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
