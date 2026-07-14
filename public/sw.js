const CACHE_VERSION = "powerup-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const API_CACHE = `${CACHE_VERSION}-api`;

const APP_SHELL = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/app_icon.png",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      for (const url of APP_SHELL) {
        try {
          await cache.add(url);
          console.log("[SW] Cached:", url);
        } catch (err) {
          console.warn("[SW] Failed to cache:", url);
        }
      }

      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");

  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => {
          if (!key.startsWith(CACHE_VERSION)) {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  //---------------------------------------------------
  // Ignore browser extensions
  //---------------------------------------------------

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    return;
  }

  //---------------------------------------------------
  // API (Network First)
  //---------------------------------------------------

  if (url.pathname.startsWith("/api")) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  //---------------------------------------------------
  // HTML Pages (Stale While Revalidate)
  //---------------------------------------------------

  if (request.mode === "navigate") {
    event.respondWith(pageStrategy(request));
    return;
  }

  //---------------------------------------------------
  // Static Assets
  //---------------------------------------------------

  event.respondWith(cacheFirst(request));
});

async function pageStrategy(request) {
  const cache = await caches.open(PAGE_CACHE);

  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => null);

  if (cached) {
    networkFetch;
    return cached;
  }

  const response = await networkFetch;

  if (response) return response;


const dashboard = await cache.match("/dashboard");

if (dashboard) return dashboard;

return caches.match("/");
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = await cache.match(request);

    if (cached) return cached;

    return new Response(
      JSON.stringify({
        offline: true,
        message: "No internet connection",
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

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);

  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (
      response.ok &&
      request.url.startsWith(self.location.origin)
    ) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    if (request.destination === "image") {
      return caches.match("/icons/app_icon.png");
    }

    return new Response("", {
      status: 404,
    });
  }
}