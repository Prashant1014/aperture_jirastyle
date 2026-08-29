// Aperture Digital Arts Society - Web Push Service Worker
self.addEventListener('install', (event) => {
  // Activate immediately without waiting for existing tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim control of all clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  if (!event.data) {
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'New Update 🔔',
      body: event.data.text() || 'You have a new notification!',
      url: '/',
    };
  }

  const title = data.title || 'New Update 🔔';
  const options = {
    body: data.body || 'You have a new notification!',
    icon: data.icon || '/icon.png',
    badge: data.badge || '/icon.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'aperture-notification',
    renotify: true,
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'Open ↗',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  const fullTargetUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open on this origin, navigate it and bring to front
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url && client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(fullTargetUrl);
          }
          return client.focus();
        }
      }
      // If no matching window is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(fullTargetUrl);
      }
    })
  );
});
