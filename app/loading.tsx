import { colors } from '@/lib/design'

export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: colors.background }}
    >
      {/* Animated Logo/Spinner */}
      <div className="relative">
        {/* Outer ring */}
        <div
          className="w-20 h-20 rounded-full animate-spin"
          style={{
            border: '3px solid transparent',
            borderTopColor: colors.purple,
            borderRightColor: colors.cyan,
          }}
        />
        {/* Inner ring */}
        <div
          className="absolute inset-2 rounded-full animate-spin"
          style={{
            border: '3px solid transparent',
            borderBottomColor: colors.pink,
            borderLeftColor: colors.purple,
            animationDirection: 'reverse',
            animationDuration: '0.8s',
          }}
        />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          🌙
        </div>
      </div>

      {/* Loading text */}
      <p
        className="mt-6 text-lg font-medium animate-pulse"
        style={{ color: colors.textMuted }}
      >
        Loading your dreams...
      </p>
    </div>
  )
}
