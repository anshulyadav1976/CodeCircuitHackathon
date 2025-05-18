// Service worker for the flashcard application
const CACHE_NAME = 'flashcard-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))); // Example caching
  self.skipWaiting(); // Activate worker immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // event.waitUntil(clients.claim()); // Claim unprotected clients
  // Add cleanup of old caches here if needed
  return self.clients.claim(); // Ensure new SW takes control immediately
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', (event) => {
  // Optional: implement caching strategies here if needed
  // event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});

// Push notification event
self.addEventListener('push', event => {
  const payload = event.data?.text() || 'Time for flashcard review!';
  
  event.waitUntil(
    self.registration.showNotification('Flashcard App', {
      body: payload,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.notification);
  event.notification.close();

  // Example: Focus or open the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList.find(c => c.focused) || clientList[0];
        if (client) return client.focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/'); // Open the base URL of the app
      }
    })
  );
});

self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  if (event.data && event.data.type === 'SHOW_REMINDER') {
    const { title, body, icon } = event.data.payload;
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: icon || '/favicon.ico', // Default icon
        badge: '/icons/icon-96x96.png', // Example badge
        // actions: [ // Example actions
        //   { action: 'explore', title: 'Open App' },
        // ],
      })
    );
  }
});
