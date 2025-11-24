'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { colors, gradients } from '@/lib/design'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: colors.background }}
    >
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-pulse opacity-20">⚡</div>
        <div className="absolute top-40 right-20 text-5xl animate-bounce opacity-20">🔧</div>
        <div className="absolute bottom-32 left-1/4 text-4xl animate-pulse opacity-20" style={{ animationDelay: '0.5s' }}>💫</div>
        <div className="absolute bottom-20 right-1/3 text-5xl animate-bounce opacity-20" style={{ animationDelay: '1s' }}>🌙</div>
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* Error Icon */}
        <div
          className="text-8xl mb-6"
          style={{ filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))' }}
        >
          😵
        </div>

        {/* Message */}
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: colors.textPrimary }}
        >
          Something Went Wrong
        </h1>
        <p
          className="text-lg mb-2"
          style={{ color: colors.textMuted }}
        >
          Don&apos;t worry, even the best dreams sometimes hit a snag.
        </p>
        <p
          className="text-sm mb-8"
          style={{ color: colors.textMuted }}
        >
          Our team has been notified and we&apos;re working on it.
        </p>

        {/* Error details (only in dev) */}
        {process.env.NODE_ENV === 'development' && (
          <div
            className="mb-8 p-4 rounded-lg text-left text-sm overflow-auto max-h-32"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.textMuted,
            }}
          >
            <code>{error.message}</code>
            {error.digest && (
              <p className="mt-2 text-xs opacity-60">Digest: {error.digest}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105 cursor-pointer"
            style={{
              background: gradients.button,
              color: colors.white,
              boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
              border: 'none',
            }}
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: 'transparent',
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Footer hint */}
      <p
        className="absolute bottom-8 text-sm"
        style={{ color: colors.textMuted }}
      >
        If this keeps happening, please contact support
      </p>
    </div>
  )
}
