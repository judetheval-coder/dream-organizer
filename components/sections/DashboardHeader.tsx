"use client"

import { colors, gradients } from '@/lib/design'
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
    title: '🎨 Comics',
    subtitle: 'View your generated dream comic panels',
  },
  'Dictionary': {
    title: '📖 Dream Dictionary',
    subtitle: 'Explore symbols and meanings in your dreams',
  },
  'Patterns': {
    title: '🌌 Global Patterns',
    subtitle: 'Discover recurring themes across your dreams',
  },
  'Gallery': {
    title: '🌟 Public Gallery',
    subtitle: 'Explore dreams shared by the community',
  },
  'Groups': {
    title: '👥 Dream Groups',
    subtitle: 'Join communities of like-minded dreamers',
  },
  'Events': {
    title: '🏆 Events & Contests',
    subtitle: 'Participate in dream challenges and competitions',
  },
  'Insights': {
    title: '✨ Insights',
    subtitle: 'Deep analysis of your dream patterns and themes',
  },
  'Subscription': {
    title: '💎 Subscription',
    subtitle: 'Manage your plan and billing',
  },
  'Leaderboard': {
    title: '🏆 Leaderboard',
    subtitle: 'See top dreamers and their achievements',
  },
  'Referrals': {
    title: '🎁 Invite Friends',
    subtitle: 'Earn rewards by sharing Dream Organizer',
  },
  'Badges': {
    title: '🏅 Your Badges',
    subtitle: 'View your earned achievements and badges',
  },
  'Settings': {
    title: '⚙️ Settings',
    subtitle: 'Customize your account and preferences',
  },
}

interface HeaderProps {
  tab: DashboardTab
}

export function DashboardHeader({ tab }: HeaderProps) {
  const headline = HEADLINES[tab]

  return (
    <div className="mb-8">
      <h2
        className="text-4xl font-bold mb-2"
        style={{
          background: gradients.purpleCyan,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}
      >
        {headline.title}
      </h2>
      <p className="text-base" style={{ color: colors.textMuted }}>{headline.subtitle}</p>
    </div>
  )
}
