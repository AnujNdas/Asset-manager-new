const CACHE_NAME = "asset-app-cache-v3";

// Only cache these static files
const STATIC_ASSETS = [
  "/",
  "/index.html",
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
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ❌ Do NOT cache API requests
  if (url.pathname.startsWith("/api")) {
    return event.respondWith(fetch(req));
  }

  // ❌ Do NOT cache JS, CSS, images, or React files
  if (
    req.destination === "script" ||
    req.destination === "style" ||
    req.destination === "image" ||
    req.url.includes("static")
  ) {
    return event.respondWith(fetch(req));
  }

  // ❌ Do NOT cache POST/PUT/DELETE
  if (req.method !== "GET") {
    return event.respondWith(fetch(req));
  }

  // ✅ Cache only predefined static files
  if (STATIC_ASSETS.includes(url.pathname)) {
    return event.respondWith(
      caches.match(req).then((cacheRes) => {
        return (
          cacheRes ||
          fetch(req).then((networkRes) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, networkRes.clone());
            });
            return networkRes;
          })
        );
      })
    );
  }

  // Default: do NOT cache anything else
  return event.respondWith(fetch(req));
});
