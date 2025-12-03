"use client"

import { useState } from 'react'
import { colors } from '@/lib/design'
import Logo from '@/components/Logo'

// Organized into collapsible categories
export const SIDEBAR_CATEGORIES = [
  {
    name: 'Home',
    icon: '🏠',
    tabs: [
      { key: 'Dashboard', label: 'Dashboard', icon: '🏠' },
    ],
  },
  {
    name: 'My Dreams',
    icon: '💭',
    tabs: [
      { key: 'My Dreams', label: 'My Dreams', icon: '💭' },
      { key: 'Comics', label: 'Comics', icon: '🎨' },
      { key: 'Insights', label: 'Insights', icon: '✨' },
    ],
  },
  {
    name: 'Community',
    icon: '🌟',
    tabs: [
      { key: 'Gallery', label: 'Public Gallery', icon: '🌟' },
      { key: 'Groups', label: 'Dream Groups', icon: '👥' },
      { key: 'Leaderboard', label: 'Leaderboard', icon: '🥇' },
    ],
  },
  {
    name: 'Challenges & Rewards',
    icon: '🏆',
    tabs: [
      { key: 'Challenges', label: 'Daily Challenges', icon: '🏆' },
      { key: 'Events', label: 'Events & Contests', icon: '🎉' },
      { key: 'Badges', label: 'My Badges', icon: '🏅' },
      { key: 'Referrals', label: 'Invite Friends', icon: '🎁' },
    ],
  },
  {
    name: 'Explore',
    icon: '🔮',
    tabs: [
      { key: 'Dictionary', label: 'Dream Dictionary', icon: '📖' },
      { key: 'Patterns', label: 'Global Patterns', icon: '🌌' },
    ],
  },
  {
    name: 'Settings',
    icon: '⚙️',
    tabs: [
      { key: 'Settings', label: 'Settings', icon: '⚙️' },
    ],
  },
] as const

// All tabs flattened - explicitly typed
export const DASHBOARD_TABS = [
  { key: 'Dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'My Dreams', label: 'My Dreams', icon: '💭' },
  { key: 'Comics', label: 'Comics', icon: '🎨' },
  { key: 'Insights', label: 'Insights', icon: '✨' },
  { key: 'Gallery', label: 'Public Gallery', icon: '🌟' },
  { key: 'Groups', label: 'Dream Groups', icon: '👥' },
  { key: 'Leaderboard', label: 'Leaderboard', icon: '🥇' },
  { key: 'Challenges', label: 'Daily Challenges', icon: '🏆' },
  { key: 'Events', label: 'Events & Contests', icon: '🎉' },
  { key: 'Badges', label: 'My Badges', icon: '🏅' },
  { key: 'Referrals', label: 'Invite Friends', icon: '🎁' },
  { key: 'Dictionary', label: 'Dream Dictionary', icon: '📖' },
  { key: 'Patterns', label: 'Global Patterns', icon: '🌌' },
  { key: 'Subscription', label: 'Subscription', icon: '💎' },
  { key: 'Settings', label: 'Settings', icon: '⚙️' },
] as const

export type DashboardTab = typeof DASHBOARD_TABS[number]['key']

interface SidebarProps {
  currentTab: DashboardTab
  onTabChange?: (tab: DashboardTab) => void
}

export function DashboardSidebar({ currentTab, onTabChange }: SidebarProps) {
  // Track which categories are expanded (all expanded by default initially, then collapse)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    // Find which category contains the current tab and expand it
    const activeCategory = SIDEBAR_CATEGORIES.find(cat =>
      cat.tabs.some(tab => tab.key === currentTab)
    )
    return new Set(activeCategory ? [activeCategory.name] : ['Home'])
  })

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryName)) {
        next.delete(categoryName)
      } else {
        next.add(categoryName)
      }
      return next
    })
  }

  const handleTabClick = (key: DashboardTab, categoryName: string) => {
    // Expand the category when clicking a tab
    setExpandedCategories(prev => new Set(prev).add(categoryName))
    onTabChange?.(key)
  }

  return (
    <div
      className="fixed left-0 top-0 h-screen w-64 p-6 overflow-y-auto z-50"
      style={{
        background: `linear-gradient(180deg, ${colors.backgroundDark} 0%, rgba(26,16,37,0.98) 100%)`,
        borderRight: `1px solid ${colors.surface}`,
        boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Subtle animated glow at top */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="mb-8 relative">
        <Logo size="md" />
      </div>
      <nav className="space-y-1 mt-10 relative">
        {SIDEBAR_CATEGORIES.map((category) => {
          const isExpanded = expandedCategories.has(category.name)
          const hasActiveTab = category.tabs.some(tab => tab.key === currentTab)

          // For single-tab categories like Home, just show the tab directly
          if (category.tabs.length === 1) {
            const tab = category.tabs[0]
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className="sidebar-item w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer hover:opacity-80 font-medium focus-visible:outline-none focus-visible:ring-2"
                aria-current={currentTab === tab.key ? 'page' : undefined}
                style={{
                  background: currentTab === tab.key
                    ? `linear-gradient(90deg, ${colors.purple}, ${colors.purple}dd)`
                    : 'transparent',
                  color: currentTab === tab.key ? colors.white : colors.textMuted,
                  border: 'none',
                  boxShadow: currentTab === tab.key ? `0 4px 20px ${colors.purple}40` : 'none',
                }}
              >
                <span className="sidebar-icon inline-block mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            )
          }

          return (
            <div key={category.name} className="mb-1">
              {/* Section Divider before category groups (except first) */}
              {category.name !== 'Home' && (
                <div className="section-divider my-3 mx-2" />
              )}

              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="sidebar-item w-full text-left px-4 py-2.5 rounded-lg transition-all cursor-pointer hover:opacity-80 font-semibold flex items-center justify-between focus-visible:outline-none focus-visible:ring-2"
                style={{
                  background: hasActiveTab && !isExpanded ? `${colors.purple}20` : 'transparent',
                  color: hasActiveTab ? colors.purple : colors.textMuted,
                  border: 'none',
                }}
              >
                <span>
                  <span className="sidebar-icon inline-block mr-2">{category.icon}</span>
                  {category.name}
                </span>
                <span
                  className="text-xs transition-transform duration-200"
                  style={{
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: colors.textMuted
                  }}
                >
                  ▼
                </span>
              </button>

              {/* Expandable Tabs */}
              <div
                className="overflow-hidden transition-all duration-200"
                style={{
                  maxHeight: isExpanded ? `${category.tabs.length * 44}px` : '0px',
                  opacity: isExpanded ? 1 : 0,
                }}
              >
                <div className="pl-4 pt-1 space-y-1">
                  {category.tabs.map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => handleTabClick(key, category.name)}
                      className={`sidebar-item w-full text-left px-3 py-2 rounded-lg transition-all cursor-pointer text-sm focus-visible:outline-none focus-visible:ring-2 ${currentTab === key ? 'active' : ''}`}
                      aria-current={currentTab === key ? 'page' : undefined}
                      style={{
                        background: currentTab === key
                          ? `linear-gradient(90deg, ${colors.purple}, ${colors.purple}dd)`
                          : 'transparent',
                        color: currentTab === key ? colors.white : colors.textMuted,
                        border: 'none',
                        boxShadow: currentTab === key ? `0 4px 16px ${colors.purple}30` : 'none',
                      }}
                    >
                      <span className="sidebar-icon inline-block mr-2">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </nav>

      {/* Premium Upgrade CTA - Separate & Eye-Catching */}
      <div className="mt-6 mx-2">
        <button
          onClick={() => onTabChange?.('Subscription')}
          className="premium-card gold-shimmer w-full rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 group"
          style={{
            border: 'none',
          }}
        >
          <div className="relative z-10 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg float-gentle">✨</span>
              <span className="font-bold text-white text-sm">Unlock Your Dreams</span>
            </div>
            <p className="text-xs text-white/80 leading-tight">
              Unlimited comics • HD exports • Premium insights
            </p>
            <div className="mt-2 flex items-center gap-1">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full streak-flame"
                style={{ background: 'rgba(234,179,8,0.3)', color: '#ffd700' }}
              >
                50% OFF
              </span>
              <span className="text-[10px] text-white/70">Limited time</span>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-6 pt-6 section-divider" style={{ borderTop: `1px solid ${colors.surface}` }}>
        <p className="text-xs mt-4" style={{ color: colors.textMuted }}>
          v1.0 • The Dream Machine
        </p>
      </div>
    </div>
  )
}
