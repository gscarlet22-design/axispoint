/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import { ExpirationPlugin, NetworkFirst, Serwist } from "serwist";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// `/api/vcard`'s content changes whenever the admin-edited event/photo
// changes (or the app itself is updated) — CacheFirst would silently serve
// a stale vCard indefinitely (bit us during development: a code fix was
// invisible for an hour because of exactly this). NetworkFirst always
// prefers a fresh fetch when online and only falls back to the cache
// offline, still satisfying the "Save button works offline" goal (§8A).
const vcardCache: RuntimeCaching = {
  matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname === "/api/vcard",
  handler: new NetworkFirst({
    cacheName: "api-vcard",
    networkTimeoutSeconds: 3,
    plugins: [new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [vcardCache, ...defaultCache],
});

serwist.addEventListeners();
