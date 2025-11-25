"use client"

import { colors } from '@/lib/design'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  count?: number
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  count = 1 
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl',
  }

  const items = Array.from({ length: count }, (_, i) => i)

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={`animate-pulse ${variants[variant]} ${className}`}
          style={{
            background: `linear-gradient(90deg, ${colors.surface} 0%, ${colors.surfaceLight} 50%, ${colors.surface} 100%)`,
            width: typeof width === 'number' ? `${width}px` : width || '100%',
            height: typeof height === 'number' ? `${height}px` : height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '100px'),
            marginBottom: count > 1 ? '0.5rem' : 0,
          }}
        />
      ))}
    </>
  )
}

// Pre-built skeleton components for common use cases
export function DreamCardSkeleton() {
  return (
    <div 
      className="rounded-2xl p-6 space-y-4"
      style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" className="mt-2" />
        </div>
      </div>
      <Skeleton variant="text" count={3} />
      <div className="flex gap-2 mt-4">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  )
}

export function PanelSkeleton() {
  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
    >
      <Skeleton variant="rectangular" height={200} />
      <div className="p-4">
        <Skeleton variant="text" count={2} />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div 
      className="rounded-xl p-4"
      style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
    >
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="60%" height={32} className="mt-2" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <DreamCardSkeleton />
          <DreamCardSkeleton />
        </div>
        <div className="space-y-4">
          <PanelSkeleton />
          <PanelSkeleton />
        </div>
      </div>
    </div>
  )
}

export default Skeleton
