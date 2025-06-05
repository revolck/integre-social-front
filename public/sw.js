/**
 * Service Worker para IntegreApp
 * Implementa cache offline, notificações push e atualizações automáticas
 */

const CACHE_NAME = "integreapp-v1.0.0";
const STATIC_CACHE = "integreapp-static-v1";
const API_CACHE = "integreapp-api-v1";
const IMAGE_CACHE = "integreapp-images-v1";

// Recursos para cache offline
const STATIC_RESOURCES = [
  "/",
  "/auth/login",
  "/dashboard/overview",
  "/manifest.json",
  "/favicon.ico",
  "/logo-white.svg",
  "/logo-black.svg",
  // Adicionar outros recursos estáticos críticos
];

// APIs para cache
const API_CACHE_PATTERNS = [
  /^\/api\/auth\/me$/,
  /^\/api\/notifications$/,
  /^\/api\/organizations\/\w+$/,
  /^\/api\/users\/profile$/,
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  NETWORK_ONLY: "network-only",
  CACHE_ONLY: "cache-only",
};

/**
 * Evento de instalação
 */
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando Service Worker...");

  event.waitUntil(
    Promise.all([
      // Cache de recursos estáticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("[SW] Fazendo cache de recursos estáticos");
        return cache.addAll(STATIC_RESOURCES);
      }),

      // Skip waiting para ativar imediatamente
      self.skipWaiting(),
    ])
  );
});

/**
 * Evento de ativação
 */
self.addEventListener("activate", (event) => {
  console.log("[SW] Ativando Service Worker...");

  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      cleanupOldCaches(),

      // Tomar controle de todas as abas imediatamente
      self.clients.claim(),

      // Configurar sincronização em background
      setupBackgroundSync(),
    ])
  );
});

/**
 * Interceptar requisições fetch
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-HTTP
  if (!request.url.startsWith("http")) {
    return;
  }

  // Ignorar extensões do browser e Chrome DevTools
  if (
    url.protocol === "chrome-extension:" ||
    url.protocol === "moz-extension:"
  ) {
    return;
  }

  // Estratégia baseada no tipo de requisição
  if (request.destination === "image") {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request));
  } else if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

/**
 * Lidar com requisições de imagens
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);

  try {
    // Tentar buscar da rede primeiro
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Salvar no cache
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error("Network response não ok");
  } catch (error) {
    // Buscar do cache se falhar na rede
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Retornar imagem placeholder se não houver no cache
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Imagem indisponível</text></svg>',
      {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache",
        },
      }
    );
  }
}

/**
 * Lidar com requisições de API
 */
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  const url = new URL(request.url);

  // Verificar se deve ser cacheado
  const shouldCache = API_CACHE_PATTERNS.some((pattern) =>
    pattern.test(url.pathname)
  );

  if (!shouldCache) {
    return fetch(request);
  }

  try {
    // Network first para APIs
    const networkResponse = await fetch(request);

    if (networkResponse.ok && request.method === "GET") {
      // Cachear apenas respostas GET bem-sucedidas
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Erro na rede, tentando cache para:", request.url);

    // Buscar do cache se a rede falhar
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Adicionar header para indicar que veio do cache
      const response = cachedResponse.clone();
      response.headers.set("X-Served-By", "ServiceWorker");
      return response;
    }

    // Retornar erro se não houver no cache
    return new Response(
      JSON.stringify({
        error: "Não foi possível conectar ao servidor",
        offline: true,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

/**
 * Lidar com requisições de navegação
 */
async function handleNavigationRequest(request) {
  const cache = await caches.open(STATIC_CACHE);

  try {
    // Tentar buscar da rede
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      return networkResponse;
    }

    throw new Error("Network response não ok");
  } catch (error) {
    console.log("[SW] Falha na navegação, servindo offline:", request.url);

    // Buscar página específica do cache
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback para página principal
    const fallbackResponse = await cache.match("/");

    if (fallbackResponse) {
      return fallbackResponse;
    }

    // Página offline mínima
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>IntegreApp - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0; 
              background: #f3f4f6; 
              text-align: center;
            }
            .container { 
              max-width: 400px; 
              padding: 2rem; 
              background: white; 
              border-radius: 8px; 
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .icon { font-size: 3rem; margin-bottom: 1rem; }
            h1 { color: #374151; margin-bottom: 0.5rem; }
            p { color: #6b7280; margin-bottom: 1.5rem; }
            button { 
              background: #3b82f6; 
              color: white; 
              border: none; 
              padding: 0.75rem 1.5rem; 
              border-radius: 6px; 
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover { background: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📱</div>
            <h1>Você está offline</h1>
            <p>Não foi possível conectar ao servidor. Verifique sua conexão com a internet.</p>
            <button onclick="window.location.reload()">Tentar Novamente</button>
          </div>
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }
}

/**
 * Lidar com recursos estáticos
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);

  // Cache first para recursos estáticos
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cachear recursos estáticos
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Erro ao buscar recurso estático:", request.url);
    return new Response("Recurso não disponível offline", { status: 404 });
  }
}

/**
 * Limpar caches antigos
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [STATIC_CACHE, API_CACHE, IMAGE_CACHE];

  const deletePromises = cacheNames
    .filter((cacheName) => !currentCaches.includes(cacheName))
    .map((cacheName) => {
      console.log("[SW] Deletando cache antigo:", cacheName);
      return caches.delete(cacheName);
    });

  return Promise.all(deletePromises);
}

/**
 * Configurar sincronização em background
 */
function setupBackgroundSync() {
  // Registrar para sync quando a conectividade for restaurada
  self.addEventListener("sync", (event) => {
    if (event.tag === "background-sync") {
      event.waitUntil(doBackgroundSync());
    }
  });
}

/**
 * Executar sincronização em background
 */
async function doBackgroundSync() {
  console.log("[SW] Executando sincronização em background...");

  try {
    // Sincronizar dados pendentes
    await syncPendingData();

    // Limpar dados expirados do cache
    await cleanExpiredCache();

    console.log("[SW] Sincronização concluída");
  } catch (error) {
    console.error("[SW] Erro na sincronização:", error);
  }
}

/**
 * Sincronizar dados pendentes
 */
async function syncPendingData() {
  // Implementar lógica para sincronizar dados offline
  // Por exemplo, enviar formulários salvos localmente
  const pendingData = await getStoredPendingData();

  for (const data of pendingData) {
    try {
      await fetch(data.url, {
        method: data.method,
        headers: data.headers,
        body: data.body,
      });

      // Remover dados após sincronização bem-sucedida
      await removePendingData(data.id);
    } catch (error) {
      console.error("[SW] Erro ao sincronizar:", error);
    }
  }
}

/**
 * Obter dados pendentes do IndexedDB
 */
async function getStoredPendingData() {
  // Implementar acesso ao IndexedDB para obter dados pendentes
  return [];
}

/**
 * Remover dados pendentes após sincronização
 */
async function removePendingData(id) {
  // Implementar remoção do IndexedDB
}

/**
 * Limpar cache expirado
 */
async function cleanExpiredCache() {
  const apiCache = await caches.open(API_CACHE);
  const requests = await apiCache.keys();

  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 horas

  for (const request of requests) {
    const response = await apiCache.match(request);
    const dateHeader = response.headers.get("date");

    if (dateHeader) {
      const responseDate = new Date(dateHeader).getTime();

      if (now - responseDate > maxAge) {
        console.log("[SW] Removendo cache expirado:", request.url);
        await apiCache.delete(request);
      }
    }
  }
}

/**
 * Lidar com notificações push
 */
self.addEventListener("push", (event) => {
  console.log("[SW] Notificação push recebida");

  let notificationData = {
    title: "IntegreApp",
    body: "Você tem uma nova notificação",
    icon: "/favicon-192x192.png",
    badge: "/favicon-192x192.png",
    tag: "default",
    data: {},
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.error("[SW] Erro ao parsear dados da notificação:", error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction || false,
      actions: notificationData.actions || [],
    })
  );
});

/**
 * Lidar com cliques em notificações
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Clique em notificação");

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/dashboard/overview";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Verificar se já existe uma aba aberta
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }

      // Abrir nova aba se não houver nenhuma
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/**
 * Lidar com mensagens do app principal
 */
self.addEventListener("message", (event) => {
  console.log("[SW] Mensagem recebida:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log("[SW] Service Worker carregado e pronto!");
