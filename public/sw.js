// 📍 Ruta: public/sw.js

const CACHE_NAME = "velasquez-food-truck-v2-network-safe";
const APP_SHELL = ["/", "/manifest.webmanifest", "/images/velasquez-logo.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => undefined)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // MUY IMPORTANTE:
  // No interceptar Supabase, APIs externas ni otros dominios.
  // Antes el SW podía cachear peticiones GET de Supabase y eso dejaba órdenes viejas.
  if (url.origin !== self.location.origin) return;

  // version.json nunca debe cachearse; se usa para detectar actualizaciones.
  if (url.pathname.endsWith("/version.json")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  // Admin/POS/Órdenes son zonas operativas: siempre network-only.
  // No queremos que cocina o POS vean órdenes viejas por caché de PWA.
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  // Navegación pública: network first con fallback al shell público.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
    );
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/branding/") ||
    url.pathname.startsWith("/sounds/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".mp3") ||
    url.pathname.endsWith(".webmanifest");

  if (!isStaticAsset) return;

  // Assets propios: stale-safe cache first.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) return response;

        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    }),
  );
});
