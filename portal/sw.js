// /portal/sw.js
const CACHE = "lizon-portal-v2";

const ASSETS = [
  "/portal/",
  "/portal/index.html",
  "/portal/login.html",
  "/portal/student.html",
  "/portal/teacher.html",
  "/portal/admin.html",

  "/portal/manifest.webmanifest",
  "/portal/assets/portal.css",
  "/portal/assets/portal.js",
  "/portal/assets/supabase.js",

  // config can exist in different places (keep both safe)
  "/portal/config.js",
  "/portal/assets/config.js",
  "/portal/data/config.js",

  // icons (required for install)
  "/portal/assets/icon-192.png",
  "/portal/assets/icon-512.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  if (!url.pathname.startsWith("/portal/")) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;

      return fetch(e.request)
        .then((res) => res)
        .catch(() => caches.match("/portal/login.html"));
    })
  );
});
