// Push notification handler for service worker
self.addEventListener('push', event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: 'Dolphia', body: event.data ? event.data.text() : 'New update' };
  }

  const title = payload.title || 'Dolphia';
  const targetUrl = payload.url || '/';

  const options = {
    body: payload.body || 'New update',
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-72x72.png',
    data: { url: targetUrl }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const urlToOpen = event.notification?.data?.url || '/';

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });

      for (const client of allClients) {
        try {
          if (client.url === urlToOpen || client.url.startsWith(urlToOpen)) {
            if ('focus' in client) return client.focus();
          }
        } catch (_) {}
      }

      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })()
  );
});
