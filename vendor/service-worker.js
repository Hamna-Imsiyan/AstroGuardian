
// ======================================
// ASTROGUARDIAN - STAGE 8
// Offline Application Cache
// ======================================

// Change this version when updating cached files
const CACHE_NAME = "astroguardian-app-v1";


// 1. FILES REQUIRED FOR OFFLINE USE

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./dashboard.js",
    "./insights.js",
    "./bodymap.js",
    "./astra.js",
    "./emergency.js",
    "./wellness.js",
    "./vendor/chart.umd.min.js"
];


// 2. INSTALL THE SERVICE WORKER

self.addEventListener("install", function (event) {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(function (cache) {

                // Save application files locally
                return cache.addAll(APP_FILES);

            })
            .then(function () {

                return self.skipWaiting();

            })

    );

});


// 3. REMOVE OLD APPLICATION CACHES

self.addEventListener("activate", function (event) {

    event.waitUntil(

        caches.keys()
            .then(function (cacheNames) {

                return Promise.all(

                    cacheNames.map(function (name) {

                        if (
                            name.startsWith("astroguardian-app-") &&
                            name !== CACHE_NAME
                        ) {
                            return caches.delete(name);
                        }

                        return Promise.resolve();
                    })

                );

            })
            .then(function () {

                return self.clients.claim();

            })

    );

});


// 4. LOAD FILES FROM CACHE WHEN AVAILABLE

self.addEventListener("fetch", function (event) {

    const request = event.request;

    // Only handle normal same-origin GET requests
    if (request.method !== "GET") {
        return;
    }

    const requestURL = new URL(request.url);

    if (requestURL.origin !== self.location.origin) {
        return;
    }

    event.respondWith(

        (async function () {

            const cache = await caches.open(CACHE_NAME);

            // First try the locally saved file
            const cachedResponse =
                await cache.match(request);

            if (cachedResponse) {
                return cachedResponse;
            }

            // Otherwise try the network
            try {

                return await fetch(request);

            } catch (error) {

                // Use the cached homepage if navigating
                if (request.mode === "navigate") {

                    const homepage =
                        await cache.match("./index.html");

                    if (homepage) {
                        return homepage;
                    }
                }

                return Response.error();
            }

        })()

    );

});
