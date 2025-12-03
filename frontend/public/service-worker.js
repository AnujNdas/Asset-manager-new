const CACHE_NAME = "asset-app-cache-v1";

// Add all static files you want cached
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// ----------- INSTALL -----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching files");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Activate SW immediately
});

// ----------- ACTIVATE -----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );

  self.clients.claim(); // Claim clients immediately
});

// ----------- FETCH (Cache First) -----------
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return from cache
      }

      // If not cached, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Cache new resource
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Offline fallback page (optional)
          return caches.match("/index.html");
        });
    })
  );
});
