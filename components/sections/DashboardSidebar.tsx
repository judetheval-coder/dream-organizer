"use client"

import { colors } from '@/lib/design'
import Logo from '@/components/Logo'
import { DevPanel } from '../DevPanel'

export const DASHBOARD_TABS = [
  { key: 'Dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'My Dreams', label: 'My Dreams', icon: '💭' },
  { key: 'Comics', label: 'Comics', icon: '🎨' },
  { key: 'Dictionary', label: 'Dream Dictionary', icon: '📖' },
  { key: 'Patterns', label: 'Global Patterns', icon: '🌍' },
  { key: 'Gallery', label: 'Public Gallery', icon: '🌟' },
  { key: 'Groups', label: 'Dream Groups', icon: '👥' },
  { key: 'Events', label: 'Events & Contests', icon: '🏆' },
  { key: 'Insights', label: 'Insights', icon: '✨' },
  { key: 'Subscription', label: 'Subscription', icon: '💎' },
  { key: 'Settings', label: 'Settings', icon: '⚙️' },
] as const

export type DashboardTab = typeof DASHBOARD_TABS[number]['key']

interface SidebarProps {
  currentTab: DashboardTab
  onTabChange?: (tab: DashboardTab) => void
}

export function DashboardSidebar({ currentTab, onTabChange }: SidebarProps) {
  return (
    <div
      className="fixed left-0 top-0 h-screen w-64 p-6 overflow-y-auto z-40"
      style={{
        background: colors.backgroundDark,
        borderRight: `1px solid ${colors.surface}`,
      }}
    >
      <div className="mb-8">
        <Logo size="md" />
      </div>
      <nav className="space-y-2 mt-10">
        {DASHBOARD_TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onTabChange?.(key)}
            className="w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer hover:opacity-80 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-current={currentTab === key ? 'page' : undefined}
            style={{
              background: currentTab === key ? colors.purple : 'transparent',
              color: currentTab === key ? colors.white : colors.textMuted,
              border: 'none',
            }}
          >
            {icon} {label}
          </button>
        ))}
      </nav>

      <div className="mt-12 pt-6" style={{ borderTop: `1px solid ${colors.surface}` }}>
        <p className="text-xs" style={{ color: colors.textMuted }}>
          v1.0 • The Dream Machine
        </p>
        <DevPanel />
      </div>
    </div>
  )
}
