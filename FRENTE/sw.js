/* ==========================================================================
   DUMELHOR — Service Worker
   Objetivo: a app abrir e continuar a funcionar mesmo SEM internet
   (guarda em cache o "shell" da app: HTML, manifest, ícones, fontes),
   e atualizar-se sozinha assim que houver uma versão nova publicada.
   ========================================================================== */

/* Sobe este número sempre que publicares uma alteração ao index.html
   (não é obrigatório — o service worker já deteta sozinho ficheiros novos —
   mas ajuda a forçar a limpeza de caches antigas). */
const CACHE_VERSION = 'dumelhor-cache-v1';

/* Ficheiros do "shell" da app — são pré-carregados na instalação para que
   a primeira abertura offline já funcione. Se algum não existir, é
   ignorado (não bloqueia a instalação do service worker). */
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './icon-192.png'
];

/* --------------------------------------------------------------------
   INSTALAÇÃO — guarda o essencial em cache e ativa-se de imediato
   -------------------------------------------------------------------- */
self.addEventListener('install', event => {
  self.skipWaiting(); // não esperar que todas as abas antigas fechem
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache =>
      Promise.all(
        CORE_ASSETS.map(url => cache.add(url).catch(() => {
          /* ficheiro pode não existir (ex.: manifest.json com outro nome) —
             não é motivo para falhar a instalação toda */
        }))
      )
    )
  );
});

/* --------------------------------------------------------------------
   ATIVAÇÃO — limpa caches de versões antigas e assume controlo já
   -------------------------------------------------------------------- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(chaves =>
      Promise.all(
        chaves
          .filter(chave => chave !== CACHE_VERSION)
          .map(chave => caches.delete(chave))
      )
    ).then(() => self.clients.claim())
  );
});

/* --------------------------------------------------------------------
   FETCH — estratégia:
   1) Pedidos à API do GitHub (sincronização de encomendas) NUNCA passam
      pela cache — a própria app (sincronizarGithub) já trata do que
      acontece quando falha por falta de rede. O service worker não deve
      interferir nem cachear dados de encomendas.
   2) Navegação (abrir a página): tenta a rede primeiro; se falhar
      (offline), serve o index.html guardado em cache.
   3) Restantes ficheiros (CSS, fontes, ícones, manifest): "stale-while-
      revalidate" — mostra logo o que está em cache (rápido e funciona
      offline) e, em paralelo, atualiza a cache a partir da rede para a
      próxima vez.
   -------------------------------------------------------------------- */
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;

  const url = new URL(req.url);

  // Nunca intercetar chamadas à API do GitHub — a app já sabe lidar
  // com sucesso/falha dessas chamadas sozinha.
  if(url.hostname.includes('github.com') || url.hostname.includes('githubusercontent.com')){
    return;
  }

  // Navegação (o próprio HTML da app)
  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req)
        .then(resp => {
          const copia = resp.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put('./index.html', copia));
          return resp;
        })
        .catch(() => caches.match('./index.html').then(resp => resp || caches.match('./')))
    );
    return;
  }

  // Restantes recursos estáticos (mesmo domínio ou fontes da Google)
  event.respondWith(
    caches.match(req).then(emCache => {
      const pedidoRede = fetch(req).then(respRede => {
        if(respRede && respRede.status === 200){
          const copia = respRede.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, copia));
        }
        return respRede;
      }).catch(() => emCache);

      // Se já houver algo em cache, mostra logo isso (rápido + funciona
      // offline); caso contrário, espera pela rede.
      return emCache || pedidoRede;
    })
  );
});
