"use client"

import { colors, gradients } from '@/lib/design'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

export interface StatItem {
  id: string
  label: string
  value: number | string
  icon: string
  caption?: string
}

interface StatsOverviewProps {
  stats: StatItem[]
  loading?: boolean
}

export function StatsOverview({ stats, loading = false }: StatsOverviewProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="space-y-4">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.id} interactive className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl" aria-hidden="true">
              {stat.icon}
            </span>
            {stat.caption && (
              <span
                className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{
                  background: gradients.card,
                  color: colors.textSecondary,
                }}
              >
                {stat.caption}
              </span>
            )}
          </div>
          <p className="text-4xl font-black" style={{ color: colors.textPrimary }}>
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </p>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            {stat.label}
          </p>
        </Card>
      ))}
    </div>
  )
}

export default StatsOverview
