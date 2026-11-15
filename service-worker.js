/* Root scope keeps feature pages, local artwork, and controls available offline. */
const APP_BASE = self.registration.scope;
const CACHE_NAME = "astroguardian-app-v5-" + new URL(APP_BASE).pathname;
const APP_FILES = ["./", "index.html", "style.css", "app-shell.css", "body-viewer.css", "companion.css", "components/ui/spotlight-card.css", "components/ui/spotlight-card.js", "components/ui/liquid-metal-button.css", "components/ui/liquid-metal-button.js", "script.js", "dashboard.js", "insights.js", "bodymap.js", "astra.js", "companion.js", "navigation.js", "emergency.js", "wellness.js", "enhacement.js", "vendor/chart.umd.min.js", "assets/body-silhouette.png", "assets/astra-companion-3d.png", "assets/space-backdrop.png", "assets/favicon.svg"];
const APP_URLS = APP_FILES.map(file => new URL(file, APP_BASE).href);

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_URLS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("astroguardian-app-") && key !== CACHE_NAME && (key === "astroguardian-app-v1" || key.endsWith("-" + new URL(APP_BASE).pathname))).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== "GET" || url.origin !== self.location.origin || !url.href.startsWith(APP_BASE)) return;
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
            const response = await fetch(request);
            if (response.ok && APP_URLS.includes(url.href)) {
                try { await cache.put(request, response.clone()); }
                catch (_) { /* A full cache must not discard a successful network response. */ }
            }
            return response;
        } catch (error) {
            const cached = await cache.match(request);
            if (cached) return cached;
            if (request.mode === "navigate") {
                const home = await cache.match(new URL("index.html", APP_BASE).href);
                if (home) return home;
            }
            return Response.error();
        }
    })());
});
