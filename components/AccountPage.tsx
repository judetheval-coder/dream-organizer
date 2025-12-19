"use client"

import { useState } from 'react'
import { colors } from '@/lib/design'
import { Card, Button } from '@/components/ui/primitives'
import { useUser, useClerk } from '@clerk/nextjs'
import { useDreams } from '@/hooks/useDreams'
import { getTierName, SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers'
import { useToast } from '@/contexts/ToastContext'

type AccountTab = 'overview' | 'subscription' | 'settings'

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState<AccountTab>('overview')
    const [giftCode, setGiftCode] = useState('')
    const [redeemLoading, setRedeemLoading] = useState(false)
    const [exportLoading, setExportLoading] = useState(false)
    const { user } = useUser()
    const { openUserProfile, signOut } = useClerk()
    const { userTier, dreams } = useDreams()
    const { showToast } = useToast()

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
            <div className="space-y-4">
                <Button
                    onClick={() => window.location.href = '/pricing'}
                    className="w-full"
                >
                    Upgrade or Manage Subscription
                </Button>

                {/* Gift Code Redemption */}
                <div className="pt-4 border-t border-gray-700">
                    <h4 className="font-medium mb-3" style={{ color: colors.textPrimary }}>🎁 Redeem Gift Code</h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter gift code"
                            value={giftCode}
                            onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                            className="flex-1 px-4 py-2 rounded-lg border outline-none"
                            style={{ background: colors.background, borderColor: colors.border, color: colors.textPrimary }}
                        />
                        <Button
                            onClick={async () => {
                                if (!giftCode) return
                                setRedeemLoading(true)
                                try {
                                    const res = await fetch('/api/redeem-gift', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ giftCode })
                                    })
                                    const data = await res.json()
                                    if (data.success) {
                                        showToast(`Gift redeemed! You now have ${data.tier} access.`, 'success')
                                        setGiftCode('')
                                        window.location.reload()
                                    } else {
                                        showToast(data.error || 'Invalid gift code', 'error')
                                    }
                                } catch {
                                    showToast('Failed to redeem gift code', 'error')
                                } finally {
                                    setRedeemLoading(false)
                                }
                            }}
                            disabled={redeemLoading || !giftCode}
                        >
                            {redeemLoading ? '...' : 'Redeem'}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )

    const renderSettings = () => (
        <Card className="p-6">
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>
                ⚙️ Account Settings
            </h3>
            <div className="space-y-4">
                {/* Profile Settings */}
                <div className="p-4 rounded-lg" style={{ background: colors.surface }}>
                    <h4 className="font-medium mb-3" style={{ color: colors.textPrimary }}>👤 Profile</h4>
                    <Button
                        onClick={() => openUserProfile()}
                        variant="secondary"
                        className="w-full"
                    >
                        Edit Profile (Name, Email, Password)
                    </Button>
                </div>

                {/* Notification Preferences */}
                <div className="p-4 rounded-lg" style={{ background: colors.surface }}>
                    <h4 className="font-medium mb-3" style={{ color: colors.textPrimary }}>🔔 Notifications</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                defaultChecked
                                onChange={(e) => {
                                    localStorage.setItem('emailNotifications', String(e.target.checked))
                                    showToast('Preference saved', 'success')
                                }}
                                className="w-4 h-4"
                            />
                            <span style={{ color: colors.textSecondary }}>Email notifications for new features</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                defaultChecked
                                onChange={(e) => {
                                    localStorage.setItem('weeklyDigest', String(e.target.checked))
                                    showToast('Preference saved', 'success')
                                }}
                                className="w-4 h-4"
                            />
                            <span style={{ color: colors.textSecondary }}>Weekly dream digest</span>
                        </label>
                    </div>
                </div>

                {/* Data Export */}
                <div className="p-4 rounded-lg" style={{ background: colors.surface }}>
                    <h4 className="font-medium mb-3" style={{ color: colors.textPrimary }}>📦 Your Data</h4>
                    <Button
                        onClick={async () => {
                            setExportLoading(true)
                            try {
                                const exportData = {
                                    exportedAt: new Date().toISOString(),
                                    user: {
                                        email: user?.primaryEmailAddress?.emailAddress,
                                        name: user?.firstName,
                                        tier: userTier
                                    },
                                    dreams: dreams.map(d => ({
                                        id: d.id,
                                        text: d.text,
                                        style: d.style,
                                        mood: d.mood,
                                        created_at: d.created_at,
                                        panels: d.panels?.map(p => ({
                                            description: p.description,
                                            image_url: p.image_url
                                        }))
                                    }))
                                }
                                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `dream-organizer-export-${new Date().toISOString().split('T')[0]}.json`
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                                URL.revokeObjectURL(url)
                                showToast('Data exported successfully', 'success')
                            } catch {
                                showToast('Failed to export data', 'error')
                            } finally {
                                setExportLoading(false)
                            }
                        }}
                        variant="secondary"
                        className="w-full"
                        disabled={exportLoading}
                    >
                        {exportLoading ? '⏳ Exporting...' : '📥 Export All My Data'}
                    </Button>
                </div>

                {/* Danger Zone */}
                <div className="p-4 rounded-lg border border-red-500/30" style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <h4 className="font-medium mb-3 text-red-400">⚠️ Danger Zone</h4>
                    <Button
                        onClick={() => {
                            if (confirm('Are you sure you want to sign out?')) {
                                signOut()
                            }
                        }}
                        variant="danger"
                        className="w-full"
                    >
                        Sign Out
                    </Button>
                </div>
            </div>
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