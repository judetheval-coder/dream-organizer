"use client"

import { colors } from '@/lib/design'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/EmptyState'

export interface ActivityItem {
  id: string
  text: string
  timestamp: string
}

interface ActivityFeedProps {
  items: ActivityItem[]
  loading?: boolean
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}

export function ActivityFeed({ items, loading = false }: ActivityFeedProps) {
  if (loading) {
    return (
      <Card className="space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </Card>
    )
  }

  if (!items.length) {
    return (
      <Card>
        <EmptyState
          icon="📭"
          title="No recent activity"
          description="Record a dream to see it appear in your feed."
        />
      </Card>
    )
  }

  return (
    <Card padding="p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Recent Activity
          </p>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Last {Math.min(items.length, 5)} updates
          </p>
        </div>
      </div>
      <ul className="divide-y divide-white/5">
        {items.map((item) => (
          <li key={item.id} className="px-6 py-4">
            <p className="text-sm" style={{ color: colors.textPrimary }}>
              {item.text}
            </p>
            <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
              {new Date(item.timestamp).toLocaleDateString('en-US', DATE_FORMAT)}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default ActivityFeed
