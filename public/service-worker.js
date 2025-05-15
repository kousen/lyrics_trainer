/* eslint-env serviceworker */
/// <reference lib="webworker" />
/**
 * @typedef {Event & {waitUntil: (promise: Promise<any>) => void}} ExtendableEvent
 * @typedef {Event & {request: Request, respondWith: (r: Promise<Response> | Response) => void}} FetchEvent
 */
const CACHE   = 'lyrics-trainer-v1';
const ASSETS  = [
    './', './index.html', './style.css', './script.js',
    './lyrics.json', './manifest.json'
];

// install: cache app shell
/** @param {ExtendableEvent} e */
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then((c) => c.addAll(ASSETS))
    );
});

// network‑first for lyrics, cache‑first otherwise
/** @param {FetchEvent} e */
self.addEventListener('fetch', (e) => {
    const req = e.request;
    e.respondWith(
        (async () => {
            if (req.url.endsWith('lyrics.json')) {
                try {
                    const net = await fetch(req);
                    const cache = await caches.open(CACHE);
                    await cache.put(req, net.clone());
                    return net;
                } catch { /* fall through */ }
            }
            const c = await caches.match(req);
            return c || fetch(req);
        })()
    );
});