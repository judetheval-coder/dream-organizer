"use client"

import { ReactNode } from 'react'
import { colors, gradients, motion } from '@/lib/design'

interface ErrorBannerProps {
  title?: string
  children?: ReactNode
  onRetry?: () => void
  className?: string
}

export function ErrorBanner({ title = 'Something went wrong', children, onRetry, className = '' }: ErrorBannerProps) {
  return (
    <div
      className={['rounded-2xl border px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between', className]
        .filter(Boolean)
        .join(' ')}
      role="alert"
      aria-live="polite"
      style={{
        background: gradients.card,
        borderColor: colors.pink,
        color: colors.textPrimary,
        transition: `background ${motion.base}`,
      }}
    >
      <div>
        <p className="font-semibold">{title}</p>
        {children && <p className="text-sm text-white/70">{children}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 md:mt-0 px-4 py-2 rounded-xl font-semibold text-sm"
          style={{
            background: gradients.button,
            color: colors.white,
          }}
        >
          Try again
        </button>
      )}
    </div>
  )
}

export default ErrorBanner
