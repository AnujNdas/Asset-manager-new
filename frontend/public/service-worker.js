const CACHE_NAME = "asset-app-cache-v4";

const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Do NOT cache API calls
  if (url.pathname.startsWith("/api")) {
    return event.respondWith(fetch(req));
  }

  // Do NOT cache static build files
  if (
    req.destination === "script" ||
    req.destination === "style" ||
    req.destination === "image" ||
    req.url.includes("static")
  ) {
    return event.respondWith(fetch(req));
  }

  // Only cache STATIC_ASSETS
  if (STATIC_ASSETS.includes(url.pathname)) {
    return event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;

        return fetch(req).then((res) => {
          caches.open(CACHE_NAME).then((cache) =>
            cache.put(req, res.clone())
          );
          return res;
        });
      })
    );
  }

  return event.respondWith(fetch(req));
});
