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
    name: 'Account',
    icon: '⚙️',
    tabs: [
      { key: 'Subscription', label: 'Subscription', icon: '💎' },
      { key: 'Settings', label: 'Settings', icon: '⚙️' },
    ],
  },
] as const

// Flatten for type extraction
export const DASHBOARD_TABS = SIDEBAR_CATEGORIES.flatMap(cat => cat.tabs)

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
        background: colors.backgroundDark,
        borderRight: `1px solid ${colors.surface}`,
      }}
    >
      <div className="mb-8">
        <Logo size="md" />
      </div>
      <nav className="space-y-1 mt-10">
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
                className="w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer hover:opacity-80 font-medium focus-visible:outline-none focus-visible:ring-2"
                aria-current={currentTab === tab.key ? 'page' : undefined}
                style={{
                  background: currentTab === tab.key ? colors.purple : 'transparent',
                  color: currentTab === tab.key ? colors.white : colors.textMuted,
                  border: 'none',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            )
          }
          
          return (
            <div key={category.name} className="mb-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full text-left px-4 py-2.5 rounded-lg transition-all cursor-pointer hover:opacity-80 font-semibold flex items-center justify-between focus-visible:outline-none focus-visible:ring-2"
                style={{
                  background: hasActiveTab && !isExpanded ? `${colors.purple}20` : 'transparent',
                  color: hasActiveTab ? colors.purple : colors.textMuted,
                  border: 'none',
                }}
              >
                <span>{category.icon} {category.name}</span>
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
                      className="w-full text-left px-3 py-2 rounded-lg transition-all cursor-pointer hover:opacity-80 text-sm focus-visible:outline-none focus-visible:ring-2"
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
                </div>
              </div>
            </div>
          )
        })}
      </nav>

      <div className="mt-12 pt-6" style={{ borderTop: `1px solid ${colors.surface}` }}>
        <p className="text-xs" style={{ color: colors.textMuted }}>
          v1.0 • The Dream Machine
        </p>
      </div>
    </div>
  )
}
