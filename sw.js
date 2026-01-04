// Service worker disabled to resolve deployment origin mismatch errors.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
