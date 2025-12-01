/// <reference lib="webworker" />

const STATIC_CACHE = 'dream-machine-static-v1'
const DYNAMIC_CACHE = 'dream-machine-dynamic-v1'

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/offline.html',
]

// API routes that should use network-first strategy
const API_ROUTES = [
  '/api/',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS.filter(url => !url.includes('/api/')))
    })
  )
  // @ts-expect-error - skipWaiting exists in ServiceWorkerGlobalScope
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  // @ts-expect-error - clients.claim exists in ServiceWorkerGlobalScope
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
// Helper to respond with offline fallback
async function offlineResponse(request) {
  if (request.mode === 'navigate') {
    const cache = await caches.open(STATIC_CACHE)
    return cache.match('/offline.html') || new Response('Offline', { status: 503 })
  }

  if (request.destination === 'image') {
    const cache = await caches.open(STATIC_CACHE)
    return cache.match('/icon-192.png') || new Response('', { status: 503 })
  }

  return new Response('Offline', { status: 503 })
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip external requests
  if (url.origin !== location.origin) return

  // Use network-first for API routes to always try the server first
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        // cache successful GET responses for later
        if (request.method === 'GET' && networkResponse.ok) {
          const clone = networkResponse.clone()
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone))
        }
        return networkResponse
      }).catch(() => caches.match(request).then(r => r || offlineResponse(request)))
    )
    return
  }

  // Skip Clerk auth routes
  if (url.pathname.includes('clerk') || url.pathname.includes('sign-in') || url.pathname.includes('sign-up')) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        // Fetch fresh version in background
        fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, networkResponse.clone())
            })
          }
        }).catch(() => {})
        return cachedResponse
      }

      // Otherwise fetch from network
      return fetch(request).then((networkResponse) => {
        // Cache successful responses
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return networkResponse
      }).catch(() => offlineResponse(request))
    })
  )
})

// Background sync for dream submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-dreams') {
    event.waitUntil(syncDreams())
  }
})

// Listen for skip waiting messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // @ts-expect-error - skipWaiting exists in ServiceWorkerGlobalScope
    self.skipWaiting()
  }
})

async function syncDreams() {
  // Get pending dreams from IndexedDB and sync
  // This would be implemented based on your dream storage strategy
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Check out your dream insights!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      { action: 'explore', title: 'View Dreams' },
      { action: 'close', title: 'Close' },
    ],
  }

  event.waitUntil(
    // @ts-expect-error - showNotification exists on ServiceWorkerRegistration
    self.registration.showNotification('The Dream Machine', options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      // @ts-expect-error - clients.openWindow exists on ServiceWorkerGlobalScope
      clients.openWindow('/dashboard')
    )
  }
})
