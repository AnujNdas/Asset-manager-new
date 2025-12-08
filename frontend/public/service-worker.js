const CACHE_NAME = "asset-app-cache-v3"; // Change version to force update

// Static files to cache on install
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// ---------------------------------------
// INSTALL
// ---------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching static files...");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// ---------------------------------------
// ACTIVATE
// ---------------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// ---------------------------------------
// FETCH
// ---------------------------------------
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ❌ Do NOT cache API requests
  if (url.pathname.startsWith("/api")) {
    return event.respondWith(fetch(req));
  }

  // ❌ Do NOT cache POST / PUT / DELETE / PATCH
  if (req.method !== "GET") {
    return event.respondWith(fetch(req));
  }

  // ✅ Cache First for static files only
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return cached static file
      }

      return fetch(req).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => caches.match("/index.html"));
    })
  );
});
