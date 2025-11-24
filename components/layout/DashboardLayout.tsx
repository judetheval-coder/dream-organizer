"use client"

import { ReactNode } from 'react'
import { gradients } from '@/lib/design'
import { DashboardSidebar, DashboardTab } from '@/components/sections/DashboardSidebar'
import { DashboardHeader } from '@/components/sections/DashboardHeader'

interface DashboardLayoutProps {
  currentTab: DashboardTab
  onTabChange?: (tab: DashboardTab) => void
  children: ReactNode
}

export function DashboardLayout({ currentTab, onTabChange, children }: DashboardLayoutProps) {
  return (
    <div style={{ background: gradients.page }} className="min-h-screen">
      <a href="#dashboard-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-black/70 focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <DashboardSidebar currentTab={currentTab} onTabChange={onTabChange} />
      <main id="dashboard-content" className="lg:ml-64 px-4 py-8 lg:px-12">
        <DashboardHeader tab={currentTab} />
        <div className="space-y-8">{children}</div>
      </main>
    </div>
  )
}

export default DashboardLayout
