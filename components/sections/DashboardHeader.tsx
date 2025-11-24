"use client"

import { colors } from '@/lib/design'
import type { DashboardTab } from './DashboardSidebar'

const HEADLINES: Record<DashboardTab, { title: string; subtitle: string }> = {
  'Dashboard': {
    title: '✨ Welcome to Your Dreams',
    subtitle: 'Explore, enhance, and visualize your dream world',
  },
  'My Dreams': {
    title: '💭 My Dreams',
    subtitle: 'Browse and manage all your saved dreams',
  },
  'Comics': {
    title: '🎨 Comics Gallery',
    subtitle: 'View your generated dream comics',
  },
  'Insights': {
    title: '✨ Dream Insights',
    subtitle: 'Analyze patterns in your dreams',
  },
  'Subscription': {
    title: '💎 Subscription Plans',
    subtitle: 'Manage your plan and features',
  },
  'Settings': {
    title: '⚙️ Settings',
    subtitle: 'Customize your experience',
  },
}

interface HeaderProps {
  tab: DashboardTab
}

export function DashboardHeader({ tab }: HeaderProps) {
  const headline = HEADLINES[tab]

  return (
    <div className="mb-8">
      <h2 className="text-4xl font-bold mb-2" style={{ color: colors.textPrimary }}>
        {headline.title}
      </h2>
      <p style={{ color: colors.textMuted }}>{headline.subtitle}</p>
    </div>
  )
}
