const CACHE_NAME = 'story-app-v1';
const DYNAMIC_CACHE = 'story-app-dynamic-v1';
const API_CACHE = 'story-app-api-v1';

const getBaseUrl = () => {
  const scope = self.registration.scope;
  return new URL(scope).pathname;
};

const getUrlsToCache = () => {
  const base = getBaseUrl();
  return [
    base,
    `${base}index.html`,
    `${base}manifest.json`,
    `${base}favicon.png`,
  ];
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        const urlsToCache = getUrlsToCache();
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin === 'https://story-api.dicoding.dev') {
    const isImage = url.pathname.includes('/images/') || 
                    request.destination === 'image' ||
                    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname);
    
    if (isImage) {
      event.respondWith(
        caches.open(API_CACHE).then((cache) => {
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch(request, { mode: 'cors', credentials: 'omit' }).then((response) => {
              if (response && (response.ok || response.type === 'opaque')) {
                cache.put(request, response.clone());
              }
              return response;
            }).catch((error) => {
              return cache.match('/favicon.png').then(fallback => {
                return fallback || new Response(null, { status: 404 });
              });
            });
          });
        })
      );
    } else {
      event.respondWith(
        caches.open(API_CACHE).then((cache) => {
          return fetch(request)
            .then((response) => {
              if (response.status === 200 && request.method === 'GET') {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              if (request.method === 'GET') {
                return cache.match(request);
              }
              return new Response(
                JSON.stringify({ error: true, message: 'Network error' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
              );
            });
        })
      );
    }
  } else if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );
  } else {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            if (request.method === 'GET') {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      }).catch(() => {
        if (request.destination === 'image') {
          return caches.match('/favicon.png');
        }
      })
    );
  }
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'Story App';
  const body = data.body || data.options?.body || 'New story available!';
  
  let storyId = data.storyId 
    || data.options?.storyId 
    || data.data?.storyId 
    || data.options?.data?.id
    || null;
  
  if (!storyId && body) {
    const storyIdMatch = body.match(/story-[a-zA-Z0-9_-]+/);
    if (storyIdMatch) {
      storyId = storyIdMatch[0];
    }
  }
  
  const baseUrl = new URL(self.registration.scope).origin + new URL(self.registration.scope).pathname;
  const targetUrl = storyId ? `${baseUrl}#/story/${storyId}` : `${baseUrl}#/stories`;
  
  const options = {
    body: body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      storyId: storyId,
      url: targetUrl
    },
    actions: [
      {
        action: 'view',
        title: 'Lihat Detail',
        icon: '/favicon.png'
      },
      {
        action: 'close',
        title: 'Tutup'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const baseUrl = new URL(self.registration.scope).origin + new URL(self.registration.scope).pathname;
    const defaultUrl = `${baseUrl}#/stories`;
    const urlToOpen = event.notification.data.url || defaultUrl;
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (let client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              client.postMessage({
                type: 'NOTIFICATION_CLICK',
                url: urlToOpen
              });
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

