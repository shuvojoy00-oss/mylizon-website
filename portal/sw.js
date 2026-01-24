// /portal/sw.js
// Lightweight service worker (basic offline shell)
const CACHE = "lizon-portal-v1";
const ASSETS = [
  "/portal/",
  "/portal/index.html",
  "/portal/login.html",
  "/portal/student.html",
  "/portal/teacher.html",
  "/portal/admin.html",
  "/portal/assets/portal.css",
  "/portal/assets/portal.js",
  "/portal/assets/config.js",
  "/portal/assets/supabase.js",
  "/portal/manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k === CACHE ? null : caches.delete(k)))))
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith("/portal/")) {
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request).then(net => {
        return net;
      }).catch(() => caches.match("/portal/login.html")))
    );
  }
});
