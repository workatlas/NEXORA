
/* =====================================
   NEXORA — SERVICE WORKER
   Offline Engine v1.0
===================================== */

const CACHE_NAME = "nexora-cache-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./tool.html",
  "./compare.html",
  "./offline.html",
  "./manifest.json",
  "./css/style.css",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon.svg"
];

/* INSTALL */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await Promise.all(
        APP_FILES.map(async (file) => {
          try {
            await cache.add(file);
          } catch (error) {
            // Skip files that do not exist yet.
          }
        })
      );

      await self.skipWaiting();
    })()
  );
});

/* ACTIVATE */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter((name) =>
            name.startsWith("nexora-cache-") &&
            name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();
    })()
  );
});

/* FETCH */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only handle requests from this NEXORA website.
  if (url.origin !== self.location.origin) return;

  // HTML pages: try the network first.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response && response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
          }

          return response;
        } catch (error) {
          const cache = await caches.open(CACHE_NAME);

          const cachedPage = await cache.match(request, {
            ignoreSearch: true
          });

          if (cachedPage) return cachedPage;

          const offlinePage = await cache.match("./offline.html");

          if (offlinePage) return offlinePage;

          const homePage = await cache.match("./index.html");

          if (homePage) return homePage;

          return new Response(
            "NEXORA is offline. Please reconnect to the internet.",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
        }
      })()
    );

    return;
  }

  // Other local files: use cache first.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);

      if (cachedResponse) return cachedResponse;

      try {
        const response = await fetch(request);

        if (response && response.ok) {
          cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        return new Response("Resource unavailable offline.", {
          status: 503,
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        });
      }
    })()
  );
});
