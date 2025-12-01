"use client"

import { colors } from '@/lib/design'
import Logo from '@/components/Logo'

export const DASHBOARD_TABS = [
  // Core Features (always visible)
  { key: 'Dashboard', label: 'Dashboard', icon: '🏠', category: 'core' },
  { key: 'Dreams', label: 'My Dreams', icon: '💭', category: 'core' },
  { key: 'Create', label: 'Create Dream', icon: '✨', category: 'core' },

  // Social Features (grouped)
  { key: 'Community', label: 'Community', icon: '👥', category: 'social' },
  { key: 'Gallery', label: 'Gallery', icon: '🌟', category: 'social' },

  // Tools & Insights
  { key: 'Tools', label: 'Tools', icon: '🛠️', category: 'tools' },

  // Account
  { key: 'Account', label: 'Account', icon: '👤', category: 'account' },
] as const

export type DashboardTab = typeof DASHBOARD_TABS[number]['key']

interface SidebarProps {
  currentTab: DashboardTab
  onTabChange?: (tab: DashboardTab) => void
}

export function DashboardSidebar({ currentTab, onTabChange }: SidebarProps) {
  const categories = {
    core: DASHBOARD_TABS.filter(tab => tab.category === 'core'),
    social: DASHBOARD_TABS.filter(tab => tab.category === 'social'),
    tools: DASHBOARD_TABS.filter(tab => tab.category === 'tools'),
    account: DASHBOARD_TABS.filter(tab => tab.category === 'account'),
  }

  const renderNavSection = (tabs: (typeof DASHBOARD_TABS)[number][], showSeparator = true) => (
    <>
      <nav className="space-y-1">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onTabChange?.(key)}
            className={`w-full text-left px-3 py-2.5 rounded-md transition-all cursor-pointer font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${currentTab === key ? 'animate-tabActive' : 'hover:bg-white/5'}`}
            aria-current={currentTab === key ? 'page' : undefined}
            style={{
              background: currentTab === key ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              color: currentTab === key ? colors.purple : colors.textMuted,
              border: currentTab === key ? '1px solid rgba(139, 92, 246, 0.3)' : 'none',
            }}
          >
            <span className="mr-3">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
      {showSeparator && (
        <div className="my-4 border-t border-white/10" />
      )}
    </>
  )

  return (
    <div
      className="fixed left-0 top-0 h-screen w-64 p-6 overflow-y-auto z-50"
      style={{
        background: colors.backgroundDark,
        borderRight: `1px solid ${colors.surface}`,
      }}
    >
      <div className="mb-8">
        <Logo size="md" />
      </div>

      <div className="space-y-1">
        {renderNavSection(categories.core)}
        {renderNavSection(categories.social)}
        {renderNavSection(categories.tools)}
        {renderNavSection(categories.account, false)}
      </div>

      <div className="mt-12 pt-6" style={{ borderTop: `1px solid ${colors.surface}` }}>
        <p className="text-xs" style={{ color: colors.textMuted }}>
          v1.0 • The Dream Machine
        </p>
      </div>
    </div>
  )
}
