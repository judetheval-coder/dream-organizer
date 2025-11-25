'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Check for updates every hour
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return null
}

// Hook for requesting notification permission
export function useNotificationPermission() {
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return 'unsupported'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return 'denied'
  }

  return { requestPermission }
}

// Hook for checking online status
export function useOnlineStatus() {
  useEffect(() => {
    const handleOnline = () => {
      // Could show toast notification
    }

    const handleOffline = () => {
      // Could show toast notification
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
}
