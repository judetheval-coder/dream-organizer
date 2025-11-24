import { colors } from '@/lib/design'

export default function DashboardLoading() {
  return (
    <div
      className="min-h-screen"
      style={{ background: colors.background }}
    >
      {/* Sidebar skeleton */}
      <div
        className="fixed left-0 top-0 h-screen w-64 p-6"
        style={{
          background: colors.backgroundDark,
          borderRight: `1px solid ${colors.surface}`,
        }}
      >
        {/* Logo skeleton */}
        <div
          className="h-10 w-32 rounded-lg animate-pulse mb-10"
          style={{ background: colors.surface }}
        />
        
        {/* Nav items skeleton */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg animate-pulse"
              style={{
                background: colors.surface,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="ml-64 p-8">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div
            className="h-10 w-64 rounded-lg animate-pulse"
            style={{ background: colors.surface }}
          />
          <div
            className="h-10 w-32 rounded-lg animate-pulse"
            style={{ background: colors.surface }}
          />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse"
              style={{
                background: colors.surface,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className="lg:col-span-2 h-96 rounded-2xl animate-pulse"
            style={{ background: colors.surface }}
          />
          <div
            className="h-96 rounded-2xl animate-pulse"
            style={{ background: colors.surface }}
          />
        </div>
      </div>
    </div>
  )
}
