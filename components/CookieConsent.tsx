'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { colors, shadows } from '@/lib/design'

const COOKIE_CONSENT_KEY = 'dream-organizer-cookie-consent'

// Helper to check if cookies are accepted
export function areCookiesAccepted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted'
}

// Helper to disable analytics/tracking
function disableAnalytics() {
  // Disable Google Analytics if present
  if (typeof window !== 'undefined') {
    // @ts-expect-error - GA global
    window['ga-disable-UA-XXXXXXXX-X'] = true
    // Block future tracking calls
    // @ts-expect-error - gtag global
    window.gtag = function() {}
    // @ts-expect-error - ga global
    window.ga = function() {}
  }
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Small delay so it doesn't appear immediately
      const timer = setTimeout(() => setShowBanner(true), 1500)
      return () => clearTimeout(timer)
    } else if (consent === 'declined') {
      // If previously declined, ensure analytics are disabled
      disableAnalytics()
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setShowBanner(false)
    // Analytics will work normally
  }

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined')
    setShowBanner(false)
    // Disable any analytics/tracking
    disableAnalytics()
    // Clear any existing cookies (except essential ones)
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      // Don't clear essential cookies
      if (!name.startsWith('__clerk') && !name.startsWith('__session')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      }
    })
  }

  if (!showBanner) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slideUp"
      style={{ background: 'rgba(10, 1, 24, 0.95)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${colors.border}` }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p style={{ color: colors.textPrimary }} className="font-medium mb-1">
            🍪 We use cookies
          </p>
          <p style={{ color: colors.textMuted }} className="text-sm">
            We use cookies to improve your experience and analyze usage.{' '}
            <Link href="/privacy" className="underline hover:opacity-80" style={{ color: colors.cyan }}>
              Learn more
            </Link>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ color: colors.textMuted, border: `1px solid ${colors.border}` }}
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
            style={{ background: colors.purple, color: colors.white, boxShadow: shadows.glow }}
          >
            Accept
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
