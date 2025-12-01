'use client'

import { useEffect, useState } from 'react'
import { colors } from '@/lib/design'
import Card from '@/components/ui/Card'

interface LeaderboardUser {
    user_id: string
    dream_count: number
    total_likes: number
    total_shares: number
    total_views: number
    rank: number
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all')

    useEffect(() => {
        fetchLeaderboard()
    }, [timeframe])

    const fetchLeaderboard = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`)
            const data = await response.json()
            setLeaderboard(data.leaderboard || [])
        } catch (error) {
            console.error('Error fetching leaderboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return `#${rank}`
    }

    return (
        <div className="min-h-screen p-8" style={{ background: colors.backgroundDark }}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-3" style={{ color: colors.textPrimary }}>
                        🏆 Leaderboard
                    </h1>
                    <p style={{ color: colors.textMuted }}>
                        Top dream creators in the community
                    </p>
                </div>

                {/* Timeframe Selector */}
                <div className="flex justify-center gap-3 mb-8">
                    {(['all', 'month', 'week'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimeframe(period)}
                            className="px-6 py-2 rounded-lg font-semibold transition-all"
                            style={{
                                background: timeframe === period
                                    ? `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`
                                    : colors.surface,
                                color: timeframe === period ? 'white' : colors.textSecondary,
                                border: `1px solid ${colors.border}`
                            }}
                        >
                            {period === 'all' ? 'All Time' : period === 'month' ? 'This Month' : 'This Week'}
                        </button>
                    ))}
                </div>

                {/* Leaderboard */}
                <Card>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-pulse text-4xl mb-3">⏳</div>
                            <p style={{ color: colors.textMuted }}>Loading leaderboard...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3">📊</div>
                            <p style={{ color: colors.textMuted }}>No data yet. Be the first!</p>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: colors.border }}>
                            {leaderboard.map((user, index) => (
                                <div
                                    key={user.user_id}
                                    className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                                >
                                    {/* Rank */}
                                    <div className="text-2xl font-bold w-16 text-center">
                                        {getRankEmoji(index + 1)}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1">
                                        <div className="font-semibold" style={{ color: colors.textPrimary }}>
                                            Creator {user.user_id.substring(0, 8)}
                                        </div>
                                        <div className="text-sm" style={{ color: colors.textMuted }}>
                                            {user.dream_count} dreams created
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-6 text-sm">
                                        <div className="text-center">
                                            <div className="font-bold" style={{ color: colors.cyan }}>
                                                {user.total_likes}
                                            </div>
                                            <div style={{ color: colors.textMuted }}>❤️ Likes</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold" style={{ color: colors.purple }}>
                                                {user.total_shares}
                                            </div>
                                            <div style={{ color: colors.textMuted }}>🚀 Shares</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold" style={{ color: colors.pink }}>
                                                {user.total_views}
                                            </div>
                                            <div style={{ color: colors.textMuted }}>👁️ Views</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* CTA */}
                <div className="mt-8 text-center p-6 rounded-lg" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                    <h3 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                        Want to climb the ranks?
                    </h3>
                    <p className="mb-4" style={{ color: colors.textMuted }}>
                        Create amazing dreams, share them with friends, and earn your spot on the leaderboard!
                    </p>
                    <a
                        href="/dashboard"
                        className="inline-block px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{ background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`, color: 'white' }}
                    >
                        Start Creating 🎨
                    </a>
                </div>
            </div>
        </div>
    )
}
