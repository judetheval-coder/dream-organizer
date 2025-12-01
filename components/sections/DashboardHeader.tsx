"use client"

import { colors, gradients } from '@/lib/design'
import type { DashboardTab } from './DashboardSidebar'

const HEADLINES: Record<DashboardTab, { title: string; subtitle: string }> = {
  'Dashboard': {
    title: '✨ Welcome to Your Dreams',
    subtitle: 'Explore, enhance, and visualize your dream world',
  },
  'Dreams': {
    title: '💭 My Dreams',
    subtitle: 'Browse and manage all your saved dreams',
  },
  'Create': {
    title: '✨ Create Dream',
    subtitle: 'Write and visualize new dreams',
  },
  'Community': {
    title: '👥 Community',
    subtitle: 'Join communities of like-minded dreamers',
  },
  'Gallery': {
    title: '🌟 Public Gallery',
    subtitle: 'Explore dreams shared by the community',
  },
  'Tools': {
    title: '🛠️ Tools & Insights',
    subtitle: 'AI-powered tools to analyze and meaningfully enhance your dreams',
  },
  'Account': {
    title: '⚙️ Account',
    subtitle: 'Manage your account and subscription',
  },
}

interface HeaderProps {
  tab: DashboardTab
}

export function DashboardHeader({ tab }: HeaderProps) {
  const headline = HEADLINES[tab]

  return (
    <div className="mb-8">
      <h2 className="text-4xl font-bold mb-2 bg-clip-text text-transparent" style={{ background: gradients.purpleCyan }}>
        {headline.title}
      </h2>
      <div className="h-1 w-40 rounded-full mb-2" style={{ background: gradients.purpleCyan, opacity: 0.15 }} />
      <p className="text-base" style={{ color: colors.textMuted }}>{headline.subtitle}</p>
    </div>
  )
}
