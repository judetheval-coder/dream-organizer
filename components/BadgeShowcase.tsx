'use client'

import { useEffect, useState } from 'react'
import { colors } from '@/lib/design'
import { BADGES, RARITY_COLORS, type BadgeId } from '@/lib/badges'

interface BadgeDisplayProps {
    badgeId: string
    earnedAt?: string
    size?: 'small' | 'medium' | 'large'
}

export function BadgeDisplay({ badgeId, earnedAt, size = 'medium' }: BadgeDisplayProps) {
    const badge = Object.values(BADGES).find(b => b.id === badgeId)

    if (!badge) return null

    const sizes = {
        small: { emoji: 'text-2xl', container: 'w-16 h-16', text: 'text-xs' },
        medium: { emoji: 'text-4xl', container: 'w-24 h-24', text: 'text-sm' },
        large: { emoji: 'text-6xl', container: 'w-32 h-32', text: 'text-base' },
    }

    const s = sizes[size]

    return (
        <div className="text-center">
            <div
                className={`${s.container} mx-auto rounded-full flex items-center justify-center mb-2 transition-transform hover:scale-110`}
                style={{
                    background: `linear-gradient(135deg, ${RARITY_COLORS[badge.rarity]}40 0%, ${RARITY_COLORS[badge.rarity]}20 100%)`,
                    border: `2px solid ${RARITY_COLORS[badge.rarity]}`,
                }}
            >
                <span className={s.emoji}>{badge.emoji}</span>
            </div>
            <div className={`font-bold ${s.text}`} style={{ color: colors.textPrimary }}>
                {badge.name}
            </div>
            <div className={`${s.text}`} style={{ color: colors.textMuted }}>
                {badge.description}
            </div>
            {earnedAt && (
                <div className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    {new Date(earnedAt).toLocaleDateString()}
                </div>
            )}
        </div>
    )
}

interface BadgeShowcaseProps {
    userId?: string
}

export function BadgeShowcase({ userId }: BadgeShowcaseProps) {
    const [badges, setBadges] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchBadges() {
            try {
                const response = await fetch('/api/badges/award')
                const data = await response.json()
                setBadges(data.badges || [])
            } catch (error) {
                console.error('Error fetching badges:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchBadges()
    }, [userId])

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-pulse text-4xl mb-2">🏅</div>
                <p style={{ color: colors.textMuted }}>Loading badges...</p>
            </div>
        )
    }

    if (badges.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-4xl mb-2">🎯</div>
                <p style={{ color: colors.textMuted }}>No badges yet. Create dreams to earn badges!</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {badges.map((badge) => (
                <BadgeDisplay
                    key={badge.id}
                    badgeId={badge.badge_type}
                    earnedAt={badge.earned_at}
                />
            ))}
        </div>
    )
}
