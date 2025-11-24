'use client'

import Link from 'next/link'
import { colors, gradients } from '@/lib/design'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: colors.background }}
    >
      {/* Floating dream elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-bounce opacity-20">🌙</div>
        <div className="absolute top-40 right-20 text-5xl animate-pulse opacity-20">✨</div>
        <div className="absolute bottom-32 left-1/4 text-4xl animate-bounce opacity-20" style={{ animationDelay: '0.5s' }}>💭</div>
        <div className="absolute bottom-20 right-1/3 text-5xl animate-pulse opacity-20" style={{ animationDelay: '1s' }}>🌟</div>
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* 404 Number */}
        <h1
          className="text-[150px] font-black leading-none mb-0"
          style={{
            background: gradients.purpleCyan,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 80px rgba(124, 58, 237, 0.5)',
          }}
        >
          404
        </h1>

        {/* Message */}
        <h2
          className="text-2xl font-bold mb-4 -mt-4"
          style={{ color: colors.textPrimary }}
        >
          Lost in the Dream Realm
        </h2>
        <p
          className="text-lg mb-8"
          style={{ color: colors.textMuted }}
        >
          The page you&apos;re looking for has drifted away like a forgotten dream. 
          Let&apos;s guide you back to reality.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: gradients.button,
              color: colors.white,
              boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
            }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: 'transparent',
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* Footer hint */}
      <p
        className="absolute bottom-8 text-sm"
        style={{ color: colors.textMuted }}
      >
        The Dream Machine • Transform dreams into comics
      </p>
    </div>
  )
}
