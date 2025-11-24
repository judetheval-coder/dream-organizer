"use client"

import { colors } from '@/lib/design'

interface LoadingSpinnerProps {
  label?: string
  size?: number
}

export function LoadingSpinner({ label = 'Loading', size = 48 }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <div
        className="rounded-full border-4 border-solid animate-spin"
        style={{
          width: size,
          height: size,
          borderColor: colors.purple,
          borderTopColor: colors.cyan,
        }}
      />
      <span className="text-sm" style={{ color: colors.textSecondary }}>
        {label}
      </span>
    </div>
  )
}

export default LoadingSpinner
