'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { colors, gradients } from '@/lib/design'
import { useToast } from '@/contexts/ToastContext'

type Tab = 'users' | 'dreams' | 'analytics' | 'settings'

type User = {
    id: string
    email?: string
    subscription_tier: 'free' | 'pro' | 'premium'
    created_at: string
    dreams_count_this_month?: number
    actual_dreams_count?: number
    panels_count?: number
    xp?: number
    level?: number
}

type Dream = {
    id: string
    user_id: string
    text: string
    created_at: string
    panels_count?: number
    flags_count?: number
    panels?: Array<{ id: string; image_url?: string }>
}

type Analytics = {
    totalUsers: number
    totalDreams: number
    totalPanels: number
    usersByTier: { free: number; pro: number; premium: number }
    dreamsThisWeek: number
    activeUsers: number
}

export default function AdminPage() {
    const { user, isLoaded } = useUser()
    const { showToast } = useToast()
    const [activeTab, setActiveTab] = useState<Tab>('users')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Users state
    const [users, setUsers] = useState<User[]>([])
    const [usersTotal, setUsersTotal] = useState(0)
    const [usersPage, setUsersPage] = useState(0)
    const [usersSearch, setUsersSearch] = useState('')

    // Dreams state
    const [dreams, setDreams] = useState<Dream[]>([])
    const [dreamsTotal, setDreamsTotal] = useState(0)
    const [dreamsPage, setDreamsPage] = useState(0)
    const [dreamsSearch, setDreamsSearch] = useState('')

    // Analytics state
    const [analytics, setAnalytics] = useState<Analytics | null>(null)

    // Check admin access
    const isAdmin = user?.publicMetadata?.role === 'admin'

    useEffect(() => {
        if (isLoaded && !isAdmin) {
            setError('Access denied: Admin role required')
            setLoading(false)
        }
    }, [isLoaded, isAdmin])

    // Load users
    const loadUsers = async () => {
        try {
            const res = await fetch(`/api/dev_7c29/users?limit=20&offset=${usersPage * 20}&search=${encodeURIComponent(usersSearch)}`)
            if (!res.ok) throw new Error('Failed to load users')
            const data = await res.json()
            setUsers(data.users || [])
            setUsersTotal(data.total || 0)
        } catch (e) {
            console.error('Failed to load users:', e)
            showToast('Failed to load users', 'error')
        }
    }

    // Load dreams
    const loadDreams = async () => {
        try {
            const res = await fetch(`/api/admin/dreams?limit=20&offset=${dreamsPage * 20}&q=${encodeURIComponent(dreamsSearch)}`)
            if (!res.ok) throw new Error('Failed to load dreams')
            const data = await res.json()
            setDreams(data.dreams || [])
            setDreamsTotal(data.total || 0)
        } catch (e) {
            console.error('Failed to load dreams:', e)
            showToast('Failed to load dreams', 'error')
        }
    }

    // Load analytics
    const loadAnalytics = async () => {
        try {
            const res = await fetch('/api/dev_7c29/analytics')
            if (!res.ok) throw new Error('Failed to load analytics')
            const data = await res.json()
            setAnalytics(data)
        } catch (e) {
            console.error('Failed to load analytics:', e)
        }
    }

    useEffect(() => {
        if (!isAdmin) return
        setLoading(true)

        const load = async () => {
            if (activeTab === 'users') await loadUsers()
            else if (activeTab === 'dreams') await loadDreams()
            else if (activeTab === 'analytics') await loadAnalytics()
            setLoading(false)
        }

        load()
    }, [isAdmin, activeTab, usersPage, dreamsPage])

    // User actions
    const updateUserTier = async (userId: string, action: string) => {
        try {
            const res = await fetch('/api/dev_7c29/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, action })
            })
            if (!res.ok) throw new Error('Failed to update user')
            const data = await res.json()
            showToast(data.message || 'User updated', 'success')
            await loadUsers()
        } catch (e) {
            console.error('Failed to update user:', e)
            showToast('Failed to update user', 'error')
        }
    }

    const deleteUser = async (userId: string) => {
        if (!confirm('Delete this user and all their data? This cannot be undone.')) return
        try {
            const res = await fetch('/api/dev_7c29/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, confirm: true })
            })
            if (!res.ok) throw new Error('Failed to delete user')
            showToast('User deleted', 'success')
            await loadUsers()
        } catch (e) {
            console.error('Failed to delete user:', e)
            showToast('Failed to delete user', 'error')
        }
    }

    // Dream actions
    const deleteDream = async (dreamId: string) => {
        if (!confirm('Delete this dream? This cannot be undone.')) return
        try {
            const res = await fetch('/api/admin/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dreamId })
            })
            if (!res.ok) throw new Error('Failed to delete dream')
            showToast('Dream deleted', 'success')
            await loadDreams()
        } catch (e) {
            console.error('Failed to delete dream:', e)
            showToast('Failed to delete dream', 'error')
        }
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: colors.background }}>
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (error || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: colors.background }}>
                <div className="text-center p-8 rounded-xl" style={{ background: colors.surface }}>
                    <div className="text-4xl mb-4">🔒</div>
                    <h1 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>Access Denied</h1>
                    <p style={{ color: colors.textMuted }}>
                        You need admin privileges to access this page.
                    </p>
                    <p className="mt-4 text-sm" style={{ color: colors.textMuted }}>
                        Set <code className="px-2 py-1 rounded" style={{ background: colors.backgroundDark }}>role: &quot;admin&quot;</code> in your Clerk user metadata.
                    </p>
                </div>
            </div>
        )
    }

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'dreams', label: 'Dreams', icon: '💭' },
        { id: 'analytics', label: 'Analytics', icon: '📊' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ]

    const tierColors = {
        free: colors.textMuted,
        pro: colors.cyan,
        premium: colors.purple,
    }

    return (
        <div className="min-h-screen" style={{ background: gradients.page }}>
            {/* Header */}
            <div className="border-b" style={{ borderColor: colors.border, background: colors.surface }}>
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                                Admin Dashboard
                            </h1>
                            <p className="text-sm" style={{ color: colors.textMuted }}>
                                Manage users, content, and settings
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: colors.purple, color: colors.white }}>
                                Admin
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b" style={{ borderColor: colors.border }}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="px-4 py-3 text-sm font-medium transition-colors relative"
                                style={{
                                    color: activeTab === tab.id ? colors.textPrimary : colors.textMuted,
                                }}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-0.5"
                                        style={{ background: gradients.purpleCyan }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <>
                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="space-y-4">
                                {/* Search */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search by email..."
                                        value={usersSearch}
                                        onChange={e => setUsersSearch(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && loadUsers()}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm"
                                        style={{ background: colors.surface, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
                                    />
                                    <button
                                        onClick={() => { setUsersPage(0); loadUsers() }}
                                        className="px-4 py-2 rounded-lg text-sm font-medium"
                                        style={{ background: colors.purple, color: colors.white }}
                                    >
                                        Search
                                    </button>
                                </div>

                                {/* Users Table */}
                                <div className="rounded-xl overflow-hidden" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                                    <table className="w-full">
                                        <thead>
                                            <tr style={{ background: colors.backgroundDark }}>
                                                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: colors.textMuted }}>User</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: colors.textMuted }}>Tier</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: colors.textMuted }}>Dreams</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: colors.textMuted }}>XP/Level</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: colors.textMuted }}>Joined</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium" style={{ color: colors.textMuted }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id} className="border-t" style={{ borderColor: colors.border }}>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                                                            {u.email || 'No email'}
                                                        </div>
                                                        <div className="text-xs" style={{ color: colors.textMuted }}>
                                                            {u.id.slice(0, 20)}...
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className="px-2 py-1 rounded-full text-xs font-medium"
                                                            style={{
                                                                background: `${tierColors[u.subscription_tier]}20`,
                                                                color: tierColors[u.subscription_tier]
                                                            }}
                                                        >
                                                            {u.subscription_tier.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm" style={{ color: colors.textSecondary }}>
                                                        {u.actual_dreams_count || 0} dreams
                                                        <span className="text-xs ml-1" style={{ color: colors.textMuted }}>
                                                            ({u.dreams_count_this_month || 0} this month)
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm" style={{ color: colors.textSecondary }}>
                                                        {u.xp || 0} XP (Lvl {u.level || 1})
                                                    </td>
                                                    <td className="px-4 py-3 text-sm" style={{ color: colors.textMuted }}>
                                                        {new Date(u.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-1">
                                                            {u.subscription_tier !== 'pro' && (
                                                                <button
                                                                    onClick={() => updateUserTier(u.id, 'upgrade_to_pro')}
                                                                    className="px-2 py-1 rounded text-xs"
                                                                    style={{ background: colors.cyan, color: colors.white }}
                                                                >
                                                                    Pro
                                                                </button>
                                                            )}
                                                            {u.subscription_tier !== 'premium' && (
                                                                <button
                                                                    onClick={() => updateUserTier(u.id, 'upgrade_to_premium')}
                                                                    className="px-2 py-1 rounded text-xs"
                                                                    style={{ background: colors.purple, color: colors.white }}
                                                                >
                                                                    Premium
                                                                </button>
                                                            )}
                                                            {u.subscription_tier !== 'free' && (
                                                                <button
                                                                    onClick={() => updateUserTier(u.id, 'reset_to_free')}
                                                                    className="px-2 py-1 rounded text-xs"
                                                                    style={{ background: colors.surfaceLight, color: colors.textMuted }}
                                                                >
                                                                    Free
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteUser(u.id)}
                                                                className="px-2 py-1 rounded text-xs"
                                                                style={{ background: '#ef4444', color: colors.white }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between text-sm" style={{ color: colors.textMuted }}>
                                    <span>
                                        Showing {usersPage * 20 + 1} - {Math.min((usersPage + 1) * 20, usersTotal)} of {usersTotal}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setUsersPage(p => Math.max(0, p - 1))}
                                            disabled={usersPage === 0}
                                            className="px-3 py-1 rounded disabled:opacity-50"
                                            style={{ background: colors.surfaceLight }}
                                        >
                                            Prev
                                        </button>
                                        <button
                                            onClick={() => setUsersPage(p => p + 1)}
                                            disabled={(usersPage + 1) * 20 >= usersTotal}
                                            className="px-3 py-1 rounded disabled:opacity-50"
                                            style={{ background: colors.surfaceLight }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dreams Tab */}
                        {activeTab === 'dreams' && (
                            <div className="space-y-4">
                                {/* Search */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search dreams..."
                                        value={dreamsSearch}
                                        onChange={e => setDreamsSearch(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && loadDreams()}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm"
                                        style={{ background: colors.surface, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
                                    />
                                    <button
                                        onClick={() => { setDreamsPage(0); loadDreams() }}
                                        className="px-4 py-2 rounded-lg text-sm font-medium"
                                        style={{ background: colors.purple, color: colors.white }}
                                    >
                                        Search
                                    </button>
                                </div>

                                {/* Dreams Grid */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {dreams.map(dream => (
                                        <div
                                            key={dream.id}
                                            className="rounded-xl p-4"
                                            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
                                        >
                                            {/* Preview Image */}
                                            {dream.panels?.[0]?.image_url ? (
                                                <img
                                                    src={dream.panels[0].image_url}
                                                    alt="Dream preview"
                                                    className="w-full h-32 object-cover rounded-lg mb-3"
                                                />
                                            ) : (
                                                <div
                                                    className="w-full h-32 rounded-lg mb-3 flex items-center justify-center"
                                                    style={{ background: colors.backgroundDark }}
                                                >
                                                    <span style={{ color: colors.textMuted }}>No image</span>
                                                </div>
                                            )}

                                            {/* Dream Text */}
                                            <p
                                                className="text-sm line-clamp-2 mb-2"
                                                style={{ color: colors.textSecondary }}
                                            >
                                                {dream.text}
                                            </p>

                                            {/* Meta */}
                                            <div className="flex items-center justify-between text-xs" style={{ color: colors.textMuted }}>
                                                <span>{dream.panels_count || dream.panels?.length || 0} panels</span>
                                                <span>{new Date(dream.created_at).toLocaleDateString()}</span>
                                            </div>

                                            {/* Flags Warning */}
                                            {(dream.flags_count || 0) > 0 && (
                                                <div
                                                    className="mt-2 px-2 py-1 rounded text-xs"
                                                    style={{ background: '#fbbf2420', color: colors.yellow }}
                                                >
                                                    {dream.flags_count} flag(s)
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={() => deleteDream(dream.id)}
                                                    className="flex-1 px-3 py-1.5 rounded text-xs font-medium"
                                                    style={{ background: '#ef4444', color: colors.white }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between text-sm" style={{ color: colors.textMuted }}>
                                    <span>
                                        Showing {dreamsPage * 20 + 1} - {Math.min((dreamsPage + 1) * 20, dreamsTotal)} of {dreamsTotal}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setDreamsPage(p => Math.max(0, p - 1))}
                                            disabled={dreamsPage === 0}
                                            className="px-3 py-1 rounded disabled:opacity-50"
                                            style={{ background: colors.surfaceLight }}
                                        >
                                            Prev
                                        </button>
                                        <button
                                            onClick={() => setDreamsPage(p => p + 1)}
                                            disabled={(dreamsPage + 1) * 20 >= dreamsTotal}
                                            className="px-3 py-1 rounded disabled:opacity-50"
                                            style={{ background: colors.surfaceLight }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && analytics && (
                            <div className="space-y-6">
                                {/* Stats Grid */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="rounded-xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                                        <div className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                                            {analytics.totalUsers}
                                        </div>
                                        <div className="text-sm" style={{ color: colors.textMuted }}>Total Users</div>
                                    </div>
                                    <div className="rounded-xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                                        <div className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                                            {analytics.totalDreams}
                                        </div>
                                        <div className="text-sm" style={{ color: colors.textMuted }}>Total Dreams</div>
                                    </div>
                                    <div className="rounded-xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                                        <div className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                                            {analytics.totalPanels}
                                        </div>
                                        <div className="text-sm" style={{ color: colors.textMuted }}>Total Panels</div>
                                    </div>
                                    <div className="rounded-xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                                        <div className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                                            {analytics.dreamsThisWeek}
                                        </div>
                                        <div className="text-sm" style={{ color: colors.textMuted }}>Dreams This Week</div>
                                    </div>
                                </div>

                                {/* Subscription Breakdown */}
                                <div className="rounded-xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                                        Users by Subscription Tier
                                    </h3>
                                    <div className="space-y-3">
                                        {(['free', 'pro', 'premium'] as const).map(tier => {
                                            const count = analytics.usersByTier?.[tier] || 0
                                            const percentage = analytics.totalUsers > 0 ? (count / analytics.totalUsers) * 100 : 0
                                            return (
                                                <div key={tier}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span style={{ color: tierColors[tier] }}>{tier.toUpperCase()}</span>
                                                        <span style={{ color: colors.textMuted }}>{count} ({percentage.toFixed(1)}%)</span>
                                                    </div>
                                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: colors.backgroundDark }}>
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{
                                                                width: `${percentage}%`,
                                                                background: tierColors[tier]
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <div className="rounded-xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                                        Subscription Tiers
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg" style={{ background: colors.backgroundDark }}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium" style={{ color: colors.textPrimary }}>Free</div>
                                                    <div className="text-sm" style={{ color: colors.textMuted }}>3 dreams/month, 4 panels max</div>
                                                </div>
                                                <span style={{ color: colors.textMuted }}>$0/mo</span>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-lg" style={{ background: colors.backgroundDark }}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium" style={{ color: colors.cyan }}>Pro</div>
                                                    <div className="text-sm" style={{ color: colors.textMuted }}>20 dreams/month, 8 panels max</div>
                                                </div>
                                                <span style={{ color: colors.cyan }}>$9.99/mo</span>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-lg" style={{ background: colors.backgroundDark }}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium" style={{ color: colors.purple }}>Premium</div>
                                                    <div className="text-sm" style={{ color: colors.textMuted }}>Unlimited dreams, 12 panels max</div>
                                                </div>
                                                <span style={{ color: colors.purple }}>$19.99/mo</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                                        Database Actions
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Seed demo data? This will add test users, dreams, and challenges.')) return
                                                try {
                                                    const res = await fetch('/api/dev_7c29/seed', { method: 'POST' })
                                                    if (!res.ok) throw new Error('Failed')
                                                    showToast('Demo data seeded', 'success')
                                                } catch {
                                                    showToast('Failed to seed data', 'error')
                                                }
                                            }}
                                            className="px-4 py-2 rounded-lg text-sm font-medium"
                                            style={{ background: colors.cyan, color: colors.white }}
                                        >
                                            Seed Demo Data
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Clear ALL demo data? This cannot be undone.')) return
                                                try {
                                                    const res = await fetch('/api/dev_7c29/seed/clear', { method: 'POST' })
                                                    if (!res.ok) throw new Error('Failed')
                                                    showToast('Demo data cleared', 'success')
                                                } catch {
                                                    showToast('Failed to clear data', 'error')
                                                }
                                            }}
                                            className="px-4 py-2 rounded-lg text-sm font-medium"
                                            style={{ background: '#ef4444', color: colors.white }}
                                        >
                                            Clear Demo Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
