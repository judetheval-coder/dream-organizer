"use client"

import { useState } from 'react'
import { colors } from '@/lib/design'
import { Card, Button } from '@/components/ui/primitives'
import { useUser } from '@clerk/nextjs'
import { useDreams } from '@/hooks/useDreams'
import { getTierName, SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers'

type AccountTab = 'overview' | 'subscription' | 'settings'

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState<AccountTab>('overview')
    const { user } = useUser()
    const { userTier, dreams } = useDreams()

    const tabs = [
        { key: 'overview' as const, label: 'Overview', icon: '👤' },
        { key: 'subscription' as const, label: 'Subscription', icon: '💎' },
        { key: 'settings' as const, label: 'Settings', icon: '⚙️' },
    ]

    const currentTier = SUBSCRIPTION_TIERS[userTier]
    const dreamCount = dreams.length
    const monthlyLimit = currentTier?.limits?.dreamsPerMonth ?? 0
    const usagePercent = monthlyLimit === -1 ? 0 : Math.min((dreamCount / monthlyLimit) * 100, 100)

    const renderOverview = () => (
        <div className="space-y-8">
            {/* Profile Header */}
            <Card className="p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
                        {user?.firstName?.[0] || user?.username?.[0] || '👤'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                            {user?.firstName || user?.username || 'Dreamer'}
                        </h2>
                        <p style={{ color: colors.textSecondary }}>{user?.primaryEmailAddress?.emailAddress}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full font-medium">
                                {getTierName(userTier)}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Account Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                    <div className="text-3xl mb-2">💭</div>
                    <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                        {dreamCount}
                    </div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Dreams Created
                    </p>
                </Card>

                <Card className="p-6 text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                        {monthlyLimit === -1 ? '∞' : monthlyLimit}
                    </div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Monthly Limit
                    </p>
                </Card>

                <Card className="p-6 text-center">
                    <div className="text-3xl mb-2">🎨</div>
                    <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                        {dreams.reduce((acc, dream) => acc + (dream.panels?.length || 0), 0)}
                    </div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Panels Generated
                    </p>
                </Card>
            </div>

            {/* Usage Progress */}
            {monthlyLimit !== -1 && (
                <Card className="p-6">
                    <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
                        Monthly Usage
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span style={{ color: colors.textSecondary }}>Dreams this month</span>
                            <span style={{ color: colors.textPrimary }}>{dreamCount} / {monthlyLimit}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
                    Quick Actions
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <Button onClick={() => setActiveTab('subscription')} className="flex items-center justify-center gap-2">
                        <span>💎</span> Manage Subscription
                    </Button>
                    <Button onClick={() => setActiveTab('settings')} variant="secondary" className="flex items-center justify-center gap-2">
                        <span>⚙️</span> Account Settings
                    </Button>
                </div>
            </Card>
        </div>
    )

    const renderSubscription = () => (
        <Card className="p-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>
                💎 Subscription Management
            </h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
                Your current plan: <span className="font-semibold text-purple-400">{getTierName(userTier)}</span>
            </p>
            <Button className="w-full">
                Upgrade or Manage Subscription
            </Button>
        </Card>
    )

    const renderSettings = () => (
        <Card className="p-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>
                ⚙️ Account Settings
            </h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
                Account preferences and configuration options.
            </p>
            <Button variant="secondary" className="w-full">
                Open Settings Panel
            </Button>
        </Card>
    )

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-lg">
                {tabs.map(({ key, label, icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium ${activeTab === key
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <span>{icon}</span>
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="animate-fadeInUp">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'subscription' && renderSubscription()}
                {activeTab === 'settings' && renderSettings()}
            </div>
        </div>
    )
}