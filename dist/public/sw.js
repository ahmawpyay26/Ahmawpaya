const CACHE_VERSION = "v2";
const CACHE_NAMES = {
  assets: `amaw-assets-${CACHE_VERSION}`,
  pages: `amaw-pages-${CACHE_VERSION}`,
  api: `amaw-api-${CACHE_VERSION}`,
  images: `amaw-images-${CACHE_VERSION}`,
};

const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  // Admin routes
  "/admin",
  "/admin-login",
  "/admin/orders",
  "/admin/products",
  "/admin/invoices",
  "/admin/customers",
  "/admin/staff",
  "/admin/analytics",
  "/admin/reports",
  "/admin/zones",
  "/admin/settings",
  "/admin/loyalty",
  "/admin/audit-logs",
  "/admin/water-quality",
  "/admin/expense-approvals",
  // Staff routes
  "/staff",
  "/staff-login",
  "/staff/orders",
  "/staff/invoices",
  "/staff/deliveries",
  "/staff/truck-stock",
  "/staff/expenses",
  // Public routes
  "/order-tracking",
];

// Install event - cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAMES.assets).then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      }),
      caches.open(CACHE_NAMES.pages).then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      }),
    ])
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          const isOldCache = !Object.values(CACHE_NAMES).includes(cacheName);
          if (isOldCache) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement multiple caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Strategy 1: API calls - Network-first, fallback to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAMES.api).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Try to return cached API response
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline error response
            return new Response(
              JSON.stringify({ 
                error: "Offline - API unavailable",
                cached: false 
              }),
              { 
                status: 503, 
                headers: { "Content-Type": "application/json" } 
              }
            );
          });
        })
    );
    return;
  }

  // Strategy 2: Images - Cache-first, fallback to network
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAMES.images).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Strategy 3: CSS, JS, fonts - Cache-first, fallback to network
  if (
    url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/i) ||
    url.pathname.includes("/assets/")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAMES.assets).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Strategy 4: HTML pages - Network-first, fallback to cache
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAMES.pages).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Try to return cached page
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline fallback page
            return caches.match("/index.html");
          });
        })
    );
    return;
  }

  // Default: Cache-first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAMES.assets).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});

// Handle messages from clients (e.g., cache update notifications)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
